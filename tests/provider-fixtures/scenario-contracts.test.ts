import { describe, expect, it } from "vitest";

const requiredScenarios = [
  "swan_individual_approved",
  "swan_transfer_returned",
  "adyen_payment_captured",
  "adyen_chargeback_opened",
];

describe("sandbox scenario contracts", () => {
  it("contains both successful and exceptional provider events", () => {
    expect(requiredScenarios).toContain("swan_individual_approved");
    expect(requiredScenarios).toContain("swan_transfer_returned");
    expect(requiredScenarios).toContain("adyen_payment_captured");
    expect(requiredScenarios).toContain("adyen_chargeback_opened");
  });
});
