# Zoryn platform audit — Swan, Adyen, Rewards Hub

Date: 2026-08-01. Scope: this app (Zoryn portals + Provider-Ready Centre) and its
integration surface with the "Zoryn Rewards Hub" project.

## 1. What is real today

| Area | State |
| --- | --- |
| Data model | 19 tables live (accounts, pots, cards, transactions, transfers, merchants, links, terminals, loyalty, support, provider_events, provider_resources, provider_health, provider_scenarios, onboarding_actions, audit_logs) with RLS + demo-read policies |
| Reads | `getProviderSnapshot` server fn feeds Provider-Ready Centre, operations, scenarios, onboarding from the database |
| Webhook in | `POST /api/public/provider-webhooks`, HMAC-SHA256 over raw body, unique `(provider,event_id)` = idempotent |
| Status out | `GET /api/public/provider-api` reports adapter mode + last 20 events |
| Adapters | TypeScript interfaces + Swan/Adyen status maps only |

## 2. Gaps

### G1 — Writes are client-only
Pot moves, SEPA transfers, card freeze, tap-to-pay, payment links, point
redemption and support cases mutate React state in `src/lib/zoryn-store.tsx`.
Nothing persists; a refresh resets balances. No mutation server functions,
no `audit_logs` rows written by the app (3 seeded rows only).

### G2 — Adapters are types, not code
No `MockBankingAdapter` / `MockAcquiringAdapter` implementations, no
`getBankingAdapter()` factory keyed on `PROVIDER_MODE`, and the exported
status maps (`mapSwanTransactionStatus`, `mapAdyenPaymentStatus`) are never
called. `provider_health` rows are static seed data rather than derived from
configured credentials and last event time.

### G3 — Webhooks are stored, never processed
Events land as `received` and stay there. Missing: a processor that advances
`received → processing → processed | retrying | dead_letter`, applies the
status maps, writes `provider_resources` mappings, updates the affected
account/card/payment row, and records an audit entry. Retry/dead-letter rows
in the operations centre are seeded, not produced.

### G4 — Provider-specific webhook contracts not honoured
One shared secret and one header. Swan sends JWS/`hmacsignature`; Adyen signs
the `NotificationRequestItem` HMAC and requires the body
`{"notificationResponse":"[accepted]"}` or it retries for days. Neither is
implemented, so live sandbox traffic would fail.

### G5 — Rewards Hub is not connected
The Hub already exposes `POST /api/public/rewards/events` (HMAC via
`REWARDS_INGEST_SECRET`/`ZORYN_WEBHOOK_SECRET`, payload `event_id, event_type,
tenant_slug, provider, provider_reference, platform_user_id, amount_cents`)
and processes with `reward_process_event`. Zoryn emits nothing to it: local
`loyalty_accounts` and the client `rewardsWallet` are a parallel, divergent
points ledger. Missing on the Zoryn side: an outbox table, an emitter that
signs and posts card/pay events, a balance reader that shows Hub wallet
totals, and a shared `platform_user_id` between the two projects.

### G6 — No authentication
Every portal is anonymous demo mode. Roles/permissions exist in the schema
(`organisation_members`, `zoryn_role`) but nothing enforces them, so per-user
accounts, staff-card scoping and admin queues cannot be exercised.

### G7 — Thin operational and compliance layer
No settlement reconciliation job, no SCA/approval step for transfers above a
limit, no complaint/compliance case workflow beyond seeded rows, no rate
limiting on the public endpoints.

### G8 — Localisation stub
`i18n.ts` has 8 keys, is imported nowhere, and there is no locale switch, so
the German-first requirement is unmet outside seeded German copy.

## 3. Recommended order

1. Mock adapter implementations + factory + live-derived `provider_health`.
2. Webhook processor with retry/dead-letter and `provider_resources` mapping,
   plus per-provider verification (Swan JWS, Adyen HMAC + `[accepted]`).
3. Mutation server functions for money movement, writing `audit_logs`.
4. Rewards outbox + signed emitter to the Hub, and a Hub balance reader.
5. Auth + roles, then reconciliation, SCA and localisation.

## 4. Delivered in this pass

- **Adapters** (`src/features/provider-ready/lib/providers.server.ts`): mock,
  Swan (GraphQL) and Adyen (Checkout/Management) implementations behind
  `getBankingAdapter()` / `getAcquiringAdapter()`, selected by `PROVIDER_MODE`
  plus credential presence. `deriveProviderHealth` now computes health from
  configuration and event outcomes.
- **Webhooks**: per-provider verification (`webhook-verify.server.ts`,
  including Adyen's HMAC signing string and `[accepted]` response) and a
  processor (`webhook-process.server.ts`) that advances
  received → processing → processed | retrying | dead_letter, updates the
  affected account/card/transaction, upserts `provider_resources`, writes
  `audit_logs`, and queues rewards. Retry worker at
  `POST /api/public/provider-jobs` (auth: `apikey` header).
- **Money movement** (`src/lib/zoryn-mutations.functions.ts`): pot moves,
  SEPA transfers, card freeze/limits, Tap to Pay capture, payment links,
  points redemption and support cases — all persisted with balance validation
  and audit entries, restricted to `is_demo` rows.
- **Rewards, standalone by design**: points are always written to Zoryn's own
  `loyalty_accounts` / `loyalty_entries` (idempotent), so rewards-only
  customers are unaffected by banking or hub availability. `rewards_outbox`
  mirrors every event to the Zoryn Rewards Hub only when `REWARDS_HUB_URL` and
  `REWARDS_INGEST_SECRET` are set; otherwise rows are marked `skipped`.

### Environment variables

| Variable | Effect when absent |
| --- | --- |
| `PROVIDER_MODE` | defaults to `mock` |
| `SWAN_API_KEY`, `SWAN_PROJECT_ID`, `SWAN_API_URL`, `SWAN_WEBHOOK_SECRET` | banking stays mock |
| `ADYEN_API_KEY`, `ADYEN_MERCHANT_ACCOUNT`, `ADYEN_HMAC_KEY` | acquiring stays mock |
| `REWARDS_HUB_URL`, `REWARDS_INGEST_SECRET`, `REWARDS_TENANT_SLUG` | rewards stay local-only |
| `PROVIDER_WEBHOOK_SECRET` | mock/Zoryn webhooks rejected |

### Still open

Authentication and organisation roles (gap G6), settlement reconciliation, SCA
approval steps and full localisation.
