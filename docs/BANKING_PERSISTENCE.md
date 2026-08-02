# Stage 2 — banking persistence

Supabase-backed banking state, all RLS-scoped to the signed-in user or their
organisation:

- `platform_customers` — individual and business banking identities
- `platform_organisations` / `platform_organisation_members` — roles and
  per-member payment limits
- `platform_accounts` — IBAN, BIC, booked and available balances
- `platform_transactions` — credits and debits with status and booking date
- `platform_beneficiaries` — saved SEPA payees
- `platform_transfers` — standard, instant, scheduled and recurring transfers
  with consent status and idempotency keys
- `platform_cards` — physical, virtual and staff cards with online,
  contactless, ATM and international controls
- `platform_onboarding_cases` / `platform_onboarding_actions` — required
  onboarding steps with due dates

Read and write paths: `src/features/banking/data/bankingRepository.ts` and the
React Query hooks in `src/features/banking/data/useBankingData.ts`.