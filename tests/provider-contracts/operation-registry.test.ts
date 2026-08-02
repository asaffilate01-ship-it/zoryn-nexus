import { describe, expect, it } from "vitest";
import { validateProviderOperation } from "@/features/providers/operationRegistry";

describe("provider operation registry", () => {
  it("validates a Swan transfer command", () => {
    const result = validateProviderOperation("swan", "create_transfer", {
      transferId: "b2c87f2c-7c20-4b14-93f5-ce152c401234",
      accountExternalId: "account_1",
      beneficiaryIban: "DE89370400440532013000",
      amountMinor: 2500,
      currency: "EUR",
      reference: "Invoice 1001",
    });

    expect(result.amountMinor).toBe(2500);
  });

  it("rejects an unsupported operation", () => {
    expect(() =>
      validateProviderOperation("adyen", "unknown_operation", {}),
    ).toThrow("unsupported_operation");
  });
});
