/**
 * Stage 2 — Supabase repository for core product data.
 *
 * Everything here goes through the browser client, so row level security
 * decides what the signed-in user sees: their own accounts, pots, cards and
 * transfers, plus anything belonging to an organisation they are an active
 * member of. No demo/localStorage fallbacks live in this module.
 */
import { supabase } from "@/integrations/supabase/client";

export const platformDataRepository = {
  async getProfile() {
    const { data, error } = await supabase.from("platform_profiles").select("*").maybeSingle();
    if (error) throw error;
    return data;
  },

  async getOrganisations() {
    const { data, error } = await supabase.from("platform_organisations").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },

  async getOrganisationMembers(organisationId: string) {
    const { data, error } = await supabase
      .from("platform_organisation_members")
      .select("*")
      .eq("organisation_id", organisationId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  async getAccounts() {
    const { data, error } = await supabase.from("platform_accounts").select("*").order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  async getPots(accountId: string) {
    const { data, error } = await supabase
      .from("platform_pots")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  async getBeneficiaries() {
    const { data, error } = await supabase.from("platform_beneficiaries").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },

  async getTransfers(accountId: string) {
    const { data, error } = await supabase
      .from("platform_transfers")
      .select("*,beneficiary:platform_beneficiaries(*)")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getCards(accountId: string) {
    const { data, error } = await supabase
      .from("platform_cards")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },

  async getMerchants() {
    const { data, error } = await supabase.from("platform_merchants").select("*").order("display_name");
    if (error) throw error;
    return data ?? [];
  },

  async getPayments(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_payments")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getSettlements(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_settlements")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createPot(input: { accountId: string; name: string; targetMinor?: number }) {
    const { data, error } = await supabase
      .from("platform_pots")
      .insert({ account_id: input.accountId, name: input.name, target_minor: input.targetMinor ?? null })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createBeneficiary(input: { name: string; iban: string; bic?: string }) {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("platform_beneficiaries")
      .insert({
        owner_user_id: auth.user?.id ?? null,
        name: input.name,
        iban: input.iban,
        bic: input.bic ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createTransfer(input: {
    accountId: string;
    beneficiaryId: string;
    amountMinor: number;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("platform_transfers")
      .insert({
        account_id: input.accountId,
        beneficiary_id: input.beneficiaryId,
        amount_minor: input.amountMinor,
        reference: input.reference ?? null,
        status: "draft",
        idempotency_key: input.idempotencyKey ?? crypto.randomUUID(),
        created_by: auth.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createSupportCase(input: { caseType: string; subject: string; description?: string; priority?: string }) {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("platform_support_cases")
      .insert({
        user_id: auth.user?.id ?? null,
        case_type: input.caseType,
        subject: input.subject,
        description: input.description ?? null,
        priority: input.priority ?? "normal",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
