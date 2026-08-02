import { supabase } from "@/integrations/supabase/client";
import { enqueueProviderCommand as enqueueCommandFn } from "./platform-commands.functions";

export interface ProviderConnectionRow {
  id: string;
  provider: string;
  mode: string;
  status: string;
  last_checked_at: string;
}
export interface ProviderEventRow {
  id: string;
  provider: string;
  event_type: string;
  processing_status: string;
  received_at: string;
  attempt_count: number;
}
export interface ProviderResourceRow {
  id: string;
  provider: string;
  aggregate_type: string;
  resource_type: string;
  external_id: string;
  external_status: string | null;
  updated_at: string;
}

export async function getProviderReadiness() {
  const [connections, events, mappings] = await Promise.all([
    supabase.from("platform_provider_connections").select("*").order("provider"),
    supabase
      .from("platform_provider_events")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(25),
    supabase
      .from("platform_provider_resources")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(25),
  ]);

  if (connections.error) throw connections.error;
  if (events.error) throw events.error;
  if (mappings.error) throw mappings.error;

  return {
    connections: (connections.data ?? []) as unknown as ProviderConnectionRow[],
    events: (events.data ?? []) as unknown as ProviderEventRow[],
    mappings: (mappings.data ?? []) as unknown as ProviderResourceRow[],
  };
}

/** Queue a provider-neutral command through the authenticated server boundary. */
export function enqueueProviderCommand(input: {
  provider: "swan" | "adyen" | "rewards";
  commandType: string;
  aggregateType: string;
  aggregateId: string;
  payload?: Record<string, unknown>;
  idempotencyKey: string;
}) {
  return enqueueCommandFn({ data: { ...input, payload: input.payload ?? {} } });
}
