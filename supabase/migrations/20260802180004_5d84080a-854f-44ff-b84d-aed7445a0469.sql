create table if not exists public.platform_provider_operation_mappings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  operation text not null,
  environment text not null check (environment in ('mock','sandbox','live')),
  api_family text,
  api_version text,
  http_method text not null default 'POST',
  endpoint_template text not null,
  request_mapper_version text not null default 'v1',
  response_mapper_version text not null default 'v1',
  enabled boolean not null default false,
  approved_by_provider boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,operation,environment)
);

grant select on public.platform_provider_operation_mappings to authenticated;
grant all on public.platform_provider_operation_mappings to service_role;
alter table public.platform_provider_operation_mappings enable row level security;
create policy "Admins read provider operation mappings"
  on public.platform_provider_operation_mappings for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger update_platform_provider_operation_mappings_updated_at
  before update on public.platform_provider_operation_mappings
  for each row execute function public.update_updated_at_column();

create table if not exists public.platform_provider_auth_state (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen')),
  environment text not null check (environment in ('sandbox','live')),
  auth_type text not null,
  token_reference text,
  expires_at timestamptz,
  last_refreshed_at timestamptz,
  status text not null default 'not_configured' check (
    status in ('not_configured','active','expiring','expired','failed')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,environment)
);

grant select on public.platform_provider_auth_state to authenticated;
grant all on public.platform_provider_auth_state to service_role;
alter table public.platform_provider_auth_state enable row level security;
create policy "Admins read provider auth state"
  on public.platform_provider_auth_state for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger update_platform_provider_auth_state_updated_at
  before update on public.platform_provider_auth_state
  for each row execute function public.update_updated_at_column();

create table if not exists public.platform_provider_webhook_configs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen','rewards')),
  environment text not null check (environment in ('sandbox','live')),
  verification_method text not null,
  timestamp_header text,
  signature_header text,
  tolerance_seconds integer not null default 300,
  enabled boolean not null default false,
  approved_by_provider boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,environment)
);

grant select on public.platform_provider_webhook_configs to authenticated;
grant all on public.platform_provider_webhook_configs to service_role;
alter table public.platform_provider_webhook_configs enable row level security;
create policy "Admins read provider webhook configs"
  on public.platform_provider_webhook_configs for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger update_platform_provider_webhook_configs_updated_at
  before update on public.platform_provider_webhook_configs
  for each row execute function public.update_updated_at_column();

create table if not exists public.platform_provider_activation_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen')),
  environment text not null check (environment in ('mock','sandbox','live')),
  status text not null check (status in ('running','passed','failed','blocked')),
  checks jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  executed_by uuid references auth.users(id)
);

grant select on public.platform_provider_activation_runs to authenticated;
grant all on public.platform_provider_activation_runs to service_role;
alter table public.platform_provider_activation_runs enable row level security;
create policy "Admins read provider activation runs"
  on public.platform_provider_activation_runs for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

insert into public.platform_provider_operation_mappings(
  provider,operation,environment,api_family,http_method,endpoint_template,enabled,metadata
) values
  ('swan','start_individual_onboarding','mock','onboarding','POST','/mock/swan/onboarding/individual',true,'{"fixture":true}'),
  ('swan','start_company_onboarding','mock','onboarding','POST','/mock/swan/onboarding/company',true,'{"fixture":true}'),
  ('swan','create_transfer','mock','payments','POST','/mock/swan/transfers',true,'{"fixture":true}'),
  ('swan','issue_card','mock','cards','POST','/mock/swan/cards',true,'{"fixture":true}'),
  ('adyen','create_legal_entity','mock','legal-entity','POST','/mock/adyen/legal-entities',true,'{"fixture":true}'),
  ('adyen','create_store','mock','management','POST','/mock/adyen/stores',true,'{"fixture":true}'),
  ('adyen','create_payment_session','mock','checkout','POST','/mock/adyen/sessions',true,'{"fixture":true}'),
  ('adyen','create_payment_link','mock','checkout','POST','/mock/adyen/payment-links',true,'{"fixture":true}'),
  ('adyen','refund_payment','mock','checkout','POST','/mock/adyen/refunds',true,'{"fixture":true}')
on conflict(provider,operation,environment) do update
set endpoint_template=excluded.endpoint_template,
    enabled=excluded.enabled,
    metadata=excluded.metadata;