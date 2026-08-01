/**
 * Webhook event processor and retry worker.
 *
 * Events land as `received`, this module advances them through
 * received -> processing -> processed | retrying | dead_letter, applies the
 * provider status maps to the affected domain rows, keeps provider_resources
 * in sync, records an audit entry and queues any rewards the event earned.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { mapAdyenPaymentStatus, mapSwanAccountStatus, mapSwanTransactionStatus } from "./provider-adapters";
import { queueRewardEvent } from "./rewards-hub.server";

type Admin = SupabaseClient<Database>;

export const MAX_ATTEMPTS = 5;
const backoffMs = (attempts: number) => Math.min(2 ** attempts, 60) * 1000;

const ACCOUNT_STATUS_TO_DB: Record<string, Database["public"]["Enums"]["resource_status"]> = {
  active: "approved",
  suspended: "suspended",
  restricted: "restricted",
  closing: "closed",
  closed: "closed",
  under_review: "in_review",
  verification_required: "action_required",
  draft: "draft",
};

async function audit(admin: Admin, action: string, resourceId: string | null, metadata: Record<string, unknown>) {
  await admin.from("audit_logs").insert({
    action,
    resource_type: "provider_event",
    resource_id: resourceId,
    metadata: metadata as never,
    is_demo: true,
  } as never);
}

async function mapResource(
  admin: Admin,
  provider: string,
  resourceType: string,
  providerId: string,
  zorynId: string | null,
  metadata: Record<string, unknown>,
) {
  await admin.from("provider_resources").upsert(
    {
      provider,
      resource_type: resourceType,
      provider_id: providerId,
      zoryn_id: zorynId,
      last_synced_at: new Date().toISOString(),
      metadata: metadata as never,
      is_demo: true,
    } as never,
    { onConflict: "provider,resource_type,provider_id" },
  );
}

/** Applies one event to the domain tables. Throws to trigger a retry. */
async function applyEvent(admin: Admin, event: { provider: string; event_type: string; resource_id: string | null; payload: any }) {
  const { provider, event_type: type, payload } = event;
  const resourceId = event.resource_id ?? String(payload?.resourceId ?? payload?.data?.id ?? "");
  const raw = String(payload?.status ?? payload?.data?.status ?? payload?.eventCode ?? "");

  if (!resourceId) return { touched: "none" as const };

  if (type.startsWith("account.")) {
    const status = ACCOUNT_STATUS_TO_DB[mapSwanAccountStatus(raw)] ?? "in_review";
    const { data } = await admin
      .from("financial_accounts")
      .update({ status })
      .eq("provider_reference", resourceId)
      .select("id")
      .maybeSingle();
    await mapResource(admin, provider, "account", resourceId, data?.id ?? null, { status });
    return { touched: "account" as const, status };
  }

  if (type.startsWith("card.")) {
    const status = /suspend|freeze|block/i.test(`${type} ${raw}`) ? "frozen" : /resume|unfreeze|enable/i.test(`${type} ${raw}`) ? "active" : raw || "active";
    const { data } = await admin
      .from("cards")
      .update({ status })
      .eq("provider_reference", resourceId)
      .select("id")
      .maybeSingle();
    await mapResource(admin, provider, "card", resourceId, data?.id ?? null, { status });
    return { touched: "card" as const, status };
  }

  if (type.startsWith("transaction.") || type.startsWith("payment.") || provider === "adyen") {
    const status =
      provider === "adyen" ? mapAdyenPaymentStatus(raw || type.split(".").pop() || "") : mapSwanTransactionStatus(raw);
    const dbStatus = provider === "adyen" ? (status === "captured" ? "booked" : status) : status;
    const { data } = await admin
      .from("transactions")
      .update({ status: dbStatus })
      .eq("provider_reference", resourceId)
      .select("id, account_id, amount, currency")
      .maybeSingle();
    await mapResource(admin, provider, "transaction", resourceId, data?.id ?? null, { status: dbStatus });

    // Settled spend earns points. Rewards work with or without a hub link.
    if (data && (dbStatus === "booked" || dbStatus === "captured")) {
      await queueRewardEvent(admin, {
        eventType: "transaction.settled",
        provider,
        providerReference: resourceId,
        amountCents: Math.round(Math.abs(Number(data.amount ?? 0)) * 100),
        transactionId: data.id,
        accountId: data.account_id,
      });
    }
    return { touched: "transaction" as const, status: dbStatus };
  }

  return { touched: "none" as const };
}

export async function processEvent(admin: Admin, eventId: string) {
  const { data: event } = await admin.from("provider_events").select("*").eq("id", eventId).maybeSingle();
  if (!event) return { ok: false, reason: "not_found" as const };
  if (event.status === "processed" || event.status === "dead_letter") {
    return { ok: true, status: event.status };
  }

  await admin.from("provider_events").update({ status: "processing" }).eq("id", eventId);

  try {
    const result = await applyEvent(admin, event as never);
    await admin
      .from("provider_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
        attempts: (event.attempts ?? 0) + 1,
        error: null,
        next_attempt_at: null,
      })
      .eq("id", eventId);
    await audit(admin, `provider_event.processed:${event.event_type}`, event.event_id, { provider: event.provider, ...result });
    return { ok: true, status: "processed" as const, ...result };
  } catch (error) {
    const attempts = (event.attempts ?? 0) + 1;
    const dead = attempts >= MAX_ATTEMPTS;
    const message = error instanceof Error ? error.message : String(error);
    await admin
      .from("provider_events")
      .update({
        status: dead ? "dead_letter" : "retrying",
        attempts,
        error: message,
        next_attempt_at: dead ? null : new Date(Date.now() + backoffMs(attempts)).toISOString(),
      })
      .eq("id", eventId);
    await audit(admin, dead ? "provider_event.dead_letter" : "provider_event.retry", event.event_id, {
      provider: event.provider,
      attempts,
      error: message,
    });
    return { ok: false, status: dead ? ("dead_letter" as const) : ("retrying" as const), error: message };
  }
}

/** Retry worker: picks up due `retrying` rows plus anything stuck in `received`. */
export async function processDueEvents(admin: Admin, limit = 25) {
  const nowIso = new Date().toISOString();
  const { data } = await admin
    .from("provider_events")
    .select("id")
    .or(`status.eq.received,and(status.eq.retrying,next_attempt_at.lte.${nowIso})`)
    .order("created_at")
    .limit(limit);

  const results = [];
  for (const row of data ?? []) results.push(await processEvent(admin, row.id));
  return results;
}
