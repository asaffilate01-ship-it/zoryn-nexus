/**
 * Stage 3 — notification outbox worker.
 *
 * Notifications are written to platform_notification_outbox by product flows
 * and delivered here, so a failed email never blocks a money movement. Retries
 * use quadratic backoff and dead-letter after five attempts. In mock mode the
 * delivery is a no-op, which keeps the demo self-contained.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

type Admin = SupabaseClient<never>;

type OutboxItem = {
  id: string;
  channel: "email" | "push" | "in_app" | "sms";
  template_key: string;
  attempt_count: number;
};

export function notificationMode(): "mock" | "live" {
  return process.env["NOTIFICATION_MODE"] === "live" ? "live" : "mock";
}

export async function deliver(item: OutboxItem) {
  if (notificationMode() === "mock") return;
  // in_app notifications are simply the outbox row itself becoming visible.
  if (item.channel === "in_app") return;
  throw new Error(`provider_not_configured_${item.channel}`);
}

export async function runNotificationWorker(admin: Admin, limit = 100) {
  const { data, error } = await admin
    .from("platform_notification_outbox")
    .select("*")
    .in("status", ["queued", "failed"])
    .or(`next_attempt_at.is.null,next_attempt_at.lte.${new Date().toISOString()}`)
    .order("created_at")
    .limit(limit);
  if (error) throw new Error(error.message);

  const items = (data ?? []) as unknown as OutboxItem[];
  let sent = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await deliver(item);
      await admin
        .from("platform_notification_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempt_count: item.attempt_count + 1,
          last_error: null,
        } as never)
        .eq("id", item.id);
      sent++;
    } catch (e) {
      const attempts = item.attempt_count + 1;
      await admin
        .from("platform_notification_outbox")
        .update({
          status: attempts >= 5 ? "dead_letter" : "failed",
          attempt_count: attempts,
          last_error: e instanceof Error ? e.message : String(e),
          next_attempt_at: new Date(Date.now() + attempts * attempts * 60_000).toISOString(),
        } as never)
        .eq("id", item.id);
      failed++;
    }
  }

  return { processed: items.length, sent, failed };
}
