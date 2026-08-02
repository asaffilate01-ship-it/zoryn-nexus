# CI green troubleshooting

## Application failure
Download `application-diagnostics`.

Common causes:
- stale generated route tree
- TypeScript errors from outdated Supabase generated types
- linting generated files
- critical provider modules below coverage threshold
- provider-safety audit finding regulated localStorage

## Browser failure
Download `browser-diagnostics`.

The Stage 10 tests avoid fragile assumptions about exact headings and accept a
secure 401/403/404 response from protected endpoints.

## Database failure
Read the migration immediately above the first SQL error.

Check:
- duplicate migration timestamps
- duplicate tables/functions from earlier overlays
- missing pgcrypto
- foreign-key references to tables created by later migrations
- pgTAP extension availability

Never delete a previously applied production migration. Add a corrective migration.
