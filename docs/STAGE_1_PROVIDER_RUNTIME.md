# Stage 1 — provider runtime

Test this stage in `PROVIDER_MODE=mock` before any Swan or Adyen sandbox
credentials are configured. Mock mode is the default and needs no secrets.

## What runs where

This project runs on TanStack Start, so the three functions named in the pack
are server routes rather than Supabase Edge Functions. There is nothing to
`supabase functions deploy` — the routes ship with the app.

| Pack function              | Endpoint in this repository                 |
| -------------------------- | ------------------------------------------- |
| `provider-command-worker`  | `POST /api/public/provider-command-worker`  |
| `provider-event-processor` | `POST /api/public/provider-event-processor` |
| `provider-runtime-health`  | `GET /api/public/provider-health`           |

All three are rate limited. The two workers require the worker secret in
`x-worker-secret` (`PROVIDER_WORKER_SECRET`, falling back to the jobs secret or
project key). The health endpoint is public and returns counts and correlation
metadata only — never payloads, error text or provider secrets.

## Runtime pieces

- **Command locking.** `platform_claim_provider_commands(p_worker_id, p_limit)`
  claims due commands with `for update skip locked` and takes a five-minute row
  lock in `platform_provider_worker_locks`, so parallel workers never dispatch
  the same command. Claiming increments `attempt_count`.
- **Event claiming.** `platform_claim_provider_events(p_limit)` does the same
  for the webhook inbox, replacing the older read-then-update pass that two
  workers could race. Execute is granted to the service role only.
- **Retry backoff.** `platform_complete_provider_command` schedules the next
  attempt at `attempt²` minutes, capped at 60, and moves the command to
  `dead_letter` on the fifth attempt. Events follow the same five-attempt rule.
- **Dead letters.** Both workers raise a critical row in
  `platform_provider_alerts` when something dead-letters, and the health
  endpoint answers `503` so external monitoring alerts.
- **Runtime logs and correlation IDs.** Every dispatch and every event
  application writes to `platform_provider_runtime_logs` with
  `correlation_id = "<provider>:<command id | event id>"`, the operation, the
  duration in milliseconds and any provider error text. Admins only.
- **Dispatch scaffolds.** `dispatchCommand` returns synthetic external ids in
  mock mode and posts with the command's `Idempotency-Key` to Swan, Adyen or
  the Rewards service in `sandbox`/`live`, failing loudly on a missing
  credential rather than silently degrading.
- **Resource mapping.** A successful dispatch upserts
  `platform_provider_resources` on
  `(provider, aggregate_type, aggregate_id, resource_type)`.

## Dashboard

`/provider-runtime` (signed in) shows the command queue, webhook event
processing, in-flight and dead-letter counts, and the correlated runtime log
with dispatch durations. It refreshes every 30 seconds. Commands and runtime
logs are admin-only through row level security.

## Mock-mode smoke test

```bash
# 1. queue a command (from the app, or as an admin via the platform command fn)
# 2. run the worker
curl -X POST "$BASE/api/public/provider-command-worker" -H "x-worker-secret: $PROVIDER_WORKER_SECRET"
# 3. drain the webhook inbox
curl -X POST "$BASE/api/public/provider-event-processor" -H "x-worker-secret: $PROVIDER_WORKER_SECRET"
# 4. check health
curl "$BASE/api/public/provider-health"
```

Expected lifecycle: `queued → processing → dispatch → resource mapping →
succeeded`. Failure lifecycle: `queued → processing → failed → retrying with
backoff → dead_letter` on the fifth attempt.

Cron already calls the two workers every minute; the health endpoint is meant
to be polled every five minutes.
