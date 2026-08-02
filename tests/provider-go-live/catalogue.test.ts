import { describe, expect, it } from "vitest";
import { requiredProviderOperations } from "@/features/providers/catalogue";

describe("provider go-live catalogue", () => {
  it("contains core Swan operations", () => {
    expect(requiredProviderOperations.swan).toContain("create_transfer");
    expect(requiredProviderOperations.swan).toContain("issue_card");
  });

  it("contains core Adyen operations", () => {
    expect(requiredProviderOperations.adyen).toContain("create_payment_session");
    expect(requiredProviderOperations.adyen).toContain("create_tap_to_pay_session");
  });
});
