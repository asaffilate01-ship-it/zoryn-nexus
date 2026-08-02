/**
 * Stage 12 — provider webhook signature verification.
 * Swan uses a timestamped HMAC-SHA256 hex signature; Adyen uses a base64
 * HMAC-SHA256 over its escaped notification signing string.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { verifyGenericHmac } from "./webhookVerifier";

export async function verifySwanWebhook(input: { rawBody: string; headers: Headers }) {
  const secret = process.env["SWAN_WEBHOOK_SECRET"];
  if (!secret) throw new Error("swan_webhook_secret_missing");

  const timestamp =
    input.headers.get(process.env["SWAN_WEBHOOK_TIMESTAMP_HEADER"] ?? "x-swan-timestamp") ??
    undefined;

  return verifyGenericHmac({
    secret,
    rawBody: input.rawBody,
    suppliedSignature:
      input.headers.get(process.env["SWAN_WEBHOOK_SIGNATURE_HEADER"] ?? "x-swan-signature") ?? "",
    ...(timestamp ? { timestamp } : {}),
    toleranceSeconds: 300,
  });
}

export type AdyenNotificationItem = {
  pspReference?: string;
  originalReference?: string;
  merchantAccountCode?: string;
  merchantReference?: string;
  amount?: { value?: number | string; currency?: string };
  eventCode?: string;
  success?: string | boolean;
  additionalData?: { hmacSignature?: string };
};

export function buildAdyenSigningString(item: AdyenNotificationItem) {
  return [
    item.pspReference ?? "",
    item.originalReference ?? "",
    item.merchantAccountCode ?? "",
    item.merchantReference ?? "",
    item.amount?.value ?? "",
    item.amount?.currency ?? "",
    item.eventCode ?? "",
    item.success ?? "",
  ]
    .map((value) => String(value).replaceAll("\\", "\\\\").replaceAll(":", "\\:"))
    .join(":");
}

export function verifyAdyenWebhook(item: AdyenNotificationItem) {
  const keyHex = process.env["ADYEN_HMAC_KEY"];
  if (!keyHex) throw new Error("adyen_hmac_key_missing");

  const supplied = item.additionalData?.hmacSignature ?? "";
  const expected = createHmac("sha256", Buffer.from(keyHex, "hex"))
    .update(buildAdyenSigningString(item))
    .digest("base64");

  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}
