/**
 * Stage 1 — provider command worker.
 *
 * Claims queued/failed provider commands under a database lock (so parallel
 * workers never dispatch the same command twice), dispatches them to the mock
 * or live Swan / Adyen / Rewards endpoint with the command's idempotency key,
 * maps the returned external id onto platform_provider_resources, and reports
 * the outcome back so Postgres applies retry backoff or dead-letters the
 * command after five attempts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { correlationId, writeRuntimeLog } from "./runtime-log.server";

type Admin = SupabaseClient<never>;

export type ProviderCommand = {
  id: string;
  provider: "swan" | "adyen" | "rewards";
  command_type: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
  attempt_count: number;
};

export type DispatchResult = {
  externalId?: string;
  externalStatus?: string;
  resourceType?: string;
  [key: string]: unknown;
};

export function workerMode(): "mock" | "sandbox" | "live" {
  const mode = process.env["PROVIDER_MODE"] ?? "mock";
  return mode === "sandbox" || mode === "live" ? mode : "mock";
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`missing_env_${key.toLowerCase()}`);
  return value;
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, tag: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${tag}_${response.status}`);
  return (await response.json().catch(() => ({}))) as DispatchResult;
}

export async function dispatchCommand(command: ProviderCommand): Promise<DispatchResult> {
  if (workerMode() === "mock") {
    return {
      externalId: `${command.provider}_${command.command_type}_${crypto.randomUUID()}`,
      externalStatus: "succeeded",
      resourceType: command.command_type,
      mode: "mock",
    };
  }

  const idem = { "Idempotency-Key": command.idempotency_key };

  if (command.provider === "swan") {
    const { SwanCommandSchemas } = await import("@/features/swan/commands");
    if (command.command_type in SwanCommandSchemas) {
      const { executeSwanCommand } = await import("@/features/swan/swanAdapter.server");
      return executeSwanCommand(command);
    }
    return postJson(
      `${requireEnv("SWAN_API_URL")}/commands`,
      { Authorization: `Bearer ${requireEnv("SWAN_ACCESS_TOKEN")}`, ...idem },
      command.payload,
      "swan",
    );
  }
  if (command.provider === "adyen") {
    const { AdyenCommandSchemas } = await import("@/features/adyen/commands");
    if (command.command_type in AdyenCommandSchemas) {
      const { executeAdyenCommand } = await import("@/features/adyen/adyenAdapter.server");
      return executeAdyenCommand(command);
    }
    return postJson(
      `${requireEnv("ADYEN_API_URL")}/commands`,
      { "X-API-Key": requireEnv("ADYEN_API_KEY"), ...idem },
      command.payload,
      "adyen",
    );
  }
  if (command.provider === "rewards") {
    return postJson(
      `${requireEnv("REWARDS_API_URL")}/events`,
      { Authorization: `Bearer ${requireEnv("REWARDS_SERVICE_TOKEN")}`, ...idem },
      command.payload,
      "rewards",
    );
  }
  throw new Error("unsupported_provider");
}

export async function persistCommandResult(
  admin: Admin,
  command: ProviderCommand,
  result: DispatchResult,
) {
  if (!result?.externalId) return;
  await admin.from("platform_provider_resources").upsert(
    {
      provider: command.provider,
      aggregate_type: command.aggregate_type,
      aggregate_id: command.aggregate_id,
      resource_type: result.resourceType ?? command.command_type,
      external_id: result.externalId,
      external_status: result.externalStatus ?? "unknown",
      metadata: result,
      last_synced_at: new Date().toISOString(),
    } as never,
    { onConflict: "provider,aggregate_type,aggregate_id,resource_type" },
  );
}

async function raiseAlert(admin: Admin, command: ProviderCommand, message: string) {
  await admin.from("platform_provider_alerts").insert({
    provider: command.provider,
    severity: "critical",
    alert_type: "command_dead_letter",
    title: `${command.provider} ${command.command_type} dead-lettered`,
    details: { commandId: command.id, error: message, attempts: command.attempt_count },
  } as never);
}

export async function runCommandWorker(admin: Admin, limit = 25) {
  const workerId = crypto.randomUUID();
  const { data, error } = await admin.rpc("platform_claim_provider_commands", {
    p_worker_id: workerId,
    p_limit: limit,
  } as never);
  if (error) throw new Error(error.message);

  const commands = (data ?? []) as unknown as ProviderCommand[];
  let succeeded = 0;
  let failed = 0;
  const results: Array<{ id: string; status: string; error?: string; correlationId: string }> = [];

  for (const command of commands) {
    const startedAt = Date.now();
    const correlation = correlationId(command.provider, command.id);
    await writeRuntimeLog(admin, {
      provider: command.provider,
      direction: "command",
      entityId: command.id,
      operation: command.command_type,
      status: "started",
      correlationId: correlation,
      metadata: { attempt: command.attempt_count, mode: workerMode() },
    });

    try {
      const result = await dispatchCommand(command);
      await persistCommandResult(admin, command, result);
      await admin.rpc("platform_complete_provider_command", {
        p_command_id: command.id,
        p_status: "succeeded",
        p_error: null,
      } as never);
      await writeRuntimeLog(admin, {
        provider: command.provider,
        direction: "command",
        entityId: command.id,
        operation: command.command_type,
        status: "succeeded",
        correlationId: correlation,
        durationMs: Date.now() - startedAt,
        metadata: { externalId: result?.externalId ?? null },
      });
      succeeded++;
      results.push({ id: command.id, status: "succeeded", correlationId: correlation });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await admin.rpc("platform_complete_provider_command", {
        p_command_id: command.id,
        p_status: "failed",
        p_error: message,
      } as never);
      // attempt_count was already incremented on claim, so >= 5 means the
      // routine just moved this command to dead_letter.
      const deadLetter = command.attempt_count >= 5;
      if (deadLetter) await raiseAlert(admin, command, message);
      await writeRuntimeLog(admin, {
        provider: command.provider,
        direction: "command",
        entityId: command.id,
        operation: command.command_type,
        status: deadLetter ? "dead_letter" : "failed",
        correlationId: correlation,
        durationMs: Date.now() - startedAt,
        errorMessage: message,
        metadata: { attempt: command.attempt_count },
      });
      failed++;
      results.push({
        id: command.id,
        status: deadLetter ? "dead_letter" : "failed",
        error: message,
        correlationId: correlation,
      });
    }
  }

  return { workerId, claimed: commands.length, succeeded, failed, results };
}
