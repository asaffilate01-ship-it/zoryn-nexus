# Sandbox entry checklist

## GitHub
- all production readiness jobs are green
- branch protection requires the Application, Browser E2E and Supabase schema jobs
- no unresolved dependency or secret scanning alerts

## Database
- clean `supabase db reset` succeeds
- `supabase test db` succeeds
- every banking/acquiring table has RLS
- no production seed contains fake balances

## Application
- no regulated/payment state is written to localStorage
- all provider credentials are server-side
- provider commands are idempotent
- dead letters can be replayed only by an authorised operator
- consent/SCA states persist across devices

## Swan
- programme documentation received
- exact GraphQL/API mappings agreed
- webhook verification method agreed
- sandbox credentials loaded server-side

## Adyen
- approved product set confirmed
- exact API versions selected
- HMAC keys loaded server-side
- test merchant/store and Tap to Pay permissions ready
