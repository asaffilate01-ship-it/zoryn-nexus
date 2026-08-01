import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook } from "@/features/provider-ready/lib/webhook-verify.server";

/**
 * Provider webhook receiver.
 *
 * Verifies the provider-specific signature (Swan HMAC hex, Adyen HMAC base64
 * over the notification item, Zoryn/mock HMAC hex), stores the event
 * idempotently on provider_events, then processes it immediately. Failures are
 * left in `retrying` for the retry worker at /api/public/provider-jobs.
 *
 * Adyen requires the literal "[accepted]" response body or it keeps retrying.
 */
export const Route = createFileRoute("/api/public/provider-webhooks")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();

        let payload: any;
        try {
          payload = JSON.parse(body || "{}");
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const verified = verifyWebhook(request.headers, body, payload);
        if (!verified.ok) {
          return Response.json({ ok: false, error: verified.error }, { status: verified.status });
        }

        const isAdyen = Array.isArray(payload?.notificationItems);
        const items: any[] = isAdyen
          ? payload.notificationItems.map((w: any) => w?.NotificationRequestItem ?? w)
          : [payload];

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { processEvent } = await import("@/features/provider-ready/lib/webhook-process.server");

        const accepted: string[] = [];
        for (const item of items) {
          const provider = isAdyen ? "adyen" : String(item?.provider ?? verified.provider);
          const eventId = String(item?.pspReference ?? item?.id ?? item?.eventId ?? crypto.randomUUID());
          const eventType = String(item?.eventCode ?? item?.type ?? "unknown");
          const resourceId =
            item?.resourceId ?? item?.merchantReference ?? item?.data?.id ?? item?.pspReference ?? null;

          const { data: row, error } = await supabaseAdmin
            .from("provider_events")
            .upsert(
              {
                provider,
                event_id: eventId,
                event_type: eventType,
                resource_id: resourceId == null ? null : String(resourceId),
                status: "received",
                payload: item,
                is_demo: true,
              } as never,
              { onConflict: "provider,event_id", ignoreDuplicates: true },
            )
            .select("id")
            .maybeSingle();

          if (error) {
            console.error("provider-webhooks insert failed", error);
            return Response.json({ ok: false, error: error.message }, { status: 500 });
          }

          // ignoreDuplicates returns no row for a replay — that is a success.
          if (row?.id) {
            await processEvent(supabaseAdmin as never, row.id);
            accepted.push(eventId);
          }
        }

        if (isAdyen) {
          return Response.json({ notificationResponse: "[accepted]" });
        }
        return Response.json({ accepted: true, provider: verified.provider, events: accepted.length });
      },
    },
  },
});
