/**
 * Rewards: local ledger first, Rewards Hub optional.
 *
 * Points are always written to Zoryn's own loyalty_accounts / loyalty_entries,
 * so customers who only use rewards (no banking, no hub) keep a complete and
 * correct balance. Every points event is additionally queued on
 * rewards_outbox; delivery to the Zoryn Rewards Hub only happens when
 * REWARDS_HUB_URL and REWARDS_INGEST_SECRET are configured, otherwise the row
 * is marked `skipped` and nothing breaks.
 */
import { createHmac } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Admin = SupabaseClient<Database>;

export const hubConfigured = () =>
  Boolean(process.env["REWARDS_HUB_URL"] && process.env["REWARDS_INGEST_SECRET"]);

/** 1 point per full euro of settled spend. */
export const pointsForSpend = (amountCents: number) => Math.max(0, Math.floor(amountCents / 100));
/** 500 points = 5.00 EUR. */
export const centsForPoints = (points: number) => Math.floor(points / 500) * 500;

export interface RewardEventInput {
  eventType: string;
  provider: string;
  providerReference: string;
  amountCents: number;
  points?: number;
  transactionId?: string | null;
  accountId?: string | null;
  loyaltyAccountId?: string | null;
  description?: string;
}

async function resolveLoyaltyAccount(admin: Admin, input: RewardEventInput) {
  if (input.loyaltyAccountId) return input.loyaltyAccountId;
  if (!input.accountId) return null;
  const { data: account } = await admin
    .from("financial_accounts")
    .select("owner_user_id, organisation_id")
    .eq("id", input.accountId)
    .maybeSingle();
  if (!account) return null;
  const query = admin.from("loyalty_accounts").select("id").limit(1);
  const { data } = account.organisation_id
    ? await query.eq("organisation_id", account.organisation_id)
    : await query.eq("owner_user_id", account.owner_user_id!);
  return data?.[0]?.id ?? null;
}

/**
 * Writes the points to the local ledger (idempotently) and queues the hub
 * delivery. Safe to call for every settled transaction.
 */
export async function queueRewardEvent(admin: Admin, input: RewardEventInput) {
  const points = input.points ?? pointsForSpend(input.amountCents);
  if (points === 0) return { points: 0, queued: false };

  const loyaltyAccountId = await resolveLoyaltyAccount(admin, input);
  const idempotencyKey = `${input.provider}:${input.providerReference}:${input.eventType}`;

  if (loyaltyAccountId) {
    const { error } = await admin.from("loyalty_entries").insert({
      loyalty_account_id: loyaltyAccountId,
      points,
      description: input.description ?? "Points earned on settled spend",
      idempotency_key: idempotencyKey,
      transaction_id: input.transactionId ?? null,
      source: input.provider,
      is_demo: true,
    } as never);
    if (!error) {
      const { data: current } = await admin
        .from("loyalty_accounts")
        .select("points")
        .eq("id", loyaltyAccountId)
        .maybeSingle();
      await admin
        .from("loyalty_accounts")
        .update({ points: Number(current?.points ?? 0) + points })
        .eq("id", loyaltyAccountId);
    }
  }

  await admin.from("rewards_outbox").upsert(
    {
      event_type: input.eventType,
      provider: input.provider,
      provider_reference: input.providerReference,
      loyalty_account_id: loyaltyAccountId,
      amount_cents: input.amountCents,
      points,
      status: hubConfigured() ? "pending" : "skipped",
      payload: {
        transaction_id: input.transactionId ?? null,
        account_id: input.accountId ?? null,
        description: input.description ?? null,
      } as never,
      is_demo: true,
    } as never,
    { onConflict: "provider,provider_reference,event_type", ignoreDuplicates: true },
  );

  return { points, queued: true, loyaltyAccountId };
}

/** Delivers pending outbox rows to the Rewards Hub ingest endpoint. */
export async function flushRewardsOutbox(admin: Admin, limit = 25) {
  if (!hubConfigured()) {
    await admin
      .from("rewards_outbox")
      .update({ status: "skipped", error: "Rewards Hub not configured" })
      .eq("status", "pending");
    return { delivered: 0, skipped: true };
  }

  const base = process.env["REWARDS_HUB_URL"]!.replace(/\/$/, "");
  const secret = process.env["REWARDS_INGEST_SECRET"]!;
  const tenant = process.env["REWARDS_TENANT_SLUG"] ?? "zoryn";
  const nowIso = new Date().toISOString();

  const { data: rows } = await admin
    .from("rewards_outbox")
    .select("*")
    .in("status", ["pending", "retrying"])
    .lte("next_attempt_at", nowIso)
    .order("created_at")
    .limit(limit);

  let delivered = 0;
  for (const row of rows ?? []) {
    const body = JSON.stringify({
      event_id: row.id,
      event_type: row.event_type,
      tenant_slug: tenant,
      provider: row.provider,
      provider_reference: row.provider_reference,
      platform_user_id: row.platform_user_id,
      amount_cents: row.amount_cents,
      points: row.points,
      currency: row.currency,
      payload: row.payload,
    });
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    try {
      const res = await fetch(`${base}/api/public/rewards/events`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-zoryn-signature": signature },
        body,
      });
      if (!res.ok) throw new Error(`Hub responded ${res.status}: ${await res.text()}`);
      await admin
        .from("rewards_outbox")
        .update({ status: "delivered", delivered_at: new Date().toISOString(), error: null, attempts: row.attempts + 1 })
        .eq("id", row.id);
      delivered += 1;
    } catch (error) {
      const attempts = row.attempts + 1;
      await admin
        .from("rewards_outbox")
        .update({
          status: attempts >= 5 ? "failed" : "retrying",
          attempts,
          error: error instanceof Error ? error.message : String(error),
          next_attempt_at: new Date(Date.now() + Math.min(2 ** attempts, 60) * 1000).toISOString(),
        })
        .eq("id", row.id);
    }
  }
  return { delivered, skipped: false };
}
