/**
 * Stage 9 — sandbox fixture runner. Injects known provider events so Swan and
 * Adyen lifecycles can be exercised before sandbox credentials exist.
 * Disabled entirely when PROVIDER_MODE=live.
 */
import { createFileRoute } from "@tanstack/react-router";

const scenarios = {
  swan_individual_approved: {
    provider: "swan",
    eventType: "onboarding.updated",
    payload: { externalId: "swan_demo_individual", status: "approved", requiredActions: [] },
  },
  swan_transfer_returned: {
    provider: "swan",
    eventType: "transfer.returned",
    payload: {
      externalId: "swan_demo_transfer",
      status: "returned",
      reason: "beneficiary_account_closed",
    },
  },
  adyen_payment_captured: {
    provider: "adyen",
    eventType: "payment.captured",
    payload: {
      externalId: "adyen_demo_payment",
      status: "captured",
      amountMinor: 2500,
      currency: "EUR",
    },
  },
  adyen_chargeback_opened: {
    provider: "adyen",
    eventType: "payment.chargeback_opened",
    payload: {
      externalId: "adyen_demo_payment",
      status: "opened",
      amountMinor: 2500,
      currency: "EUR",
    },
  },
} as const;

export const Route = createFileRoute("/api/public/provider-sandbox-fixtures")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "provider-sandbox-fixtures", 60, 60);
        if (limited) return limited;

        const { checkWorkerSecret } = await import("@/lib/worker-auth.server");
        if (!checkWorkerSecret(request, "PROVIDER_REPLAY_SECRET")) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        if ((process.env["PROVIDER_MODE"] ?? "mock") === "live") {
          return Response.json({ error: "fixtures_disabled_in_live_mode" }, { status: 403 });
        }

        const body = (await request.json().catch(() => ({}))) as { scenario?: string };
        const fixture = scenarios[body.scenario as keyof typeof scenarios];
        if (!fixture) return Response.json({ error: "unknown_scenario" }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const eventId = `fixture:${body.scenario}:${crypto.randomUUID()}`;

        const { error } = await supabaseAdmin.from("platform_provider_events").insert({
          provider: fixture.provider,
          event_id: eventId,
          event_type: fixture.eventType,
          payload: fixture.payload,
          payload_hash: eventId,
          processing_status: "received",
          occurred_at: new Date().toISOString(),
        } as never);

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ accepted: true, eventId }, { status: 202 });
      },
    },
  },
});
