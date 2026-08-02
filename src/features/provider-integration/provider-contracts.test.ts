import { describe, expect, it } from "vitest";
import { MockAdyenProvider, MockSwanProvider } from "@/features/provider-integration/mockProviders";

describe("provider contracts", () => {
  it("supports Swan-style onboarding, accounts, transfers and cards", async () => {
    const provider = new MockSwanProvider();
    const onboarding = await provider.startIndividualOnboarding({});
    expect(onboarding.externalId).toContain("swan_individual");

    const accounts = await provider.listAccounts(onboarding.externalId);
    expect(accounts).toHaveLength(1);

    const transfer = await provider.createTransfer({});
    expect(transfer.status).toBe("submitted");

    const card = await provider.issueCard({});
    expect(card.status).toBe("ordered");
  });

  it("supports Adyen-style merchant, payment, refund and settlement actions", async () => {
    const provider = new MockAdyenProvider();
    const merchant = await provider.startMerchantOnboarding({});
    expect(merchant.externalId).toContain("adyen_account_holder");

    const link = await provider.createPaymentLink({ amountMinor: 1500 });
    expect(link.url).toContain("1500");

    const refund = await provider.refundPayment("payment_1");
    expect(refund.status).toBe("refunded");

    const settlements = await provider.listSettlements(merchant.externalId);
    expect(settlements[0]?.["status"]).toBe("paid");
  });
});
