begin;

create table if not exists public.platform_provider_operation_catalogue (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen')),
  operation text not null,
  category text not null,
  required_for_launch boolean not null default true,
  status text not null default 'unmapped' check (
    status in ('unmapped','mapped','sandbox_validated','production_approved','deprecated')
  ),
  created_at timestamptz not null default now(),
  unique(provider,operation)
);

create table if not exists public.platform_provider_configuration_versions (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen')),
  environment text not null check (environment in ('mock','sandbox','live')),
  version text not null,
  configuration jsonb not null default '{}'::jsonb,
  checksum text not null,
  status text not null default 'draft' check (
    status in ('draft','validated','approved','active','retired')
  ),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,environment,version)
);

create table if not exists public.platform_provider_webhook_receipts (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen')),
  environment text not null check (environment in ('mock','sandbox','live')),
  provider_event_id text not null,
  event_type text not null,
  signature_valid boolean not null,
  replay_valid boolean not null,
  payload_hash text not null,
  processing_status text not null default 'received',
  received_at timestamptz not null default now(),
  unique(provider,environment,provider_event_id,event_type)
);

create table if not exists public.platform_provider_launch_scores (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('swan','adyen')),
  environment text not null check (environment in ('mock','sandbox','live')),
  configuration_score integer not null default 0 check (configuration_score between 0 and 100),
  webhooks_score integer not null default 0 check (webhooks_score between 0 and 100),
  reconciliation_score integer not null default 0 check (reconciliation_score between 0 and 100),
  lifecycle_score integer not null default 0 check (lifecycle_score between 0 and 100),
  overall_score integer generated always as (
    (configuration_score + webhooks_score + reconciliation_score + lifecycle_score) / 4
  ) stored,
  blocking_reasons jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now()
);

grant select on public.platform_provider_operation_catalogue to authenticated;
grant select on public.platform_provider_configuration_versions to authenticated;
grant select on public.platform_provider_webhook_receipts to authenticated;
grant select on public.platform_provider_launch_scores to authenticated;
grant all on public.platform_provider_operation_catalogue to service_role;
grant all on public.platform_provider_configuration_versions to service_role;
grant all on public.platform_provider_webhook_receipts to service_role;
grant all on public.platform_provider_launch_scores to service_role;

alter table public.platform_provider_operation_catalogue enable row level security;
alter table public.platform_provider_configuration_versions enable row level security;
alter table public.platform_provider_webhook_receipts enable row level security;
alter table public.platform_provider_launch_scores enable row level security;

create policy "Admins read provider operation catalogue"
  on public.platform_provider_operation_catalogue for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins read provider configuration versions"
  on public.platform_provider_configuration_versions for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins read provider webhook receipts"
  on public.platform_provider_webhook_receipts for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins read provider launch scores"
  on public.platform_provider_launch_scores for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

insert into public.platform_provider_operation_catalogue(provider,operation,category)
values
 ('swan','start_individual_onboarding','onboarding'),
 ('swan','start_company_onboarding','onboarding'),
 ('swan','get_onboarding_status','onboarding'),
 ('swan','list_accounts','accounts'),
 ('swan','get_account_balance','accounts'),
 ('swan','list_transactions','transactions'),
 ('swan','create_transfer','transfers'),
 ('swan','confirm_transfer','transfers'),
 ('swan','issue_card','cards'),
 ('swan','activate_card','cards'),
 ('swan','freeze_card','cards'),
 ('swan','unfreeze_card','cards'),
 ('adyen','create_legal_entity','onboarding'),
 ('adyen','create_account_holder','onboarding'),
 ('adyen','create_store','merchant'),
 ('adyen','get_capabilities','merchant'),
 ('adyen','create_payment_session','payments'),
 ('adyen','create_payment_link','payments'),
 ('adyen','capture_payment','payments'),
 ('adyen','cancel_payment','payments'),
 ('adyen','refund_payment','refunds'),
 ('adyen','list_settlements','settlements'),
 ('adyen','register_terminal','terminals'),
 ('adyen','create_tap_to_pay_session','terminals')
on conflict(provider,operation) do nothing;

commit;