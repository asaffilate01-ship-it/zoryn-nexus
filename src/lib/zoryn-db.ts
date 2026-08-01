import { supabase } from "@/integrations/supabase/client";
import { initialState, type State } from "./zoryn-store";

const PERSONAL_ACCOUNT = "c0000000-0000-4000-8000-000000000001";
const BUSINESS_ACCOUNT = "c0000000-0000-4000-8000-000000000002";
const MERCHANT_ACCOUNT = "c0000000-0000-4000-8000-000000000003";
const BUSINESS_ORG = "a0000000-0000-4000-8000-000000000001";
const MERCHANT_ORG = "a0000000-0000-4000-8000-000000000002";
const PERSONAL_ORG = "a0000000-0000-4000-8000-000000000004";
const BUSINESS_LINK_REFS = ["PL-8821"];

const num = (v: unknown) => Number(v ?? 0);

const toTxn = (r: any) => ({
  id: r.id as string,
  date: String(r.occurred_at).slice(0, 10),
  name: r.title as string,
  category: (r.subtitle as string) ?? "Other",
  amount: num(r.amount),
  status: (r.status === "pending" ? "pending" : "booked") as "booked" | "pending",
});

const toLink = (r: any) => ({
  id: r.id as string,
  reference: (r.provider_reference as string) ?? r.id,
  description: r.label as string,
  amount: num(r.amount),
  url: (r.url as string) ?? "",
  status: (r.status === "paid" ? "paid" : "active") as "active" | "paid",
  createdAt: r.created_at as string,
});

const toCase = (r: any) => ({
  id: r.id as string,
  ref: r.reference as string,
  subject: r.subject as string,
  category: r.priority === "high" ? "payment" : "other",
  description: r.subject as string,
  status: (r.status === "resolved" ? "resolved" : r.status === "in_review" ? "in_review" : "open") as
    | "open"
    | "in_review"
    | "resolved",
  createdAt: r.created_at as string,
});

/**
 * Loads the demo dataset from the database (rows flagged `is_demo`, readable
 * without signing in). Anything the query can't supply falls back to the
 * built-in constants so the portals always render.
 */
export async function loadDemoState(): Promise<State> {
  const [accounts, pots, cards, txns, orgs, members, merchants, links, terminals, loyalty, loyaltyEntries, cases, events, audit] =
    await Promise.all([
      supabase.from("financial_accounts").select("*").eq("is_demo", true),
      supabase.from("pots").select("*").eq("is_demo", true),
      supabase.from("cards").select("*").eq("is_demo", true),
      supabase.from("transactions").select("*").eq("is_demo", true).order("occurred_at", { ascending: false }),
      supabase.from("organisations").select("*").eq("is_demo", true),
      supabase.from("organisation_members").select("*").eq("is_demo", true),
      supabase.from("merchants").select("*").eq("is_demo", true),
      supabase.from("payment_links").select("*").eq("is_demo", true),
      supabase.from("terminals").select("*").eq("is_demo", true),
      supabase.from("loyalty_accounts").select("*").eq("is_demo", true),
      supabase.from("loyalty_entries").select("*").eq("is_demo", true),
      supabase.from("support_cases").select("*").eq("is_demo", true),
      supabase.from("provider_events").select("*").eq("is_demo", true).order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").eq("is_demo", true).order("created_at", { ascending: false }),
    ]);

  const acc = (accounts.data ?? []) as any[];
  if (acc.length === 0) return initialState;

  const account = (id: string) => acc.find((a) => a.id === id);
  const personalAcc = account(PERSONAL_ACCOUNT);
  const businessAcc = account(BUSINESS_ACCOUNT);
  const merchantAcc = account(MERCHANT_ACCOUNT);

  const allCards = (cards.data ?? []) as any[];
  const allTxns = (txns.data ?? []) as any[];
  const allLinks = (links.data ?? []) as any[];
  const allCases = (cases.data ?? []) as any[];
  const allOrgs = (orgs.data ?? []) as any[];
  const allLoyalty = (loyalty.data ?? []) as any[];
  const merchantRow = ((merchants.data ?? []) as any[])[0];
  const loyaltyFor = (orgId: string | null) =>
    allLoyalty.find((l) => (orgId === null ? l.organisation_id === null : l.organisation_id === orgId));

  const base = initialState;

  const personalLoyalty = loyaltyFor(PERSONAL_ORG);
  const personal: State["personal"] = {
    ...base.personal,
    holder: personalAcc?.account_name ?? base.personal.holder,
    iban: personalAcc?.iban ?? base.personal.iban,
    balance: num(personalAcc?.balance ?? base.personal.balance),
    points: Number(personalLoyalty?.points ?? base.personal.points),
    tier: personalLoyalty ? String(personalLoyalty.tier).replace(/^./, (c: string) => c.toUpperCase()) : base.personal.tier,
    pots: ((pots.data ?? []) as any[])
      .filter((p) => p.account_id === PERSONAL_ACCOUNT)
      .map((p) => ({ id: p.id as string, name: p.name as string, balance: num(p.balance), target: num(p.target) })),
    txns: allTxns.filter((t) => t.account_id === PERSONAL_ACCOUNT).map(toTxn),
    cards: allCards
      .filter((c) => c.account_id === PERSONAL_ACCOUNT)
      .map((c) => ({
        id: c.id as string,
        label: c.name as string,
        holder: String(personalAcc?.account_name ?? "").toUpperCase(),
        type: (c.card_type === "physical" ? "physical" : "virtual") as "physical" | "virtual",
        last4: c.last_four as string,
        frozen: c.status !== "active",
        limit: num(c.monthly_limit),
        spent: num(c.spent),
      })),
    cases: allCases.filter((c) => c.organisation_id === PERSONAL_ORG).map(toCase),
  };

  const businessTxns = allTxns.filter((t) => t.account_id === BUSINESS_ACCOUNT);
  const businessCards = allCards.filter((c) => c.account_id === BUSINESS_ACCOUNT);
  const business: State["business"] = {
    ...base.business,
    name: businessAcc?.account_name ?? base.business.name,
    iban: businessAcc?.iban ?? base.business.iban,
    balance: num(businessAcc?.balance ?? base.business.balance),
    pendingSettlement: num(merchantRow?.pending_settlement ?? base.business.pendingSettlement),
    txns: businessTxns.map(toTxn),
    team: ((members.data ?? []) as any[])
      .filter((m) => m.organisation_id === BUSINESS_ORG)
      .map((m, i) => {
        const card = businessCards.find((c) => c.name === m.display_name) ?? businessCards[i];
        return {
          id: m.id as string,
          name: m.display_name as string,
          role: (m.role as State["business"]["team"][number]["role"]) ?? "Employee",
          cardLast4: (card?.last_four as string) ?? "0000",
          limit: num(m.monthly_limit),
          spent: num(m.spent),
          frozen: card ? card.status !== "active" : false,
        };
      }),
    links: allLinks.filter((l) => BUSINESS_LINK_REFS.includes(l.provider_reference)).map(toLink),
    points: Number(loyaltyFor(BUSINESS_ORG)?.points ?? base.business.points),
    cases: allCases.filter((c) => c.organisation_id === BUSINESS_ORG).map(toCase),
  };

  const merchantTxns = allTxns.filter((t) => t.account_id === MERCHANT_ACCOUNT);
  const merchantLoyalty = loyaltyFor(MERCHANT_ORG);
  const merchant: State["merchant"] = {
    ...base.merchant,
    name: merchantAcc?.account_name ?? base.merchant.name,
    balance: num(merchantAcc?.balance ?? base.merchant.balance),
    pendingSettlement: num(merchantRow?.pending_settlement ?? base.merchant.pendingSettlement),
    payments: merchantTxns.map((t) => ({
      id: t.id as string,
      time: t.occurred_at as string,
      amount: Math.abs(num(t.amount)),
      method: (String(t.subtitle) as State["merchant"]["payments"][number]["method"]) ?? "Terminal",
      status: (t.status === "refunded" ? "refunded" : "captured") as "captured" | "refunded",
      scheme: String(t.title).split("—").pop()?.trim() ?? "Visa",
    })),
    links: allLinks.filter((l) => !BUSINESS_LINK_REFS.includes(l.provider_reference)).map(toLink),
    terminals: ((terminals.data ?? []) as any[]).map((t) => {
      const [name, location] = String(t.name).split("—").map((s) => s.trim());
      return {
        id: t.id as string,
        name: name ?? "Terminal",
        location: location ?? "Store",
        status: (["online", "offline", "charging"].includes(t.status) ? t.status : "online") as
          | "online"
          | "offline"
          | "charging",
        battery: Number(t.battery ?? 0),
        firmware: "4.8.1",
      };
    }),
    loyalty: {
      ...base.merchant.loyalty,
      members: Number(merchantLoyalty?.points ? Math.round(Number(merchantLoyalty.points) / 14.6) : base.merchant.loyalty.members),
      stamps: ((loyaltyEntries.data ?? []) as any[]).reduce((sum, e) => sum + Math.max(0, Number(e.points ?? 0)), 0),
    },
    cases: allCases.filter((c) => c.organisation_id === MERCHANT_ORG).map(toCase),
  };

  const admin: State["admin"] = {
    ...base.admin,
    organisations: allOrgs.length,
    merchants: ((merchants.data ?? []) as any[]).length,
    volume: allTxns.reduce((sum, t) => sum + Math.abs(num(t.amount)), 0),
    queue: allOrgs
      .filter((o) => o.status !== "approved" || o.kind === "merchant")
      .map((o) => ({
        id: o.id as string,
        name: o.name as string,
        kind: (o.kind === "merchant" ? "KYB" : "KYB") as "KYC" | "KYB",
        submitted: String(o.created_at).slice(0, 10),
        risk: (o.status === "approved" ? "low" : "medium") as "low" | "medium" | "high",
        status: (o.status === "approved"
          ? "APPROVED"
          : o.status === "action_required"
            ? "ACTION_REQUIRED"
            : "IN_REVIEW") as State["admin"]["queue"][number]["status"],
      })),
    webhooks: ((events.data ?? []) as any[]).map((e) => ({
      id: e.id as string,
      source: e.provider === "mock_banking" ? "Banking adapter" : "Acquiring adapter",
      type: e.event_type as string,
      receivedAt: e.created_at as string,
      status: (e.processed_at ? "processed" : "queued") as "processed" | "queued" | "failed",
    })),
    cases: allCases.map(toCase),
    audit: ((audit.data ?? []) as any[]).map((a) => ({
      id: a.id as string,
      actor: (a.metadata?.actor as string) ?? "system",
      action: a.action as string,
      at: a.created_at as string,
    })),
  };

  return { personal, business, merchant, admin };
}
