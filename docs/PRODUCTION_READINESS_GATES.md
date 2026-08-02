# Production readiness gates

The platform is provider-ready only when:

- all regulated and payment state is persisted in Supabase, not localStorage
- browser code never contains Swan or Adyen credentials
- every provider command is idempotent
- every provider webhook is authenticated and stored before processing
- provider events can be retried and moved to dead-letter state
- mock and live adapters satisfy the same contracts
- individual, company and merchant onboarding error states are complete
- transfer, card, payment, refund and settlement state machines are tested
- tenant and role isolation tests pass
- CI and clean migration checks pass
- monitoring, backups and incident response are active
