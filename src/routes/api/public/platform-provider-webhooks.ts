/**
 * Platform provider webhook inbox.
 *
 * Swan, Adyen and Rewards post here. The handler validates the HMAC signature,
 * hashes the raw payload, rejects unsupported providers and stores the event
 * before any processing happens. Duplicate protection is the unique
 * (provider, event_id) constraint, so a replay is accepted but never stored twice.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual, createHash } from "crypto";

const PROVIDERS = ["swan", "adyen", "rewards"] as const;
type Provider = (typeof PROVIDERS)[number];

function secretFor(provider: Provider): string | undefined {
  const specific =
    provider === "swan"
      ? process.env["SWAN_WEBHOOK_SECRET"]
      : provider === "adyen"
        ? process.env["ADYEN_HMAC_KEY"]
        : process.env["REWARDS_SERVICE_TOKEN"];
  return specific ?? process.env["PROVIDER_WEBHOOK_SECRET"];
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const Route = createFileRoute("/api/public/platform-provider-webhooks")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforceRateLimit } = await import("@/lib/rate-limit.server");
        const limited = await enforceRateLimit(request, "platform-provider-webhooks", 600, 60);
        if (limited) return limited;

        const provider = request.headers.get("x-provider") as Provider | null;
        if (!provider || !PROVIDERS.includes(provider)) {
          return Response.json({ error: "unsupported_provider" }, { status: 400 });
        }

        const raw = await request.text();
        let event: Record<string, unknown>;
        try {
          event = JSON.parse(raw || "{}");
        } catch {
          return Response.json({ error: "invalid_event" }, { status: 400 });
        }

        const eventId = String(event["eventId"] ?? event["id"] ?? "");
        const eventType = String(event["eventType"] ?? event["type"] ?? "");
        if (!eventId || !eventType) {
          return Response.json({ error: "invalid_event" }, { status: 400 });
        }

        const secret = secretFor(provider);
        if (!secret) return Response.json({ error: "provider_not_configured" }, { status: 503 });

        const supplied = request.headers.get("x-signature") ?? "";
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        if (!safeEqual(supplied, expected)) {
          return Response.json({ error: "invalid_signature" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("platform_provider_events").insert({
          provider,
          event_id: eventId,
          event_type: eventType,
          payload: event as never,
          payload_hash: createHash("sha256").update(raw).digest("hex"),
          processing_status: "received",
          occurred_at: String(event["occurredAt"] ?? new Date().toISOString()),
        } as never);

        if (error && (error as { code?: string }).code === "23505") {
          return Response.json({ accepted: true, duplicate: true });
        }
        if (error) return Response.json({ error: error.message }, { status: 500 });

        return Response.json({ accepted: true }, { status: 202 });
      },
    },
  },
});
