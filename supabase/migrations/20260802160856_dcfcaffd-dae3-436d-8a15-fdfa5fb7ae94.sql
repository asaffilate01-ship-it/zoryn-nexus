-- Stage 2: banking persistence

create table if not exists public.platform_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_type text not null check (customer_type in ('individual','business')),
  status text not null default 'draft',
  provider text,
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, customer_type)
);

grant select, insert, update on public.platform_customers to authenticated;
grant all on public.platform_customers to service_role;
alter table public.platform_customers enable row level security;

create policy "customers own read" on public.platform_customers
  for select to authenticated using (user_id = auth.uid());
create policy "customers own insert" on public.platform_customers
  for insert to authenticated with check (user_id = auth.uid());
create policy "customers own update" on public.platform_customers
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger platform_customers_updated_at
  before update on public.platform_customers
  for each row execute function public.update_updated_at_column();

-- extra columns on existing banking tables
alter table public.platform_accounts
  add column if not exists customer_id uuid references public.platform_customers(id) on delete set null,
  add column if not exists bic text;

alter table public.platform_organisations
  add column if not exists trading_name text,
  add column if not exists registration_number text;

alter table public.platform_organisation_members
  add column if not exists payment_limit_minor bigint;

alter table public.platform_beneficiaries
  add column if not exists customer_id uuid references public.platform_customers(id) on delete set null;

alter table public.platform_transfers
  add column if not exists transfer_type text not null default 'standard',
  add column if not exists consent_status text not null default 'not_required',
  add column if not exists scheduled_for timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'platform_transfers_transfer_type_check') then
    alter table public.platform_transfers
      add constraint platform_transfers_transfer_type_check
      check (transfer_type in ('standard','instant','scheduled','recurring'));
  end if;
end $$;

alter table public.platform_cards
  add column if not exists online_enabled boolean not null default true,
  add column if not exists contactless_enabled boolean not null default true,
  add column if not exists atm_enabled boolean not null default true,
  add column if not exists international_enabled boolean not null default true;

-- transactions ledger
create table if not exists public.platform_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.platform_accounts(id) on delete cascade,
  direction text not null check (direction in ('credit','debit')),
  transaction_type text not null,
  amount_minor bigint not null,
  currency text not null default 'EUR',
  status text not null default 'pending',
  merchant_name text,
  counterparty_name text,
  reference text,
  provider text,
  provider_external_id text,
  booked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_transactions_account_idx
  on public.platform_transactions (account_id, created_at desc);

grant select on public.platform_transactions to authenticated;
grant all on public.platform_transactions to service_role;
alter table public.platform_transactions enable row level security;

create policy "transactions readable via account" on public.platform_transactions
  for select to authenticated
  using (public.platform_can_access_account(account_id, auth.uid()));

create trigger platform_transactions_updated_at
  before update on public.platform_transactions
  for each row execute function public.update_updated_at_column();

-- onboarding actions
create table if not exists public.platform_onboarding_actions (
  id uuid primary key default gen_random_uuid(),
  onboarding_case_id uuid not null references public.platform_onboarding_cases(id) on delete cascade,
  action_type text not null,
  title text,
  status text not null default 'required' check (status in ('required','in_progress','submitted','completed','rejected')),
  payload jsonb not null default '{}'::jsonb,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_onboarding_actions_case_idx
  on public.platform_onboarding_actions (onboarding_case_id);

grant select on public.platform_onboarding_actions to authenticated;
grant all on public.platform_onboarding_actions to service_role;
alter table public.platform_onboarding_actions enable row level security;

create policy "onboarding actions readable by case owner" on public.platform_onboarding_actions
  for select to authenticated
  using (
    exists (
      select 1 from public.platform_onboarding_cases c
      where c.id = onboarding_case_id
        and (
          c.user_id = auth.uid()
          or (c.organisation_id is not null and public.platform_is_org_member(c.organisation_id, auth.uid()))
        )
    )
  );

create trigger platform_onboarding_actions_updated_at
  before update on public.platform_onboarding_actions
  for each row execute function public.update_updated_at_column();