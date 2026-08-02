import type {
  AcquiringProvider,
  BankingProvider,
  CardStatus,
  OnboardingStatus,
  PaymentStatus,
  TransferStatus,
} from "./types";

const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

export class MockSwanProvider implements BankingProvider {
  async startIndividualOnboarding() {
    await sleep();
    return { externalId: id("swan_individual"), redirectUrl: "/onboarding?provider=mock-swan" };
  }
  async startCompanyOnboarding() {
    await sleep();
    return { externalId: id("swan_company"), redirectUrl: "/onboarding?provider=mock-swan" };
  }
  async getOnboardingStatus(externalId: string) {
    await sleep();
    const status: OnboardingStatus = externalId.includes("action") ? "action_required" : "approved";
    return { status, requiredActions: status === "action_required" ? ["proof_of_address"] : [] };
  }
  async listAccounts(customerExternalId: string) {
    await sleep();
    return [{
      externalId: id("swan_account"),
      customerExternalId,
      iban: "DE89 3704 0044 0532 0130 00",
      availableBalanceMinor: 125430,
      currency: "EUR",
      status: "active",
    }];
  }
  async createTransfer() {
    await sleep();
    const status: TransferStatus = "submitted";
    return { externalId: id("swan_transfer"), status };
  }
  async issueCard() {
    await sleep();
    const status: CardStatus = "ordered";
    return { externalId: id("swan_card"), status };
  }
  async updateCardStatus() {
    await sleep();
  }
}

export class MockAdyenProvider implements AcquiringProvider {
  async startMerchantOnboarding() {
    await sleep();
    return { externalId: id("adyen_account_holder"), redirectUrl: "/merchant/onboarding?provider=mock-adyen" };
  }
  async getMerchantStatus() {
    await sleep();
    return { status: "active", requiredActions: [] };
  }
  async createPaymentLink(input: Record<string, unknown>) {
    await sleep();
    const externalId = id("adyen_link");
    return { externalId, url: `https://pay.example.test/${externalId}?amount=${input.amountMinor ?? 0}` };
  }
  async createPaymentSession() {
    await sleep();
    return { externalId: id("adyen_session"), clientToken: "mock_client_token" };
  }
  async refundPayment() {
    await sleep();
    const status: PaymentStatus = "refunded";
    return { externalId: id("adyen_refund"), status };
  }
  async listSettlements(merchantExternalId: string) {
    await sleep();
    return [{
      externalId: id("adyen_settlement"),
      merchantExternalId,
      grossMinor: 245000,
      feesMinor: 4150,
      refundsMinor: 12000,
      netMinor: 228850,
      status: "paid",
      currency: "EUR",
    }];
  }
}
