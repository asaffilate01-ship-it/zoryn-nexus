/**
 * Stage 9 — explicit provider event handler registrations.
 *
 * Each provider event type is mapped to its own handler instead of relying on
 * a single generic processor. Registration is idempotent, so it is safe to
 * call at the start of every processor run.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  registerProviderEventHandler,
  type NormalizedProviderEvent,
} from "@/features/providers/eventHandlerRegistry";

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

function normalizeOnboarding(status: unknown): string {
  return ONBOARDING_STATES.includes(String(status) as never) ? String(status) : "under_review";
}

function requireExternalId(event: NormalizedProviderEvent): string {
  const externalId = event.externalId ?? (event.payload["externalId"] as string | undefined);
  if (!externalId) throw new Error("missing_external_id");
  return externalId;
}

let registered = false;

export function registerDefaultProviderEventHandlers(admin: Admin) {
  if (registered) return;
  registered = true;

  registerProviderEventHandler("swan", "onboarding.updated", async (event) => {
    const { error } = await admin
      .from("platform_onboarding_cases")
      .update({
        status: normalizeOnboarding(event.status ?? event.payload["status"]),
        required_actions: event.payload["requiredActions"] ?? [],
        last_synced_at: new Date().toISOString(),
      } as never)
      .eq("external_id", requireExternalId(event));
    if (error) throw new Error(error.message);
  });

  registerProviderEventHandler("swan", "transfer.returned", async (event) => {
    const { error } = await admin
      .from("platform_transfers")
      .update({ status: "returned", updated_at: new Date().toISOString() } as never)
      .eq("provider_external_id", requireExternalId(event));
    if (error) throw new Error(error.message);
  });

  registerProviderEventHandler("adyen", "payment.captured", async (event) => {
    const externalId = requireExternalId(event);
    const captured = Number(event.payload["amountMinor"] ?? 0);
    const { error } = await admin
      .from("platform_payments")
      .update({
        status: "captured",
        captured_minor: Number.isFinite(captured) ? captured : null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("provider_external_id", externalId);
    if (error) throw new Error(error.message);
  });

  registerProviderEventHandler("adyen", "payment.chargeback_opened", async (event) => {
    const externalId = requireExternalId(event);
    const { data: payment, error: paymentError } = await admin
      .from("platform_payments")
      .select("id")
      .eq("provider_external_id", externalId)
      .maybeSingle();
    if (paymentError) throw new Error(paymentError.message);
    if (!payment) throw new Error("unknown_payment");

    const amount = Number(event.payload["amountMinor"] ?? 0);
    const { error } = await admin.from("platform_chargebacks").insert({
      payment_id: (payment as { id: string }).id,
      amount_minor: Number.isFinite(amount) ? amount : 0,
      status: "opened",
      reason: (event.payload["reason"] as string | undefined) ?? "chargeback_opened",
      provider_external_id: externalId,
    } as never);
    if (error) throw new Error(error.message);

    await admin
      .from("platform_payments")
      .update({ status: "chargeback_opened", updated_at: new Date().toISOString() } as never)
      .eq("id", (payment as { id: string }).id);
  });
}