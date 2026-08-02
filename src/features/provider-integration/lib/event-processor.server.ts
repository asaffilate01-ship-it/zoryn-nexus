/**
 * Stage 1 — provider event processor.
 *
 * Drains platform_provider_events. Onboarding events update the persisted
 * onboarding case; resource events upsert the provider resource mapping.
 * Anything unrecognised fails, so it retries and then dead-letters after five
 * attempts with a critical alert — an unmapped provider event is an
 * integration gap, not something to silently swallow.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

type Admin = SupabaseClient<never>;

const ONBOARDING_STATES = [
  "not_started",
  "in_progress",
  "action_required",
  "under_review",
  "approved",
  "rejected",
  "restricted",
] as const;

export function normalizeOnboarding(status: unknown): string {
  return ONBOARDING_STATES.includes(String(status) as never) ? String(status) : "under_review";
}

type ProviderEvent = {
  id: string;
  provider: string;
  event_type: string;
  payload: Record<string, any>;
  attempt_count: number;
};

export async function applyEvent(admin: Admin, event: ProviderEvent) {
  const payload = event.payload ?? {};

  if (event.event_type.includes("onboarding")) {
    if (!payload["externalId"]) throw new Error("missing_external_id");
    const { error } = await admin
      .from("platform_onboarding_cases")
      .update({
        status: normalizeOnboarding(payload["status"]),
        required_actions: payload["requiredActions"] ?? [],
        last_synced_at: new Date().toISOString(),
      } as never)
      .eq("external_id", String(payload["externalId"]));
    if (error) throw new Error(error.message);
    return "onboarding_case_updated";
  }

  if (payload["aggregateId"] && payload["externalId"]) {
    const { error } = await admin.from("platform_provider_resources").upsert(
      {
        provider: event.provider,
        aggregate_type: payload["aggregateType"] ?? "unknown",
        aggregate_id: payload["aggregateId"],
        resource_type: payload["resourceType"] ?? event.event_type,
        external_id: payload["externalId"],
        external_status: payload["status"] ?? "unknown",
        metadata: payload,
        last_synced_at: new Date().toISOString(),
      } as never,
      { onConflict: "provider,aggregate_type,aggregate_id,resource_type" },
    );
    if (error) throw new Error(error.message);
    return "resource_mapped";
  }

  throw new Error("unmapped_event");
}

export async function runEventProcessor(admin: Admin, limit = 50) {
  const { data, error } = await admin
    .from("platform_provider_events")
    .select("*")
    .in("processing_status", ["received", "retrying"])
    .order("received_at")
    .limit(limit);
  if (error) throw new Error(error.message);

  const events = (data ?? []) as unknown as ProviderEvent[];
  let processed = 0;
  let failed = 0;

  for (const event of events) {
    const attempts = event.attempt_count + 1;
    await admin
      .from("platform_provider_events")
      .update({ processing_status: "processing", attempt_count: attempts } as never)
      .eq("id", event.id);

    try {
      await applyEvent(admin, event);
      await admin
        .from("platform_provider_events")
        .update({
          processing_status: "processed",
          processed_at: new Date().toISOString(),
          last_error: null,
        } as never)
        .eq("id", event.id);
      processed++;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const deadLetter = attempts >= 5;
      await admin
        .from("platform_provider_events")
        .update({
          processing_status: deadLetter ? "dead_letter" : "retrying",
          last_error: message,
        } as never)
        .eq("id", event.id);
      if (deadLetter) {
        await admin.from("platform_provider_alerts").insert({
          provider: ["swan", "adyen", "rewards"].includes(event.provider) ? event.provider : null,
          severity: "critical",
          alert_type: "event_dead_letter",
          title: `${event.provider} ${event.event_type} dead-lettered`,
          details: { eventId: event.id, error: message, attempts },
        } as never);
      }
      failed++;
    }
  }

  return { claimed: events.length, processed, failed };
}
