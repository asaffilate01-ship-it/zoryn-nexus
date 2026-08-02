import { describe, expect, it } from "vitest";

const matrix: Record<string, string[]> = {
  personal_customer: ["own_accounts:read", "own_transfers:create", "own_cards:manage"],
  business_owner: ["org_accounts:read", "org_transfers:approve", "org_cards:issue"],
  finance_manager: ["org_accounts:read", "org_transfers:approve", "org_settlements:read"],
  bookkeeper: ["org_accounts:read", "org_transactions:export"],
  cardholder: ["assigned_card:read", "assigned_card:freeze"],
  support: ["customer_profile:read", "support_case:write"],
};

const can = (role: string, permission: string) =>
  matrix[role]?.includes(permission) ?? false;

describe("access matrix", () => {
  it("prevents support from changing balances", () => {
    expect(can("support", "balances:write")).toBe(false);
  });

  it("prevents bookkeepers from issuing cards", () => {
    expect(can("bookkeeper", "org_cards:issue")).toBe(false);
  });

  it("allows owners to approve organisation transfers", () => {
    expect(can("business_owner", "org_transfers:approve")).toBe(true);
  });
});
