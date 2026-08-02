export type ProviderName = "mock" | "swan" | "adyen" | "rewards";
export type CustomerStatus =
  | "registered"
  | "email_pending"
  | "phone_pending"
  | "onboarding_started"
  | "identity_required"
  | "document_required"
  | "under_review"
  | "additional_information_required"
  | "approved"
  | "account_opening"
  | "active"
  | "restricted"
  | "suspended"
  | "closure_requested"
  | "closed"
  | "rejected";
export type AccountStatus =
  | "draft"
  | "verification_required"
  | "under_review"
  | "active"
  | "restricted"
  | "suspended"
  | "closing"
  | "closed";
export type TransactionStatus =
  "pending" | "booked" | "released" | "reversed" | "failed" | "returned" | "refunded" | "disputed";
export type CardStatus =
  | "ordered"
  | "manufacturing"
  | "shipped"
  | "active"
  | "frozen"
  | "lost"
  | "stolen"
  | "expired"
  | "replaced"
  | "cancelled";
export type TransferStatus =
  | "draft"
  | "awaiting_approval"
  | "awaiting_sca"
  | "submitted"
  | "pending"
  | "completed"
  | "failed"
  | "returned"
  | "cancelled";
export type PaymentStatus =
  | "created"
  | "authorised"
  | "captured"
  | "declined"
  | "cancelled"
  | "partially_refunded"
  | "refunded"
  | "chargeback_opened"
  | "chargeback_won"
  | "chargeback_lost";
export type ReviewPriority = "low" | "medium" | "high" | "critical";

export interface ProviderRef {
  provider: ProviderName;
  resourceType: string;
  providerId: string;
  lastSyncedAt: string;
}
export interface RequiredAction {
  id: string;
  title: string;
  description: string;
  dueAt?: string;
  action: "upload" | "verify" | "review" | "fund" | "contact_support";
}
export interface CustomerProfile {
  id: string;
  kind: "personal" | "business";
  name: string;
  email: string;
  locale: "de" | "en";
  status: CustomerStatus;
  accountStatus: AccountStatus;
  providerRefs: ProviderRef[];
  requiredActions: RequiredAction[];
  riskScore: number;
}
export interface MoneyAccount {
  id: string;
  name: string;
  iban: string;
  bic: string;
  currency: "EUR";
  availableCents: number;
  bookedCents: number;
  status: AccountStatus;
}
export interface Pot {
  id: string;
  name: string;
  balanceCents: number;
  targetCents: number;
  targetDate?: string;
  rule?: string;
}
export interface Transaction {
  id: string;
  accountId: string;
  counterparty: string;
  amountCents: number;
  currency: "EUR";
  status: TransactionStatus;
  category: string;
  bookedAt: string;
  reference: string;
  rewardsPoints?: number;
}
export interface Card {
  id: string;
  label: string;
  last4: string;
  type: "physical" | "virtual" | "staff";
  status: CardStatus;
  monthlyLimitCents: number;
  spentCents: number;
  controls: { online: boolean; contactless: boolean; atm: boolean; international: boolean };
}
export interface TeamMember {
  id: string;
  name: string;
  role: "owner" | "admin" | "finance" | "bookkeeper" | "approver" | "employee" | "viewer";
  status: "active" | "invited" | "suspended";
  approvalLimitCents: number;
}
export interface MerchantSummary {
  id: string;
  name: string;
  status: "onboarding" | "action_required" | "active" | "restricted";
  todaySalesCents: number;
  pendingSettlementCents: number;
  terminalsOnline: number;
  terminalsTotal: number;
}
export interface ProviderHealth {
  provider: ProviderName;
  status: "operational" | "degraded" | "outage" | "not_configured";
  latencyMs: number;
  lastEventAt?: string;
  message: string;
}
export interface WebhookEvent {
  id: string;
  provider: ProviderName;
  type: string;
  status: "received" | "processing" | "processed" | "retrying" | "failed" | "dead_letter";
  attempts: number;
  occurredAt: string;
  resourceId: string;
  error?: string;
}
export interface Scenario {
  id: string;
  group: "personal" | "business" | "pay" | "admin";
  title: string;
  description: string;
  status: string;
  severity: ReviewPriority;
}
