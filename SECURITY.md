# Swan integration checklist

- Create sandbox project and credentials.
- Implement hosted individual/company onboarding links.
- Map account holder, account, membership and card identifiers into `zn_provider_resources`.
- Retrieve account and transaction detail server-side.
- Implement SEPA transfer creation and provider-led consent/SCA.
- Map Swan statuses through `provider-adapters.ts`.
- Receive webhook notifications through `provider-webhooks`.
- Retrieve sensitive details using authenticated API calls.
- Configure card artwork, card programme rules, Apple Pay/Google Pay and production approvals with Swan.
- Confirm approved marketing and regulated disclosures.
