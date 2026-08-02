import { describe, expect, it } from "vitest";
import { verifyGenericHmac } from "@/features/providers/server/webhookVerifier";

describe("webhook verifier", () => {
  it("rejects an incorrect signature", async () => {
    const valid = await verifyGenericHmac({
      secret: "secret",
      rawBody: '{"id":"1"}',
      suppliedSignature: "invalid",
    });

    expect(valid).toBe(false);
  });

  it("rejects stale timestamped requests", async () => {
    const valid = await verifyGenericHmac({
      secret: "secret",
      rawBody: '{"id":"1"}',
      suppliedSignature: "invalid",
      timestamp: "1",
    });

    expect(valid).toBe(false);
  });
});
