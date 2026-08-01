-- 1. demo flag on every client-facing table
alter table public.organisations add column if not exists is_demo boolean not null default false;
alter table public.organisation_members add column if not exists is_demo boolean not null default false;
alter table public.financial_accounts add column if not exists is_demo boolean not null default false;
alter table public.pots add column if not exists is_demo boolean not null default false;
alter table public.cards add column if not exists is_demo boolean not null default false;
alter table public.transactions add column if not exists is_demo boolean not null default false;
alter table public.merchants add column if not exists is_demo boolean not null default false;
alter table public.payment_links add column if not exists is_demo boolean not null default false;
alter table public.terminals add column if not exists is_demo boolean not null default false;
alter table public.loyalty_accounts add column if not exists is_demo boolean not null default false;
alter table public.loyalty_entries add column if not exists is_demo boolean not null default false;
alter table public.support_cases add column if not exists is_demo boolean not null default false;
alter table public.provider_events add column if not exists is_demo boolean not null default false;
alter table public.audit_logs add column if not exists is_demo boolean not null default false;

-- 2. anon may read demo rows only
grant select on public.organisations to anon;
grant select on public.organisation_members to anon;
grant select on public.financial_accounts to anon;
grant select on public.pots to anon;
grant select on public.cards to anon;
grant select on public.transactions to anon;
grant select on public.merchants to anon;
grant select on public.payment_links to anon;
grant select on public.terminals to anon;
grant select on public.loyalty_accounts to anon;
grant select on public.loyalty_entries to anon;
grant select on public.support_cases to anon;
grant select on public.provider_events to anon;
grant select on public.audit_logs to anon;

create policy demo_read_organisations on public.organisations for select to anon using (is_demo);
create policy demo_read_organisation_members on public.organisation_members for select to anon using (is_demo);
create policy demo_read_financial_accounts on public.financial_accounts for select to anon using (is_demo);
create policy demo_read_pots on public.pots for select to anon using (is_demo);
create policy demo_read_cards on public.cards for select to anon using (is_demo);
create policy demo_read_transactions on public.transactions for select to anon using (is_demo);
create policy demo_read_merchants on public.merchants for select to anon using (is_demo);
create policy demo_read_payment_links on public.payment_links for select to anon using (is_demo);
create policy demo_read_terminals on public.terminals for select to anon using (is_demo);
create policy demo_read_loyalty_accounts on public.loyalty_accounts for select to anon using (is_demo);
create policy demo_read_loyalty_entries on public.loyalty_entries for select to anon using (is_demo);
create policy demo_read_support_cases on public.support_cases for select to anon using (is_demo);
create policy demo_read_provider_events on public.provider_events for select to anon using (is_demo);
create policy demo_read_audit_logs on public.audit_logs for select to anon using (is_demo);

-- 3. demo seed data
insert into public.organisations (id, name, legal_name, kind, country, status, is_demo) values
  ('a0000000-0000-4000-8000-000000000001', 'LoungeTech Demo GmbH', 'LoungeTech Demo GmbH', 'business', 'DE', 'approved', true),
  ('a0000000-0000-4000-8000-000000000002', 'Cafe 1 Demo', 'Cafe Eins Demo UG', 'merchant', 'DE', 'approved', true),
  ('a0000000-0000-4000-8000-000000000003', 'Nordwind Handel UG', 'Nordwind Handel UG', 'business', 'DE', 'in_review', true)
  ,('a0000000-0000-4000-8000-000000000004', 'Amer Saleem (personal demo)', null, 'business', 'DE', 'approved', true)
on conflict (id) do nothing;

insert into public.organisation_members (id, organisation_id, user_id, display_name, role, monthly_limit, spent, is_demo) values
  ('b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001', null, 'Amer Saleem', 'Owner', 5000, 1840.50, true),
  ('b0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001', null, 'Marta Keller', 'Finance', 2500, 1284.20, true),
  ('b0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001', null, 'Jonas Weber', 'Employee', 800, 642.80, true),
  ('b0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001', null, 'Sofia Bauer', 'Employee', 800, 120.40, true)
on conflict (id) do nothing;

insert into public.financial_accounts (id, owner_user_id, organisation_id, provider, provider_reference, account_name, currency, iban, balance, available_balance, status, is_demo) values
  ('c0000000-0000-4000-8000-000000000001', null, 'a0000000-0000-4000-8000-000000000004', 'mock_banking', 'acc_personal_demo', 'Amer Saleem', 'EUR', 'DE89 3704 0044 0532 0130 00', 8420.65, 8420.65, 'approved', true),
  ('c0000000-0000-4000-8000-000000000002', null, 'a0000000-0000-4000-8000-000000000001', 'mock_banking', 'acc_business_demo', 'LoungeTech Demo GmbH', 'EUR', 'DE71 1001 1001 9876 5432 10', 48620.40, 45440.00, 'approved', true),
  ('c0000000-0000-4000-8000-000000000003', null, 'a0000000-0000-4000-8000-000000000002', 'mock_banking', 'acc_merchant_demo', 'Cafe 1 Demo', 'EUR', 'DE33 2004 1155 0044 5566 77', 3180.40, 3180.40, 'approved', true)
on conflict (id) do nothing;

insert into public.pots (id, account_id, name, emoji, balance, target, is_demo) values
  ('d0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','Emergency fund','🛟',2150,5000,true),
  ('d0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','Urlaub 2027','🏖️',640.20,2500,true),
  ('d0000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001','Neues Fahrrad','🚲',310,1200,true)
on conflict (id) do nothing;

insert into public.cards (id, account_id, provider, provider_reference, name, last_four, card_type, status, monthly_limit, spent, is_demo) values
  ('e0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','mock_banking','card_p1','Zoryn Metal','4412','physical','active',2000,1284.20,true),
  ('e0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','mock_banking','card_p2','Online shopping','8821','virtual','active',500,184.60,true),
  ('e0000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001','mock_banking','card_p3','Subscriptions','1094','virtual','frozen',200,79.98,true),
  ('e0000000-0000-4000-8000-000000000011','c0000000-0000-4000-8000-000000000002','mock_banking','card_b1','Amer Saleem','2201','physical','active',5000,1840.50,true),
  ('e0000000-0000-4000-8000-000000000012','c0000000-0000-4000-8000-000000000002','mock_banking','card_b2','Marta Keller','7714','physical','active',2500,1284.20,true),
  ('e0000000-0000-4000-8000-000000000013','c0000000-0000-4000-8000-000000000002','mock_banking','card_b3','Jonas Weber','5510','virtual','active',800,642.80,true),
  ('e0000000-0000-4000-8000-000000000014','c0000000-0000-4000-8000-000000000002','mock_banking','card_b4','Sofia Bauer','3390','virtual','frozen',800,120.40,true)
on conflict (id) do nothing;

insert into public.transactions (id, account_id, provider, provider_reference, title, subtitle, kind, amount, currency, status, occurred_at, is_demo) values
  ('f0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p1','Salary — LoungeTech GmbH','Income','credit',3420,'EUR','completed','2026-07-31T08:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p2','REWE Markt','Groceries','debit',-62.35,'EUR','completed','2026-07-30T17:20:00Z',true),
  ('f0000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p3','DB Bahn','Travel','debit',-42.90,'EUR','completed','2026-07-29T07:41:00Z',true),
  ('f0000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p4','Cafe 1 Demo','Hospitality','debit',-18.40,'EUR','completed','2026-07-28T09:15:00Z',true),
  ('f0000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p5','Vodafone DE','Utilities','debit',-39.99,'EUR','completed','2026-07-27T06:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p6','Rewards cashback','Zoryn Points','credit',12.80,'EUR','completed','2026-07-26T12:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p7','Miete August','Housing','debit',-1180,'EUR','completed','2026-07-25T06:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000001','mock_banking','tx_p8','Amazon.de','Shopping','debit',-84.20,'EUR','completed','2026-07-24T19:30:00Z',true),
  ('f0000000-0000-4000-8000-000000000011','c0000000-0000-4000-8000-000000000002','mock_banking','tx_b1','ZorynPay settlement','Settlement','credit',3180.40,'EUR','completed','2026-07-31T06:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000012','c0000000-0000-4000-8000-000000000002','mock_banking','tx_b2','Invoice INV-2291 — Kunde AG','Income','credit',6120,'EUR','completed','2026-07-30T10:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000013','c0000000-0000-4000-8000-000000000002','mock_banking','tx_b3','Supplier payout — Nordic Beans','Payout','debit',-2480,'EUR','completed','2026-07-29T10:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000014','c0000000-0000-4000-8000-000000000002','mock_banking','tx_b4','Payroll run (12 staff)','Payroll','debit',-18420,'EUR','completed','2026-07-28T10:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000015','c0000000-0000-4000-8000-000000000002','mock_banking','tx_b5','Team card — M. Keller','Expenses','debit',-184.20,'EUR','completed','2026-07-27T13:00:00Z',true),
  ('f0000000-0000-4000-8000-000000000021','c0000000-0000-4000-8000-000000000003','mock_acquiring','tx_m1','Tap to Pay — Visa','Tap to Pay','credit',24.50,'EUR','completed','2026-07-31T10:42:00Z',true),
  ('f0000000-0000-4000-8000-000000000022','c0000000-0000-4000-8000-000000000003','mock_acquiring','tx_m2','Online payment — Mastercard','Online','credit',86.90,'EUR','completed','2026-07-31T10:12:00Z',true),
  ('f0000000-0000-4000-8000-000000000023','c0000000-0000-4000-8000-000000000003','mock_acquiring','tx_m3','Terminal payment — Girocard','Terminal','credit',12.80,'EUR','completed','2026-07-31T09:51:00Z',true),
  ('f0000000-0000-4000-8000-000000000024','c0000000-0000-4000-8000-000000000003','mock_acquiring','tx_m4','Terminal payment — Visa','Terminal','refund',-32.40,'EUR','refunded','2026-07-30T18:22:00Z',true)
on conflict (id) do nothing;

insert into public.merchants (id, organisation_id, provider, provider_reference, status, pending_settlement, is_demo) values
  ('11110000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002','mock_acquiring','mer_cafe1','approved',1284.60,true)
on conflict (id) do nothing;

insert into public.payment_links (id, merchant_id, provider_reference, label, amount, currency, status, url, is_demo) values
  ('22220000-0000-4000-8000-000000000001','11110000-0000-4000-8000-000000000001','PL-4471','Catering order',240,'EUR','open','https://pay.zoryn.demo/PL-4471',true),
  ('22220000-0000-4000-8000-000000000002','11110000-0000-4000-8000-000000000001','PL-8821','Consulting retainer',2400,'EUR','paid','https://pay.zoryn.demo/PL-8821',true)
on conflict (id) do nothing;

insert into public.terminals (id, merchant_id, provider, provider_reference, name, status, battery, last_seen_at, is_demo) values
  ('33330000-0000-4000-8000-000000000001','11110000-0000-4000-8000-000000000001','mock_acquiring','trm_01','Terminal 01 — Counter','online',82,'2026-07-31T10:45:00Z',true),
  ('33330000-0000-4000-8000-000000000002','11110000-0000-4000-8000-000000000001','mock_acquiring','trm_02','Terminal 02 — Terrace','charging',34,'2026-07-31T10:30:00Z',true),
  ('33330000-0000-4000-8000-000000000003','11110000-0000-4000-8000-000000000001','mock_acquiring','trm_03','Tap to Pay — iPhone','online',61,'2026-07-31T10:44:00Z',true)
on conflict (id) do nothing;

insert into public.loyalty_accounts (id, owner_user_id, organisation_id, points, tier, is_demo) values
  ('44440000-0000-4000-8000-000000000001', null, 'a0000000-0000-4000-8000-000000000004', 1840, 'silver', true),
  ('44440000-0000-4000-8000-000000000002', null, 'a0000000-0000-4000-8000-000000000001', 24600, 'gold', true),
  ('44440000-0000-4000-8000-000000000003', null, 'a0000000-0000-4000-8000-000000000002', 8940, 'gold', true)
on conflict (id) do nothing;

insert into public.loyalty_entries (id, loyalty_account_id, points, description, is_demo) values
  ('55550000-0000-4000-8000-000000000001','44440000-0000-4000-8000-000000000001',120,'Cafe 1 Demo purchase',true),
  ('55550000-0000-4000-8000-000000000002','44440000-0000-4000-8000-000000000001',-500,'Redeemed for €5 credit',true),
  ('55550000-0000-4000-8000-000000000003','44440000-0000-4000-8000-000000000002',2400,'Supplier payment rewards',true),
  ('55550000-0000-4000-8000-000000000004','44440000-0000-4000-8000-000000000003',412,'Coffee stamp card campaign',true)
on conflict (id) do nothing;

insert into public.support_cases (id, owner_user_id, organisation_id, reference, subject, status, priority, is_demo) values
  ('66660000-0000-4000-8000-000000000001', null, 'a0000000-0000-4000-8000-000000000004', 'SC-1042','Disputed charge — order #4402','in_review','high',true),
  ('66660000-0000-4000-8000-000000000002', null, 'a0000000-0000-4000-8000-000000000002','SC-1051','Terminal 02 offline','open','normal',true)
on conflict (id) do nothing;

insert into public.provider_events (id, provider, event_id, event_type, payload, processed_at, created_at, is_demo) values
  ('77770000-0000-4000-8000-000000000001','mock_banking','evt_1001','account.updated','{}','2026-07-31T10:41:05Z','2026-07-31T10:41:00Z',true),
  ('77770000-0000-4000-8000-000000000002','mock_acquiring','evt_1002','payment.captured','{}','2026-07-31T10:40:02Z','2026-07-31T10:40:00Z',true),
  ('77770000-0000-4000-8000-000000000003','mock_acquiring','evt_1003','settlement.created','{}',null,'2026-07-31T06:02:00Z',true),
  ('77770000-0000-4000-8000-000000000004','mock_banking','evt_1004','card.status_changed','{}',null,'2026-07-30T21:14:00Z',true)
on conflict (id) do nothing;

insert into public.audit_logs (id, actor_id, action, resource_type, resource_id, metadata, created_at, is_demo) values
  ('88880000-0000-4000-8000-000000000001', null, 'KYB approved — Cafe 1 Demo','organisation','a0000000-0000-4000-8000-000000000002','{"actor":"ops@loungetech"}','2026-07-30T12:04:00Z',true),
  ('88880000-0000-4000-8000-000000000002', null, 'Webhook replay — settlements','provider_events',null,'{"actor":"system"}','2026-07-30T06:10:00Z',true),
  ('88880000-0000-4000-8000-000000000003', null, 'Card restricted — 3390','card','e0000000-0000-4000-8000-000000000014','{"actor":"ops@loungetech"}','2026-07-29T16:44:00Z',true)
on conflict (id) do nothing;