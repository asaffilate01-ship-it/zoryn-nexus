# Merge checklist

- [ ] Back up the current repository
- [ ] Copy overlay contents into repository root
- [ ] Keep existing route files
- [ ] Do not hand-edit `src/routeTree.gen.ts`
- [ ] Apply `supabase/migrations/20260801190000_platform_production_upgrade.sql`
- [ ] Apply `supabase/seed.production-demo.sql` only in demo/development
- [ ] Deploy `platform-api`, `provider-webhooks`, and `demo-reset`
- [ ] Configure environment variables from `.env.production-ready.example`
- [ ] Confirm RLS using personal, business, employee and admin accounts
- [ ] Run security and accessibility reviews before launch
