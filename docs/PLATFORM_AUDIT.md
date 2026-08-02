# Zoryn platform audit — gaps, weaknesses, security

Date: 2026-08-01. Scope: whole app (marketing site, four portals, Provider-Ready
Centre, server functions, public API routes, database).

## 1. Security

| # | Finding | Severity | State |
| - | ------- | -------- | ----- |
| S1 | `provider_resources` readable by any signed-in user (`USING (true)`) — exposed customer names/IBAN references across all organisations | High | **Fixed** — authenticated read now scoped to `is_demo = true` |
| S2 | `onboarding_actions` readable by any signed-in user | Medium | **Fixed** — same scoping |
| S3 | Money-movement server functions (`moveFunds`, `createSepaTransfer`, `captureTapToPay`, `redeemPoints`, …) are **unauthenticated** and run with the service-role client | High (for real money) | Accepted in demo mode — guarded by `is_demo` row checks, UUID validation and a €5,000 cap. Must gain `requireSupabaseAuth` + ownership checks before real funds |
| S4 | `PROVIDER_WEBHOOK_SECRET` is a placeholder value | Medium | **Accepted** — Swan and Adyen issue this shared secret from their dashboards; it must be pasted into Lovable Cloud at integration time and is intentionally a dummy in mock/demo mode |
| S5 | No rate limiting on `/api/public/*` (webhooks, jobs, provider-api) | Medium | **Fixed** — durable per-IP limiter (`public.check_rate_limit` + `api_rate_limits`, service-role only) on all four public routes: webhooks 600/min, provider-api 120/min, jobs 60/min, demo-reset 10/hour. Fails open so provider retries are never dropped by limiter outages |
| S6 | `SECURITY DEFINER` helpers (`is_org_member`, `can_access_*`) executable by `authenticated` | Info | Intentional — required by RLS policies; already revoked from `anon`/`public` |
| S7 | `/api/public/provider-jobs` authenticated with the publishable anon key | Low–Medium | Works, but a dedicated `CRON_SECRET` would be stronger |
| S8 | Anon `SELECT` grants on 15 tables | Info | Intentional — every policy filters on `is_demo` |

## 2. Functional gaps

- **G6 Authentication & roles — delivered.** Email/password and Google sign-in
  at `/auth`, a `user_roles` table with a `has_role` helper, a signup trigger
  that bootstraps `profiles` and grants the `personal` role, all portals behind
  the `_authenticated` gate, per-role portal scoping and sign-out. S3 (adding
  `requireSupabaseAuth` + ownership checks to money movement) is now unblocked.
- **Provider live mode delegated to Swan/Adyen.** The Swan (GraphQL) and
  Adyen (Checkout/Management) adapters are implemented and switch on when
  `PROVIDER_MODE=sandbox|live` and the corresponding credentials exist. Until
  those credentials are supplied, mock mode keeps the demo operational. KYC,
  KYB, AML, sanctions screening and PCI scope are intentionally delegated to
  the regulated partners; Zoryn maps their outcomes into customer-facing states.
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

- **Live Swan/Adyen credentials** need to be pasted from the Swan and Adyen
  dashboards (`SWAN_API_KEY`, `SWAN_PROJECT_ID`, `ADYEN_API_KEY`,
  `ADYEN_MERCHANT_ACCOUNT`). Until then the adapters fall back to mock mode.
- **PROVIDER_WEBHOOK_SECRET** is intentionally a placeholder — it is a shared
  secret issued by Swan/Adyen and must be pasted into Lovable Cloud from the
  provider dashboards; it cannot be generated by Zoryn.
- **Dual approval and refunds/chargebacks** are product workflows, not defects;
  they need a decision on approval thresholds and refund windows before build.
- **Rate limiting** on `/api/public/*` has no standard backend primitive yet.
- The `SECURITY DEFINER` linter warnings cover `has_role`, `is_org_member` and
  the `can_access_*` helpers. They must stay executable because RLS policies
  call them as the requesting role.

## 5. Compliance & regulated-partner model

Zoryn is the customer experience layer; it is **not** a bank or payment
institution. Regulated services are delegated as follows:

- **Swan** (banking partner): KYC/KYB identity verification, account opening,
  German IBANs, SEPA transfers, card issuing, AML monitoring and sanctions
  screening. Zoryn stores only provider references, account IDs and masked card
  metadata (last four, status, limits).
- **Adyen** (acquiring partner): PCI DSS scope, card acceptance (Tap to Pay,
  terminals, payment links), settlement, chargebacks and acquiring risk. Card
  PANs, CVV and PCI-sensitive data never pass through Zoryn.
- **Zoryn** owns: user roles, permissions, the rewards ledger, audit logging,
  webhook event lifecycle, support/compliance case routing and the operational
  dashboards that surface provider outcomes to customers and staff.

This model is documented in the marketing site (`/`, `/products`) and in the
Provider-Ready Centre (`/demo`).

## Audit — 2026-08-02 (post Stage 12)

### Verified green
- `bun run check`: CI doctor, typecheck, lint, provider safety audit, critical coverage, production build.
- Critical suite: 71 tests / 12 files. Coverage 87.2% statements, 86.3% lines, 70% branches (thresholds 60/60/50).

### Findings fixed in this pass
| Severity | Finding | Fix |
| --- | --- | --- |
| High | `platform_provider_resources`, `platform_provider_events`, `platform_provider_connections` allowed `USING (true)` reads to every signed-in user (cross-tenant provider identifiers and payloads). | Policies replaced with `has_role(auth.uid(), 'admin')`, matching the rest of the provider tables. |
| High | `rewards_outbox` demo policy granted SELECT to the `public` role, exposing internal reward payloads with account/transaction ids. | Policy replaced with admin-only read; `anon` SELECT grant revoked. No client code reads this table. |
| Medium | `platform_can_access_account/merchant`, `platform_is_org_member`, `platform_owns_account`, `platform_replay_dead_letter_command` and `update_updated_at_column` were executable by `anon`. | EXECUTE revoked from `anon` (and from `authenticated` for the trigger function). |
| Medium | Stage 12 modules (`providerDomainHandlers`, `providerWebhookVerification`, `swanTokenProvider`, `catalogue`) shipped with no tests, breaking the coverage gate. | Added `tests/provider-contracts/provider-domain-handlers.test.ts` and `provider-webhook-verification.test.ts` (33 new cases incl. HMAC tamper/replay). |

### Accepted / documented
- `has_role`, `is_org_member`, `can_access_*` remain executable by `authenticated` — they are referenced from RLS policies and must be callable by the policy evaluator.
- `api_rate_limits` and `platform_audit_events` have RLS enabled with no policies: intentional deny-all; only the service role writes them.
- Demo tables (`cards`, `transactions`, `pots`, `merchants`, `terminals`, `support_cases`, `loyalty_*`, `audit_logs`, `organisation_members`) keep `anon` reads limited to `is_demo = true` synthetic rows so the public demo works without login. No real customer data is in those rows.
- `pg_net`-style extension in `public` is a managed-platform default.

### Remaining product gaps (not security)
1. Dual approval UI for high-value business transfers (schema supports it, no reviewer screen).
2. Refund and chargeback operator actions are read-only in ZorynPay.
3. Role administration UI (roles are assigned via the database only).
4. External scheduler still has to call `/api/public/provider-jobs`; no in-platform cron.
5. Sandbox credentials for Swan and Adyen are still outstanding — `PROVIDER_MODE` stays `mock` until mappings are marked `approved_by_provider`.
