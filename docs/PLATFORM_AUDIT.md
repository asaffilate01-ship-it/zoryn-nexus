# Zoryn platform audit — gaps, weaknesses, security

Date: 2026-08-01. Scope: whole app (marketing site, four portals, Provider-Ready
Centre, server functions, public API routes, database).

## 1. Security

| # | Finding | Severity | State |
| - | ------- | -------- | ----- |
| S1 | `provider_resources` readable by any signed-in user (`USING (true)`) — exposed customer names/IBAN references across all organisations | High | **Fixed** — authenticated read now scoped to `is_demo = true` |
| S2 | `onboarding_actions` readable by any signed-in user | Medium | **Fixed** — same scoping |
| S3 | Money-movement server functions (`moveFunds`, `createSepaTransfer`, `captureTapToPay`, `redeemPoints`, …) are **unauthenticated** and run with the service-role client | High (for real money) | Accepted in demo mode — guarded by `is_demo` row checks, UUID validation and a €5,000 cap. Must gain `requireSupabaseAuth` + ownership checks before real funds |
| S4 | `PROVIDER_WEBHOOK_SECRET` is a placeholder value | Medium | Open — replace with the real Swan/Adyen secrets at integration time |
| S5 | No rate limiting on `/api/public/*` (webhooks, jobs, provider-api) | Medium | Open |
| S6 | `SECURITY DEFINER` helpers (`is_org_member`, `can_access_*`) executable by `authenticated` | Info | Intentional — required by RLS policies; already revoked from `anon`/`public` |
| S7 | `/api/public/provider-jobs` authenticated with the publishable anon key | Low–Medium | Works, but a dedicated `CRON_SECRET` would be stronger |
| S8 | Anon `SELECT` grants on 15 tables | Info | Intentional — every policy filters on `is_demo` |

## 2. Functional gaps

- **G6 Authentication & roles — delivered.** Email/password and Google sign-in
  at `/auth`, a `user_roles` table with a `has_role` helper, a signup trigger
  that bootstraps `profiles` and grants the `personal` role, all portals behind
  the `_authenticated` gate, per-role portal scoping and sign-out. S3 (adding
  `requireSupabaseAuth` + ownership checks to money movement) is now unblocked.
- **Provider live mode untested.** Swan (GraphQL) and Adyen (Checkout/
  Management) adapters exist but have only ever run with `PROVIDER_MODE=mock`;
  no sandbox credentials, so error mapping and pagination are unverified.
- **No dual approval / four-eyes flow.** Business "payment awaiting dual
  approval" is a seeded scenario, not an implemented workflow.
- **Refunds and chargebacks** are display-only on ZorynPay — no mutation path.
- **Complaints** have no dedicated table; they ride on `support_cases`.
- **Demo reset** — no endpoint to restore seed state after a demo session
  drains balances.
- **Scheduler** — `provider-jobs` must be called externally; no cron is wired,
  so retries/dead-letter only advance when invoked manually.

## 3. Quality weaknesses

- **No automated tests.** No unit tests on balance maths, HMAC verification or
  the webhook state machine; everything is verified by hand in the browser.
- **`any` typing** in `zoryn-mutations.functions.ts` (the admin client is cast),
  so schema drift will not be caught by typecheck.
- **Optimistic UI is thin** — mutations invalidate and refetch; slow networks
  show a stale balance briefly, and there is no error toast on every path.
- **Duplicate routes without canonicals.** `/operations`, `/operations-centre`,
  `/production-ready`, `/provider-ready` and `/scenario-lab` render overlapping
  content; `/personal` vs `/personal-workspace` likewise. Add canonical tags or
  redirect the aliases.
- **i18n coverage** is complete for the shipped copy, but new strings are added
  in English first with no key-coverage check.
- **Accessibility** unaudited: colour contrast on muted mint text, focus rings
  in the dark sidebar and keyboard traps in the Tap-to-Pay modal are unverified.

## 4. Suggested order of work

1. Auth + roles (closes G6 and S3 together).
2. Real provider secrets and a sandbox run of both adapters (closes S4).
3. Demo reset + scheduled `provider-jobs`.
4. Dual approval and refund flows.
5. Tests around money maths and webhook verification.

## Remediation round — August 2026

Closed in this pass:

- **S3 — money movement now requires a session.** Every server function in
  `src/lib/zoryn-mutations.functions.ts` runs behind `requireSupabaseAuth`.
  Shared `is_demo` rows stay drivable by any signed-in user; any non-demo row is
  checked against `can_access_account` / `can_access_merchant` /
  `can_access_loyalty` before it is written. Audit rows now carry `actor_id`.
  Helpers moved to `zoryn-mutations.server.ts` so the server-fn module stays a
  thin wrapper.
- **UI follow-through.** The public Provider-Ready Centre disables its write
  actions when signed out and links to `/auth`; reads stay public.
- **S4 — dedicated job credential.** `/api/public/provider-jobs` and the new
  `/api/public/demo-reset` authenticate with `ZORYN_JOBS_SECRET`
  (`x-zoryn-jobs-secret` header, timing-safe compare) instead of the anon key.
- **Demo reset.** `demo_baseline` snapshots every seeded demo row; the reset
  endpoint clears demo activity and restores the snapshot, so the sandbox is
  repeatable.
- **Tests.** `bun run test` (vitest) covers the money conversion/limits and the
  three webhook signature schemes, including tampered bodies and the Adyen
  signing-string escaping.
- **Typed admin client.** The `any` casts around the service-role client are
  replaced with `SupabaseClient<Database>`.
- **Duplicate routes.** `/operations`, `/operations-centre`,
  `/production-ready`, `/onboarding` and the `*-workspace` aliases now emit
  canonical links to their primary route.

Still open, and why:

- **Live Swan/Adyen mode** needs sandbox credentials (`SWAN_*`, `ADYEN_*`) from
  the account owner; the adapters run in mock mode until those exist.
- **PROVIDER_WEBHOOK_SECRET** still holds its placeholder value — it is a shared
  secret that must be pasted into the provider dashboards, so it has to be
  replaced by hand rather than generated.
- **Dual approval and refunds/chargebacks** are product workflows, not defects;
  they need a decision on approval thresholds and refund windows before build.
- **Rate limiting** on `/api/public/*` has no standard backend primitive yet.
- The `SECURITY DEFINER` linter warnings cover `has_role`, `is_org_member` and
  the `can_access_*` helpers. They must stay executable because RLS policies
  call them as the requesting role.
