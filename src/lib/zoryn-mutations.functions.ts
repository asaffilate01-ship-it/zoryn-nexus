/**
 * Money-movement server functions.
 *
 * Every portal action that changes money now persists: pot moves, SEPA
 * transfers, card freeze/unfreeze, Tap to Pay captures, payment links and
 * points redemption. Each call goes through the provider adapter (mock until
 * sandbox credentials exist), writes the resulting rows and records an
 * audit_logs entry.
 *
 * Demo guardrails: these functions are unauthenticated while the platform runs
 * in demo mode, so they only ever touch rows flagged `is_demo` and reject
 * amounts outside a sane range.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_CENTS = 5_000_00;
const amount = z.number().int().min(1).max(MAX_CENTS);
const uuid = z.string().uuid();

const money = (cents: number) => Number((cents / 100).toFixed(2));

async function ctx() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { getBankingAdapter, getAcquiringAdapter } = await import(
    "@/features/provider-ready/lib/providers.server"
  );
  return { admin: supabaseAdmin, banking: getBankingAdapter(), acquiring: getAcquiringAdapter() };
}

async function audit(admin: any, action: string, resourceId: string, metadata: Record<string, unknown>) {
  await admin.from("audit_logs").insert({
    action,
    resource_type: action.split(".")[0],
    resource_id: resourceId,
    metadata,
    is_demo: true,
  });
}

async function demoAccount(admin: any, accountId: string) {
  const { data, error } = await admin
    .from("financial_accounts")
    .select("id, balance, available_balance, is_demo, currency")
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || !data.is_demo) throw new Error("Account not available in demo mode");
  return data;
}

/* ------------------------------------------------------------ pot transfers */

export const moveFunds = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        accountId: uuid,
        amountCents: amount,
        fromPotId: uuid.nullable().optional(),
        toPotId: uuid.nullable().optional(),
      })
      .refine((v) => v.fromPotId || v.toPotId, "Choose a source or destination pot")
      .refine((v) => v.fromPotId !== v.toPotId, "Source and destination must differ")
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { admin } = await ctx();
    const account = await demoAccount(admin, data.accountId);
    const value = money(data.amountCents);

    const loadPot = async (potId: string) => {
      const { data: pot } = await admin.from("pots").select("id, name, balance, is_demo, account_id").eq("id", potId).maybeSingle();
      if (!pot || !pot.is_demo || pot.account_id !== data.accountId) throw new Error("Pot not available in demo mode");
      return pot;
    };

    const from = data.fromPotId ? await loadPot(data.fromPotId) : null;
    const to = data.toPotId ? await loadPot(data.toPotId) : null;

    // Balance validation before anything is written.
    if (from && Number(from.balance) < value) throw new Error(`Not enough in ${from.name}`);
    if (!from && Number(account.available_balance) < value) throw new Error("Not enough in your main balance");

    if (from) await admin.from("pots").update({ balance: Number(from.balance) - value }).eq("id", from.id);
    if (to) await admin.from("pots").update({ balance: Number(to.balance) + value }).eq("id", to.id);
    if (!from) {
      await admin
        .from("financial_accounts")
        .update({ balance: Number(account.balance) - value, available_balance: Number(account.available_balance) - value })
        .eq("id", account.id);
    }
    if (!to) {
      await admin
        .from("financial_accounts")
        .update({ balance: Number(account.balance) + value, available_balance: Number(account.available_balance) + value })
        .eq("id", account.id);
    }

    const { data: transfer } = await admin
      .from("internal_transfers")
      .insert({ account_id: account.id, from_pot_id: from?.id ?? null, to_pot_id: to?.id ?? null, amount: value })
      .select("id")
      .maybeSingle();

    await audit(admin, "transfer.internal", transfer?.id ?? account.id, {
      amount_cents: data.amountCents,
      from: from?.name ?? "Main balance",
      to: to?.name ?? "Main balance",
    });

    return { ok: true, transferId: transfer?.id ?? null };
  });

/* ------------------------------------------------------------ SEPA transfer */

export const createSepaTransfer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        accountId: uuid,
        counterparty: z.string().min(2).max(80),
        iban: z.string().min(15).max(34),
        amountCents: amount,
        reference: z.string().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, banking } = await ctx();
    const account = await demoAccount(admin, data.accountId);
    const value = money(data.amountCents);
    if (Number(account.available_balance) < value) throw new Error("Not enough available balance");

    const result = await banking.createTransfer({
      accountId: account.id,
      amount: { value: data.amountCents, currency: "EUR" },
      sepaBeneficiary: { name: data.counterparty, iban: data.iban },
      reference: data.reference ?? "Zoryn payment",
    });

    await admin
      .from("financial_accounts")
      .update({ available_balance: Number(account.available_balance) - value })
      .eq("id", account.id);

    const { data: tx } = await admin
      .from("transactions")
      .insert({
        account_id: account.id,
        provider: banking.provider,
        provider_reference: result.id,
        title: data.counterparty,
        subtitle: data.reference ?? "SEPA credit transfer",
        kind: "sepa_transfer",
        amount: -value,
        currency: "EUR",
        status: result.status === "completed" ? "booked" : "pending",
        occurred_at: new Date().toISOString(),
        metadata: { iban: data.iban },
        is_demo: true,
      })
      .select("id, status")
      .maybeSingle();

    await audit(admin, "transfer.sepa", tx?.id ?? account.id, {
      amount_cents: data.amountCents,
      counterparty: data.counterparty,
      provider: banking.provider,
      provider_reference: result.id,
    });

    return { ok: true, transactionId: tx?.id ?? null, status: tx?.status ?? "pending", providerReference: result.id };
  });

/* --------------------------------------------------------------- card state */

export const setCardFrozen = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ cardId: uuid, frozen: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const { admin, banking } = await ctx();
    const { data: card } = await admin
      .from("cards")
      .select("id, provider_reference, status, is_demo")
      .eq("id", data.cardId)
      .maybeSingle();
    if (!card || !card.is_demo) throw new Error("Card not available in demo mode");

    const reference = card.provider_reference ?? card.id;
    const result = data.frozen ? await banking.freezeCard(reference) : await banking.unfreezeCard(reference);
    await admin.from("cards").update({ status: result.status }).eq("id", card.id);
    await audit(admin, "card.status_changed", card.id, { status: result.status, provider: banking.provider });
    return { ok: true, status: result.status };
  });

export const setCardLimit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ cardId: uuid, monthlyLimitCents: z.number().int().min(0).max(2_000_000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { admin } = await ctx();
    const { data: card } = await admin.from("cards").select("id, is_demo").eq("id", data.cardId).maybeSingle();
    if (!card || !card.is_demo) throw new Error("Card not available in demo mode");
    await admin.from("cards").update({ monthly_limit: money(data.monthlyLimitCents) }).eq("id", card.id);
    await audit(admin, "card.limit_changed", card.id, { monthly_limit_cents: data.monthlyLimitCents });
    return { ok: true };
  });

/* ------------------------------------------------------------- ZorynPay tap */

export const captureTapToPay = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ merchantId: uuid, amountCents: amount, terminalId: uuid.optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, acquiring } = await ctx();
    const { data: merchant } = await admin
      .from("merchants")
      .select("id, organisation_id, pending_settlement, is_demo")
      .eq("id", data.merchantId)
      .maybeSingle();
    if (!merchant || !merchant.is_demo) throw new Error("Merchant not available in demo mode");

    const value = money(data.amountCents);
    const reference = `tap_${Date.now().toString(36)}`;

    const { data: account } = await admin
      .from("financial_accounts")
      .select("id, balance, available_balance")
      .eq("organisation_id", merchant.organisation_id)
      .eq("is_demo", true)
      .limit(1)
      .maybeSingle();

    const { data: tx } = await admin
      .from("transactions")
      .insert({
        account_id: account?.id ?? null,
        provider: acquiring.provider,
        provider_reference: reference,
        title: "Tap to Pay sale",
        subtitle: "Contactless card present",
        kind: "card_payment",
        amount: value,
        currency: "EUR",
        status: "captured",
        occurred_at: new Date().toISOString(),
        metadata: { terminal_id: data.terminalId ?? null },
        is_demo: true,
      })
      .select("id")
      .maybeSingle();

    await admin
      .from("merchants")
      .update({ pending_settlement: Number(merchant.pending_settlement) + value })
      .eq("id", merchant.id);

    if (data.terminalId) {
      await admin.from("terminals").update({ last_seen_at: new Date().toISOString() }).eq("id", data.terminalId);
    }

    // Rewards are earned locally whether or not the Rewards Hub is linked.
    const { queueRewardEvent } = await import("@/features/provider-ready/lib/rewards-hub.server");
    const reward = await queueRewardEvent(admin as never, {
      eventType: "payment.captured",
      provider: acquiring.provider,
      providerReference: reference,
      amountCents: data.amountCents,
      transactionId: tx?.id ?? null,
      accountId: account?.id ?? null,
      description: "Points earned on a ZorynPay sale",
    });

    await audit(admin, "payment.captured", tx?.id ?? merchant.id, {
      amount_cents: data.amountCents,
      provider: acquiring.provider,
      provider_reference: reference,
      points: reward.points,
    });

    return { ok: true, transactionId: tx?.id ?? null, providerReference: reference, pointsEarned: reward.points };
  });

export const createMerchantPaymentLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ merchantId: uuid, label: z.string().min(2).max(80), amountCents: amount }).parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, acquiring } = await ctx();
    const { data: merchant } = await admin.from("merchants").select("id, is_demo").eq("id", data.merchantId).maybeSingle();
    if (!merchant || !merchant.is_demo) throw new Error("Merchant not available in demo mode");

    const link = await acquiring.createPaymentLink({
      amount: { value: data.amountCents, currency: "EUR" },
      reference: data.label,
    });

    const { data: row } = await admin
      .from("payment_links")
      .insert({
        merchant_id: merchant.id,
        provider_reference: link.id,
        label: data.label,
        amount: money(data.amountCents),
        currency: "EUR",
        status: link.status,
        url: link.url,
        is_demo: true,
      })
      .select("id, url")
      .maybeSingle();

    await audit(admin, "payment_link.created", row?.id ?? merchant.id, { amount_cents: data.amountCents, label: data.label });
    return { ok: true, id: row?.id ?? null, url: row?.url ?? link.url };
  });

/* -------------------------------------------------------------- redemptions */

export const redeemPoints = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        loyaltyAccountId: uuid,
        points: z.number().int().min(500).max(100_000),
        destination: z.enum(["balance", "pot"]),
        accountId: uuid.optional(),
        potId: uuid.optional(),
      })
      .refine((v) => v.points % 500 === 0, "Redeem in blocks of 500 points")
      .refine((v) => v.destination !== "pot" || Boolean(v.potId), "Choose a pot")
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { admin } = await ctx();
    const { data: loyalty } = await admin
      .from("loyalty_accounts")
      .select("id, points, is_demo")
      .eq("id", data.loyaltyAccountId)
      .maybeSingle();
    if (!loyalty || !loyalty.is_demo) throw new Error("Rewards account not available in demo mode");
    if (Number(loyalty.points) < data.points) throw new Error("Not enough points");

    // 500 points = EUR 5.00
    const valueCents = (data.points / 500) * 500;
    const value = money(valueCents);
    const reference = `redeem_${Date.now().toString(36)}`;

    await admin.from("loyalty_entries").insert({
      loyalty_account_id: loyalty.id,
      points: -data.points,
      description: `Redeemed for ${value.toFixed(2)} EUR cashback`,
      idempotency_key: `zoryn:${reference}:reward.redeemed`,
      source: "zoryn",
      is_demo: true,
    });
    await admin.from("loyalty_accounts").update({ points: Number(loyalty.points) - data.points }).eq("id", loyalty.id);

    if (data.destination === "pot" && data.potId) {
      const { data: pot } = await admin.from("pots").select("id, balance, is_demo").eq("id", data.potId).maybeSingle();
      if (!pot || !pot.is_demo) throw new Error("Pot not available in demo mode");
      await admin.from("pots").update({ balance: Number(pot.balance) + value }).eq("id", pot.id);
    } else if (data.accountId) {
      const account = await demoAccount(admin, data.accountId);
      await admin
        .from("financial_accounts")
        .update({ balance: Number(account.balance) + value, available_balance: Number(account.available_balance) + value })
        .eq("id", account.id);
    }

    await admin.from("rewards_outbox").upsert(
      {
        event_type: "reward.redeemed",
        provider: "zoryn",
        provider_reference: reference,
        loyalty_account_id: loyalty.id,
        amount_cents: valueCents,
        points: -data.points,
        status: process.env["REWARDS_HUB_URL"] && process.env["REWARDS_INGEST_SECRET"] ? "pending" : "skipped",
        payload: { destination: data.destination, pot_id: data.potId ?? null, account_id: data.accountId ?? null },
        is_demo: true,
      },
      { onConflict: "provider,provider_reference,event_type", ignoreDuplicates: true },
    );

    await audit(admin, "reward.redeemed", loyalty.id, { points: data.points, value_cents: valueCents, destination: data.destination });
    return { ok: true, valueCents, remainingPoints: Number(loyalty.points) - data.points };
  });

/* ------------------------------------------------------------ support cases */

export const createSupportCase = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        subject: z.string().min(4).max(140),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        organisationId: uuid.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { admin } = await ctx();
    const reference = `ZC-${Math.floor(Math.random() * 90000 + 10000)}`;
    const { data: row } = await admin
      .from("support_cases")
      .insert({
        reference,
        subject: data.subject,
        status: "open",
        priority: data.priority,
        organisation_id: data.organisationId ?? null,
        is_demo: true,
      })
      .select("id, reference")
      .maybeSingle();
    await audit(admin, "support_case.created", row?.id ?? reference, { subject: data.subject, priority: data.priority });
    return { ok: true, id: row?.id ?? null, reference: row?.reference ?? reference };
  });
