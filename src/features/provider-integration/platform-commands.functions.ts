/**
 * Secure frontend boundary for provider actions.
 *
 * The browser never talks to Swan or Adyen directly. It queues a
 * provider-neutral command; the worker picks it up and calls the adapter, so
 * provider credentials stay server-side. Commands are idempotent: replaying
 * the same key returns the existing command instead of creating a second one.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const commandSchema = z.object({
  provider: z.enum(["swan", "adyen", "rewards"]),
  commandType: z.string().min(1).max(120),
  aggregateType: z.string().min(1).max(60),
  aggregateId: z.string().uuid(),
  payload: z.record(z.unknown()).default({}),
  idempotencyKey: z.string().min(8).max(200),
});

export const enqueueProviderCommand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => commandSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("platform_provider_commands")
      .insert({
        provider: data.provider,
        command_type: data.commandType,
        aggregate_type: data.aggregateType,
        aggregate_id: data.aggregateId,
        payload: data.payload as never,
        idempotency_key: data.idempotencyKey,
        status: "queued",
        created_by: userId,
      } as never)
      .select("id, status, idempotency_key")
      .single();

    // 23505 = unique violation on idempotency_key: the command already exists.
    if (error && (error as { code?: string }).code === "23505") {
      const existing = await supabase
        .from("platform_provider_commands")
        .select("id, status, idempotency_key")
        .eq("idempotency_key", data.idempotencyKey)
        .maybeSingle();
      return { accepted: true, duplicate: true, command: existing.data };
    }
    if (error) throw new Error(error.message);

    return { accepted: true, duplicate: false, command: row };
  });