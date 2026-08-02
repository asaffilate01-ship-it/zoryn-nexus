begin;

create table if not exists public.platform_provider_contract_versions (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  contract_name text not null,
  version text not null,
  environment text not null check (environment in ('mock','sandbox','live')),
  status text not null default 'draft' check (
    status in ('draft','validated','approved','deprecated')
  ),
  schema_hash text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, contract_name, version, environment)
);

create table if not exists public.platform_provider_test_evidence (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  environment text not null check (environment in ('mock','sandbox','live')),
  scenario text not null,
  status text not null check (status in ('passed','failed','blocked')),
  external_reference text,
  evidence jsonb not null default '{}'::jsonb,
  executed_at timestamptz not null default now(),
  executed_by uuid references auth.users(id)
);

create table if not exists public.platform_reconciliation_items (
  id uuid primary key default gen_random_uuid(),
  reconciliation_run_id uuid not null references public.platform_reconciliation_runs(id) on delete cascade,
  resource_type text not null,
  internal_reference text,
  provider_reference text,
  expected_minor bigint,
  actual_minor bigint,
  status text not null check (status in ('matched','missing_internal','missing_provider','different')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_provider_health_checks (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  environment text not null check (environment in ('mock','sandbox','live')),
  status text not null check (status in ('healthy','degraded','offline')),
  latency_ms integer,
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

create index if not exists platform_provider_health_checks_latest_idx
on public.platform_provider_health_checks(provider, environment, checked_at desc);

alter table public.platform_provider_contract_versions enable row level security;
alter table public.platform_provider_test_evidence enable row level security;
alter table public.platform_reconciliation_items enable row level security;
alter table public.platform_provider_health_checks enable row level security;

commit;
