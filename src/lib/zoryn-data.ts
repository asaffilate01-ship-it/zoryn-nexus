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

export const recentActivity = [
  { name: "Cafe 1 St Albans", category: "Hospitality", amount: -18.4 },
  { name: "Salary payment", category: "Income", amount: 3420 },
  { name: "ZorynPay settlement", category: "Settlement", amount: 1284.6 },
  { name: "DB Bahn", category: "Travel", amount: -42.9 },
  { name: "REWE Markt", category: "Groceries", amount: -62.35 },
];

export const providerReadiness = [
  { label: "Banking adapter", state: "Ready" },
  { label: "Acquiring adapter", state: "Ready" },
  { label: "Provider proxy (server)", state: "Mock mode" },
  { label: "Row Level Security", state: "Configured" },
];

export const roleOrder: Role[] = ["personal", "business", "merchant", "admin"];

export const rolePaths: Record<Role, string> = {
  personal: "/personal",
  business: "/business",
  merchant: "/merchant",
  admin: "/admin",
};