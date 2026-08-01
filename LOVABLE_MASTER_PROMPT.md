# Zoryn master prompt for Lovable

Build and refine the supplied Zoryn project as a production-quality responsive fintech platform for Germany. Preserve the existing dark navy/mint visual identity and the product line: “Money. Payments. Rewards.”

## Brand and legal positioning
- Product brand: Zoryn.
- Parent: LoungeTech Digitallösungen GmbH.
- Initial market: Germany, with later EU expansion.
- Do not describe LoungeTech or Zoryn as a licensed bank.
- Use wording such as “financial technology platform” and keep provider/legal disclosures configurable.
- Products: Zoryn Money, Zoryn Cards, ZorynPay, Zoryn Rewards, Zoryn Business and Zoryn Connect.

## Required applications
Create one responsive application with role-based workspaces and navigation for:
1. Personal customer.
2. Business customer.
3. ZorynPay merchant.
4. LoungeTech administrator.

## Personal features
Dashboard, German IBAN account, balances, transaction feed, beneficiaries, SEPA transfers, cards, freeze/unfreeze, limits, virtual/physical card views, statements, rewards, notifications, profile, trusted devices, support and complaints.

## Business features
Business onboarding, account and IBAN, team roles, employee cards, budgets, approval workflows, invoices, payment links, incoming payments, expense management, receipts, settlements, reports, rewards campaigns and support.

## ZorynPay features
Merchant onboarding, Tap to Pay UI, online checkout, payment links, QR payments, product catalogue, tips, refunds, digital receipts, transactions, settlements, chargebacks, terminals, staff shifts and analytics.

## Admin features
Customers, organisations, onboarding/KYC/KYB status, provider status, accounts, cards, merchants, payments, settlements, chargebacks, compliance queues, risk alerts, support, complaints, pricing, revenue, loyalty liability, audit log, webhooks and system health.

## Data and security
- Use Supabase Auth, PostgreSQL, Storage and Row Level Security.
- Use organisation membership and role-based permissions.
- Never store full card PAN or CVV.
- Never call Swan or Adyen directly from the browser.
- All provider calls go through Supabase Edge Functions or the supplied Python orchestration API.
- Store only provider IDs, normalised statuses and safe cached display data.
- Add immutable audit events and idempotent webhook event storage.
- Use demo/mock mode until real sandbox credentials are supplied.

## Provider architecture
- Swan is the intended source of truth for accounts, IBANs, balances, SEPA, cards, banking onboarding and regulated banking decisions.
- Adyen is the intended source of truth for merchant acquiring, online/in-person payments, Tap to Pay, terminals, refunds, chargebacks and settlements.
- Keep adapters provider-independent. Use normalised statuses: DRAFT, IN_REVIEW, ACTION_REQUIRED, APPROVED, RESTRICTED, SUSPENDED and CLOSED.
- Do not invent actual provider endpoints or credentials. Clearly mark integration functions as placeholders until official sandbox specifications are supplied.

## UX requirements
- Polished German-first fintech interface with English locale support.
- Desktop, tablet and mobile responsive.
- Accessible contrast, keyboard navigation, loading, empty, error and success states.
- Use realistic demo data and fully clickable workflows.
- Create reusable cards, tables, dialogs, forms, status badges, charts and activity timelines.
- Include onboarding progress and action-required banners.

## Build order
1. Preserve and improve the current landing/login demo selector.
2. Complete all role dashboards.
3. Create Supabase Auth and organisation membership.
4. Wire the supplied SQL migration.
5. Create mock provider service and realistic demo seed data.
6. Implement forms and workflows using mock mode.
7. Add Edge Function placeholders for Swan and Adyen.
8. Add admin audit and webhook monitoring.
9. Add German/English localisation.
10. Ensure `npm run build` passes without TypeScript errors.
