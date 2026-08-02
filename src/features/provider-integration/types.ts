export type ProviderMode = "mock" | "sandbox" | "live";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "action_required"
  | "under_review"
  | "approved"
  | "rejected"
  | "restricted";

export type AccountStatus =
  "opening" | "active" | "restricted" | "suspended" | "closing" | "closed";
export type TransferStatus =
  | "draft"
  | "consent_required"
  | "submitted"
  | "pending"
  | "booked"
  | "rejected"
  | "returned"
  | "cancelled"
  | "failed";

export type CardStatus =
  | "ordered"
  | "manufacturing"
  | "shipped"
  | "active"
  | "frozen"
  | "blocked"
  | "expired"
  | "cancelled";

export type PaymentStatus =
  | "created"
  | "authorised"
  | "captured"
  | "refused"
  | "cancelled"
  | "partially_refunded"
  | "refunded"
  | "chargeback";

export interface ProviderReference {
  provider: "swan" | "adyen" | "rewards";
  resourceType: string;
  resourceId: string;
  externalId: string;
  status: string;
  lastSyncedAt: string;
}

export interface BankingProvider {
  startIndividualOnboarding(
    input: Record<string, unknown>,
  ): Promise<{ externalId: string; redirectUrl?: string }>;
  startCompanyOnboarding(
    input: Record<string, unknown>,
  ): Promise<{ externalId: string; redirectUrl?: string }>;
  getOnboardingStatus(
    externalId: string,
  ): Promise<{ status: OnboardingStatus; requiredActions: string[] }>;
  listAccounts(customerExternalId: string): Promise<Array<Record<string, unknown>>>;
  createTransfer(
    input: Record<string, unknown>,
  ): Promise<{ externalId: string; status: TransferStatus }>;
  issueCard(input: Record<string, unknown>): Promise<{ externalId: string; status: CardStatus }>;
  updateCardStatus(cardExternalId: string, action: "freeze" | "unfreeze" | "cancel"): Promise<void>;
}

export interface AcquiringProvider {
  startMerchantOnboarding(
    input: Record<string, unknown>,
  ): Promise<{ externalId: string; redirectUrl?: string }>;
  getMerchantStatus(externalId: string): Promise<{ status: string; requiredActions: string[] }>;
  createPaymentLink(input: Record<string, unknown>): Promise<{ externalId: string; url: string }>;
  createPaymentSession(
    input: Record<string, unknown>,
  ): Promise<{ externalId: string; clientToken?: string }>;
  refundPayment(
    externalId: string,
    amountMinor?: number,
  ): Promise<{ externalId: string; status: PaymentStatus }>;
  listSettlements(merchantExternalId: string): Promise<Array<Record<string, unknown>>>;
}
