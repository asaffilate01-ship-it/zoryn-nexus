/**
 * Stage 12 — provider launch scoring. Calculates configuration, lifecycle,
 * webhook and reconciliation readiness for Swan or Adyen and records the score.
 */
import { createFileRoute } from "@tanstack/react-router";
import { requiredProviderOperations } from "@/features/providers/catalogue";

export const Route = createFileRoute("/api/public/provider-launch-score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-launch-score", 30, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "PROVIDER_WORKER_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          provider?: string;
          environment?: string;
        };
        const provider = body.provider;
        if (provider !== "swan" && provider !== "adyen") {
          return Response.json({ error: "unsupported_provider" }, { status: 400 });
        }

        const environment = (body.environment ??
          process.env["PROVIDER_MODE"] ??
          "mock") as "mock" | "sandbox" | "live";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [mappings, evidence, webhooks, reconciliations] = await Promise.all([
          supabaseAdmin
            .from("platform_provider_operation_mappings")
            .select("operation, enabled, approved_by_provider")
            .eq("provider", provider)
            .eq("environment", environment),
          supabaseAdmin
            .from("platform_provider_test_evidence")
            .select("status")
            .eq("provider", provider)
            .eq("environment", environment),
          supabaseAdmin
            .from("platform_provider_webhook_receipts")
            .select("signature_valid, replay_valid")
            .eq("provider", provider)
            .eq("environment", environment),
          supabaseAdmin
            .from("platform_reconciliation_runs")
            .select("status")
            .eq("provider", provider),
        ]);

        const required = requiredProviderOperations[provider];
        const approved = required.filter((operation) =>
          (mappings.data ?? []).some(
            (item) =>
              item.operation === operation &&
              item.enabled &&
              (environment === "mock" || item.approved_by_provider),
          ),
        ).length;

        const configuration_score = Math.round((approved / required.length) * 100);
        const lifecycle_score = Math.min(
          100,
          (evidence.data ?? []).filter((item) => item.status === "passed").length * 10,
        );
        const webhooks_score = Math.min(
          100,
          (webhooks.data ?? []).filter((item) => item.signature_valid && item.replay_valid).length *
            20,
        );
        const reconciliation_score = Math.min(
          100,
          (reconciliations.data ?? []).filter((item) => item.status === "passed").length * 25,
        );

        const blocking_reasons: string[] = [];
        if (configuration_score < 100)
          blocking_reasons.push("Required operation mappings incomplete.");
        if (lifecycle_score < 80) blocking_reasons.push("Sandbox lifecycle evidence incomplete.");
        if (webhooks_score < 80) blocking_reasons.push("Webhook verification evidence incomplete.");
        if (reconciliation_score < 80) blocking_reasons.push("Reconciliation evidence incomplete.");

        const { data, error } = await supabaseAdmin
          .from("platform_provider_launch_scores")
          .insert({
            provider,
            environment,
            configuration_score,
            webhooks_score,
            reconciliation_score,
            lifecycle_score,
            blocking_reasons,
          } as never)
          .select("id, overall_score")
          .single();

        if (error) return Response.json({ error: error.message }, { status: 500 });

        return Response.json({
          provider,
          environment,
          scoreId: (data as { id: string }).id,
          overallScore: (data as { overall_score: number }).overall_score,
          configuration_score,
          lifecycle_score,
          webhooks_score,
          reconciliation_score,
          blocking_reasons,
        });
      },
    },
  },
});