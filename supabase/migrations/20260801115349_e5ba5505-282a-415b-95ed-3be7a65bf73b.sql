revoke execute on function public.is_org_member(uuid, uuid) from anon, public;
revoke execute on function public.can_access_account(uuid, uuid) from anon, public;
revoke execute on function public.can_access_merchant(uuid, uuid) from anon, public;
revoke execute on function public.can_access_loyalty(uuid, uuid) from anon, public;
grant execute on function public.is_org_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_access_account(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_access_merchant(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_access_loyalty(uuid, uuid) to authenticated, service_role;