import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const money = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

export const dt = (d: string) =>
  new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });

const uid = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();

export type Txn = {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  status: "booked" | "pending";
};
export type Pot = { id: string; name: string; balance: number; target: number };
export type Card = {
  id: string;
  label: string;
  holder: string;
  type: "physical" | "virtual";
  last4: string;
  frozen: boolean;
  limit: number;
  spent: number;
};
export type SupportCase = {
  id: string;
  ref: string;
  subject: string;
  category: string;
  description: string;
  status: "open" | "in_review" | "resolved";
  createdAt: string;
};
export type PaymentLink = {
  id: string;
  reference: string;
  description: string;
  amount: number;
  url: string;
  status: "active" | "paid";
  createdAt: string;
};
export type TeamMember = {
  id: string;
  name: string;
  role: "Owner" | "Admin" | "Finance" | "Employee";
  cardLast4: string;
  limit: number;
  spent: number;
  frozen: boolean;
};
export type Terminal = {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "charging";
  battery: number;
  firmware: string;
};
export type Settlement = {
  id: string;
  date: string;
  gross: number;
  fees: number;
  net: number;
  status: "paid" | "in_transit" | "scheduled";
};
export type MerchantPayment = {
  id: string;
  time: string;
  amount: number;
  method: "Tap to Pay" | "Terminal" | "Payment link" | "Online";
  status: "captured" | "refunded";
  scheme: string;
};
export type QueueItem = {
  id: string;
  name: string;
  kind: "KYC" | "KYB";
  submitted: string;
  risk: "low" | "medium" | "high";
  status: "IN_REVIEW" | "ACTION_REQUIRED" | "APPROVED" | "RESTRICTED";
};
export type WebhookEvent = {
  id: string;
  source: string;
  type: string;
  receivedAt: string;
  status: "processed" | "queued" | "failed";
};

const seedTxns: Txn[] = [
  { id: uid(), date: "2026-07-31", name: "Salary — LoungeTech GmbH", category: "Income", amount: 3420, status: "booked" },
  { id: uid(), date: "2026-07-30", name: "REWE Markt", category: "Groceries", amount: -62.35, status: "booked" },
  { id: uid(), date: "2026-07-29", name: "DB Bahn", category: "Travel", amount: -42.9, status: "booked" },
  { id: uid(), date: "2026-07-28", name: "Cafe 1 Demo", category: "Hospitality", amount: -18.4, status: "booked" },
  { id: uid(), date: "2026-07-27", name: "Vodafone DE", category: "Utilities", amount: -39.99, status: "booked" },
  { id: uid(), date: "2026-07-26", name: "Rewards cashback", category: "Zoryn Points", amount: 12.8, status: "booked" },
  { id: uid(), date: "2026-07-25", name: "Miete August", category: "Housing", amount: -1180, status: "booked" },
  { id: uid(), date: "2026-07-24", name: "Amazon.de", category: "Shopping", amount: -84.2, status: "booked" },
];

export type State = {
  personal: {
    holder: string;
    iban: string;
    bic: string;
    balance: number;
    points: number;
    tier: string;
    pendingPoints: number;
    rewardsWallet: number;
    cashbackDestination: string;
    pots: Pot[];
    txns: Txn[];
    cards: Card[];
    cases: SupportCase[];
    beneficiaries: { name: string; iban: string }[];
  };
  business: {
    name: string;
    iban: string;
    balance: number;
    todaySales: number;
    pendingSettlement: number;
    txns: Txn[];
    team: TeamMember[];
    links: PaymentLink[];
    points: number;
    tier: string;
    pendingPoints: number;
    rewardsWallet: number;
    cashbackDestination: string;
    cases: SupportCase[];
    suppliers: { name: string; iban: string }[];
  };
  merchant: {
    name: string;
    balance: number;
    pendingSettlement: number;
    payments: MerchantPayment[];
    links: PaymentLink[];
    terminals: Terminal[];
    settlements: Settlement[];
    loyalty: { members: number; stamps: number; redemptions: number; campaigns: { name: string; reward: string; active: boolean; joined: number }[] };
    cases: SupportCase[];
  };
  admin: {
    customers: number;
    organisations: number;
    merchants: number;
    volume: number;
    queue: QueueItem[];
    webhooks: WebhookEvent[];
    cases: SupportCase[];
    audit: { id: string; actor: string; action: string; at: string }[];
    providers: { key: string; name: string; mode: string; status: "operational" | "degraded" | "mock"; latency: string }[];
  };
};

export const initialState: State = {
  personal: {
    holder: "Amer Saleem",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "ZORYDEB2XXX",
    balance: 8420.65,
    points: 1840,
    tier: "Silver",
    pots: [
      { id: "pot-1", name: "Emergency fund", balance: 2150, target: 5000 },
      { id: "pot-2", name: "Urlaub 2027", balance: 640.2, target: 2500 },
      { id: "pot-3", name: "Neues Fahrrad", balance: 310, target: 1200 },
    ],
    txns: seedTxns,
    cards: [
      { id: "card-p1", label: "Zoryn Metal", holder: "AMER SALEEM", type: "physical", last4: "4412", frozen: false, limit: 2000, spent: 1284.2 },
      { id: "card-p2", label: "Online shopping", holder: "AMER SALEEM", type: "virtual", last4: "8821", frozen: false, limit: 500, spent: 184.6 },
      { id: "card-p3", label: "Subscriptions", holder: "AMER SALEEM", type: "virtual", last4: "1094", frozen: true, limit: 200, spent: 79.98 },
    ],
    cases: [
      { id: uid(), ref: "SC-1042", subject: "Disputed charge — order #4402", category: "payment", description: "Merchant charged twice.", status: "in_review", createdAt: "2026-07-24T09:12:00Z" },
    ],
    beneficiaries: [
      { name: "Lena Hoffmann", iban: "DE02 1203 0000 0000 2020 51" },
      { name: "Stadtwerke München", iban: "DE44 5001 0517 5407 3249 31" },
      { name: "Nordic Beans UG", iban: "DE12 5001 0517 0648 4898 90" },
    ],
  },
  business: {
    name: "LoungeTech Demo GmbH",
    iban: "DE71 1001 1001 9876 5432 10",
    balance: 48620.4,
    todaySales: 4230.8,
    pendingSettlement: 3180.4,
    txns: [
      { id: uid(), date: "2026-07-31", name: "ZorynPay settlement", category: "Settlement", amount: 3180.4, status: "booked" },
      { id: uid(), date: "2026-07-30", name: "Invoice INV-2291 — Kunde AG", category: "Income", amount: 6120, status: "booked" },
      { id: uid(), date: "2026-07-29", name: "Supplier payout — Nordic Beans", category: "Payout", amount: -2480, status: "booked" },
      { id: uid(), date: "2026-07-28", name: "Payroll run (12 staff)", category: "Payroll", amount: -18420, status: "booked" },
      { id: uid(), date: "2026-07-27", name: "Team card — M. Keller", category: "Expenses", amount: -184.2, status: "booked" },
    ],
    team: [
      { id: "tm-1", name: "Amer Saleem", role: "Owner", cardLast4: "2201", limit: 5000, spent: 1840.5, frozen: false },
      { id: "tm-2", name: "Marta Keller", role: "Finance", cardLast4: "7714", limit: 2500, spent: 1284.2, frozen: false },
      { id: "tm-3", name: "Jonas Weber", role: "Employee", cardLast4: "5510", limit: 800, spent: 642.8, frozen: false },
      { id: "tm-4", name: "Sofia Bauer", role: "Employee", cardLast4: "3390", limit: 800, spent: 120.4, frozen: true },
    ],
    links: [
      { id: uid(), reference: "PL-8821", description: "Consulting retainer", amount: 2400, url: "https://pay.zoryn.demo/PL-8821", status: "paid", createdAt: "2026-07-28T10:00:00Z" },
    ],
    points: 24600,
    cases: [],
    suppliers: [
      { name: "Nordic Beans UG", iban: "DE12 5001 0517 0648 4898 90" },
      { name: "Bürobedarf Schmidt", iban: "DE31 3704 0044 0111 2233 44" },
      { name: "CloudHost GmbH", iban: "DE55 2004 1155 0099 8877 66" },
    ],
  },
  merchant: {
    name: "Cafe 1 Demo",
    balance: 3180.4,
    pendingSettlement: 1284.6,
    payments: [
      { id: uid(), time: "2026-07-31T10:42:00Z", amount: 24.5, method: "Tap to Pay", status: "captured", scheme: "Visa" },
      { id: uid(), time: "2026-07-31T10:12:00Z", amount: 86.9, method: "Online", status: "captured", scheme: "Mastercard" },
      { id: uid(), time: "2026-07-31T09:51:00Z", amount: 12.8, method: "Terminal", status: "captured", scheme: "Girocard" },
      { id: uid(), time: "2026-07-30T18:22:00Z", amount: 32.4, method: "Terminal", status: "refunded", scheme: "Visa" },
    ],
    links: [
      { id: uid(), reference: "PL-4471", description: "Catering order", amount: 240, url: "https://pay.zoryn.demo/PL-4471", status: "active", createdAt: "2026-07-30T08:00:00Z" },
    ],
    terminals: [
      { id: "t-01", name: "Terminal 01", location: "Counter", status: "online", battery: 82, firmware: "4.8.1" },
      { id: "t-02", name: "Terminal 02", location: "Terrace", status: "charging", battery: 34, firmware: "4.8.1" },
      { id: "t-03", name: "Tap to Pay — iPhone", location: "Mobile", status: "online", battery: 61, firmware: "4.9.0" },
    ],
    settlements: [
      { id: uid(), date: "2026-07-30", gross: 1320.4, fees: 18.6, net: 1301.8, status: "paid" },
      { id: uid(), date: "2026-07-29", gross: 980.2, fees: 14.1, net: 966.1, status: "paid" },
      { id: uid(), date: "2026-07-31", gross: 1284.6, fees: 19.2, net: 1265.4, status: "in_transit" },
    ],
    loyalty: {
      members: 612,
      stamps: 1940,
      redemptions: 88,
      campaigns: [
        { name: "Coffee stamp card", reward: "10th coffee free", active: true, joined: 412 },
        { name: "Double points Tuesdays", reward: "2× Zoryn Points", active: true, joined: 200 },
      ],
    },
    cases: [],
  },
  admin: {
    customers: 12480,
    organisations: 1380,
    merchants: 412,
    volume: 4280000,
    queue: [
      { id: "q-1", name: "Cafe 1 Demo", kind: "KYB", submitted: "2026-07-30", risk: "low", status: "IN_REVIEW" },
      { id: "q-2", name: "Lena Hoffmann", kind: "KYC", submitted: "2026-07-30", risk: "medium", status: "ACTION_REQUIRED" },
      { id: "q-3", name: "Nordwind Handel UG", kind: "KYB", submitted: "2026-07-29", risk: "high", status: "IN_REVIEW" },
      { id: "q-4", name: "Jonas Weber", kind: "KYC", submitted: "2026-07-29", risk: "low", status: "IN_REVIEW" },
    ],
    webhooks: [
      { id: uid(), source: "Banking adapter", type: "account.updated", receivedAt: "2026-07-31T10:41:00Z", status: "processed" },
      { id: uid(), source: "Acquiring adapter", type: "payment.captured", receivedAt: "2026-07-31T10:40:00Z", status: "processed" },
      { id: uid(), source: "Acquiring adapter", type: "settlement.created", receivedAt: "2026-07-31T06:02:00Z", status: "queued" },
      { id: uid(), source: "Banking adapter", type: "card.status_changed", receivedAt: "2026-07-30T21:14:00Z", status: "failed" },
    ],
    cases: [
      { id: uid(), ref: "SC-1042", subject: "Disputed charge — order #4402", category: "payment", description: "Escalated from personal portal.", status: "in_review", createdAt: "2026-07-24T09:12:00Z" },
      { id: uid(), ref: "SC-1051", subject: "Terminal 02 offline", category: "other", description: "Merchant reports intermittent connection.", status: "open", createdAt: "2026-07-29T14:02:00Z" },
    ],
    audit: [
      { id: uid(), actor: "ops@loungetech", action: "KYB approved — Cafe 1 Demo", at: "2026-07-30T12:04:00Z" },
      { id: uid(), actor: "system", action: "Webhook replay — settlements", at: "2026-07-30T06:10:00Z" },
      { id: uid(), actor: "ops@loungetech", action: "Card restricted — 3390", at: "2026-07-29T16:44:00Z" },
    ],
    providers: [
      { key: "banking", name: "Banking adapter", mode: "Demo / mock", status: "mock", latency: "82 ms" },
      { key: "acquiring", name: "Acquiring adapter", mode: "Demo / mock", status: "mock", latency: "104 ms" },
      { key: "database", name: "Database & auth", mode: "Managed", status: "operational", latency: "31 ms" },
      { key: "webhooks", name: "Webhook ingestion", mode: "Managed", status: "operational", latency: "12 ms" },
    ],
  },
};

type Ctx = {
  state: State;
  notice: string;
  notify: (m: string) => void;
  movePersonalFunds: (from: string, to: string, amount: number) => string | null;
  sepaTransfer: (p: { name: string; iban: string; amount: number; reference: string }) => string | null;
  toggleCard: (id: string) => void;
  setCardLimit: (id: string, limit: number) => void;
  redeemPoints: (points: number) => string | null;
  createCase: (role: RoleKey, c: { subject: string; category: string; description: string }) => void;
  resolveCase: (role: RoleKey, id: string) => void;
  supplierPayment: (p: { name: string; iban: string; amount: number; reference: string }) => string | null;
  createLink: (role: "business" | "merchant", p: { description: string; amount: number }) => void;
  setTeamLimit: (id: string, limit: number) => void;
  toggleTeamCard: (id: string) => void;
  takePayment: (amount: number, method: MerchantPayment["method"]) => void;
  refundPayment: (id: string) => void;
  settleNow: () => void;
  decideQueue: (id: string, status: QueueItem["status"]) => void;
  replayWebhooks: () => void;
};

export type RoleKey = "personal" | "business" | "merchant" | "admin";

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [notice, setNotice] = useState("");

  // Load the seeded demo dataset from the database; the built-in constants
  // remain the fallback so the portals render even if the read fails.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { loadDemoState } = await import("./zoryn-db");
        const next = await loadDemoState();
        if (!cancelled) setState(next);
      } catch {
        /* keep fallback data */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const notify = useCallback((m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(""), 3200);
  }, []);

  const logAudit = (action: string) =>
    setState((s) => ({
      ...s,
      admin: { ...s.admin, audit: [{ id: uid(), actor: "demo-user", action, at: nowISO() }, ...s.admin.audit].slice(0, 30) },
    }));

  const value = useMemo<Ctx>(() => {
    const api: Ctx = {
      state,
      notice,
      notify,

      movePersonalFunds: (from, to, amount) => {
        if (!(amount > 0)) return "Enter an amount greater than €0.";
        if (from === to) return "Choose two different balances.";
        const p = state.personal;
        const available = from === "main" ? p.balance : (p.pots.find((x) => x.id === from)?.balance ?? 0);
        if (amount > available) return `Not enough funds — available ${money(available)}.`;
        setState((s) => {
          const per = { ...s.personal };
          per.pots = per.pots.map((pot) => {
            if (pot.id === from) return { ...pot, balance: +(pot.balance - amount).toFixed(2) };
            if (pot.id === to) return { ...pot, balance: +(pot.balance + amount).toFixed(2) };
            return pot;
          });
          if (from === "main") per.balance = +(per.balance - amount).toFixed(2);
          if (to === "main") per.balance = +(per.balance + amount).toFixed(2);
          const label = (k: string) => (k === "main" ? "Main balance" : (per.pots.find((x) => x.id === k)?.name ?? "Pot"));
          per.txns = [
            { id: uid(), date: nowISO().slice(0, 10), name: `${label(from)} → ${label(to)}`, category: "Internal transfer", amount: 0, status: "booked" },
            ...per.txns,
          ];
          return { ...s, personal: per };
        });
        notify(`${money(amount)} moved successfully.`);
        return null;
      },

      sepaTransfer: ({ name, iban, amount, reference }) => {
        if (!name.trim() || iban.replace(/\s/g, "").length < 15) return "Enter a payee name and a valid IBAN.";
        if (!(amount > 0)) return "Enter an amount greater than €0.";
        if (amount > state.personal.balance) return `Not enough funds — available ${money(state.personal.balance)}.`;
        setState((s) => ({
          ...s,
          personal: {
            ...s.personal,
            balance: +(s.personal.balance - amount).toFixed(2),
            points: s.personal.points + Math.floor(amount / 10),
            txns: [
              { id: uid(), date: nowISO().slice(0, 10), name: `SEPA — ${name}`, category: reference || "Transfer", amount: -amount, status: "pending" },
              ...s.personal.txns,
            ],
          },
        }));
        logAudit(`SEPA transfer ${money(amount)} to ${name}`);
        notify(`SEPA transfer of ${money(amount)} to ${name} submitted.`);
        return null;
      },

      toggleCard: (id) => {
        setState((s) => ({
          ...s,
          personal: { ...s.personal, cards: s.personal.cards.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c)) },
        }));
        const card = state.personal.cards.find((c) => c.id === id);
        notify(card?.frozen ? `Card •••• ${card.last4} unfrozen.` : `Card •••• ${card?.last4} frozen.`);
      },

      setCardLimit: (id, limit) => {
        setState((s) => ({
          ...s,
          personal: { ...s.personal, cards: s.personal.cards.map((c) => (c.id === id ? { ...c, limit } : c)) },
        }));
        notify(`Monthly limit updated to ${money(limit)}.`);
      },

      redeemPoints: (points) => {
        if (points < 500) return "Minimum redemption is 500 points.";
        if (points % 500 !== 0) return "Redeem in multiples of 500 points.";
        if (points > state.personal.points) return `You only have ${state.personal.points} points.`;
        const credit = (points / 500) * 5;
        setState((s) => ({
          ...s,
          personal: {
            ...s.personal,
            points: s.personal.points - points,
            balance: +(s.personal.balance + credit).toFixed(2),
            txns: [
              { id: uid(), date: nowISO().slice(0, 10), name: "Zoryn Rewards redemption", category: "Zoryn Points", amount: credit, status: "booked" },
              ...s.personal.txns,
            ],
          },
        }));
        notify(`${points} points converted into ${money(credit)}.`);
        return null;
      },

      createCase: (role, c) => {
        const item: SupportCase = {
          id: uid(),
          ref: `SC-${Math.floor(1100 + Math.random() * 800)}`,
          subject: c.subject,
          category: c.category,
          description: c.description,
          status: "open",
          createdAt: nowISO(),
        };
        setState((s) => ({
          ...s,
          [role]: { ...s[role], cases: [item, ...s[role].cases] },
          admin: role === "admin" ? { ...s.admin, cases: [item, ...s.admin.cases] } : { ...s.admin, cases: [item, ...s.admin.cases] },
        }));
        notify(`Support case ${item.ref} created.`);
      },

      resolveCase: (role, id) => {
        setState((s) => ({
          ...s,
          [role]: { ...s[role], cases: s[role].cases.map((c) => (c.id === id ? { ...c, status: "resolved" as const } : c)) },
        }));
        notify("Case marked as resolved.");
      },

      supplierPayment: ({ name, iban, amount, reference }) => {
        if (!name.trim() || iban.replace(/\s/g, "").length < 15) return "Select a supplier with a valid IBAN.";
        if (!(amount > 0)) return "Enter an amount greater than €0.";
        if (amount > state.business.balance) return `Not enough funds — available ${money(state.business.balance)}.`;
        setState((s) => ({
          ...s,
          business: {
            ...s.business,
            balance: +(s.business.balance - amount).toFixed(2),
            txns: [
              { id: uid(), date: nowISO().slice(0, 10), name: `Supplier payout — ${name}`, category: reference || "Payout", amount: -amount, status: "pending" },
              ...s.business.txns,
            ],
          },
        }));
        notify(`Supplier payment of ${money(amount)} to ${name} submitted.`);
        return null;
      },

      createLink: (role, { description, amount }) => {
        const link: PaymentLink = {
          id: uid(),
          reference: `PL-${Math.floor(1000 + Math.random() * 9000)}`,
          description,
          amount,
          url: "",
          status: "active",
          createdAt: nowISO(),
        };
        link.url = `https://pay.zoryn.demo/${link.reference}`;
        setState((s) => ({ ...s, [role]: { ...s[role], links: [link, ...s[role].links] } }));
        notify(`Payment link ${link.reference} created for ${money(amount)}.`);
      },

      setTeamLimit: (id, limit) => {
        setState((s) => ({
          ...s,
          business: { ...s.business, team: s.business.team.map((t) => (t.id === id ? { ...t, limit } : t)) },
        }));
        notify(`Card limit updated to ${money(limit)}.`);
      },

      toggleTeamCard: (id) => {
        setState((s) => ({
          ...s,
          business: { ...s.business, team: s.business.team.map((t) => (t.id === id ? { ...t, frozen: !t.frozen } : t)) },
        }));
        notify("Staff card status updated.");
      },

      takePayment: (amount, method) => {
        const payment: MerchantPayment = {
          id: uid(),
          time: nowISO(),
          amount,
          method,
          status: "captured",
          scheme: ["Visa", "Mastercard", "Girocard", "Apple Pay"][Math.floor(Math.random() * 4)]!,
        };
        setState((s) => ({
          ...s,
          merchant: {
            ...s.merchant,
            payments: [payment, ...s.merchant.payments],
            balance: +(s.merchant.balance + amount).toFixed(2),
            pendingSettlement: +(s.merchant.pendingSettlement + amount).toFixed(2),
            loyalty: { ...s.merchant.loyalty, stamps: s.merchant.loyalty.stamps + 1 },
          },
          business: { ...s.business, todaySales: +(s.business.todaySales + amount).toFixed(2), pendingSettlement: +(s.business.pendingSettlement + amount).toFixed(2) },
          admin: {
            ...s.admin,
            webhooks: [{ id: uid(), source: "Acquiring adapter", type: "payment.captured", receivedAt: nowISO(), status: "processed" as const }, ...s.admin.webhooks].slice(0, 20),
          },
        }));
      },

      refundPayment: (id) => {
        const p = state.merchant.payments.find((x) => x.id === id);
        if (!p || p.status === "refunded") return;
        setState((s) => ({
          ...s,
          merchant: {
            ...s.merchant,
            payments: s.merchant.payments.map((x) => (x.id === id ? { ...x, status: "refunded" as const } : x)),
            balance: +(s.merchant.balance - p.amount).toFixed(2),
            pendingSettlement: +(s.merchant.pendingSettlement - p.amount).toFixed(2),
          },
        }));
        notify(`Refund of ${money(p.amount)} issued.`);
      },

      settleNow: () => {
        const amount = state.merchant.pendingSettlement;
        if (amount <= 0) {
          notify("Nothing pending to settle.");
          return;
        }
        const fees = +(amount * 0.015).toFixed(2);
        setState((s) => ({
          ...s,
          merchant: {
            ...s.merchant,
            pendingSettlement: 0,
            settlements: [
              { id: uid(), date: nowISO().slice(0, 10), gross: amount, fees, net: +(amount - fees).toFixed(2), status: "paid" as const },
              ...s.merchant.settlements,
            ],
          },
          business: {
            ...s.business,
            balance: +(s.business.balance + (amount - fees)).toFixed(2),
            pendingSettlement: 0,
            txns: [
              { id: uid(), date: nowISO().slice(0, 10), name: "ZorynPay settlement", category: "Settlement", amount: +(amount - fees).toFixed(2), status: "booked" as const },
              ...s.business.txns,
            ],
          },
        }));
        notify(`Settlement of ${money(amount - fees)} paid out to the business account.`);
      },

      decideQueue: (id, status) => {
        setState((s) => ({
          ...s,
          admin: {
            ...s.admin,
            queue: s.admin.queue.map((q) => (q.id === id ? { ...q, status } : q)),
            audit: [{ id: uid(), actor: "ops@loungetech", action: `${status} — ${s.admin.queue.find((q) => q.id === id)?.name}`, at: nowISO() }, ...s.admin.audit],
          },
        }));
        notify(`Case updated to ${status.replace("_", " ").toLowerCase()}.`);
      },

      replayWebhooks: () => {
        setState((s) => ({
          ...s,
          admin: {
            ...s.admin,
            webhooks: s.admin.webhooks.map((w) => (w.status === "failed" || w.status === "queued" ? { ...w, status: "processed" as const } : w)),
          },
        }));
        notify("Queued and failed webhook events replayed.");
      },
    };
    return api;
  }, [state, notice, notify]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
