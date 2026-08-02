begin;
select plan(12);

select has_table('public','platform_provider_contract_versions');
select has_table('public','platform_provider_test_evidence');
select has_table('public','platform_provider_health_checks');
select has_table('public','platform_reconciliation_items');

select has_table('public','platform_provider_commands');
select has_table('public','platform_provider_events');
select has_table('public','platform_provider_resources');
select has_table('public','platform_reconciliation_runs');

select has_rls('public','platform_provider_contract_versions');
select has_rls('public','platform_provider_test_evidence');
select has_rls('public','platform_provider_health_checks');
select has_rls('public','platform_reconciliation_items');

select * from finish();
rollback;
