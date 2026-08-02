import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Stage 11 — Swan authentication foundation.
 * Prefers a directly supplied access token, otherwise performs a
 * client-credentials exchange. Token material is never persisted; only a
 * reference to an environment-held secret is read back from auth state.
 */
export async function getSwanAccessToken(admin: SupabaseClient): Promise<string> {
  const directToken = process.env["SWAN_ACCESS_TOKEN"];
  if (directToken) return directToken;

  const clientId = process.env["SWAN_CLIENT_ID"];
  const clientSecret = process.env["SWAN_CLIENT_SECRET"];
  const tokenUrl = process.env["SWAN_TOKEN_URL"];

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("swan_auth_not_configured");
  }

  const environment = process.env["PROVIDER_MODE"] === "live" ? "live" : "sandbox";

  const cached = await admin
    .from("platform_provider_auth_state")
    .select("status, expires_at, token_reference")
    .eq("provider", "swan")
    .eq("environment", environment)
    .maybeSingle();

  const cachedState = cached.data as {
    status?: string;
    expires_at?: string | null;
    token_reference?: string | null;
  } | null;

  if (
    cachedState?.status === "active" &&
    cachedState.expires_at &&
    new Date(cachedState.expires_at).getTime() > Date.now() + 60_000 &&
    cachedState.token_reference
  ) {
    const referenced = process.env[cachedState.token_reference];
    if (referenced) return referenced;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { access_token?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(`swan_token_http_${response.status}`);
  }

  await admin.from("platform_provider_auth_state").upsert(
    {
      provider: "swan",
      environment,
      auth_type: "client_credentials",
      status: "active",
      last_refreshed_at: new Date().toISOString(),
    } as never,
    { onConflict: "provider,environment" },
  );

  return String(payload.access_token);
}