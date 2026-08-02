# Stage 4 — acquiring persistence

Supabase-backed merchant state, RLS-scoped to active members of the owning
organisation:

- `platform_merchants` — legal name, trading name, category code, status
- `platform_stores` — locations and addresses
- `platform_payment_links` — amount, currency, expiry and public URL
- `platform_payments` — store, payment method, captured and refunded amounts
- `platform_refunds` — full and partial refunds
- `platform_chargebacks` — disputes with reason and defence deadline
- `platform_settlements` — gross, fees, refunds, chargebacks and net
- `platform_terminals` — physical terminals and Tap to Pay devices

Read paths: `src/features/acquiring/data/acquiringRepository.ts` and the hooks
in `src/features/acquiring/data/useAcquiringData.ts`.