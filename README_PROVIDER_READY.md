# Zoryn Nexus Provider-Ready v2

Merge this overlay into the root of `zoryn-nexus`. It is designed for the existing TanStack Start + React + Supabase structure and does not replace current Personal, Business, Merchant or Admin routes.

## Adds

1. Production account/onboarding states
2. Corporate/design-system additions
3. Personal banking workflows
4. Business workflows
5. ZorynPay merchant workflows
6. Zoryn Rewards integration
7. Admin/compliance operations
8. Swan/Adyen provider abstractions
9. Webhook event centre
10. German/English localisation
11. Security and permission patterns
12. Responsive/loading/error/accessibility components
13. Realistic seeded scenarios
14. Provider readiness documentation and tests

## Merge

Copy the contents of this folder into your repository root and allow folders to merge. Do not manually edit `src/routeTree.gen.ts`; TanStack regenerates it.

Run the migration, then the seed file in development only:

```bash
supabase db push
# or paste the migration in Supabase SQL Editor
```

Deploy Edge Functions:

```bash
supabase functions deploy provider-webhooks
supabase functions deploy provider-api
```

Add environment values from `.env.provider-ready.example`.

## New routes

- `/provider-ready` — consolidated production-readiness centre
- `/onboarding-status` — onboarding and compliance states
- `/operations-centre` — webhook/provider operations
- `/scenario-lab` — realistic seeded demo scenarios

## Important

This remains a mock/sandbox product until Swan and Adyen approve and connect production services. No browser code should contain provider secrets.
