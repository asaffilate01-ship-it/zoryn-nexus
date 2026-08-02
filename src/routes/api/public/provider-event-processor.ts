/**
 * Stage 1 — event processor endpoint. Drains the platform provider webhook
 * inbox, applying onboarding and resource-mapping events.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/provider-event-processor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-event-processor", 120, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "PROVIDER_WORKER_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runEventProcessor } =
          await import("@/features/provider-integration/lib/event-processor.server");

        try {
          const result = await runEventProcessor(supabaseAdmin as never);
          return Response.json({ ok: true, ...result });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          console.error("provider-event-processor failed", message);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
