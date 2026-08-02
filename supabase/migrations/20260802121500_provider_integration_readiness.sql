begin;

create extension if not exists pgcrypto;

create table if not exists public.platform_provider_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique check (provider in ('swan','adyen','rewards')),
  mode text not null default 'mock' check (mode in ('mock','sandbox','live')),
  status text not null default 'unknown' check (status in ('unknown','healthy','degraded','offline')),
  configuration jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_provider_resources (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  aggregate_type text not null,
  aggregate_id uuid not null,
  resource_type text not null,
  external_id text not null,
  external_status text,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, resource_type, external_id),
  unique(provider, aggregate_type, aggregate_id, resource_type)
);

create index if not exists platform_provider_resources_aggregate_idx
  on public.platform_provider_resources(aggregate_type, aggregate_id);

create table if not exists public.platform_provider_commands (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  command_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  status text not null default 'queued' check (
    status in ('queued','processing','succeeded','failed','dead_letter')
  ),
  attempt_count integer not null default 0,
  last_error text,
  next_attempt_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists platform_provider_commands_queue_idx
  on public.platform_provider_commands(status, next_attempt_at, created_at);

create table if not exists public.platform_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  payload_hash text not null,
  processing_status text not null default 'received' check (
    processing_status in ('received','processing','processed','retrying','failed','dead_letter','duplicate')
  ),
  attempt_count integer not null default 0,
  last_error text,
  occurred_at timestamptz,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, event_id)
);

create table if not exists public.platform_onboarding_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  organisation_id uuid,
  onboarding_type text not null check (onboarding_type in ('individual','company','merchant')),
  provider text not null check (provider in ('swan','adyen')),
  status text not null default 'not_started' check (
    status in ('not_started','in_progress','action_required','under_review','approved','rejected','restricted')
  ),
  required_actions jsonb not null default '[]'::jsonb,
  external_id text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  organisation_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.platform_provider_connections enable row level security;
alter table public.platform_provider_resources enable row level security;
alter table public.platform_provider_commands enable row level security;
alter table public.platform_provider_events enable row level security;
alter table public.platform_onboarding_cases enable row level security;
alter table public.platform_audit_events enable row level security;

-- Browser clients may read provider health but never secrets.
create policy platform_provider_connections_authenticated_read
on public.platform_provider_connections for select
to authenticated
using (true);

-- Commands may be created by authenticated users; processing remains service-role only.
create policy platform_provider_commands_authenticated_insert
on public.platform_provider_commands for insert
to authenticated
with check (created_by = auth.uid());

create policy platform_onboarding_own_read
on public.platform_onboarding_cases for select
to authenticated
using (user_id = auth.uid());

create policy platform_onboarding_own_insert
on public.platform_onboarding_cases for insert
to authenticated
with check (user_id = auth.uid());

insert into public.platform_provider_connections(provider, mode, status)
values
  ('swan','mock','healthy'),
  ('adyen','mock','healthy'),
  ('rewards','mock','healthy')
on conflict (provider) do nothing;

commit;
