/**
 * Stage 1 v6 — provider runtime logging.
 *
 * Every command dispatch and every event application writes a row here with a
 * correlation id, so one provider interaction can be followed end to end
 * across the queue, the worker and the webhook inbox. Rows are admin-readable
 * only because error messages can quote provider responses.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

type Admin = SupabaseClient<never>;

export type RuntimeLogStatus = "started" | "succeeded" | "failed" | "dead_letter";

const PROVIDERS = ["swan", "adyen", "rewards"] as const;

export function correlationId(provider: string, reference: string) {
  return `${provider}:${reference}`;
}

export async function writeRuntimeLog(
  admin: Admin,
  entry: {
    provider: string;
    direction: "command" | "event";
    entityId: string;
    operation: string;
    status: RuntimeLogStatus;
    correlationId: string;
    durationMs?: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  },
) {
  // The table constrains provider; an unexpected value must not break the
  // worker loop, so drop the log rather than fail the dispatch.
  if (!PROVIDERS.includes(entry.provider as never)) return;

  const { error } = await admin.from("platform_provider_runtime_logs").insert({
    provider: entry.provider,
    direction: entry.direction,
    entity_id: entry.entityId,
    operation: entry.operation,
    status: entry.status,
    correlation_id: entry.correlationId,
    duration_ms: entry.durationMs ?? null,
    error_message: entry.errorMessage ?? null,
    metadata: entry.metadata ?? {},
  } as never);

  if (error) console.error("runtime log insert failed", error.message);
}
