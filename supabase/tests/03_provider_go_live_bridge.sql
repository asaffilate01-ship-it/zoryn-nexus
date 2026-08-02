begin;
select plan(8);

select has_table('public','platform_provider_operation_catalogue');
select has_table('public','platform_provider_configuration_versions');
select has_table('public','platform_provider_webhook_receipts');
select has_table('public','platform_provider_launch_scores');

select has_rls('public','platform_provider_operation_catalogue');
select has_rls('public','platform_provider_configuration_versions');
select has_rls('public','platform_provider_webhook_receipts');
select has_rls('public','platform_provider_launch_scores');

select * from finish();
rollback;
