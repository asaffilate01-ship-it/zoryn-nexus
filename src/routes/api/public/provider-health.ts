/**
 * Stage 1 — provider health endpoint.
 *
 * Public read-only: returns connection modes plus command and event backlog
 * sizes, and answers 503 when anything has dead-lettered so external
 * monitoring can alert. Never returns payloads or provider secrets.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/provider-health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-health", 120, 60);
        if (limited) return limited;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [connections, commands, events, alerts, logs] = await Promise.all([
          supabaseAdmin
            .from("platform_provider_connections")
            .select("provider, mode, status, last_checked_at"),
          supabaseAdmin.from("platform_provider_commands").select("status, provider"),
          supabaseAdmin
            .from("platform_provider_events")
            .select("processing_status, provider, received_at"),
          supabaseAdmin.from("platform_provider_alerts").select("id").eq("status", "open"),
          supabaseAdmin
            .from("platform_provider_runtime_logs")
            .select("provider, direction, operation, status, correlation_id, duration_ms, created_at")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        const commandBacklog = (commands.data ?? []).filter((x) =>
          ["queued", "processing", "failed", "dead_letter"].includes(x.status),
        );
        const eventBacklog = (events.data ?? []).filter((x) =>
          ["received", "processing", "retrying", "failed", "dead_letter"].includes(
            x.processing_status,
          ),
        );
        const degraded =
          commandBacklog.some((x) => x.status === "dead_letter") ||
          eventBacklog.some((x) => x.processing_status === "dead_letter");

        return Response.json(
          {
            status: degraded ? "degraded" : "healthy",
            checkedAt: new Date().toISOString(),
            connections: connections.data ?? [],
            commandBacklog: commandBacklog.length,
            eventBacklog: eventBacklog.length,
            openAlerts: (alerts.data ?? []).length,
            // Error text is deliberately omitted: this endpoint is public.
            recentActivity: logs.data ?? [],
          },
          { status: degraded ? 503 : 200 },
        );
      },
    },
  },
});
