# Final go-live acceptance (v7)

A release is production-ready only when every row below is signed off and a
matching `platform_launch_acceptance` record has `approved = true`.

## Engineering

- typecheck, lint, unit tests with coverage and production build pass
- Playwright desktop and mobile lifecycle checks pass
- clean-database migration reset plus `supabase test db` pass

## Security

- no provider credentials in browser code
- every public endpoint is signature- or secret-authenticated and rate limited
- RLS covers every new banking and acquiring table

## Swan (banking)

- sandbox acceptance in `docs/SWAN_SANDBOX_ACCEPTANCE.md` completed
- onboarding, accounts, transactions, SEPA transfers and cards verified
- webhook duplicates, retries and dead letters verified

## Adyen (acquiring)

- test acceptance in `docs/ADYEN_TEST_ACCEPTANCE.md` completed
- payments, refunds, chargebacks, settlements and Tap to Pay verified

## Operations

- reconciliation runs scheduled and reviewed
- incident records, owners and follow-ups in place
- notification outbox draining with backoff

## Legal and pilot

- terms, complaints handling and regulatory disclosures published
- pilot cohort accepted the platform in production