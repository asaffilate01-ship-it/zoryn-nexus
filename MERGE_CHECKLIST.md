# Merge checklist

1. Back up or branch `zoryn-nexus`.
2. Copy overlay files into repository root.
3. Keep existing files unless a deliberate merge is required.
4. Do not edit `src/routeTree.gen.ts`.
5. Run `npm install` or `bun install`.
6. Run `npm run build`.
7. Apply `supabase/migrations/20260801170000_provider_ready.sql`.
8. Development only: apply `supabase/seed.provider-ready.sql`.
9. Deploy `provider-webhooks` and `provider-api` Edge Functions.
10. Configure secrets and test `/provider-ready`.
