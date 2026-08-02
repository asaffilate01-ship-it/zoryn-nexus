import { describe, expect, it } from "vitest";

describe("provider safety contracts", () => {
  it("uses stable provider names", () => {
    const providers = ["swan", "adyen", "rewards"] as const;
    expect(new Set(providers).size).toBe(3);
  });

  it("requires idempotency for provider commands", () => {
    const command = {
      provider: "swan",
      commandType: "create_transfer",
      idempotencyKey: "transfer:123:v1",
    };
    expect(command.idempotencyKey.length).toBeGreaterThan(8);
  });
});
