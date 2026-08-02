/** Stage 5 — Adyen webhook normalization. */
export type NormalizedAdyenEvent = {
  eventId: string;
  eventType: string;
  externalId?: string | undefined;
  status?: string | undefined;
  amountMinor?: number | undefined;
  payload: Record<string, unknown>;
};

const ADYEN_EVENT_MAP: Record<string, string> = {
  AUTHORISATION: "payment.authorised",
  CAPTURE: "payment.captured",
  CAPTURE_FAILED: "payment.capture_failed",
  CANCELLATION: "payment.cancelled",
  REFUND: "payment.refunded",
  REFUND_FAILED: "payment.refund_failed",
  CHARGEBACK: "payment.chargeback_opened",
  CHARGEBACK_REVERSED: "payment.chargeback_reversed",
  NOTIFICATION_OF_FRAUD: "payment.fraud_notification",
  ACCOUNT_HOLDER_STATUS_CHANGE: "merchant.status_changed",
  TRANSFER_FUNDS: "settlement.transfer_updated",
  PAYMENT_LINK: "payment_link.updated",
};

export function normalizeAdyenEvent(input: Record<string, unknown>): NormalizedAdyenEvent {
  const type = String(input["eventCode"] ?? input["type"] ?? "");
  const resource = (input["resource"] ?? {}) as Record<string, unknown>;
  const amount = (input["amount"] ?? {}) as Record<string, unknown>;
  const success = input["success"];

  return {
    eventId: String(input["pspReference"] ?? input["id"] ?? input["eventId"] ?? ""),
    eventType: ADYEN_EVENT_MAP[type] ?? type.toLowerCase(),
    externalId: (input["pspReference"] ?? resource["id"]) as string | undefined,
    status:
      success === "true" || success === true
        ? "succeeded"
        : success === "false" || success === false
          ? "failed"
          : (input["status"] as string | undefined),
    amountMinor: typeof amount["value"] === "number" ? (amount["value"] as number) : undefined,
    payload: input,
  };
}
