# Merge checklist

1. Copy this stage into the repository root.
2. Merge `package.json.patch.json` into the live `package.json`.
3. Keep Bun as the package manager because the repository has a Bun lockfile.
4. Run `bun install --frozen-lockfile`.
5. Run `bun run check`.
6. Run `bun run test:e2e`.
7. Run `supabase db reset`.
8. Run `supabase test db`.
9. Push and confirm `Production readiness gates` is green.
10. Do not manually edit `src/routeTree.gen.ts`.
