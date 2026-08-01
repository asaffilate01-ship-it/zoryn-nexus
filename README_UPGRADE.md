# Zoryn Nexus Platform Production Upgrade v3

Merge this overlay into the root of `zoryn-nexus`. It is designed for the repository's TanStack Start + React 19 + Supabase stack.

## Adds
- Supabase-backed demo store and realistic seed scenarios
- Auth/session/role scaffolding
- Personal and business onboarding workspaces
- Complete Personal, Business, ZorynPay and Operations command centres
- Provider-independent Swan/Adyen contracts
- Secure provider API and webhook Edge Functions
- Audit, complaints, support, approvals, devices, beneficiaries, cards, pots and settlements schema
- German/English localisation foundation
- Security and go-live documentation

## Merge
1. Copy all files into the repository root and merge folders.
2. Do not manually edit `src/routeTree.gen.ts`.
3. Run the migration and seed scripts in Supabase.
4. Deploy the Edge Functions.
5. Run `npm install && npm run dev`.

## New routes
- `/production-ready`
- `/onboarding`
- `/personal-workspace`
- `/business-workspace`
- `/zorynpay-workspace`
- `/operations`
- `/scenario-lab`

This remains a simulated platform until Swan and Adyen production approval and credentials are supplied.
