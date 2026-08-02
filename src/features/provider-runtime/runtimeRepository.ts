/**
 * Reads the provider runtime queues through the browser client, so row level
 * security decides what the signed-in operator may see: commands and runtime
 * logs are admin-only, webhook events are readable by any signed-in operator.
 */
import { supabase } from "@/integrations/supabase/client";
import type { RuntimeCommandRow, RuntimeEventRow, RuntimeLogRow, RuntimeSnapshot } from "./types";

export async function getRuntimeSnapshot(): Promise<RuntimeSnapshot> {
  const [commands, events, logs] = await Promise.all([
    supabase
      .from("platform_provider_commands")
      .select(
        "id, provider, command_type, status, attempt_count, last_error, next_attempt_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("platform_provider_events")
      .select(
        "id, provider, event_id, event_type, processing_status, attempt_count, last_error, received_at",
      )
      .order("received_at", { ascending: false })
      .limit(25),
    supabase
      .from("platform_provider_runtime_logs")
      .select(
        "id, provider, direction, operation, status, correlation_id, duration_ms, error_message, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  for (const result of [commands, events, logs]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    commands: (commands.data ?? []) as RuntimeCommandRow[],
    events: (events.data ?? []) as RuntimeEventRow[],
    logs: (logs.data ?? []) as RuntimeLogRow[],
  };
}
