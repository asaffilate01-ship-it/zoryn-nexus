begin;

create table if not exists public.platform_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organisation_id uuid references public.platform_organisations(id) on delete set null,
  operation_type text not null,
  operation_id uuid not null,
  provider text not null check (provider in ('swan','adyen')),
  status text not null default 'initiated' check (
    status in ('initiated','user_action_required','authorised','expired','cancelled','failed')
  ),
  redirect_url text,
  provider_external_id text,
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.platform_consents to authenticated;
grant all on public.platform_consents to service_role;
alter table public.platform_consents enable row level security;

create policy platform_consents_own_read
on public.platform_consents for select
to authenticated
using (
  user_id = auth.uid()
  or (organisation_id is not null and public.platform_is_org_member(organisation_id, auth.uid()))
  or public.has_role(auth.uid(), 'admin')
);

create trigger platform_consents_updated_at
before update on public.platform_consents
for each row execute function public.update_updated_at_column();

create table if not exists public.platform_launch_blockers (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('engineering','security','swan','adyen','operations','legal','pilot')),
  severity text not null check (severity in ('warning','critical')),
  title text not null,
  details text,
  status text not null default 'open' check (status in ('open','accepted','resolved')),
  evidence_url text,
  owner text,
  due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.platform_launch_blockers to authenticated;
grant all on public.platform_launch_blockers to service_role;
alter table public.platform_launch_blockers enable row level security;

create policy platform_launch_blockers_admin_read
on public.platform_launch_blockers for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy platform_launch_blockers_admin_write
on public.platform_launch_blockers for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger platform_launch_blockers_updated_at
before update on public.platform_launch_blockers
for each row execute function public.update_updated_at_column();

create or replace function public.platform_replay_dead_letter_command(p_command_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'not_authorised';
  end if;

  if not exists (
    select 1 from public.platform_provider_commands
    where id = p_command_id and status = 'dead_letter'
  ) then
    raise exception 'command_not_dead_letter';
  end if;

  update public.platform_provider_commands
  set status = 'queued',
      attempt_count = 0,
      last_error = null,
      next_attempt_at = now(),
      processed_at = null
  where id = p_command_id;

  insert into public.platform_audit_events(actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'provider_command_replayed', 'provider_command', p_command_id::text, '{}'::jsonb);
end;
$$;

revoke all on function public.platform_replay_dead_letter_command(uuid) from public;
grant execute on function public.platform_replay_dead_letter_command(uuid) to authenticated;

commit;