import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Public provider status endpoint (replaces the "provider-api" function in the
 * overlay — this stack runs server routes, not Edge Functions).
 *
 * Read-only: reports adapter mode and recent demo webhook events so the
 * operations centre and external monitoring can check provider readiness.
 * No provider secrets are ever returned.
 */
export const Route = createFileRoute("/api/public/provider-api")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data, error } = await supabase
          .from("provider_events")
          .select("provider, event_type, created_at, processed_at")
          .eq("is_demo", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("provider-api read failed", error);
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        const { bankingConfigured, acquiringConfigured, rewardsHubConfigured, deriveProviderHealth, providerMode } =
          await import("@/features/provider-ready/lib/providers.server");
        const lastEventAt: Record<string, string | null> = {};
        const failures: Record<string, number> = {};
        for (const e of data ?? []) {
          if (!lastEventAt[e.provider] || e.created_at > lastEventAt[e.provider]!) lastEventAt[e.provider] = e.created_at;
        }
        const health = deriveProviderHealth(lastEventAt, failures);

        return Response.json({
          ok: true,
          mode: providerMode(),
          adapters: {
            banking: { configured: bankingConfigured(), status: health.find((h) => h.provider === "swan")?.status },
            acquiring: { configured: acquiringConfigured(), status: health.find((h) => h.provider === "adyen")?.status },
            rewards: { configured: rewardsHubConfigured(), status: health.find((h) => h.provider === "rewards")?.status },
          },
          health,
          webhookEndpoint: "/api/public/provider-webhooks",
          jobsEndpoint: "/api/public/provider-jobs",
          recentEvents: data ?? [],
        });
      },
    },
  },
});