-- Run after the migration for shared public demo records. Auth-linked records should be inserted after creating demo users.
insert into public.organisations(id,name,legal_name,kind,country,status) values
('11111111-1111-1111-1111-111111111111','LoungeTech Demo','LoungeTech Digitallösungen GmbH','business','DE','approved'),
('22222222-2222-2222-2222-222222222222','Cafe 1 Demo','Cafe 1 St Albans Ltd','merchant','DE','approved') on conflict do nothing;
insert into public.financial_accounts(id,organisation_id,provider_reference,account_name,iban,balance,available_balance) values
('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','SWAN-DEMO-BUS-001','Business EUR','DE71 1001 1001 9876 5432 10',48620.40,48620.40),
('44444444-4444-4444-4444-444444444444','22222222-2222-2222-2222-222222222222','SWAN-DEMO-MER-001','Merchant settlement','DE61 1001 1001 1111 8102 90',3180.40,3180.40) on conflict do nothing;
insert into public.organisation_members(organisation_id,display_name,role,monthly_limit,spent) values
('11111111-1111-1111-1111-111111111111','Leonie Weber','Finance Admin',5000,2400),('11111111-1111-1111-1111-111111111111','David Khan','Operations',1500,840),('11111111-1111-1111-1111-111111111111','Maya Schmidt','Marketing',1000,610),('11111111-1111-1111-1111-111111111111','Jonas Fischer','Driver',750,380);
insert into public.merchants(id,organisation_id,provider_reference,pending_settlement) values('55555555-5555-5555-5555-555555555555','22222222-2222-2222-2222-222222222222','ADYEN-DEMO-MRC-8102',3180.40) on conflict do nothing;
insert into public.terminals(merchant_id,provider_reference,name,status,battery) values
('55555555-5555-5555-5555-555555555555','ZP-T1001','Front counter','online',78),('55555555-5555-5555-5555-555555555555','ZP-T1002','Mobile till','online',64),('55555555-5555-5555-5555-555555555555','ZP-T1003','Events terminal','offline',12) on conflict do nothing;
insert into public.payment_links(merchant_id,provider_reference,label,amount,status,url) values
('55555555-5555-5555-5555-555555555555','PL-1001','Catering deposit',850,'paid','https://pay.zoryn.example/PL-1001'),('55555555-5555-5555-5555-555555555555','PL-1002','Event booking',1250,'open','https://pay.zoryn.example/PL-1002') on conflict do nothing;
