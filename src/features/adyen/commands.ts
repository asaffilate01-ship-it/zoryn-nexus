/** Stage 5 — explicit Adyen command schemas (Platforms, Checkout, Tap to Pay). */
import { z } from "zod";

export const AdyenCommandSchemas = {
  create_legal_entity: z.object({
    organisationId: z.string().uuid(),
    legalName: z.string().min(1),
    country: z.string().length(2),
  }),
  create_store: z.object({
    storeId: z.string().uuid(),
    merchantExternalId: z.string().min(1),
    name: z.string().min(1),
  }),
  create_payment_link: z.object({
    paymentLinkId: z.string().uuid(),
    amountMinor: z.number().int().positive(),
    currency: z.literal("EUR"),
    reference: z.string().min(1),
  }),
  refund_payment: z.object({
    refundId: z.string().uuid(),
    paymentExternalId: z.string().min(1),
    amountMinor: z.number().int().positive(),
  }),
} as const;

export type AdyenCommandName = keyof typeof AdyenCommandSchemas;

export const AdyenEndpoints: Record<AdyenCommandName, string> = {
  create_legal_entity: "/legalEntities",
  create_store: "/stores",
  create_payment_link: "/paymentLinks",
  refund_payment: "/refunds",
};

export const mapAdyenStatus = (raw?: string): string =>
  ({
    Authorised: "authorised",
    Captured: "captured",
    Refused: "declined",
    Cancelled: "cancelled",
    Refunded: "refunded",
    Chargeback: "chargeback_opened",
    active: "active",
    completed: "completed",
    expired: "expired",
  })[raw ?? ""] ?? (raw ?? "submitted").toLowerCase();