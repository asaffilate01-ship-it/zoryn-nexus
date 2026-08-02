export type NormalizedProviderEvent = {
  provider: "swan" | "adyen" | "rewards";
  eventId: string;
  eventType: string;
  externalId?: string;
  aggregateId?: string;
  status?: string;
  payload: Record<string, unknown>;
};

export type EventHandler = (event: NormalizedProviderEvent) => Promise<void>;

const handlers = new Map<string, EventHandler>();

export function registerProviderEventHandler(
  provider: NormalizedProviderEvent["provider"],
  eventType: string,
  handler: EventHandler,
) {
  handlers.set(`${provider}:${eventType}`, handler);
}

export async function handleProviderEvent(event: NormalizedProviderEvent) {
  const handler = handlers.get(`${event.provider}:${event.eventType}`);
  if (!handler) throw new Error(`unmapped_event:${event.provider}:${event.eventType}`);
  await handler(event);
}

export function listRegisteredProviderEvents() {
  return [...handlers.keys()].sort();
}
