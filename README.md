# Zoryn Full Website & Interactive Platform v1.1

A customer-facing corporate website plus a realistic, fully interactive mock fintech platform for Zoryn.

## Public website

The default route is now a polished customer and business homepage covering:

- Zoryn Personal
- Zoryn Business
- ZorynPay
- Zoryn Rewards
- Security and trust
- Interactive product calls to action
- Responsive desktop, tablet and mobile navigation

The previous product selector is now the **Interactive Product Centre**, available through the **Explore live demo** links or `#demo`.

## Interactive workspaces

- Zoryn Personal: balances, German IBAN, transactions, pots, SEPA transfers, cards, rewards and support
- Zoryn Business: business balance, cash flow, team cards, payment links, transfers and rewards
- ZorynPay: Tap to Pay simulation, settlements, terminals and loyalty
- Platform & Operations: customers, compliance, payment monitoring, providers, support and audit views

All mock actions persist in browser localStorage.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Provider integration boundary

The product UI is deliberately separated from regulated infrastructure:

- Swan can replace the mock banking layer for accounts, IBANs, SEPA and cards.
- Adyen can replace the mock acquiring layer for online payments, Tap to Pay, terminals, refunds and settlements.
- Supabase migrations and seeded data are included for persistence, identity, roles, audit and operational data.

Never expose Swan or Adyen secret credentials in the browser. Connect providers through Supabase Edge Functions or a secure backend.

## Supabase

Apply:

- `supabase/migrations/202608010100_zoryn_demo.sql`
- `supabase/seed.sql`

## GitHub / Lovable

Upload the contents of this folder to a private GitHub repository, connect the repository to Lovable, and paste `LOVABLE_MASTER_PROMPT.md` into Lovable for further iteration.

## Important

This is a mock product environment. It does not hold or move real funds and does not itself provide regulated financial services.


## Site routes

- Default / `#` — Zoryn corporate homepage
- `#products` — customer product website (the previous homepage)
- `#demo` — interactive demo and testing centre

The corporate homepage presents Zoryn as a company and platform. The product page explains Personal, Business, ZorynPay and Rewards. The demo centre contains all realistic mock banking and payment workflows.


## Zoryn Rewards integration
See `src/lib/rewardsGateway.ts`, `src/components/rewards/UnifiedWalletCard.tsx`, the rewards bridge migration and Edge Function.
