-- 1. Scope blanket authenticated reads on provider integration tables to admins
drop policy if exists "platform_provider_resources_authenticated_read" on public.platform_provider_resources;
create policy "Admins read provider resources" on public.platform_provider_resources
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "platform_provider_events_authenticated_read" on public.platform_provider_events;
create policy "Admins read provider events" on public.platform_provider_events
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "platform_provider_connections_authenticated_read" on public.platform_provider_connections;
create policy "Admins read provider connections" on public.platform_provider_connections
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 2. Internal rewards mirroring payloads must not be world readable
drop policy if exists "Demo rewards outbox is readable" on public.rewards_outbox;
create policy "Admins read rewards outbox" on public.rewards_outbox
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
revoke select on public.rewards_outbox from anon;

-- 3. Remove anonymous execute on internal helper functions
revoke execute on function public.platform_can_access_account(uuid, uuid) from anon;
revoke execute on function public.platform_can_access_merchant(uuid, uuid) from anon;
revoke execute on function public.platform_is_org_member(uuid, uuid) from anon;
revoke execute on function public.platform_owns_account(uuid, uuid) from anon;
revoke execute on function public.platform_replay_dead_letter_command(uuid) from anon;
revoke execute on function public.update_updated_at_column() from anon, authenticated;