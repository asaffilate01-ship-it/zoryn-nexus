# Zoryn Lovable Complete v0.3

This package combines the earlier Zoryn foundations into one Lovable-ready build.

## Use in Lovable
1. Extract the ZIP.
2. Upload/push the contents of `lovable-app` to a GitHub repository.
3. Import that repository into Lovable.
4. Paste the contents of `LOVABLE_MASTER_PROMPT.md` into Lovable.
5. Connect a Supabase project.
6. Run the migration in `lovable-app/supabase/migrations`.
7. Add the variables from `.env.example`.
8. Keep `VITE_DEMO_MODE=true` until Swan and Adyen sandbox access is approved.

## What is included
- React/Vite/TypeScript application.
- Personal, business, merchant and admin demo portals.
- Responsive Zoryn design system.
- Supabase schema and starter RLS.
- Provider proxy Edge Function placeholder.
- Master Lovable build prompt.
- Reference Python/FastAPI provider abstraction backend.

## Important
The application is intentionally provider-independent. Do not add Swan or Adyen secrets to frontend variables. Use server-side Edge Functions or the Python API for all regulated provider calls.
