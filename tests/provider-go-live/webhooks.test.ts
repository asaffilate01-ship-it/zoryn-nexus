import { describe, expect, it } from "vitest";
import { buildAdyenSigningString } from "@/features/providers/server/providerWebhookVerification";

describe("webhook signing", () => {
  it("uses the Adyen field order", () => {
    const value = buildAdyenSigningString({
      pspReference: "PSP1",
      originalReference: "",
      merchantAccountCode: "Merchant",
      merchantReference: "Order1",
      amount: { value: 2500, currency: "EUR" },
      eventCode: "AUTHORISATION",
      success: "true",
    });
    expect(value.split(":")).toHaveLength(8);
  });
});
