/**
 * Server-only helpers for the money-movement server functions.
 *
 * Kept out of `zoryn-mutations.functions.ts` because a module that declares
 * server functions must stay a thin wrapper (the server-fn split transform
 * drops runtime siblings).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Admin = SupabaseClient<Database>;

export const MAX_CENTS = 5_000_00;

export const money = (cents: number) => Number((cents / 100).toFixed(2));

export async function getAdmin(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

export async function ctx() {
  const admin = await getAdmin();
  const { getBankingAdapter, getAcquiringAdapter } =
    await import("@/features/provider-ready/lib/providers.server");
  return { admin, banking: getBankingAdapter(), acquiring: getAcquiringAdapter() };
}

export async function audit(
  admin: Admin,
  actorId: string | null,
  action: string,
  resourceId: string,
  metadata: Record<string, unknown>,
) {
  await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    resource_type: action.split(".")[0] ?? action,
    resource_id: resourceId,
    metadata: metadata as never,
    is_demo: true,
  });
}

/**
 * Authorisation for demo data.
 *
 * Rows flagged `is_demo` are shared sandbox data every signed-in user may
 * drive. Rows owned by a real user (owner_user_id / organisation_id) may only
 * be touched by that user or a member of that organisation, which is exactly
 * what the `can_access_*` security-definer functions already enforce for RLS.
 */
async function canAccess(
  admin: Admin,
  fn: "can_access_account" | "can_access_loyalty" | "can_access_merchant",
  id: string,
  userId: string,
) {
  const args =
    fn === "can_access_account"
      ? { _account_id: id, _user_id: userId }
      : fn === "can_access_loyalty"
        ? { _loyalty_id: id, _user_id: userId }
        : { _merchant_id: id, _user_id: userId };
  const { data } = await admin.rpc(fn, args as never);
  return data === true;
}

export async function requireAccount(admin: Admin, accountId: string, userId: string) {
  const { data, error } = await admin
    .from("financial_accounts")
    .select("id, balance, available_balance, is_demo, currency, owner_user_id, organisation_id")
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Account not found");
  if (!data.is_demo && !(await canAccess(admin, "can_access_account", accountId, userId))) {
    throw new Error("You do not have access to this account");
  }
  return data;
}

export async function requireMerchant(admin: Admin, merchantId: string, userId: string) {
  const { data } = await admin
    .from("merchants")
    .select("id, organisation_id, pending_settlement, is_demo")
    .eq("id", merchantId)
    .maybeSingle();
  if (!data) throw new Error("Merchant not found");
  if (!data.is_demo && !(await canAccess(admin, "can_access_merchant", merchantId, userId))) {
    throw new Error("You do not have access to this merchant");
  }
  return data;
}

export async function requireLoyalty(admin: Admin, loyaltyId: string, userId: string) {
  const { data } = await admin
    .from("loyalty_accounts")
    .select("id, points, is_demo")
    .eq("id", loyaltyId)
    .maybeSingle();
  if (!data) throw new Error("Rewards account not found");
  if (!data.is_demo && !(await canAccess(admin, "can_access_loyalty", loyaltyId, userId))) {
    throw new Error("You do not have access to this rewards account");
  }
  return data;
}

export async function requireCard(admin: Admin, cardId: string, userId: string) {
  const { data } = await admin
    .from("cards")
    .select("id, account_id, provider_reference, status, is_demo")
    .eq("id", cardId)
    .maybeSingle();
  if (!data) throw new Error("Card not found");
  if (!data.is_demo && !(await canAccess(admin, "can_access_account", data.account_id, userId))) {
    throw new Error("You do not have access to this card");
  }
  return data;
}

export async function requirePot(admin: Admin, potId: string, accountId: string, userId: string) {
  const { data } = await admin
    .from("pots")
    .select("id, name, balance, is_demo, account_id")
    .eq("id", potId)
    .maybeSingle();
  if (!data || data.account_id !== accountId) throw new Error("Pot not found on this account");
  if (!data.is_demo) await requireAccount(admin, data.account_id, userId);
  return data;
}
