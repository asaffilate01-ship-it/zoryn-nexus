/**
 * Money-movement server functions.
 *
 * Every portal action that changes money persists: pot moves, SEPA transfers,
 * card freeze/unfreeze, Tap to Pay captures, payment links and points
 * redemption. Each call goes through the provider adapter (mock until sandbox
 * credentials exist), writes the resulting rows and records an audit entry
 * against the signed-in actor.
 *
 * Security: every function requires an authenticated session. Shared demo rows
 * (`is_demo`) may be driven by any signed-in user; real rows are checked
 * against account/merchant/loyalty ownership. Amounts are bounded.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  MAX_CENTS,
  audit,
  ctx,
  money,
  requireAccount,
  requireCard,
  requireLoyalty,
  requireMerchant,
  requirePot,
} from "./zoryn-mutations.server";

const amount = z.number().int().min(1).max(MAX_CENTS);
const uuid = z.string().uuid();

/* ------------------------------------------------------------ pot transfers */

export const moveFunds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { admin } = await ctx();
    const userId = context.userId;
    const account = await requireAccount(admin, data.accountId, userId);
    const value = money(data.amountCents);

    const from = data.fromPotId ? await requirePot(admin, data.fromPotId, account.id, userId) : null;
    const to = data.toPotId ? await requirePot(admin, data.toPotId, account.id, userId) : null;

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

    await audit(admin, userId, "transfer.internal", transfer?.id ?? account.id, {
      amount_cents: data.amountCents,
      from: from?.name ?? "Main balance",
      to: to?.name ?? "Main balance",
    });

    return { ok: true, transferId: transfer?.id ?? null };
  });

/* ------------------------------------------------------------ SEPA transfer */

export const createSepaTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { admin, banking } = await ctx();
    const account = await requireAccount(admin, data.accountId, context.userId);
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

    await audit(admin, context.userId, "transfer.sepa", tx?.id ?? account.id, {
      amount_cents: data.amountCents,
      counterparty: data.counterparty,
      provider: banking.provider,
      provider_reference: result.id,
    });

    return { ok: true, transactionId: tx?.id ?? null, status: tx?.status ?? "pending", providerReference: result.id };
  });

/* --------------------------------------------------------------- card state */

export const setCardFrozen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ cardId: uuid, frozen: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { admin, banking } = await ctx();
    const card = await requireCard(admin, data.cardId, context.userId);

    const reference = card.provider_reference ?? card.id;
    const result = data.frozen ? await banking.freezeCard(reference) : await banking.unfreezeCard(reference);
    await admin.from("cards").update({ status: result.status }).eq("id", card.id);
    await audit(admin, context.userId, "card.status_changed", card.id, {
      status: result.status,
      provider: banking.provider,
    });
    return { ok: true, status: result.status };
  });

export const setCardLimit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ cardId: uuid, monthlyLimitCents: z.number().int().min(0).max(2_000_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin } = await ctx();
    const card = await requireCard(admin, data.cardId, context.userId);
    await admin.from("cards").update({ monthly_limit: money(data.monthlyLimitCents) }).eq("id", card.id);
    await audit(admin, context.userId, "card.limit_changed", card.id, {
      monthly_limit_cents: data.monthlyLimitCents,
    });
    return { ok: true };
  });

/* ------------------------------------------------------------- ZorynPay tap */

export const captureTapToPay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ merchantId: uuid, amountCents: amount, terminalId: uuid.optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, acquiring } = await ctx();
    const merchant = await requireMerchant(admin, data.merchantId, context.userId);

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

    await audit(admin, context.userId, "payment.captured", tx?.id ?? merchant.id, {
      amount_cents: data.amountCents,
      provider: acquiring.provider,
      provider_reference: reference,
      points: reward.points,
    });

    return { ok: true, transactionId: tx?.id ?? null, providerReference: reference, pointsEarned: reward.points };
  });

export const createMerchantPaymentLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ merchantId: uuid, label: z.string().min(2).max(80), amountCents: amount }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, acquiring } = await ctx();
    const merchant = await requireMerchant(admin, data.merchantId, context.userId);

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

    await audit(admin, context.userId, "payment_link.created", row?.id ?? merchant.id, {
      amount_cents: data.amountCents,
      label: data.label,
    });
    return { ok: true, id: row?.id ?? null, url: row?.url ?? link.url };
  });

/* -------------------------------------------------------------- redemptions */

export const redeemPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { admin } = await ctx();
    const userId = context.userId;
    const loyalty = await requireLoyalty(admin, data.loyaltyAccountId, userId);
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

    if (data.destination === "pot" && data.potId && data.accountId) {
      const account = await requireAccount(admin, data.accountId, userId);
      const pot = await requirePot(admin, data.potId, account.id, userId);
      await admin.from("pots").update({ balance: Number(pot.balance) + value }).eq("id", pot.id);
    } else if (data.accountId) {
      const account = await requireAccount(admin, data.accountId, userId);
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
      } as never,
      { onConflict: "provider,provider_reference,event_type", ignoreDuplicates: true },
    );

    await audit(admin, userId, "reward.redeemed", loyalty.id, {
      points: data.points,
      value_cents: valueCents,
      destination: data.destination,
    });
    return { ok: true, valueCents, remainingPoints: Number(loyalty.points) - data.points };
  });

/* ------------------------------------------------------------ support cases */

export const createSupportCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        subject: z.string().min(4).max(140),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        organisationId: uuid.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin } = await ctx();
    const reference = `ZC-${Math.floor(Math.random() * 90000 + 10000)}`;
    const { data: row } = await admin
      .from("support_cases")
      .insert({
        reference,
        subject: data.subject,
        status: "open",
        priority: data.priority,
        owner_user_id: context.userId,
        organisation_id: data.organisationId ?? null,
        is_demo: true,
      })
      .select("id, reference")
      .maybeSingle();
    await audit(admin, context.userId, "support_case.created", row?.id ?? reference, {
      subject: data.subject,
      priority: data.priority,
    });
    return { ok: true, id: row?.id ?? null, reference: row?.reference ?? reference };
  });
