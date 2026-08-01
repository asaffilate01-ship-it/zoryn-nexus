/**
 * Durable rate limiting for the public API surface.
 *
 * Server functions run on stateless workers, so counters live in Postgres.
 * `public.check_rate_limit` atomically increments a bucket inside a rolling
 * window and returns false once the limit is exceeded. The routine is only
 * executable by the service role, so it is called with the admin client.
 *
 * Fail-open: if the limiter itself errors we let the request through rather
 * than dropping provider webhooks (Swan/Adyen would otherwise retry-storm).
 */
export function clientKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<Response | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
      _bucket: `${scope}:${clientKey(request)}`,
      _limit: limit,
      _window_seconds: windowSeconds,
    } as never);
    if (error) {
      console.error("rate limit check failed", error);
      return null;
    }
    if (data === false) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: { "retry-after": String(windowSeconds) },
      });
    }
    return null;
  } catch (err) {
    console.error("rate limit unavailable", err);
    return null;
  }
}
