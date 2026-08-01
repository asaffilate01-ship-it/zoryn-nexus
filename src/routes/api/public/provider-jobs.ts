import { createFileRoute } from "@tanstack/react-router";

/**
 * Background worker endpoint (pg_cron or an external scheduler calls this).
 *
 * - Retries webhook events that are due, moving repeat failures to dead letter.
 * - Flushes the rewards outbox to the Zoryn Rewards Hub when one is configured;
 *   otherwise the rows are marked `skipped` and rewards continue to work using
 *   Zoryn's own points ledger.
 *
 * Authenticated with the project's anon key in the `apikey` header.
 */
export const Route = createFileRoute("/api/public/provider-jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
        const provided = request.headers.get("apikey");
        if (!expected || provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

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
