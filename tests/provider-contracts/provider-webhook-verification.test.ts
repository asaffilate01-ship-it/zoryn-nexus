import { afterEach, describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import {
  buildAdyenSigningString,
  verifyAdyenWebhook,
  verifySwanWebhook,
} from "@/features/providers/server/providerWebhookVerification";
import { getSwanAccessToken } from "@/features/providers/server/swanTokenProvider";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Swan webhook verification", () => {
  it("fails closed when the signing secret is missing", async () => {
    delete process.env["SWAN_WEBHOOK_SECRET"];
    await expect(verifySwanWebhook({ rawBody: "{}", headers: new Headers() })).rejects.toThrow(
      "swan_webhook_secret_missing",
    );
  });

  it("accepts a correctly signed, in-tolerance payload", async () => {
    process.env["SWAN_WEBHOOK_SECRET"] = "swan_test_secret";
    const rawBody = JSON.stringify({ type: "account.updated" });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", "swan_test_secret")
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const headers = new Headers({
      "x-swan-timestamp": timestamp,
      "x-swan-signature": signature,
    });

    await expect(verifySwanWebhook({ rawBody, headers })).resolves.toBe(true);
  });

  it("rejects a replayed timestamp outside tolerance", async () => {
    process.env["SWAN_WEBHOOK_SECRET"] = "swan_test_secret";
    const rawBody = "{}";
    const timestamp = String(Math.floor(Date.now() / 1000) - 4000);
    const signature = createHmac("sha256", "swan_test_secret")
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    await expect(
      verifySwanWebhook({
        rawBody,
        headers: new Headers({ "x-swan-timestamp": timestamp, "x-swan-signature": signature }),
      }),
    ).resolves.toBe(false);
  });

  it("rejects a tampered body", async () => {
    process.env["SWAN_WEBHOOK_SECRET"] = "swan_test_secret";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", "swan_test_secret")
      .update(`${timestamp}.{"a":1}`)
      .digest("hex");

    await expect(
      verifySwanWebhook({
        rawBody: '{"a":2}',
        headers: new Headers({ "x-swan-timestamp": timestamp, "x-swan-signature": signature }),
      }),
    ).resolves.toBe(false);
  });
});

describe("Adyen webhook verification", () => {
  const key = "0102030405060708";

  it("escapes colons and backslashes in the signing string", () => {
    expect(
      buildAdyenSigningString({
        pspReference: "psp:1",
        merchantAccountCode: "back\\slash",
        amount: { value: 1000, currency: "EUR" },
        eventCode: "AUTHORISATION",
        success: "true",
      }),
    ).toBe("psp\\:1::back\\\\slash::1000:EUR:AUTHORISATION:true");
  });

  it("throws when the HMAC key is not configured", () => {
    delete process.env["ADYEN_HMAC_KEY"];
    expect(() => verifyAdyenWebhook({ pspReference: "psp_1" })).toThrow("adyen_hmac_key_missing");
  });

  it("accepts a valid HMAC signature and rejects an invalid one", () => {
    process.env["ADYEN_HMAC_KEY"] = key;
    const item = {
      pspReference: "psp_1",
      merchantAccountCode: "ZorynPayECOM",
      merchantReference: "order_1",
      amount: { value: 1500, currency: "EUR" },
      eventCode: "AUTHORISATION",
      success: "true",
    };
    const hmacSignature = createHmac("sha256", Buffer.from(key, "hex"))
      .update(buildAdyenSigningString(item))
      .digest("base64");

    expect(verifyAdyenWebhook({ ...item, additionalData: { hmacSignature } })).toBe(true);
    expect(verifyAdyenWebhook({ ...item, additionalData: { hmacSignature: "bogus" } })).toBe(false);
    expect(verifyAdyenWebhook(item)).toBe(false);
  });
});

describe("Swan access token provider", () => {
  it("prefers a directly supplied access token", async () => {
    process.env["SWAN_ACCESS_TOKEN"] = "token_direct";
    await expect(getSwanAccessToken({} as never)).resolves.toBe("token_direct");
  });

  it("fails closed when client credentials are incomplete", async () => {
    delete process.env["SWAN_ACCESS_TOKEN"];
    delete process.env["SWAN_CLIENT_ID"];
    delete process.env["SWAN_CLIENT_SECRET"];
    delete process.env["SWAN_TOKEN_URL"];
    await expect(getSwanAccessToken({} as never)).rejects.toThrow("swan_auth_not_configured");
  });
});
