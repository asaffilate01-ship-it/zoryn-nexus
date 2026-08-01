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

        return Response.json({
          ok: true,
          mode: process.env["PROVIDER_MODE"] ?? "mock",
          adapters: {
            banking: { configured: Boolean(process.env["SWAN_API_KEY"]), status: "mock" },
            acquiring: { configured: Boolean(process.env["ADYEN_API_KEY"]), status: "mock" },
            rewards: { configured: true, status: "operational" },
          },
          webhookEndpoint: "/api/public/provider-webhooks",
          recentEvents: data ?? [],
        });
      },
    },
  },
});