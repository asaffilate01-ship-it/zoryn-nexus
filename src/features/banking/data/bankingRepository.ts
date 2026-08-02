/**
 * Stage 2 — banking persistence repository.
 *
 * Reads run through the browser Supabase client under RLS, so a signed-in
 * user only ever sees their own (or their organisation's) banking records.
 */
import { supabase } from "@/integrations/supabase/client";

export type BankingAccount = {
  id: string;
  account_type: string;
  iban: string | null;
  bic: string | null;
  currency: string;
  available_balance_minor: number;
  booked_balance_minor: number;
  status: string;
  organisation_id: string | null;
  customer_id: string | null;
};

export type BankingTransaction = {
  id: string;
  account_id: string;
  direction: "credit" | "debit";
  transaction_type: string;
  amount_minor: number;
  currency: string;
  status: string;
  merchant_name: string | null;
  counterparty_name: string | null;
  reference: string | null;
  booked_at: string | null;
  created_at: string;
};

export type BankingCard = {
  id: string;
  account_id: string;
  card_type: string;
  last_four: string | null;
  status: string;
  spending_limit_minor: number | null;
  online_enabled: boolean;
  contactless_enabled: boolean;
  atm_enabled: boolean;
  international_enabled: boolean;
};

export const bankingRepository = {
  async getCustomers() {
    const { data, error } = await supabase
      .from("platform_customers")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  async listAccounts() {
    const { data, error } = await supabase
      .from("platform_accounts")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as unknown as BankingAccount[];
  },

  async listTransactions(accountId: string) {
    const { data, error } = await supabase
      .from("platform_transactions")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as unknown as BankingTransaction[];
  },

  async listCards(accountId: string) {
    const { data, error } = await supabase
      .from("platform_cards")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as unknown as BankingCard[];
  },

  async listBeneficiaries() {
    const { data, error } = await supabase.from("platform_beneficiaries").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },

  async listOnboardingActions(caseId: string) {
    const { data, error } = await supabase
      .from("platform_onboarding_actions")
      .select("*")
      .eq("onboarding_case_id", caseId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  async createTransfer(input: {
    accountId: string;
    beneficiaryId: string;
    amountMinor: number;
    reference?: string;
    transferType?: "standard" | "instant" | "scheduled";
    scheduledFor?: string;
  }) {
    const { data, error } = await supabase
      .from("platform_transfers")
      .insert({
        account_id: input.accountId,
        beneficiary_id: input.beneficiaryId,
        amount_minor: input.amountMinor,
        currency: "EUR",
        reference: input.reference ?? null,
        transfer_type: input.transferType ?? "standard",
        scheduled_for: input.scheduledFor ?? null,
        status: "draft",
        idempotency_key: crypto.randomUUID(),
      } as never)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
