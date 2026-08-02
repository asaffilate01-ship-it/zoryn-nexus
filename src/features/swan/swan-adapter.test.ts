import { describe, expect, it } from "vitest";
import { normalizeSwanEvent } from "./webhooks";
import { SwanCommandSchemas, isRetryableStatus, mapSwanStatus } from "./commands";

describe("Swan event normalization", () => {
  it("normalizes transfer returned", () => {
    const event = normalizeSwanEvent({
      id: "evt_1",
      type: "Transfer.Returned",
      resource: { id: "tr_1", status: "returned", type: "transfer" },
    });
    expect(event.eventType).toBe("transfer.returned");
    expect(event.externalId).toBe("tr_1");
  });

  it("falls back to a lowercase event type for unmapped events", () => {
    const event = normalizeSwanEvent({ id: "evt_2", type: "Account.Unknown", data: {} });
    expect(event.eventType).toBe("account.unknown");
    expect(event.requiredActions).toEqual([]);
  });
});

describe("Swan mappings", () => {
  it("maps provider statuses onto Zoryn states", () => {
    expect(mapSwanStatus("Enabled")).toBe("active");
    expect(mapSwanStatus("Closing")).toBe("closing");
  });

  it("classifies retryable HTTP failures", () => {
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(400)).toBe(false);
  });

  it("rejects invalid transfer commands", () => {
    expect(() =>
      SwanCommandSchemas.create_transfer.parse({
        transferId: "not-a-uuid",
        accountExternalId: "acc",
        beneficiaryIban: "DE00",
        amountMinor: -1,
        currency: "EUR",
      }),
    ).toThrow();
  });
});