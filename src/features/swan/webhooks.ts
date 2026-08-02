/** Stage 3 — Swan webhook normalization. */
export type NormalizedSwanEvent = {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId?: string | undefined;
  externalId?: string | undefined;
  status?: string | undefined;
  requiredActions: string[];
  payload: Record<string, unknown>;
};

const SWAN_EVENT_MAP: Record<string, string> = {
  "Onboarding.Updated": "onboarding.updated",
  "Account.Opened": "account.opened",
  "Account.Restricted": "account.restricted",
  "Transaction.Booked": "transaction.booked",
  "Transaction.Reversed": "transaction.reversed",
  "Transfer.Booked": "transfer.booked",
  "Transfer.Returned": "transfer.returned",
  "Card.Activated": "card.activated",
  "Card.Frozen": "card.frozen",
  "Card.Cancelled": "card.cancelled",
};

export function normalizeSwanEvent(input: Record<string, unknown>): NormalizedSwanEvent {
  const type = String(input["type"] ?? input["eventType"] ?? "");
  const resource = (input["resource"] ?? input["data"] ?? {}) as Record<string, unknown>;

  return {
    eventId: String(input["id"] ?? input["eventId"] ?? ""),
    eventType: SWAN_EVENT_MAP[type] ?? type.toLowerCase(),
    aggregateType: String(resource["aggregateType"] ?? resource["type"] ?? "unknown"),
    aggregateId: resource["aggregateId"] as string | undefined,
    externalId: (resource["id"] ?? resource["externalId"]) as string | undefined,
    status: resource["status"] as string | undefined,
    requiredActions: (resource["requiredActions"] as string[] | undefined) ?? [],
    payload: resource,
  };
}
