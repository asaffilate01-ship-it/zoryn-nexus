create table if not exists public.platform_provider_runtime_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  direction text not null check (direction in ('command','event')),
  entity_id uuid,
  operation text not null,
  status text not null check (status in ('started','succeeded','failed','dead_letter')),
  correlation_id text not null,
  duration_ms integer,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select on public.platform_provider_runtime_logs to authenticated;
grant all on public.platform_provider_runtime_logs to service_role;

alter table public.platform_provider_runtime_logs enable row level security;

create policy platform_provider_runtime_logs_admin_read
on public.platform_provider_runtime_logs
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index if not exists platform_provider_runtime_logs_lookup_idx
on public.platform_provider_runtime_logs(provider, direction, status, created_at desc);

create index if not exists platform_provider_runtime_logs_correlation_idx
on public.platform_provider_runtime_logs(correlation_id, created_at desc);

create policy platform_provider_commands_admin_read
on public.platform_provider_commands
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.platform_claim_provider_events(p_limit integer default 50)
returns setof public.platform_provider_events
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select e.id
    from public.platform_provider_events e
    where e.processing_status in ('received','retrying')
    order by e.received_at
    for update of e skip locked
    limit greatest(1, least(p_limit, 100))
  )
  update public.platform_provider_events e
  set processing_status = 'processing',
      attempt_count = e.attempt_count + 1
  from candidates c
  where e.id = c.id
  returning e.*;
end;
$$;

revoke all on function public.platform_claim_provider_events(integer) from public, anon, authenticated;
grant execute on function public.platform_claim_provider_events(integer) to service_role;