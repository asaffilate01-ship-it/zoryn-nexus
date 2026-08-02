import { describe, expect, it } from "vitest";

function eventKey(provider: string, eventId: string) {
  return `${provider}:${eventId}`;
}

describe("provider event idempotency", () => {
  it("uses provider plus event id as the duplicate boundary", () => {
    expect(eventKey("swan", "123")).toBe("swan:123");
    expect(eventKey("swan", "123")).not.toBe(eventKey("adyen", "123"));
  });
});
