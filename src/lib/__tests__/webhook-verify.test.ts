import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import { adyenSigningString, verifyWebhook } from "@/features/provider-ready/lib/webhook-verify.server";

const SECRET = "test-secret";

afterEach(() => {
  delete process.env["PROVIDER_WEBHOOK_SECRET"];
  delete process.env["SWAN_WEBHOOK_SECRET"];
  delete process.env["ADYEN_HMAC_KEY"];
});

const sign = (secret: string, body: string) => createHmac("sha256", secret).update(body).digest("hex");

describe("verifyWebhook", () => {
  it("rejects when no secret is configured", () => {
    const result = verifyWebhook(new Headers(), "{}", {});
    expect(result).toMatchObject({ ok: false, status: 503 });
  });

  it("accepts a correctly signed mock payload", () => {
    process.env["PROVIDER_WEBHOOK_SECRET"] = SECRET;
    const body = JSON.stringify({ provider: "mock", id: "evt_1" });
    const headers = new Headers({ "x-zoryn-signature": sign(SECRET, body) });
    expect(verifyWebhook(headers, body, JSON.parse(body))).toEqual({ ok: true, provider: "mock" });
  });

  it("rejects a tampered body", () => {
    process.env["PROVIDER_WEBHOOK_SECRET"] = SECRET;
    const body = JSON.stringify({ provider: "mock", id: "evt_1" });
    const headers = new Headers({ "x-zoryn-signature": sign(SECRET, body) });
    expect(verifyWebhook(headers, body + " ", JSON.parse(body))).toMatchObject({ ok: false, status: 401 });
  });

  it("verifies Swan signatures with the Swan secret", () => {
    process.env["SWAN_WEBHOOK_SECRET"] = "swan-secret";
    const body = JSON.stringify({ id: "swan_1" });
    const ok = new Headers({ hmacsignature: sign("swan-secret", body) });
    expect(verifyWebhook(ok, body, JSON.parse(body))).toEqual({ ok: true, provider: "swan" });
    const bad = new Headers({ hmacsignature: sign("wrong", body) });
    expect(verifyWebhook(bad, body, JSON.parse(body))).toMatchObject({ ok: false, status: 401 });
  });

  it("builds the Adyen signing string with escaping", () => {
    expect(
      adyenSigningString({
        pspReference: "ps:1",
        merchantAccountCode: "ZORYN",
        merchantReference: "ref",
        amount: { value: 1000, currency: "EUR" },
        eventCode: "AUTHORISATION",
        success: "true",
      }),
    ).toBe("ps\\:1::ZORYN:ref:1000:EUR:AUTHORISATION:true");
  });

  it("verifies an Adyen notification end to end", () => {
    const key = Buffer.from("a1b2c3d4", "hex").toString("hex");
    process.env["ADYEN_HMAC_KEY"] = key;
    const item: Record<string, unknown> = {
      pspReference: "psp_1",
      merchantAccountCode: "ZORYN",
      merchantReference: "order-1",
      amount: { value: 2490, currency: "EUR" },
      eventCode: "AUTHORISATION",
      success: "true",
    };
    const signature = createHmac("sha256", Buffer.from(key, "hex"))
      .update(adyenSigningString(item), "utf8")
      .digest("base64");
    item["additionalData"] = { hmacSignature: signature };
    const payload = { notificationItems: [{ NotificationRequestItem: item }] };
    expect(verifyWebhook(new Headers(), JSON.stringify(payload), payload)).toEqual({ ok: true, provider: "adyen" });
  });
});
