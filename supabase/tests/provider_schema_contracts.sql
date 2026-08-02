begin;
select plan(18);

select has_table('public','platform_provider_connections');
select has_table('public','platform_provider_resources');
select has_table('public','platform_provider_commands');
select has_table('public','platform_provider_events');
select has_table('public','platform_provider_runtime_logs');

select has_table('public','platform_customers');
select has_table('public','platform_organisations');
select has_table('public','platform_organisation_members');
select has_table('public','platform_accounts');
select has_table('public','platform_transactions');
select has_table('public','platform_beneficiaries');
select has_table('public','platform_transfers');
select has_table('public','platform_cards');

select has_table('public','platform_merchants');
select has_table('public','platform_payments');
select has_table('public','platform_refunds');
select has_table('public','platform_settlements');
select has_table('public','platform_terminals');

select * from finish();
rollback;
