/** Stage 3 — explicit Swan command schemas. */
import { z } from "zod";

export const SwanCommandSchemas = {
  start_individual_onboarding: z.object({
    customerId: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
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
} as const;

export type SwanCommandName = keyof typeof SwanCommandSchemas;

export const SwanEndpoints: Record<SwanCommandName, string> = {
  start_individual_onboarding: "/onboarding/individuals",
  start_company_onboarding: "/onboarding/companies",
  create_transfer: "/transfers",
  issue_card: "/cards",
};

/** Swan account/transaction/card status strings mapped to Zoryn states. */
export const mapSwanStatus = (raw?: string): string =>
  ({
    Enabled: "active",
    Opened: "active",
    Suspended: "suspended",
    Closing: "closing",
    Closed: "closed",
    Pending: "pending",
    Booked: "booked",
    Reversed: "reversed",
    Rejected: "rejected",
    Returned: "returned",
    Canceled: "cancelled",
    Cancelled: "cancelled",
  })[raw ?? ""] ?? (raw ?? "unknown").toLowerCase();

/** 5xx and 429 are transient; everything else should stop retrying. */
export function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429 || status === 408;
}
