create extension if not exists pgcrypto;

do $$ begin
  create type public.zoryn_role as enum ('personal','business','merchant','admin','staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.resource_status as enum ('draft','in_review','action_required','approved','restricted','suspended','closed');
exception when duplicate_object then null; end $$;

-- updated_at helper
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role public.zoryn_role not null default 'personal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profile_self" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

create table if not exists public.organisations(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  kind text not null check (kind in ('business','merchant','platform')),
  country char(2) not null default 'DE',
  status public.resource_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.organisations to authenticated;
grant all on public.organisations to service_role;
alter table public.organisations enable row level security;
create trigger organisations_updated_at before update on public.organisations for each row execute function public.update_updated_at_column();

create table if not exists public.organisation_members(
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null,
  monthly_limit numeric(14,2) not null default 0,
  spent numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.organisation_members to authenticated;
grant all on public.organisation_members to service_role;
alter table public.organisation_members enable row level security;
create trigger organisation_members_updated_at before update on public.organisation_members for each row execute function public.update_updated_at_column();

-- membership helper (security definer to avoid recursive RLS)
create or replace function public.is_org_member(_org_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organisation_members m where m.organisation_id = _org_id and m.user_id = _user_id);
$$;

create policy "members_read_own_org" on public.organisation_members for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organisation_id, auth.uid()));
create policy "orgs_read_member" on public.organisations for select to authenticated
  using (public.is_org_member(id, auth.uid()));

create table if not exists public.financial_accounts(
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete cascade,
  provider text not null default 'mock_banking',
  provider_reference text unique,
  account_name text not null,
  currency char(3) not null default 'EUR',
  iban text,
  balance numeric(14,2) not null default 0,
  available_balance numeric(14,2) not null default 0,
  status public.resource_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (owner_user_id is not null or organisation_id is not null)
);
grant select, insert, update, delete on public.financial_accounts to authenticated;
grant all on public.financial_accounts to service_role;
alter table public.financial_accounts enable row level security;
create policy "own_accounts" on public.financial_accounts for select to authenticated
  using (owner_user_id = auth.uid() or public.is_org_member(organisation_id, auth.uid()));
create trigger financial_accounts_updated_at before update on public.financial_accounts for each row execute function public.update_updated_at_column();

create or replace function public.can_access_account(_account_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.financial_accounts a
    where a.id = _account_id
      and (a.owner_user_id = _user_id or public.is_org_member(a.organisation_id, _user_id))
  );
$$;

create table if not exists public.pots(
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.financial_accounts(id) on delete cascade,
  name text not null,
  emoji text default '💰',
  balance numeric(14,2) not null default 0,
  target numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pots to authenticated;
grant all on public.pots to service_role;
alter table public.pots enable row level security;
create policy "own_pots" on public.pots for all to authenticated
  using (public.can_access_account(account_id, auth.uid()))
  with check (public.can_access_account(account_id, auth.uid()));
create trigger pots_updated_at before update on public.pots for each row execute function public.update_updated_at_column();

create table if not exists public.cards(
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.financial_accounts(id) on delete cascade,
  provider text not null default 'mock_banking',
  provider_reference text unique,
  name text not null,
  last_four char(4) not null,
  card_type text not null check (card_type in ('physical','virtual')),
  status text not null default 'active',
  monthly_limit numeric(14,2) not null default 0,
  spent numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.cards to authenticated;
grant all on public.cards to service_role;
alter table public.cards enable row level security;
create policy "own_cards_read" on public.cards for select to authenticated using (public.can_access_account(account_id, auth.uid()));
create policy "own_cards_update" on public.cards for update to authenticated
  using (public.can_access_account(account_id, auth.uid()))
  with check (public.can_access_account(account_id, auth.uid()));
create trigger cards_updated_at before update on public.cards for each row execute function public.update_updated_at_column();

create table if not exists public.transactions(
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.financial_accounts(id) on delete cascade,
  provider text not null default 'mock',
  provider_reference text unique,
  title text not null,
  subtitle text,
  kind text not null,
  amount numeric(14,2) not null,
  currency char(3) not null default 'EUR',
  status text not null default 'completed',
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "own_transactions" on public.transactions for select to authenticated using (public.can_access_account(account_id, auth.uid()));
create trigger transactions_updated_at before update on public.transactions for each row execute function public.update_updated_at_column();

create table if not exists public.internal_transfers(
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.financial_accounts(id) on delete cascade,
  from_pot_id uuid references public.pots(id) on delete set null,
  to_pot_id uuid references public.pots(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_pot_id is distinct from to_pot_id)
);
grant select, insert, update, delete on public.internal_transfers to authenticated;
grant all on public.internal_transfers to service_role;
alter table public.internal_transfers enable row level security;
create policy "own_transfers" on public.internal_transfers for all to authenticated
  using (public.can_access_account(account_id, auth.uid()))
  with check (public.can_access_account(account_id, auth.uid()));
create trigger internal_transfers_updated_at before update on public.internal_transfers for each row execute function public.update_updated_at_column();

create table if not exists public.merchants(
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  provider text not null default 'mock_acquiring',
  provider_reference text unique,
  status public.resource_status not null default 'approved',
  pending_settlement numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.merchants to authenticated;
grant all on public.merchants to service_role;
alter table public.merchants enable row level security;
create policy "merchant_org_read" on public.merchants for select to authenticated using (public.is_org_member(organisation_id, auth.uid()));
create trigger merchants_updated_at before update on public.merchants for each row execute function public.update_updated_at_column();

create or replace function public.can_access_merchant(_merchant_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.merchants mm
    where mm.id = _merchant_id and public.is_org_member(mm.organisation_id, _user_id)
  );
$$;

create table if not exists public.payment_links(
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  provider_reference text unique,
  label text not null,
  amount numeric(14,2) not null,
  currency char(3) not null default 'EUR',
  status text not null default 'open',
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payment_links to authenticated;
grant all on public.payment_links to service_role;
alter table public.payment_links enable row level security;
create policy "payment_links_org" on public.payment_links for all to authenticated
  using (public.can_access_merchant(merchant_id, auth.uid()))
  with check (public.can_access_merchant(merchant_id, auth.uid()));
create trigger payment_links_updated_at before update on public.payment_links for each row execute function public.update_updated_at_column();

create table if not exists public.terminals(
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  provider text not null default 'mock_acquiring',
  provider_reference text unique,
  name text not null,
  status text not null default 'online',
  battery integer not null default 100,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.terminals to authenticated;
grant all on public.terminals to service_role;
alter table public.terminals enable row level security;
create policy "terminals_org" on public.terminals for all to authenticated
  using (public.can_access_merchant(merchant_id, auth.uid()))
  with check (public.can_access_merchant(merchant_id, auth.uid()));
create trigger terminals_updated_at before update on public.terminals for each row execute function public.update_updated_at_column();

create table if not exists public.loyalty_accounts(
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete cascade,
  points bigint not null default 0,
  tier text not null default 'silver',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.loyalty_accounts to authenticated;
grant all on public.loyalty_accounts to service_role;
alter table public.loyalty_accounts enable row level security;
create policy "loyalty_accounts_own" on public.loyalty_accounts for all to authenticated
  using (owner_user_id = auth.uid() or public.is_org_member(organisation_id, auth.uid()))
  with check (owner_user_id = auth.uid() or public.is_org_member(organisation_id, auth.uid()));
create trigger loyalty_accounts_updated_at before update on public.loyalty_accounts for each row execute function public.update_updated_at_column();

create or replace function public.can_access_loyalty(_loyalty_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.loyalty_accounts la
    where la.id = _loyalty_id
      and (la.owner_user_id = _user_id or public.is_org_member(la.organisation_id, _user_id))
  );
$$;

create table if not exists public.loyalty_entries(
  id uuid primary key default gen_random_uuid(),
  loyalty_account_id uuid not null references public.loyalty_accounts(id) on delete cascade,
  points bigint not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.loyalty_entries to authenticated;
grant all on public.loyalty_entries to service_role;
alter table public.loyalty_entries enable row level security;
create policy "loyalty_entries_own" on public.loyalty_entries for all to authenticated
  using (public.can_access_loyalty(loyalty_account_id, auth.uid()))
  with check (public.can_access_loyalty(loyalty_account_id, auth.uid()));
create trigger loyalty_entries_updated_at before update on public.loyalty_entries for each row execute function public.update_updated_at_column();

create table if not exists public.support_cases(
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete cascade,
  reference text unique not null,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.support_cases to authenticated;
grant all on public.support_cases to service_role;
alter table public.support_cases enable row level security;
create policy "support_cases_own" on public.support_cases for all to authenticated
  using (owner_user_id = auth.uid() or public.is_org_member(organisation_id, auth.uid()))
  with check (owner_user_id = auth.uid() or public.is_org_member(organisation_id, auth.uid()));
create trigger support_cases_updated_at before update on public.support_cases for each row execute function public.update_updated_at_column();

create table if not exists public.provider_events(
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, event_id)
);
grant all on public.provider_events to service_role;
alter table public.provider_events enable row level security;
create trigger provider_events_updated_at before update on public.provider_events for each row execute function public.update_updated_at_column();

create table if not exists public.audit_logs(
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create trigger audit_logs_updated_at before update on public.audit_logs for each row execute function public.update_updated_at_column();

create index if not exists idx_accounts_owner on public.financial_accounts(owner_user_id);
create index if not exists idx_accounts_org on public.financial_accounts(organisation_id);
create index if not exists idx_pots_account on public.pots(account_id);
create index if not exists idx_cards_account on public.cards(account_id);
create index if not exists idx_tx_account_time on public.transactions(account_id, occurred_at desc);
create index if not exists idx_org_members_user on public.organisation_members(user_id);
create index if not exists idx_payment_links_merchant on public.payment_links(merchant_id);
create index if not exists idx_terminals_merchant on public.terminals(merchant_id);