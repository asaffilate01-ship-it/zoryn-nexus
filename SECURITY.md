# Security

- Never expose provider secrets (Swan, Adyen, Rewards) to the browser; all provider calls run server-side in TanStack server functions or /api/public routes.
- Verify webhook signatures (HMAC, timing-safe compare) before processing any provider event.
- Enforce idempotency on provider events and keep raw payloads for audit.
- Row Level Security is enabled on every public table; demo rows are readable only where is_demo = true.
- Provider status codes are never shown to customers; they are mapped to plain-language states.
