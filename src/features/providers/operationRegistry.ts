import { z } from "zod";

export type ProviderName = "swan" | "adyen" | "rewards";

export const ProviderOperationSchemas = {
  swan: {
    start_individual_onboarding: z.object({
      customerId: z.string().uuid(),
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      country: z.string().length(2),
    }),
    start_company_onboarding: z.object({
      organisationId: z.string().uuid(),
      legalName: z.string().min(1),
      registrationNumber: z.string().min(1),
      country: z.string().length(2),
    }),
    create_transfer: z.object({
      transferId: z.string().uuid(),
      accountExternalId: z.string().min(1),
      beneficiaryIban: z.string().min(8),
      amountMinor: z.number().int().positive(),
      currency: z.literal("EUR"),
      reference: z.string().max(140).optional(),
    }),
    issue_card: z.object({
      cardId: z.string().uuid(),
      accountExternalId: z.string().min(1),
      cardType: z.enum(["physical", "virtual"]),
      cardholderName: z.string().min(1),
    }),
  },
  adyen: {
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
    create_payment_session: z.object({
      paymentId: z.string().uuid(),
      amountMinor: z.number().int().positive(),
      currency: z.literal("EUR"),
      reference: z.string().min(1),
      returnUrl: z.string().url(),
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
  },
  rewards: {
    record_transaction: z.object({
      customerId: z.string().uuid(),
      transactionId: z.string().uuid(),
      amountMinor: z.number().int().positive(),
      currency: z.literal("EUR"),
      merchantId: z.string().optional(),
    }),
    reverse_transaction: z.object({
      transactionId: z.string().uuid(),
      reason: z.string().min(1),
    }),
  },
} as const;

export function validateProviderOperation(
  provider: ProviderName,
  operation: string,
  payload: unknown,
) {
  const providerSchemas = ProviderOperationSchemas[provider] as Record<string, z.ZodTypeAny>;
  const schema = providerSchemas[operation];
  if (!schema) throw new Error(`unsupported_operation:${provider}:${operation}`);
  return schema.parse(payload);
}
