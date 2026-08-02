/**
 * Stage 1 — command worker endpoint. Called by pg_cron or an external
 * scheduler with the worker secret; claims and dispatches queued provider
 * commands.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/provider-command-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-command-worker", 120, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "PROVIDER_WORKER_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runCommandWorker } =
          await import("@/features/provider-integration/lib/command-worker.server");

        try {
          const result = await runCommandWorker(supabaseAdmin as never);
          return Response.json({ ok: true, ...result });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          console.error("provider-command-worker failed", message);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
