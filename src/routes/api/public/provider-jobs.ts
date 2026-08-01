import { createFileRoute } from "@tanstack/react-router";

/**
 * Background worker endpoint (pg_cron or an external scheduler calls this).
 *
 * - Retries webhook events that are due, moving repeat failures to dead letter.
 * - Flushes the rewards outbox to the Zoryn Rewards Hub when one is configured;
 *   otherwise the rows are marked `skipped` and rewards continue to work using
 *   Zoryn's own points ledger.
 *
 * Authenticated with a dedicated ZORYN_JOBS_SECRET in the
 * `x-zoryn-jobs-secret` header (falls back to the project's anon key in
 * `apikey` when no dedicated secret is configured).
 */
export const Route = createFileRoute("/api/public/provider-jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-jobs", 60, 60);
        if (limited) return limited;

        const { checkJobsSecret } = await import("@/lib/demo-reset.server");
        if (!checkJobsSecret(request)) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { processDueEvents } = await import("@/features/provider-ready/lib/webhook-process.server");
        const { flushRewardsOutbox } = await import("@/features/provider-ready/lib/rewards-hub.server");

        const events = await processDueEvents(supabaseAdmin as never);
        const rewards = await flushRewardsOutbox(supabaseAdmin as never);

        return Response.json({
          ok: true,
          processed: events.length,
          results: events,
          rewards,
        });
      },
    },
  },
});
