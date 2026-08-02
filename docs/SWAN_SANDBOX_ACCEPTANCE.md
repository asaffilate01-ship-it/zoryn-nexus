# Swan sandbox acceptance

- individual onboarding
- company onboarding
- required actions
- account and IBAN retrieval
- balances and transactions
- standard and instant SEPA
- consent/SCA handling
- card order, activation, freeze and cancel
- webhook duplicate and out-of-order handling
- retry and dead-letter verification

The exact Swan API URLs and payload fields in
`src/features/swan/commands.ts` are adjusted once Swan provides the Zoryn
programme documentation and sandbox credentials. Configure `SWAN_API_URL`,
`SWAN_ACCESS_TOKEN` and `PROVIDER_MODE=sandbox` to route commands live.