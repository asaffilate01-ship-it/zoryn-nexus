/**
 * Shared authentication for background worker endpoints.
 *
 * Workers are called by pg_cron or an external scheduler, so they live under
 * /api/public/* (which bypasses site auth) and must authenticate themselves.
 * Preferred header is `x-worker-secret` carrying PROVIDER_WORKER_SECRET; the
 * project's jobs secret / anon key is accepted as a fallback so an existing
 * cron entry keeps working.
 */
import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkWorkerSecret(request: Request, envKey: string): boolean {
  const candidates = [
    process.env[envKey],
    process.env["ZORYN_JOBS_SECRET"],
    process.env["SUPABASE_ANON_KEY"],
    process.env["SUPABASE_PUBLISHABLE_KEY"],
  ].filter((v): v is string => Boolean(v));
  if (candidates.length === 0) return false;

  const provided =
    request.headers.get("x-worker-secret") ??
    request.headers.get("x-zoryn-jobs-secret") ??
    request.headers.get("apikey") ??
    "";
  if (!provided) return false;

  return candidates.some((expected) => safeEqual(provided, expected));
}
