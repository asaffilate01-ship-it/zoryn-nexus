import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Provider webhook receiver (replaces the "provider-webhooks" function in the
 * overlay — this stack runs server routes, not Edge Functions).
 *
 * Verifies an HMAC-SHA256 signature over the raw body, then stores the raw
 * event idempotently on provider_events. Processing stays asynchronous: the
 * row is written as `received` and picked up by the operations centre.
 */
export const Route = createFileRoute("/api/public/provider-webhooks")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PROVIDER_WEBHOOK_SECRET"];
        if (!secret) {
          return Response.json(
            { ok: false, mode: "mock", error: "PROVIDER_WEBHOOK_SECRET is not configured" },
            { status: 503 },
          );
        }

        const body = await request.text();
        const signature =
          request.headers.get("x-zoryn-signature") ??
          request.headers.get("x-swan-signature") ??
          request.headers.get("hmacsignature") ??
          "";
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(body || "{}");
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const provider = String(payload["provider"] ?? "unknown");
        const eventId = String(payload["id"] ?? payload["eventId"] ?? crypto.randomUUID());
        const eventType = String(payload["type"] ?? payload["eventCode"] ?? "unknown");
        const resourceId = payload["resourceId"] == null ? null : String(payload["resourceId"]);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("provider_events").upsert(
          {
            provider,
            event_id: eventId,
            event_type: eventType,
            resource_id: resourceId,
            status: "received",
            payload: payload as never,
          },
          { onConflict: "provider,event_id", ignoreDuplicates: true },
        );
        if (error) {
          console.error("provider-webhooks insert failed", error);
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        return Response.json({ accepted: true, provider, eventType });
      },
    },
  },
});