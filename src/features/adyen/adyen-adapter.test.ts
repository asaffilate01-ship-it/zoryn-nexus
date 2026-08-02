import { describe, expect, it } from "vitest";
import { normalizeAdyenEvent } from "./webhooks";
import { AdyenCommandSchemas, mapAdyenStatus } from "./commands";

describe("Adyen event normalization", () => {
  it("normalizes a capture notification", () => {
    const event = normalizeAdyenEvent({
      pspReference: "psp_1",
      eventCode: "CAPTURE",
      success: "true",
      amount: { value: 2500, currency: "EUR" },
    });
    expect(event.eventType).toBe("payment.captured");
    expect(event.status).toBe("succeeded");
    expect(event.amountMinor).toBe(2500);
  });

  it("normalizes chargebacks and failures", () => {
    const event = normalizeAdyenEvent({
      pspReference: "psp_2",
      eventCode: "CHARGEBACK",
      success: "false",
    });
    expect(event.eventType).toBe("payment.chargeback_opened");
    expect(event.status).toBe("failed");
  });
});

describe("Adyen mappings", () => {
  it("maps result codes", () => {
    expect(mapAdyenStatus("Authorised")).toBe("authorised");
    expect(mapAdyenStatus("Refused")).toBe("declined");
  });

  it("rejects an invalid refund command", () => {
    expect(() =>
      AdyenCommandSchemas.refund_payment.parse({
        refundId: "nope",
        paymentExternalId: "",
        amountMinor: 0,
      }),
    ).toThrow();
  });
});