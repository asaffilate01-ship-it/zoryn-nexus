begin;
select plan(8);

select has_table('public','platform_provider_operation_mappings');
select has_table('public','platform_provider_auth_state');
select has_table('public','platform_provider_webhook_configs');
select has_table('public','platform_provider_activation_runs');

select has_rls('public','platform_provider_operation_mappings');
select has_rls('public','platform_provider_auth_state');
select has_rls('public','platform_provider_webhook_configs');
select has_rls('public','platform_provider_activation_runs');

select * from finish();
rollback;