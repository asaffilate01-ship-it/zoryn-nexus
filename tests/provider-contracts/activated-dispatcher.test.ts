import { describe, expect, it } from "vitest";
import { validateProviderOperation } from "@/features/providers/operationRegistry";

describe("activated provider contracts", () => {
  it("accepts required Swan transfer fields", () => {
    const payload = validateProviderOperation("swan", "create_transfer", {
      transferId: "5b99a72e-6bf8-4ce9-a063-cc25d8f8b001",
      accountExternalId: "account_demo",
      beneficiaryIban: "DE89370400440532013000",
      amountMinor: 5000,
      currency: "EUR",
      reference: "Test transfer",
    });

    expect(payload.currency).toBe("EUR");
  });

  it("accepts required Adyen payment-session fields", () => {
    const payload = validateProviderOperation("adyen", "create_payment_session", {
      paymentId: "5b99a72e-6bf8-4ce9-a063-cc25d8f8b002",
      amountMinor: 2500,
      currency: "EUR",
      reference: "PAY-100",
      returnUrl: "https://example.test/return",
    });

    expect(payload.amountMinor).toBe(2500);
  });
});