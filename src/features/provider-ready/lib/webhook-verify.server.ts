/**
 * Per-provider webhook signature verification.
 *
 * Each provider signs differently, so a single shared HMAC is not enough once
 * sandbox traffic starts:
 *  - Zoryn/mock: HMAC-SHA256 hex over the raw body (`x-zoryn-signature`).
 *  - Swan:       HMAC-SHA256 hex over the raw body (`hmacsignature`), own secret.
 *  - Adyen:      HMAC-SHA256 base64 over the colon-joined notification payload
 *                (`additionalData.hmacSignature`), key supplied as hex.
 */
import { createHmac, timingSafeEqual } from "crypto";

export type VerifyResult = { ok: true; provider: string } | { ok: false; status: number; error: string };

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const hexHmac = (secret: string, body: string) => createHmac("sha256", secret).update(body).digest("hex");

/** Adyen escapes backslashes and colons before joining the signed fields. */
const escapeAdyen = (value: unknown) => String(value ?? "").replace(/\\/g, "\\\\").replace(/:/g, "\\:");

export function adyenSigningString(item: Record<string, any>): string {
  const amount = item["amount"] ?? {};
  return [
    item["pspReference"],
    item["originalReference"],
    item["merchantAccountCode"],
    item["merchantReference"],
    amount["value"],
    amount["currency"],
    item["eventCode"],
    item["success"],
  ]
    .map(escapeAdyen)
    .join(":");
}

export function verifyAdyenItem(item: Record<string, any>): boolean {
  const hexKey = process.env["ADYEN_HMAC_KEY"];
  const provided = item?.["additionalData"]?.["hmacSignature"];
  if (!hexKey || !provided) return false;
  const expected = createHmac("sha256", Buffer.from(hexKey, "hex"))
    .update(adyenSigningString(item), "utf8")
    .digest("base64");
  return safeEqual(String(provided), expected);
}

export function verifyWebhook(headers: Headers, body: string, payload: any): VerifyResult {
  // Adyen posts a notificationItems array and verifies each item individually.
  if (Array.isArray(payload?.notificationItems)) {
    if (!process.env["ADYEN_HMAC_KEY"]) {
      return { ok: false, status: 503, error: "ADYEN_HMAC_KEY is not configured" };
    }
    const items = payload.notificationItems.map((w: any) => w?.NotificationRequestItem ?? w);
    if (!items.every((item: any) => verifyAdyenItem(item))) {
      return { ok: false, status: 401, error: "Invalid Adyen signature" };
    }
    return { ok: true, provider: "adyen" };
  }

  const swanSignature = headers.get("hmacsignature") ?? headers.get("x-swan-signature");
  const swanSecret = process.env["SWAN_WEBHOOK_SECRET"];
  if (swanSignature && swanSecret) {
    return safeEqual(swanSignature, hexHmac(swanSecret, body))
      ? { ok: true, provider: "swan" }
      : { ok: false, status: 401, error: "Invalid Swan signature" };
  }

  const secret = process.env["PROVIDER_WEBHOOK_SECRET"];
  if (!secret) return { ok: false, status: 503, error: "PROVIDER_WEBHOOK_SECRET is not configured" };
  const signature = headers.get("x-zoryn-signature") ?? swanSignature ?? "";
  return safeEqual(signature, hexHmac(secret, body))
    ? { ok: true, provider: String(payload?.provider ?? "mock") }
    : { ok: false, status: 401, error: "Invalid signature" };
}
