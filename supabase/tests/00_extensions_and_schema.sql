begin;
select plan(10);

select has_extension('pgcrypto');
select has_table('public','platform_provider_commands');
select has_table('public','platform_provider_events');
select has_table('public','platform_provider_resources');
select has_table('public','platform_provider_runtime_logs');
select has_table('public','platform_accounts');
select has_table('public','platform_transfers');
select has_table('public','platform_cards');
select has_table('public','platform_payments');
select has_table('public','platform_settlements');

select * from finish();
rollback;
