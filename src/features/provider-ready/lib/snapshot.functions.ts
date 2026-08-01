import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  Card,
  CustomerProfile,
  MerchantSummary,
  MoneyAccount,
  Pot,
  ProviderHealth,
  ProviderName,
  RequiredAction,
  Scenario,
  TeamMember,
  Transaction,
  WebhookEvent,
} from "../types/domain";

export interface ProviderSnapshot {
  customer: CustomerProfile;
  accounts: MoneyAccount[];
  pots: Pot[];
  transactions: Transaction[];
  cards: Card[];
  staffCards: Card[];
  team: TeamMember[];
  merchant: MerchantSummary;
  terminals: { id: string; name: string; status: string; battery: number }[];
  rewards: { points: number; tier: string; valueCents: number };
  providerHealth: ProviderHealth[];
  webhookEvents: WebhookEvent[];
  scenarios: Scenario[];
  onboardingActions: RequiredAction[];
  business: { balanceCents: number; availableCents: number; cardSpendCents: number; pendingApprovalCents: number };
  pay: { todaySalesCents: number; pendingSettlementCents: number; refundsCents: number };
}

const cents = (v: number | string | null) => Math.round(Number(v ?? 0) * 100);
const asProvider = (v: string): ProviderName =>
  (["swan", "adyen", "rewards", "mock"] as const).includes(v as ProviderName) ? (v as ProviderName) : "mock";

/**
 * Public read-only snapshot of every demo record backing the provider-ready
 * centre. Reads through the publishable key so only rows flagged `is_demo`
 * (and exposed by the `TO anon` policies) can ever be returned.
 */
export const getProviderSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderSnapshot> => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const [
      accountsRes,
      potsRes,
      txRes,
      cardsRes,
      membersRes,
      merchantsRes,
      terminalsRes,
      loyaltyRes,
      resourcesRes,
      healthRes,
      eventsRes,
      scenariosRes,
      actionsRes,
      orgsRes,
    ] = await Promise.all([
      supabase.from("financial_accounts").select("*").eq("is_demo", true).order("created_at"),
      supabase.from("pots").select("*").eq("is_demo", true).order("created_at"),
      supabase.from("transactions").select("*").eq("is_demo", true).order("occurred_at", { ascending: false }).limit(24),
      supabase.from("cards").select("*").eq("is_demo", true).order("created_at"),
      supabase.from("organisation_members").select("*").eq("is_demo", true).order("created_at"),
      supabase.from("merchants").select("*").eq("is_demo", true),
      supabase.from("terminals").select("*").eq("is_demo", true).order("created_at"),
      supabase.from("loyalty_accounts").select("*").eq("is_demo", true),
      supabase.from("provider_resources").select("*").eq("is_demo", true).order("created_at"),
      supabase.from("provider_health").select("*").eq("is_demo", true).order("provider"),
      supabase.from("provider_events").select("*").eq("is_demo", true).order("occurred_at", { ascending: false }).limit(25),
      supabase.from("provider_scenarios").select("*").eq("is_demo", true).order("sort_order"),
      supabase.from("onboarding_actions").select("*").eq("is_demo", true).order("sort_order"),
      supabase.from("organisations").select("*"),
    ]);

    const accountRows = accountsRes.data ?? [];
    const personal = accountRows.find((a) => a.account_name === "Amer Saleem") ?? accountRows[0];
    const business = accountRows.find((a) => a.account_name.includes("GmbH"));
    const merchantRow = (merchantsRes.data ?? [])[0];
    const merchantOrg = (orgsRes.data ?? []).find((o) => o.id === merchantRow?.organisation_id);
    const personalCards = (cardsRes.data ?? []).filter((c) => c.account_id === personal?.id);
    const personalTx = (txRes.data ?? []).filter((t) => t.account_id === personal?.id);
    const loyaltyPersonal = (loyaltyRes.data ?? []).find((l) => l.organisation_id === personal?.organisation_id);
    const terminals = terminalsRes.data ?? [];
    const paySales = (txRes.data ?? [])
      .filter((t) => t.account_id === merchantRow?.id || t.kind === "settlement")
      .reduce((sum, t) => sum + Math.abs(cents(t.amount)), 0);

    return {
      customer: {
        id: personal?.id ?? "unknown",
        kind: "personal",
        name: personal?.account_name ?? "Demo customer",
        email: "demo@zoryn.de",
        locale: "de",
        status: personal?.status === "approved" ? "active" : "under_review",
        accountStatus: personal?.status === "approved" ? "active" : "under_review",
        riskScore: 18,
        providerRefs: (resourcesRes.data ?? []).map((r) => ({
          provider: asProvider(r.provider),
          resourceType: r.resource_type,
          providerId: r.provider_id,
          lastSyncedAt: r.last_synced_at,
        })),
        requiredActions: [],
      },
      accounts: accountRows.map((a) => ({
        id: a.id,
        name: a.account_name,
        iban: a.iban ?? "",
        bic: "ZORYDEB1XXX",
        currency: "EUR",
        availableCents: cents(a.available_balance),
        bookedCents: cents(a.balance),
        status: a.status === "approved" ? "active" : "under_review",
      })),
      pots: (potsRes.data ?? [])
        .filter((p) => p.account_id === personal?.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          balanceCents: cents(p.balance),
          targetCents: cents(p.target),
        })),
      transactions: personalTx.map((t) => {
        const meta = (t.metadata ?? {}) as { category?: string; rewards_points?: number };
        return {
          id: t.id,
          accountId: t.account_id ?? "",
          counterparty: t.title,
          amountCents: cents(t.amount),
          currency: "EUR",
          status: (t.status === "completed" ? "booked" : t.status) as Transaction["status"],
          category: meta.category ?? t.kind,
          bookedAt: t.occurred_at,
          reference: t.subtitle ?? t.provider_reference ?? "",
          ...(meta.rewards_points != null ? { rewardsPoints: meta.rewards_points } : {}),
        } satisfies Transaction;
      }),
      cards: personalCards.map((c) => ({
        id: c.id,
        label: c.name,
        last4: c.last_four,
        type: c.card_type as Card["type"],
        status: c.status as Card["status"],
        monthlyLimitCents: cents(c.monthly_limit),
        spentCents: cents(c.spent),
        controls: { online: true, contactless: c.card_type !== "virtual", atm: c.card_type === "physical", international: c.card_type === "physical" },
      })),
      staffCards: (cardsRes.data ?? [])
        .filter((c) => c.account_id === business?.id)
        .map((c) => ({
          id: c.id,
          label: c.name,
          last4: c.last_four,
          type: c.card_type as Card["type"],
          status: c.status as Card["status"],
          monthlyLimitCents: cents(c.monthly_limit),
          spentCents: cents(c.spent),
          controls: { online: true, contactless: c.card_type !== "virtual", atm: c.card_type === "physical", international: false },
        })),
      team: (membersRes.data ?? []).map((m) => ({
        id: m.id,
        name: m.display_name,
        role: m.role.toLowerCase() as TeamMember["role"],
        status: "active",
        approvalLimitCents: cents(m.monthly_limit),
      })),
      merchant: {
        id: merchantRow?.id ?? "unknown",
        name: merchantOrg?.name ?? "Demo merchant",
        status: merchantRow?.status === "approved" ? "active" : "onboarding",
        todaySalesCents: paySales,
        pendingSettlementCents: cents(merchantRow?.pending_settlement ?? 0),
        terminalsOnline: terminals.filter((t) => t.status === "online").length,
        terminalsTotal: terminals.length,
      },
      terminals: terminals.map((t) => ({ id: t.id, name: t.name, status: t.status, battery: t.battery })),
      rewards: {
        points: Number(loyaltyPersonal?.points ?? 0),
        tier: loyaltyPersonal?.tier ?? "silver",
        valueCents: Number(loyaltyPersonal?.points ?? 0),
      },
      providerHealth: (healthRes.data ?? []).map((p) => ({
        provider: asProvider(p.provider),
        status: p.status as ProviderHealth["status"],
        latencyMs: p.latency_ms,
        ...(p.last_event_at ? { lastEventAt: p.last_event_at } : {}),
        message: p.message,
      })),
      webhookEvents: (eventsRes.data ?? []).map((e) => ({
        id: e.id,
        provider: asProvider(e.provider),
        type: e.event_type,
        status: e.status as WebhookEvent["status"],
        attempts: e.attempts,
        occurredAt: e.occurred_at,
        resourceId: e.resource_id ?? e.event_id,
        ...(e.error ? { error: e.error } : {}),
      })),
      scenarios: (scenariosRes.data ?? []).map((s) => ({
        id: s.id,
        group: s.group_key as Scenario["group"],
        title: s.title,
        description: s.description,
        status: s.state,
        severity: s.severity as Scenario["severity"],
      })),
      onboardingActions: (actionsRes.data ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        action: a.action_type as RequiredAction["action"],
        ...(a.due_at ? { dueAt: a.due_at } : {}),
      })),
      business: {
        balanceCents: cents(business?.balance ?? 0),
        availableCents: cents(business?.available_balance ?? 0),
        cardSpendCents: (cardsRes.data ?? [])
          .filter((c) => c.account_id === business?.id)
          .reduce((sum, c) => sum + cents(c.spent), 0),
        pendingApprovalCents: cents(business?.balance ?? 0) - cents(business?.available_balance ?? 0),
      },
      pay: {
        todaySalesCents: paySales,
        pendingSettlementCents: cents(merchantRow?.pending_settlement ?? 0),
        refundsCents: (txRes.data ?? [])
          .filter((t) => t.status === "refunded")
          .reduce((sum, t) => sum + Math.abs(cents(t.amount)), 0),
      },
    };
  },
);