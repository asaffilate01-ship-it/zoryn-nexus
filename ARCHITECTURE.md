# Security baseline

- Provider secrets only in Edge Functions/backend secret storage.
- Supabase RLS on customer/business records.
- MFA and step-up authentication for admins and sensitive actions.
- Mask PII in admin tables and logs.
- CSP, secure cookies, CSRF controls and rate limits at deployment layer.
- Append-only audit events for support/admin actions.
- Signed webhook validation, replay protection and idempotency.
- Dependency and secret scanning in CI.
- Penetration test before production.
- GDPR retention, export and deletion procedures.
