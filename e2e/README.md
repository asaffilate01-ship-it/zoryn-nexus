# End-to-end tests

`bunx playwright test` runs the suite against a local dev server, or against a
deployed environment with `E2E_BASE_URL=https://… bunx playwright test`.

The suite covers the public marketing and product journeys, the authentication
gate on every portal route, and the platform endpoints (provider health, worker
authentication and webhook signature enforcement).
