import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedProviderEvent } from "./eventHandlerRegistry";

/**
 * Stage 11 — provider-specific domain handlers. Applies a normalized provider
 * event onto the owning banking or acquiring record.
 */
export async function applyNormalizedProviderEvent(
  admin: SupabaseClient,
  event: NormalizedProviderEvent,
) {
  const payload = event.payload as Record<string, unknown>;
  const status = event.status ?? (payload["status"] as string | undefined);
  const externalId = event.externalId ?? "";

  if (event.provider === "swan") {
    if (event.eventType.startsWith("onboarding.")) {
      await admin
        .from("platform_onboarding_cases")
        .update({
          status: status ?? "under_review",
          required_actions: (payload["requiredActions"] as string[] | undefined) ?? [],
        } as never)
        .eq("provider_external_id", externalId);
      return;
    }

    if (event.eventType.startsWith("transfer.")) {
      await admin
        .from("platform_transfers")
        .update({ status } as never)
        .eq("provider_external_id", externalId);
      return;
    }

    if (event.eventType.startsWith("card.")) {
      await admin
        .from("platform_cards")
        .update({ status } as never)
        .eq("provider_external_id", externalId);
      return;
    }
  }

  if (event.provider === "adyen") {
    if (event.eventType.startsWith("payment.")) {
      await admin
        .from("platform_payments")
        .update({ status } as never)
        .eq("provider_external_id", externalId);
      return;
    }

    if (event.eventType.startsWith("settlement.")) {
      await admin
        .from("platform_settlements")
        .update({
          status,
          paid_at: (payload["paidAt"] as string | undefined) ?? null,
        } as never)
        .eq("provider_external_id", externalId);
      return;
    }
  }

  throw new Error(`domain_handler_missing:${event.provider}:${event.eventType}`);
}