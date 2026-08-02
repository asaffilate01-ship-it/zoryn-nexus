insert into public.platform_provider_events (
  provider, event_id, event_type, payload, payload_hash, processing_status, occurred_at
) values
  ('swan','demo-swan-1','card.transaction.booked',
   '{"amountMinor":2490,"currency":"EUR","merchantName":"Cafe Berlin"}'::jsonb,
   encode(digest('demo-swan-1','sha256'),'hex'),'processed',now()),
  ('adyen','demo-adyen-1','payment.captured',
   '{"amountMinor":4590,"currency":"EUR","merchantAccount":"ZorynDemo"}'::jsonb,
   encode(digest('demo-adyen-1','sha256'),'hex'),'processed',now()),
  ('rewards','demo-rewards-1','reward.issued',
   '{"points":459,"programme":"universal"}'::jsonb,
   encode(digest('demo-rewards-1','sha256'),'hex'),'processed',now())
on conflict (provider,event_id) do nothing;
