# Architecture

## Boundaries

Frontend -> Zoryn API/Edge Functions -> Swan / Adyen / Rewards.

Swan is the source of truth for account holders, IBAN accounts, SEPA, cards and regulated banking decisions. Adyen is the source of truth for merchant acquiring, payments, refunds, terminals and settlements. Zoryn Rewards is the source of truth for loyalty wallets, campaign rules and reward liability.

## Provider-independent status model

Never expose provider status codes directly to customers. Translate them into customer actions and plain-language states.

## Webhooks

Store raw events, verify signatures, enforce idempotency, process asynchronously, support retries/dead-letter and tolerate out-of-order delivery.

## Pots

Pots are Zoryn-side allocations unless a provider supplies separate regulated accounts. Do not describe them as separate bank accounts without provider confirmation.
