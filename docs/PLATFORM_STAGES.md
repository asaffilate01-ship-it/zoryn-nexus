# Platform stages 1–4

## Stage 1 — Provider workers

| Piece                         | Location                                                          |
| ----------------------------- | ----------------------------------------------------------------- |
| Command claiming and dispatch | `src/features/provider-integration/lib/command-worker.server.ts`  |
| Event processing              | `src/features/provider-integration/lib/event-processor.server.ts` |
| Command worker endpoint       | `POST /api/public/provider-command-worker`                        |
| Event processor endpoint      | `POST /api/public/provider-event-processor`                       |
| Health endpoint               | `GET /api/public/provider-health`                                 |

- **Locking.** `platform_claim_provider_commands` claims rows with `for update
skip locked` and stamps a worker lock, so two workers never dispatch the same
  command. Every dispatch carries the command's `idempotency_key`.
- **Dispatch.** `PROVIDER_MODE=mock` (default) returns synthetic external ids so
  the demo is self-contained. `sandbox`/`live` post to the Swan, Adyen and
  Rewards endpoints and fail loudly when credentials are missing.
- **Backoff and dead letters.** `platform_complete_provider_command` applies the
  retry backoff and moves a command to `dead_letter` after five attempts; the
  worker then raises a critical row in `platform_provider_alerts`. Events follow
  the same five-attempt rule. An unmapped event throws rather than being
  silently swallowed.
- **Health.** Reports connection modes plus command and event backlog, and
  answers `503` when anything has dead-lettered so external monitoring alerts.
  It never returns payloads or secrets.

Scheduling is handled by `pg_cron`: command worker and event processor every
minute, notification worker every five minutes. Workers authenticate with
`x-worker-secret` (`PROVIDER_WORKER_SECRET` / `NOTIFICATION_WORKER_SECRET`), and
accept the jobs secret or project key as a fallback.

## Stage 2 — Supabase persistence

`src/features/persistence/platformDataRepository.ts` and `usePlatformData.ts`
read profiles, organisations and members, accounts, pots, beneficiaries,
transfers, cards, merchants, payments and settlements from the `platform_*`
tables through the browser client, so row level security decides visibility:
own records, plus anything belonging to an organisation the user is a member
of. There are no localStorage fallbacks in that module.

## Stage 3 — Notifications and operations

- `platform_notification_outbox` decouples messaging from money movement; the
  worker in `src/features/operations/lib/notification-worker.server.ts` delivers
  with quadratic backoff and dead-letters after five attempts.
- Support cases, incidents and reconciliation runs are persisted platform side.
- The control room at `/control-room` (admin only) shows queue depth for
  commands, events, alerts, incidents, outbox, support cases and reconciliation,
  refreshing every 30 seconds.

## Stage 4 — Testing and release gates

| Gate            | Command                                                              |
| --------------- | -------------------------------------------------------------------- |
| Types           | `bun run typecheck`                                                  |
| Lint and format | `bun run lint`                                                       |
| Unit tests      | `bun run test`                                                       |
| End-to-end      | `bun run test:e2e`                                                   |
| Database schema | `supabase db execute --file supabase/tests/database/schema.test.sql` |

The schema gate asserts every `platform_*` table exists, every public table has
row level security enabled, the command and event idempotency indexes exist, the
worker routines are security definer, and every table with policies is reachable
by the Data API. CI runs the application, database and end-to-end jobs, and the
`release-gate` job fails the run if any of them did.
