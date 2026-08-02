# Adyen test acceptance

- legal entity and account holder creation
- merchant account and store creation
- capability and verification states
- payment link creation and expiry
- card payment authorisation and capture
- full and partial refunds
- chargeback opened and reversed
- settlement and payout reconciliation
- Tap to Pay device registration and sale
- webhook HMAC validation, duplicates and retries

Endpoints in `src/features/adyen/commands.ts` are aligned to the Adyen
products approved for Zoryn (Platforms, Checkout, Tap to Pay). Configure
`ADYEN_API_URL`, `ADYEN_API_KEY` and `PROVIDER_MODE=sandbox` to route
commands to the Adyen test environment.