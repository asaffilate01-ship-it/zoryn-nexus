import type {
  Card,
  CustomerProfile,
  MerchantSummary,
  MoneyAccount,
  Pot,
  ProviderHealth,
  Scenario,
  TeamMember,
  Transaction,
  WebhookEvent,
} from "../types/domain";

export const demoCustomer: CustomerProfile = {
  id: "cus_demo_001",
  kind: "personal",
  name: "Lena Hoffmann",
  email: "lena.hoffmann@example.de",
  locale: "de",
  status: "active",
  accountStatus: "active",
  riskScore: 18,
  providerRefs: [
    { provider: "swan", resourceType: "account_holder", providerId: "ah_9f21", lastSyncedAt: "2026-08-01T07:40:00Z" },
    { provider: "swan", resourceType: "account", providerId: "acc_44a1", lastSyncedAt: "2026-08-01T07:40:00Z" },
    { provider: "rewards", resourceType: "wallet", providerId: "rw_1180", lastSyncedAt: "2026-08-01T06:10:00Z" },
  ],
  requiredActions: [
    {
      id: "act_1",
      title: "Confirm proof of address",
      description: "Upload a utility bill or bank statement issued in the last three months.",
      dueAt: "2026-08-08T00:00:00Z",
      action: "upload",
    },
  ],
};

export const demoAccounts: MoneyAccount[] = [
  {
    id: "acc_main",
    name: "Zoryn Personal",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "ZORYDEB1XXX",
    currency: "EUR",
    availableCents: 486_240,
    bookedCents: 512_180,
    status: "active",
  },
];

export const demoPots: Pot[] = [
  { id: "pot_emergency", name: "Notgroschen", balanceCents: 250_000, targetCents: 500_000, rule: "Round-ups" },
  { id: "pot_urlaub", name: "Urlaub 2026", balanceCents: 84_500, targetCents: 200_000, targetDate: "2026-12-01" },
  { id: "pot_fahrrad", name: "Fahrrad", balanceCents: 31_000, targetCents: 120_000 },
];

export const demoTransactions: Transaction[] = [
  {
    id: "tx_1",
    accountId: "acc_main",
    counterparty: "REWE Markt",
    amountCents: -6_235,
    currency: "EUR",
    status: "booked",
    category: "Groceries",
    bookedAt: "2026-08-01T08:22:00Z",
    reference: "CARD 4821",
    rewardsPoints: 62,
  },
  {
    id: "tx_2",
    accountId: "acc_main",
    counterparty: "Gehalt LoungeTech",
    amountCents: 285_000,
    currency: "EUR",
    status: "booked",
    category: "Income",
    bookedAt: "2026-07-31T09:00:00Z",
    reference: "SEPA CT",
  },
  {
    id: "tx_3",
    accountId: "acc_main",
    counterparty: "Deutsche Bahn",
    amountCents: -4_890,
    currency: "EUR",
    status: "pending",
    category: "Travel",
    bookedAt: "2026-07-30T12:10:00Z",
    reference: "CARD 4821",
    rewardsPoints: 48,
  },
  {
    id: "tx_4",
    accountId: "acc_main",
    counterparty: "Stadtwerke München",
    amountCents: -8_400,
    currency: "EUR",
    status: "returned",
    category: "Utilities",
    bookedAt: "2026-07-29T06:00:00Z",
    reference: "SEPA DD R-Transaction",
  },
];

export const demoCards: Card[] = [
  {
    id: "card_metal",
    label: "Zoryn Metal",
    last4: "4821",
    type: "physical",
    status: "active",
    monthlyLimitCents: 300_000,
    spentCents: 126_840,
    controls: { online: true, contactless: true, atm: true, international: true },
  },
  {
    id: "card_online",
    label: "Online virtual",
    last4: "9034",
    type: "virtual",
    status: "frozen",
    monthlyLimitCents: 80_000,
    spentCents: 21_400,
    controls: { online: true, contactless: false, atm: false, international: false },
  },
  {
    id: "card_replacement",
    label: "Replacement card",
    last4: "7715",
    type: "physical",
    status: "shipped",
    monthlyLimitCents: 300_000,
    spentCents: 0,
    controls: { online: true, contactless: true, atm: true, international: false },
  },
];

export const demoTeam: TeamMember[] = [
  { id: "tm_1", name: "Jonas Weber", role: "owner", status: "active", approvalLimitCents: 5_000_000 },
  { id: "tm_2", name: "Aylin Kaya", role: "finance", status: "active", approvalLimitCents: 1_000_000 },
  { id: "tm_3", name: "Marco Reuter", role: "approver", status: "active", approvalLimitCents: 250_000 },
  { id: "tm_4", name: "Sofia Braun", role: "employee", status: "invited", approvalLimitCents: 0 },
];

export const demoMerchant: MerchantSummary = {
  id: "mrc_cafe1",
  name: "Cafe Berlin Mitte",
  status: "active",
  todaySalesCents: 124_820,
  pendingSettlementCents: 318_040,
  terminalsOnline: 2,
  terminalsTotal: 3,
};

export const providerHealth: ProviderHealth[] = [
  {
    provider: "swan",
    status: "not_configured",
    latencyMs: 0,
    message: "Banking adapter in mock mode. Add sandbox credentials to enable live calls.",
  },
  {
    provider: "adyen",
    status: "not_configured",
    latencyMs: 0,
    message: "Acquiring adapter in mock mode. Onboarding, payments and settlement simulated.",
  },
  {
    provider: "rewards",
    status: "operational",
    latencyMs: 84,
    lastEventAt: "2026-08-01T09:12:00Z",
    message: "Universal points wallet and cashback routing available.",
  },
  {
    provider: "mock",
    status: "operational",
    latencyMs: 22,
    lastEventAt: "2026-08-01T09:30:00Z",
    message: "Mock provider serving all demo journeys.",
  },
];

export const webhookEvents: WebhookEvent[] = [
  {
    id: "evt_1",
    provider: "swan",
    type: "AccountHolder.Updated",
    status: "processed",
    attempts: 1,
    occurredAt: "2026-08-01T09:12:00Z",
    resourceId: "ah_9f21",
  },
  {
    id: "evt_2",
    provider: "adyen",
    type: "AUTHORISATION",
    status: "processed",
    attempts: 1,
    occurredAt: "2026-08-01T09:02:00Z",
    resourceId: "pay_88213",
  },
  {
    id: "evt_3",
    provider: "adyen",
    type: "REPORT_AVAILABLE",
    status: "retrying",
    attempts: 3,
    occurredAt: "2026-08-01T08:40:00Z",
    resourceId: "settlement_2026_08_01",
    error: "Downstream settlement import timed out (retry in 5m).",
  },
  {
    id: "evt_4",
    provider: "swan",
    type: "Card.Suspended",
    status: "dead_letter",
    attempts: 6,
    occurredAt: "2026-07-31T21:15:00Z",
    resourceId: "crd_9034",
    error: "Unknown card reference — resource mapping missing.",
  },
];

export const scenarios: Scenario[] = [
  {
    id: "sc_1",
    group: "personal",
    title: "Identity verification resumed",
    description: "Customer abandons hosted onboarding and returns two days later to finish verification.",
    status: "identity_required",
    severity: "medium",
  },
  {
    id: "sc_2",
    group: "personal",
    title: "SEPA direct debit returned",
    description: "An R-transaction arrives after booking and the balance plus category are corrected.",
    status: "returned",
    severity: "high",
  },
  {
    id: "sc_3",
    group: "personal",
    title: "Lost card replacement",
    description: "Card reported lost, permanently blocked, replacement ordered and shipped.",
    status: "replaced",
    severity: "medium",
  },
  {
    id: "sc_4",
    group: "business",
    title: "Supplier payment awaiting approval",
    description: "A payment above the approval limit waits for a second approver and provider SCA.",
    status: "awaiting_approval",
    severity: "medium",
  },
  {
    id: "sc_5",
    group: "business",
    title: "KYB additional information",
    description: "Regulated partner requests an updated shareholder register before activation.",
    status: "additional_information_required",
    severity: "high",
  },
  {
    id: "sc_6",
    group: "pay",
    title: "Chargeback opened",
    description: "Cardholder disputes a contactless payment; evidence is collected within the SLA.",
    status: "chargeback_opened",
    severity: "critical",
  },
  {
    id: "sc_7",
    group: "pay",
    title: "Terminal offline",
    description: "Kitchen terminal drops to 14% battery and goes offline mid-service.",
    status: "failed",
    severity: "high",
  },
  {
    id: "sc_8",
    group: "admin",
    title: "Webhook dead-letter triage",
    description: "An unmapped card reference is replayed after the provider resource mapping is repaired.",
    status: "dead_letter",
    severity: "critical",
  },
  {
    id: "sc_9",
    group: "admin",
    title: "Account restricted for review",
    description: "Risk engine restricts outgoing payments while a compliance case is open.",
    status: "restricted",
    severity: "high",
  },
];