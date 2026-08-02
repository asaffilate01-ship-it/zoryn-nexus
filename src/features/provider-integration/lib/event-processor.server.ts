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
import { correlationId, writeRuntimeLog } from "./runtime-log.server";

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
  event_id: string;
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
  // Claiming happens inside Postgres with `for update skip locked`, so two
  // workers running at the same time never pick up the same event. The routine
  // also increments attempt_count, so the returned rows already carry the
  // attempt number for this pass.
  const { data, error } = await admin.rpc("platform_claim_provider_events", {
    p_limit: limit,
  } as never);
  if (error) throw new Error(error.message);

  const events = (data ?? []) as unknown as ProviderEvent[];
  let processed = 0;
  let failed = 0;

  for (const event of events) {
    const attempts = event.attempt_count;
    const correlation = correlationId(event.provider, event.event_id ?? event.id);
    const startedAt = Date.now();

    try {
      const outcome = await applyEvent(admin, event);
      await admin
        .from("platform_provider_events")
        .update({
          processing_status: "processed",
          processed_at: new Date().toISOString(),
          last_error: null,
        } as never)
        .eq("id", event.id);
      await writeRuntimeLog(admin, {
        provider: event.provider,
        direction: "event",
        entityId: event.id,
        operation: event.event_type,
        status: "succeeded",
        correlationId: correlation,
        durationMs: Date.now() - startedAt,
        metadata: { outcome, attempt: attempts },
      });
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
      await writeRuntimeLog(admin, {
        provider: event.provider,
        direction: "event",
        entityId: event.id,
        operation: event.event_type,
        status: deadLetter ? "dead_letter" : "failed",
        correlationId: correlation,
        durationMs: Date.now() - startedAt,
        errorMessage: message,
        metadata: { attempt: attempts },
      });
      failed++;
    }
  }

  return { claimed: events.length, processed, failed };
}
