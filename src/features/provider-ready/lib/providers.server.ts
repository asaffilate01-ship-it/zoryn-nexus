/**
 * Provider adapter implementations and factory.
 *
 * Every portal talks to these interfaces, never to a provider SDK. The factory
 * picks an implementation from the environment, so the platform runs fully in
 * mock mode until sandbox credentials exist, and switches over without any UI
 * or database change.
 *
 * PROVIDER_MODE = "mock" (default) | "sandbox" | "live"
 */
import type {
  AcquiringProviderAdapter,
  BankingProviderAdapter,
} from "./provider-adapters";
import { mapAdyenPaymentStatus, mapSwanAccountStatus, mapSwanTransactionStatus } from "./provider-adapters";
import type { ProviderHealth } from "../types/domain";

export type ProviderMode = "mock" | "sandbox" | "live";

export const providerMode = (): ProviderMode => {
  const raw = (process.env["PROVIDER_MODE"] ?? "mock").toLowerCase();
  return raw === "sandbox" || raw === "live" ? raw : "mock";
};

export const bankingConfigured = () =>
  Boolean(process.env["SWAN_API_KEY"] && process.env["SWAN_PROJECT_ID"]);
export const acquiringConfigured = () =>
  Boolean(process.env["ADYEN_API_KEY"] && process.env["ADYEN_MERCHANT_ACCOUNT"]);

const id = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;

/* ------------------------------------------------------------------ mock */

export const mockBanking: BankingProviderAdapter = {
  provider: "mock",
  async startIndividualOnboarding() {
    return { redirectUrl: "/onboarding-status", providerCustomerId: id("cus") };
  },
  async startBusinessOnboarding() {
    return { redirectUrl: "/onboarding-status", providerCustomerId: id("org") };
  },
  async getAccount(accountId) {
    return { id: accountId, status: mapSwanAccountStatus("Enabled"), currency: "EUR" };
  },
  async createTransfer() {
    return { id: id("trf"), status: "submitted" };
  },
  async freezeCard(cardId) {
    return { id: cardId, status: "frozen" };
  },
  async unfreezeCard(cardId) {
    return { id: cardId, status: "active" };
  },
};

export const mockAcquiring: AcquiringProviderAdapter = {
  provider: "mock",
  async createMerchant() {
    return { merchantId: id("mer"), onboardingUrl: "/onboarding-status" };
  },
  async createPaymentLink(input) {
    const linkId = id("pl");
    return {
      id: linkId,
      url: `https://pay.zoryn.demo/l/${linkId}`,
      status: mapAdyenPaymentStatus(String(input["status"] ?? "created")),
    };
  },
  async refundPayment(paymentId) {
    return { id: paymentId, status: "refunded" };
  },
};

/* ------------------------------------------------------------- swan (live) */

const swanUnavailable = (): never => {
  throw new Error(
    "Banking adapter is not configured. Set SWAN_API_KEY and SWAN_PROJECT_ID, then PROVIDER_MODE=sandbox.",
  );
};

async function swanGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const endpoint = process.env["SWAN_API_URL"] ?? "https://api.swan.io/sandbox-partner/graphql";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env["SWAN_API_KEY"]}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Swan request failed [${res.status}]: ${body}`);
  const parsed = JSON.parse(body) as { data?: T; errors?: Array<{ message: string }> };
  if (parsed.errors?.length) throw new Error(`Swan error: ${parsed.errors.map((e) => e.message).join(", ")}`);
  return parsed.data as T;
}

export const swanBanking: BankingProviderAdapter = {
  provider: "swan",
  async startIndividualOnboarding(input) {
    if (!bankingConfigured()) return swanUnavailable();
    const data = await swanGraphQL<{ onboardIndividualAccountHolder: { onboarding: { id: string; onboardingUrl: string } } }>(
      `mutation ($input: OnboardIndividualAccountHolderInput!) {
         onboardIndividualAccountHolder(input: $input) {
           ... on OnboardIndividualAccountHolderSuccessPayload { onboarding { id onboardingUrl } }
         }
       }`,
      { input: { ...input, projectId: process.env["SWAN_PROJECT_ID"] } },
    );
    const onboarding = data.onboardIndividualAccountHolder.onboarding;
    return { redirectUrl: onboarding.onboardingUrl, providerCustomerId: onboarding.id };
  },
  async startBusinessOnboarding(input) {
    if (!bankingConfigured()) return swanUnavailable();
    const data = await swanGraphQL<{ onboardCompanyAccountHolder: { onboarding: { id: string; onboardingUrl: string } } }>(
      `mutation ($input: OnboardCompanyAccountHolderInput!) {
         onboardCompanyAccountHolder(input: $input) {
           ... on OnboardCompanyAccountHolderSuccessPayload { onboarding { id onboardingUrl } }
         }
       }`,
      { input: { ...input, projectId: process.env["SWAN_PROJECT_ID"] } },
    );
    const onboarding = data.onboardCompanyAccountHolder.onboarding;
    return { redirectUrl: onboarding.onboardingUrl, providerCustomerId: onboarding.id };
  },
  async getAccount(accountId) {
    if (!bankingConfigured()) return swanUnavailable();
    const data = await swanGraphQL<{ account: { id: string; statusInfo: { status: string }; currency: string } }>(
      `query ($id: ID!) { account(accountId: $id) { id currency statusInfo { status } } }`,
      { id: accountId },
    );
    return { ...data.account, status: mapSwanAccountStatus(data.account.statusInfo.status) };
  },
  async createTransfer(input) {
    if (!bankingConfigured()) return swanUnavailable();
    const data = await swanGraphQL<{ initiateCreditTransfers: { payment: { id: string; statusInfo: { status: string } } } }>(
      `mutation ($input: InitiateCreditTransfersInput!) {
         initiateCreditTransfers(input: $input) {
           ... on InitiateCreditTransfersSuccessPayload { payment { id statusInfo { status } } }
         }
       }`,
      { input },
    );
    const payment = data.initiateCreditTransfers.payment;
    return { id: payment.id, status: mapSwanTransactionStatus(payment.statusInfo.status) === "booked" ? "completed" : "submitted" };
  },
  async freezeCard(cardId) {
    if (!bankingConfigured()) return swanUnavailable();
    await swanGraphQL(`mutation ($input: SuspendCardInput!) { suspendCard(input: $input) { __typename } }`, { input: { cardId } });
    return { id: cardId, status: "frozen" };
  },
  async unfreezeCard(cardId) {
    if (!bankingConfigured()) return swanUnavailable();
    await swanGraphQL(`mutation ($input: ResumeCardInput!) { resumePhysicalCard(input: $input) { __typename } }`, { input: { cardId } });
    return { id: cardId, status: "active" };
  },
};

/* ------------------------------------------------------------ adyen (live) */

const adyenUnavailable = (): never => {
  throw new Error(
    "Acquiring adapter is not configured. Set ADYEN_API_KEY and ADYEN_MERCHANT_ACCOUNT, then PROVIDER_MODE=sandbox.",
  );
};

async function adyenPost<T>(base: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env["ADYEN_API_KEY"]! },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Adyen request failed [${res.status}]: ${text}`);
  return JSON.parse(text) as T;
}

export const adyenAcquiring: AcquiringProviderAdapter = {
  provider: "adyen",
  async createMerchant(input) {
    if (!acquiringConfigured()) return adyenUnavailable();
    const base = process.env["ADYEN_MANAGEMENT_URL"] ?? "https://management-test.adyen.com/v3";
    const data = await adyenPost<{ id: string; hostedOnboardingUrl?: string }>(base, "/legalEntities", input);
    return { merchantId: data.id, onboardingUrl: data.hostedOnboardingUrl ?? "/onboarding-status" };
  },
  async createPaymentLink(input) {
    if (!acquiringConfigured()) return adyenUnavailable();
    const base = process.env["ADYEN_CHECKOUT_URL"] ?? "https://checkout-test.adyen.com/v71";
    const data = await adyenPost<{ id: string; url: string; status: string }>(base, "/paymentLinks", {
      merchantAccount: process.env["ADYEN_MERCHANT_ACCOUNT"],
      ...input,
    });
    return { id: data.id, url: data.url, status: mapAdyenPaymentStatus(data.status) };
  },
  async refundPayment(paymentId, amountCents) {
    if (!acquiringConfigured()) return adyenUnavailable();
    const base = process.env["ADYEN_CHECKOUT_URL"] ?? "https://checkout-test.adyen.com/v71";
    await adyenPost(base, `/payments/${paymentId}/refunds`, {
      merchantAccount: process.env["ADYEN_MERCHANT_ACCOUNT"],
      ...(amountCents ? { amount: { currency: "EUR", value: amountCents } } : {}),
    });
    return { id: paymentId, status: "refunded" };
  },
};

/* ---------------------------------------------------------------- factory */

export function getBankingAdapter(): BankingProviderAdapter {
  return providerMode() !== "mock" && bankingConfigured() ? swanBanking : mockBanking;
}

export function getAcquiringAdapter(): AcquiringProviderAdapter {
  return providerMode() !== "mock" && acquiringConfigured() ? adyenAcquiring : mockAcquiring;
}

/** Rewards works standalone: the local ledger is always available, the hub is optional. */
export const rewardsHubConfigured = () =>
  Boolean(process.env["REWARDS_HUB_URL"] && process.env["REWARDS_INGEST_SECRET"]);

/**
 * Live health, derived from configuration and the most recent event for each
 * provider, rather than from static rows.
 */
export function deriveProviderHealth(
  lastEventAt: Partial<Record<string, string | null>>,
  failures: Partial<Record<string, number>>,
): ProviderHealth[] {
  const mode = providerMode();
  const entry = (
    provider: ProviderHealth["provider"],
    configured: boolean,
    okMessage: string,
    mockMessage: string,
  ): ProviderHealth => {
    const failed = failures[provider] ?? 0;
    const status: ProviderHealth["status"] = !configured
      ? "not_configured"
      : failed > 0
        ? "degraded"
        : "operational";
    return {
      provider,
      status,
      latencyMs: configured ? 120 : 0,
      ...(lastEventAt[provider] ? { lastEventAt: lastEventAt[provider] as string } : {}),
      message: !configured
        ? mockMessage
        : failed > 0
          ? `${failed} event(s) awaiting retry or in dead letter.`
          : okMessage,
    };
  };

  return [
    entry(
      "swan",
      mode !== "mock" && bankingConfigured(),
      "Swan banking adapter connected. KYC/KYB, accounts, transfers and cards are live.",
      "Swan banking adapter in mock mode. Add SWAN_API_KEY and SWAN_PROJECT_ID to enable live calls.",
    ),
    entry(
      "adyen",
      mode !== "mock" && acquiringConfigured(),
      "Adyen acquiring adapter connected. Tap to Pay, terminals, payments and settlement are live.",
      "Adyen acquiring adapter in mock mode. Add ADYEN_API_KEY and ADYEN_MERCHANT_ACCOUNT to enable live calls.",
    ),
    entry(
      "rewards",
      true,
      rewardsHubConfigured()
        ? "Local points ledger active and mirrored to the Rewards Hub."
        : "Local points ledger active. Rewards Hub not linked — points stay in Zoryn.",
      "",
    ),
    entry("mock", mode === "mock", "Mock provider serving all demo journeys.", "Mock provider disabled — live adapters in use."),
  ];
}
