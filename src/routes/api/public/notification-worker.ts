/**
 * Stage 3 — notification outbox worker endpoint.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/notification-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "notification-worker", 120, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "NOTIFICATION_WORKER_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runNotificationWorker } =
          await import("@/features/operations/lib/notification-worker.server");

        try {
          const result = await runNotificationWorker(supabaseAdmin as never);
          return Response.json({ ok: true, ...result });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          console.error("notification-worker failed", message);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
