/**
 * Stage 12 — comprehensive provider domain event handlers.
 * Routes a normalized Swan or Adyen event onto the owning platform record.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedProviderEvent } from "../eventHandlerRegistry";

type DomainTable =
  | "platform_onboarding_cases"
  | "platform_accounts"
  | "platform_transactions"
  | "platform_transfers"
  | "platform_cards"
  | "platform_merchants"
  | "platform_stores"
  | "platform_payments"
  | "platform_refunds"
  | "platform_chargebacks"
  | "platform_settlements"
  | "platform_terminals";

export function domainTarget(provider: string, eventType: string): DomainTable | null {
  if (provider === "swan") {
    if (eventType.startsWith("onboarding.")) return "platform_onboarding_cases";
    if (eventType.startsWith("account.")) return "platform_accounts";
    if (eventType.startsWith("transaction.")) return "platform_transactions";
    if (eventType.startsWith("transfer.")) return "platform_transfers";
    if (eventType.startsWith("card.")) return "platform_cards";
  }

  if (provider === "adyen") {
    if (eventType.startsWith("merchant.")) return "platform_merchants";
    if (eventType.startsWith("store.")) return "platform_stores";
    if (eventType.startsWith("payment.")) return "platform_payments";
    if (eventType.startsWith("refund.")) return "platform_refunds";
    if (eventType.startsWith("chargeback.")) return "platform_chargebacks";
    if (eventType.startsWith("settlement.")) return "platform_settlements";
    if (eventType.startsWith("terminal.")) return "platform_terminals";
  }

  return null;
}

export async function applyProviderDomainEvent(
  admin: SupabaseClient,
  event: NormalizedProviderEvent,
) {
  if (!event.externalId) throw new Error("external_id_missing");

  const payload = event.payload as Record<string, unknown>;
  const status = event.status ?? (payload["status"] as string | undefined);

  const table = domainTarget(event.provider, event.eventType);
  if (!table) throw new Error(`unhandled_event:${event.provider}:${event.eventType}`);

  if (table === "platform_transactions") {
    const { error } = await admin.from(table).upsert(
      {
        provider_external_id: event.externalId,
        account_id: payload["accountId"],
        direction: payload["direction"],
        transaction_type: payload["transactionType"] ?? "card",
        amount_minor: payload["amountMinor"],
        currency: payload["currency"] ?? "EUR",
        status,
        merchant_name: payload["merchantName"],
        reference: payload["reference"],
        booked_at: payload["bookedAt"],
      } as never,
      { onConflict: "provider_external_id" },
    );
    if (error) throw error;
    return;
  }

  const values: Record<string, unknown> = { status };
  if (table === "platform_accounts") {
    values["iban"] = payload["iban"];
    values["available_balance_minor"] = payload["availableBalanceMinor"];
    values["booked_balance_minor"] = payload["bookedBalanceMinor"];
  }
  if (table === "platform_onboarding_cases") {
    values["required_actions"] = payload["requiredActions"] ?? [];
    values["last_synced_at"] = new Date().toISOString();
  }
  if (table === "platform_settlements") {
    values["paid_at"] = payload["paidAt"];
  }

  const clean = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  );

  const { error } = await admin
    .from(table)
    .update(clean as never)
    .eq("provider_external_id", event.externalId);

  if (error) throw error;
}