/** Stage 4 — acquiring persistence repository (RLS-scoped merchant reads). */
import { supabase } from "@/integrations/supabase/client";

export const acquiringRepository = {
  async listMerchants() {
    const { data, error } = await supabase
      .from("platform_merchants")
      .select("*")
      .order("display_name");
    if (error) throw error;
    return data ?? [];
  },

  async listStores(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_stores")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("name");
    if (error) throw error;
    return data ?? [];
  },

  async listPaymentLinks(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_payment_links")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listPayments(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_payments")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  },

  async listRefunds(paymentId: string) {
    const { data, error } = await supabase
      .from("platform_refunds")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listChargebacks(paymentId: string) {
    const { data, error } = await supabase
      .from("platform_chargebacks")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listSettlements(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_settlements")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listTerminals(merchantId: string) {
    const { data, error } = await supabase
      .from("platform_terminals")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },
};
