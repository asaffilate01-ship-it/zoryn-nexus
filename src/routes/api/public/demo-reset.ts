import { createFileRoute } from "@tanstack/react-router";

/**
 * Resets the demo sandbox back to its seeded baseline.
 *
 * Protected with the ZORYN_JOBS_SECRET header so the public prefix cannot be
 * used to wipe demo activity anonymously.
 */
export const Route = createFileRoute("/api/public/demo-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "demo-reset", 10, 3600);
        if (limited) return limited;

        const { checkJobsSecret, resetDemoData } = await import("@/lib/demo-reset.server");
        if (!checkJobsSecret(request)) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const result = await resetDemoData(supabaseAdmin);
        return Response.json(result);
      },
    },
  },
});
