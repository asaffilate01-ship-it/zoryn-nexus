import type {
  AccountStatus,
  CardStatus,
  PaymentStatus,
  ProviderName,
  TransactionStatus,
  TransferStatus,
} from "../types/domain";

export interface BankingProviderAdapter {
  provider: ProviderName;
  startIndividualOnboarding(
    input: Record<string, unknown>,
  ): Promise<{ redirectUrl: string; providerCustomerId: string }>;
  startBusinessOnboarding(
    input: Record<string, unknown>,
  ): Promise<{ redirectUrl: string; providerCustomerId: string }>;
  getAccount(accountId: string): Promise<Record<string, unknown>>;
  createTransfer(input: Record<string, unknown>): Promise<{ id: string; status: TransferStatus }>;
  freezeCard(cardId: string): Promise<{ id: string; status: CardStatus }>;
  unfreezeCard(cardId: string): Promise<{ id: string; status: CardStatus }>;
}
export interface AcquiringProviderAdapter {
  provider: ProviderName;
  createMerchant(
    input: Record<string, unknown>,
  ): Promise<{ merchantId: string; onboardingUrl: string }>;
  createPaymentLink(
    input: Record<string, unknown>,
  ): Promise<{ id: string; url: string; status: PaymentStatus }>;
  refundPayment(
    paymentId: string,
    amountCents?: number,
  ): Promise<{ id: string; status: PaymentStatus }>;
}
export const mapSwanAccountStatus = (raw: string): AccountStatus =>
  (({ Enabled: "active", Suspended: "suspended", Closing: "closing", Closed: "closed" })[
    raw
  ] as AccountStatus) ?? "under_review";
export const mapSwanTransactionStatus = (raw: string): TransactionStatus =>
  (({
    Pending: "pending",
    Booked: "booked",
    Released: "released",
    Reversed: "reversed",
    Declined: "failed",
  })[raw] as TransactionStatus) ?? "pending";
export const mapAdyenPaymentStatus = (raw: string): PaymentStatus =>
  (({
    Authorised: "authorised",
    Captured: "captured",
    Refused: "declined",
    Refunded: "refunded",
    Chargeback: "chargeback_opened",
  })[raw] as PaymentStatus) ?? "created";
