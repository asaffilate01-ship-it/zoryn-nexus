# Final Swan and Adyen activation

## What is complete after Stage 11

- provider command and event runtime
- banking and acquiring persistence
- consent/SCA persistence
- versioned operation mappings (mock, sandbox, live)
- server-side authentication foundation (Swan client credentials, Adyen API key)
- provider-specific domain handlers
- sandbox fixtures
- reconciliation structure
- activation evidence and CI gates

## Running activation

```bash
curl -X POST "$BASE_URL/api/public/provider-activation" \
  -H "x-worker-secret: $PROVIDER_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"provider":"swan"}'
```

`PROVIDER_MODE` selects the environment (`mock`, `sandbox`, `live`).

## What only Swan can supply

- exact endpoint/GraphQL operation definitions
- final auth flow
- programme/card product IDs
- webhook signature algorithm and event catalogue
- sandbox identities
- production acceptance criteria

## What only Adyen can supply

- approved product and account model
- API versions and endpoint permissions
- merchant account and balance platform
- HMAC keys
- Tap to Pay SDK entitlement
- test stores/capabilities
- certification scenarios

Do not mark a sandbox mapping as `approved_by_provider = true` until it has been
validated against the provider documentation and a successful sandbox call.