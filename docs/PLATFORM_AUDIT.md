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

- **G6 Authentication & roles (still open).** All portals use a mock session;
  there is no sign-in, no `profiles` bootstrap, no per-role portal scoping and
  no `user_roles` table. This is the single largest remaining gap — S3 cannot
  be closed without it.
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
