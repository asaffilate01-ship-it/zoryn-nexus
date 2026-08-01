-- Development/demo only. Replace UUIDs as needed for authenticated demo users.
insert into public.zn_organisations(id,name,legal_type,status) values ('00000000-0000-0000-0000-000000000101','Cafe Berlin GmbH','GmbH','active') on conflict do nothing;
insert into public.zn_accounts(id,subject_type,subject_id,account_type,iban,bic,available_balance,booked_balance,status) values
('00000000-0000-0000-0000-000000000201','organisation','00000000-0000-0000-0000-000000000101','operating','DE89370400440532013000','COBADEFFXXX',28490.12,29120.12,'active') on conflict do nothing;
insert into public.zn_pots(account_id,name,balance,target,rules) values
('00000000-0000-0000-0000-000000000201','Tax reserve',6200,12000,'{"percentage":19}'),
('00000000-0000-0000-0000-000000000201','Payroll',8900,15000,'{"monthly":5000}');
insert into public.zn_transactions(account_id,kind,direction,amount,status,counterparty,reference,booked_at) values
('00000000-0000-0000-0000-000000000201','card','in',1842.75,'booked','ZorynPay daily sales','Settlement',now()),
('00000000-0000-0000-0000-000000000201','sepa','out',2480,'pending','METRO AG','Supplier invoice 23881',null),
('00000000-0000-0000-0000-000000000201','sepa','out',420,'returned','Vodafone Business','Invalid beneficiary',now());
insert into public.zn_support_cases(subject_type,subject_id,category,priority,status,title,sla_due_at) values
('organisation','00000000-0000-0000-0000-000000000101','complaint','high','open','Settlement delay complaint',now()+interval '4 hours'),
('organisation','00000000-0000-0000-0000-000000000101','card','normal','open','Employee card replacement',now()+interval '2 days');
