import {
  Building2,
  CreditCard,
  Gift,
  LayoutDashboard,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Store,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type Role = "personal" | "business" | "merchant" | "admin";
export type PageKey =
  | "overview"
  | "accounts"
  | "cards"
  | "payments"
  | "rewards"
  | "team"
  | "compliance"
  | "support";

export const money = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

export type Stat = { label: string; value: number | string; format?: "money" | "number" };

export type PortalConfig = {
  name: string;
  tagline: string;
  user: string;
  balance: number;
  primaryLabel: string;
  primarySubtitle: string;
  primaryAction: string;
  primaryActionResult: string;
  stats: Stat[];
};

export const portalConfigs: Record<Role, PortalConfig> = {
  personal: {
    name: "Personal",
    tagline: "Everyday money and rewards",
    user: "Amer Saleem",
    balance: 8420.65,
    primaryLabel: "Primary account",
    primarySubtitle: "DE89 3704 0044 0532 0130 00",
    primaryAction: "Send money",
    primaryActionResult: "Transfer created in demo mode",
    stats: [
      { label: "Available balance", value: 8420.65, format: "money" },
      { label: "Zoryn Points", value: 1840, format: "number" },
      { label: "Spent this month", value: 1284.2, format: "money" },
      { label: "Card status", value: "Active" },
    ],
  },
  business: {
    name: "Business",
    tagline: "Company accounts, team cards, payouts",
    user: "LoungeTech Demo GmbH",
    balance: 48620.4,
    primaryLabel: "Business account",
    primarySubtitle: "DE71 1001 1001 9876 5432 10",
    primaryAction: "Create payout",
    primaryActionResult: "Payout queued in demo mode",
    stats: [
      { label: "Business balance", value: 48620.4, format: "money" },
      { label: "Today's sales", value: 4230.8, format: "money" },
      { label: "Pending settlement", value: 3180.4, format: "money" },
      { label: "Active cards", value: 8, format: "number" },
    ],
  },
  merchant: {
    name: "ZorynPay",
    tagline: "Take payments in store and online",
    user: "Cafe 1 Demo",
    balance: 3180.4,
    primaryLabel: "Next settlement",
    primarySubtitle: "Arrives Monday · acquiring adapter",
    primaryAction: "Take payment",
    primaryActionResult: "Tap to Pay session started (mock)",
    stats: [
      { label: "Today's sales", value: 4230.8, format: "money" },
      { label: "Transactions", value: 47, format: "number" },
      { label: "Average ticket", value: 28.4, format: "money" },
      { label: "Refunds", value: 2, format: "number" },
    ],
  },
  admin: {
    name: "LoungeTech Admin",
    tagline: "Platform, compliance and provider operations",
    user: "Operations Team",
    balance: 0,
    primaryLabel: "Provider operations",
    primarySubtitle: "Provider adapters operational",
    primaryAction: "Review queue",
    primaryActionResult: "Opened KYC review queue (mock)",
    stats: [
      { label: "Customers", value: 12480, format: "number" },
      { label: "Businesses", value: 1380, format: "number" },
      { label: "KYC/KYB review", value: 28, format: "number" },
      { label: "Monthly volume", value: 4280000, format: "money" },
    ],
  },
};

export const portalNav: Record<Role, { key: PageKey; label: string; icon: LucideIcon }[]> = {
  personal: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "accounts", label: "Accounts", icon: WalletCards },
    { key: "cards", label: "Cards", icon: CreditCard },
    { key: "payments", label: "Transfers", icon: Send },
    { key: "rewards", label: "Rewards", icon: Gift },
    { key: "support", label: "Support", icon: ShieldCheck },
  ],
  business: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "accounts", label: "Account", icon: WalletCards },
    { key: "payments", label: "Payments", icon: ReceiptText },
    { key: "team", label: "Team & cards", icon: Users },
    { key: "rewards", label: "Rewards", icon: Gift },
    { key: "support", label: "Support", icon: ShieldCheck },
  ],
  merchant: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "payments", label: "Take payment", icon: Smartphone },
    { key: "accounts", label: "Settlements", icon: WalletCards },
    { key: "cards", label: "Terminals", icon: CreditCard },
    { key: "rewards", label: "Loyalty", icon: Gift },
    { key: "support", label: "Support", icon: ShieldCheck },
  ],
  admin: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "team", label: "Customers", icon: Users },
    { key: "compliance", label: "Compliance", icon: ShieldCheck },
    { key: "payments", label: "Payments", icon: ReceiptText },
    { key: "accounts", label: "Providers", icon: Building2 },
    { key: "support", label: "Support", icon: Store },
  ],
};

export const moduleTitles: Record<PageKey, string> = {
  overview: "Overview",
  accounts: "Accounts & settlements",
  cards: "Cards & terminals",
  payments: "Payments & transfers",
  rewards: "Zoryn Rewards",
  team: "Team & customers",
  compliance: "Compliance operations",
  support: "Support centre",
};

export type Activity = { name: string; category: string; amount: number };

export const recentActivityByRole: Record<Role, Activity[]> = {
  personal: [
    { name: "Cafe 1 St Albans", category: "Hospitality", amount: -18.4 },
    { name: "Salary payment", category: "Income", amount: 3420 },
    { name: "DB Bahn", category: "Travel", amount: -42.9 },
    { name: "REWE Markt", category: "Groceries", amount: -62.35 },
    { name: "Rewards cashback", category: "Zoryn Points", amount: 12.8 },
  ],
  business: [
    { name: "Supplier payout — Nordic Beans", category: "Payout", amount: -2480 },
    { name: "Customer invoice INV-2291", category: "Income", amount: 6120 },
    { name: "Team card — M. Keller", category: "Expenses", amount: -184.2 },
    { name: "Payroll run (12 staff)", category: "Payroll", amount: -18420 },
    { name: "ZorynPay settlement", category: "Settlement", amount: 3180.4 },
  ],
  merchant: [
    { name: "Tap to Pay — terminal 02", category: "In store", amount: 24.5 },
    { name: "Online checkout order #4471", category: "E-commerce", amount: 86.9 },
    { name: "Refund — order #4402", category: "Refund", amount: -32.4 },
    { name: "Tap to Pay — terminal 01", category: "In store", amount: 12.8 },
    { name: "Daily settlement batch", category: "Settlement", amount: 1284.6 },
  ],
  admin: [
    { name: "KYB approved — Cafe 1 Demo", category: "Compliance", amount: 0 },
    { name: "Chargeback escalation #118", category: "Disputes", amount: -420 },
    { name: "Platform fees collected", category: "Revenue", amount: 18420.5 },
    { name: "New merchant onboarded", category: "Onboarding", amount: 0 },
    { name: "Webhook replay — settlements", category: "Operations", amount: 0 },
  ],
};

export type Readiness = { label: string; state: string };

export const providerReadinessByRole: Record<Role, Readiness[]> = {
  personal: [
    { label: "Account adapter", state: "Ready" },
    { label: "Card issuing", state: "Ready" },
    { label: "Rewards engine", state: "Mock mode" },
    { label: "Row Level Security", state: "Configured" },
  ],
  business: [
    { label: "Banking adapter", state: "Ready" },
    { label: "Bulk payouts", state: "Mock mode" },
    { label: "Team card controls", state: "Ready" },
    { label: "Organisation roles", state: "Configured" },
  ],
  merchant: [
    { label: "Acquiring adapter", state: "Ready" },
    { label: "Tap to Pay", state: "Mock mode" },
    { label: "Settlement schedule", state: "Daily" },
    { label: "Loyalty linking", state: "Ready" },
  ],
  admin: [
    { label: "Provider proxy (server)", state: "Mock mode" },
    { label: "Webhook ingestion", state: "Ready" },
    { label: "Audit log", state: "Recording" },
    { label: "Row Level Security", state: "Configured" },
  ],
};

export type ModuleContent = {
  title: string;
  description: string;
  metrics: [string, string][];
  actionLabel: string;
  actionResult: string;
};

const fallbackModule = (role: Role, page: PageKey): ModuleContent => ({
  title: moduleTitles[page],
  description:
    "This module is wired to the shared Zoryn data model and runs in mock mode — no provider credentials are used.",
  metrics: [
    ["Status", "Ready"],
    ["Open items", role === "admin" ? "28" : "3"],
    ["Last sync", "Just now"],
  ],
  actionLabel: "Run demo action",
  actionResult: "Demo workflow completed",
});

const moduleContent: Partial<Record<Role, Partial<Record<PageKey, ModuleContent>>>> = {
  personal: {
    accounts: {
      title: "Your accounts",
      description: "Current account, savings pot and a joint account, all in demo mode.",
      metrics: [["Current", "€8,420.65"], ["Savings pot", "€2,150.00"], ["Joint", "€640.20"]],
      actionLabel: "Move money between pots",
      actionResult: "€100 moved to Savings pot (mock)",
    },
    cards: {
      title: "Your cards",
      description: "One physical card and two virtual cards with per-card spending limits.",
      metrics: [["Physical", "Active"], ["Virtual cards", "2"], ["Monthly limit", "€2,000"]],
      actionLabel: "Freeze physical card",
      actionResult: "Card frozen (mock)",
    },
    payments: {
      title: "Transfers",
      description: "SEPA transfers, standing orders and recent payees.",
      metrics: [["Scheduled", "3"], ["Payees", "14"], ["Sent this month", "€1,284.20"]],
      actionLabel: "New SEPA transfer",
      actionResult: "Transfer created in demo mode",
    },
    rewards: {
      title: "Zoryn Rewards",
      description: "Earn points on everyday spend and redeem with partner merchants.",
      metrics: [["Points", "1,840"], ["Tier", "Silver"], ["Cashback YTD", "€96.40"]],
      actionLabel: "Redeem 500 points",
      actionResult: "500 points redeemed for €5 credit (mock)",
    },
    support: {
      title: "Support",
      description: "Chat with the Zoryn team, dispute a transaction or replace a card.",
      metrics: [["Open tickets", "0"], ["Disputes", "1"], ["Response time", "< 2 min"]],
      actionLabel: "Start a chat",
      actionResult: "Support chat opened (mock)",
    },
  },
  business: {
    accounts: {
      title: "Business account",
      description: "Main operating account plus tax and payroll sub-accounts.",
      metrics: [["Operating", "€48,620.40"], ["Tax reserve", "€12,400.00"], ["Payroll", "€18,420.00"]],
      actionLabel: "Download statement",
      actionResult: "Statement generated (mock)",
    },
    payments: {
      title: "Payments & payouts",
      description: "Supplier payouts, invoices and scheduled bulk payment runs.",
      metrics: [["Pending payouts", "5"], ["Unpaid invoices", "9"], ["Next run", "Monday"]],
      actionLabel: "Approve payout batch",
      actionResult: "Batch of 5 payouts approved (mock)",
    },
    team: {
      title: "Team & cards",
      description: "Roles, permissions and per-employee card limits across the organisation.",
      metrics: [["Members", "12"], ["Admins", "2"], ["Active cards", "8"]],
      actionLabel: "Issue team card",
      actionResult: "Virtual team card issued (mock)",
    },
    rewards: {
      title: "Business rewards",
      description: "Cashback on business spend and partner offers for your team.",
      metrics: [["Points", "24,600"], ["Tier", "Gold"], ["Cashback YTD", "€1,240"]],
      actionLabel: "Redeem cashback",
      actionResult: "Cashback credited to operating account (mock)",
    },
    support: {
      title: "Business support",
      description: "Dedicated account manager, onboarding help and dispute handling.",
      metrics: [["Open tickets", "2"], ["Account manager", "Assigned"], ["SLA", "4h"]],
      actionLabel: "Contact account manager",
      actionResult: "Request sent to account manager (mock)",
    },
  },
  merchant: {
    payments: {
      title: "Take payment",
      description: "Tap to Pay on phone, terminal payments and payment links.",
      metrics: [["Today", "€4,230.80"], ["Transactions", "47"], ["Avg ticket", "€28.40"]],
      actionLabel: "Start Tap to Pay",
      actionResult: "Tap to Pay session started (mock)",
    },
    accounts: {
      title: "Settlements",
      description: "Daily settlement batches and fee breakdown from the acquiring adapter.",
      metrics: [["Next payout", "€3,180.40"], ["In transit", "€1,284.60"], ["Fees (mo)", "€142.30"]],
      actionLabel: "Request instant settlement",
      actionResult: "Instant settlement requested (mock)",
    },
    cards: {
      title: "Terminals",
      description: "Registered terminals and Tap to Pay devices across your locations.",
      metrics: [["Terminals", "3"], ["Online", "3"], ["Firmware", "Up to date"]],
      actionLabel: "Pair new terminal",
      actionResult: "Pairing code generated (mock)",
    },
    rewards: {
      title: "Loyalty",
      description: "Stamp cards and points earned by customers paying with Zoryn.",
      metrics: [["Members", "612"], ["Stamps issued", "1,940"], ["Redemptions", "88"]],
      actionLabel: "Create loyalty offer",
      actionResult: "Loyalty offer published (mock)",
    },
    support: {
      title: "Merchant support",
      description: "Terminal issues, chargebacks and payout queries.",
      metrics: [["Open tickets", "1"], ["Chargebacks", "2"], ["SLA", "2h"]],
      actionLabel: "Report terminal issue",
      actionResult: "Terminal ticket created (mock)",
    },
  },
  admin: {
    team: {
      title: "Customers",
      description: "Personal, business and merchant accounts across the platform.",
      metrics: [["Customers", "12,480"], ["Businesses", "1,380"], ["Merchants", "412"]],
      actionLabel: "Export customer report",
      actionResult: "Customer report exported (mock)",
    },
    compliance: {
      title: "Compliance operations",
      description: "KYC/KYB review queue, sanctions screening and transaction monitoring alerts.",
      metrics: [["Review queue", "28"], ["Alerts", "6"], ["SAR drafts", "1"]],
      actionLabel: "Open review queue",
      actionResult: "Opened KYC review queue (mock)",
    },
    payments: {
      title: "Platform payments",
      description: "Volume across all portals, failed payments and webhook replays.",
      metrics: [["Monthly volume", "€4.28M"], ["Failures", "0.4%"], ["Webhooks queued", "3"]],
      actionLabel: "Replay failed webhooks",
      actionResult: "3 webhooks replayed (mock)",
    },
    accounts: {
      title: "Providers",
      description: "Banking and acquiring adapter health, resource mapping and audit trail.",
      metrics: [["Adapters", "2"], ["Mode", "Mock"], ["Audit events", "1,204"]],
      actionLabel: "Run adapter health check",
      actionResult: "All adapters healthy (mock)",
    },
    support: {
      title: "Support desk",
      description: "Cross-portal tickets, escalations and agent workload.",
      metrics: [["Open tickets", "34"], ["Escalations", "4"], ["Agents online", "7"]],
      actionLabel: "Assign escalations",
      actionResult: "Escalations assigned (mock)",
    },
  },
};

export const getModuleContent = (role: Role, page: PageKey): ModuleContent =>
  moduleContent[role]?.[page] ?? fallbackModule(role, page);

export const roleOrder: Role[] = ["personal", "business", "merchant", "admin"];

export const rolePaths: Record<Role, string> = {
  personal: "/personal",
  business: "/business",
  merchant: "/merchant",
  admin: "/admin",
};