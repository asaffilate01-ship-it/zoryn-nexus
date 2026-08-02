/**
 * Stage 9 — reconciliation runner. Performs structural reconciliation of
 * mapped provider resources; once sandbox access exists this should compare
 * against Swan/Adyen API records and statements.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/provider-reconciliation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-reconciliation", 60, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "PROVIDER_WORKER_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          provider?: string;
          runType?: string;
        };
        if (!["swan", "adyen", "rewards"].includes(body.provider ?? "")) {
          return Response.json({ error: "unsupported_provider" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: run, error: createError } = await supabaseAdmin
          .from("platform_reconciliation_runs")
          .insert({
            provider: body.provider,
            run_type: body.runType ?? "resource_sync",
            status: "running",
          } as never)
          .select("id")
          .single();

        if (createError || !run) {
          return Response.json({ error: createError?.message ?? "run_failed" }, { status: 500 });
        }
        const runId = (run as { id: string }).id;

        try {
          const { data: resources, error: resourcesError } = await supabaseAdmin
            .from("platform_provider_resources")
            .select("aggregate_id, resource_type, external_id, external_status, last_synced_at")
            .eq("provider", body.provider!);
          if (resourcesError) throw new Error(resourcesError.message);

          const items = (resources ?? []).map((resource) => ({
            reconciliation_run_id: runId,
            resource_type: resource.resource_type,
            internal_reference: resource.aggregate_id,
            provider_reference: resource.external_id,
            status: resource.external_id
              ? resource.external_status
                ? "matched"
                : "different"
              : "missing_provider",
            details: {
              externalStatus: resource.external_status,
              lastSyncedAt: resource.last_synced_at,
            },
          }));

          if (items.length) {
            const { error: itemError } = await supabaseAdmin
              .from("platform_reconciliation_items")
              .insert(items as never);
            if (itemError) throw new Error(itemError.message);
          }

          const differences = items.filter((item) => item.status !== "matched").length;

          await supabaseAdmin
            .from("platform_reconciliation_runs")
            .update({
              status: differences ? "warning" : "passed",
              details: {
                total: items.length,
                differences,
                note: "Stage 9 structural reconciliation. Replace with provider statement/API reconciliation in sandbox.",
              },
              completed_at: new Date().toISOString(),
            } as never)
            .eq("id", runId);

          return Response.json({ runId, total: items.length, differences });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          await supabaseAdmin
            .from("platform_reconciliation_runs")
            .update({
              status: "failed",
              details: { error: message },
              completed_at: new Date().toISOString(),
            } as never)
            .eq("id", runId);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
