/**
 * Stage 11 — final provider activation endpoint. Verifies that every required
 * Swan/Adyen operation has an enabled mapping for the active environment and
 * records the run as evidence. Sandbox and live mappings must be explicitly
 * approved by the provider before they count as passing.
 */
import { createFileRoute } from "@tanstack/react-router";

const requiredOperations: Record<"swan" | "adyen", string[]> = {
  swan: [
    "start_individual_onboarding",
    "start_company_onboarding",
    "create_transfer",
    "issue_card",
  ],
  adyen: [
    "create_legal_entity",
    "create_store",
    "create_payment_session",
    "create_payment_link",
    "refund_payment",
  ],
};

export const Route = createFileRoute("/api/public/provider-activation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-activation", 30, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "PROVIDER_WORKER_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as { provider?: string };
        const provider = body.provider;
        if (provider !== "swan" && provider !== "adyen") {
          return Response.json({ error: "unsupported_provider" }, { status: 400 });
        }

        const environment = (process.env["PROVIDER_MODE"] ?? "mock") as
          | "mock"
          | "sandbox"
          | "live";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: run, error: runError } = await supabaseAdmin
          .from("platform_provider_activation_runs")
          .insert({ provider, environment, status: "running" } as never)
          .select("id")
          .single();

        if (runError || !run) {
          return Response.json(
            { error: runError?.message ?? "activation_run_failed" },
            { status: 500 },
          );
        }
        const runId = (run as { id: string }).id;

        const { data: mappings } = await supabaseAdmin
          .from("platform_provider_operation_mappings")
          .select("operation, approved_by_provider")
          .eq("provider", provider)
          .eq("environment", environment)
          .eq("enabled", true);

        const rows = (mappings ?? []) as { operation: string; approved_by_provider: boolean }[];
        const checks: Record<string, boolean> = {};
        for (const operation of requiredOperations[provider]) {
          const mapping = rows.find((item) => item.operation === operation);
          checks[`mapping:${operation}`] = Boolean(
            mapping && (environment === "mock" || mapping.approved_by_provider),
          );
        }

        const status = Object.values(checks).every(Boolean) ? "passed" : "blocked";

        await supabaseAdmin
          .from("platform_provider_activation_runs")
          .update({ status, checks, completed_at: new Date().toISOString() } as never)
          .eq("id", runId);

        return Response.json({ runId, provider, environment, status, checks });
      },
    },
  },
});