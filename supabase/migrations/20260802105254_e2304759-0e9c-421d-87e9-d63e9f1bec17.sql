revoke execute on function public.platform_claim_provider_commands(text, integer) from anon, authenticated, public;
revoke execute on function public.platform_complete_provider_command(uuid, text, text) from anon, authenticated, public;
grant execute on function public.platform_claim_provider_commands(text, integer) to service_role;
grant execute on function public.platform_complete_provider_command(uuid, text, text) to service_role;

revoke execute on function public.check_rate_limit(text, integer, integer) from anon, authenticated, public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;