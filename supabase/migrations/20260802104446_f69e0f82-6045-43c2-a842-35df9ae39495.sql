begin;

-- ============ STAGE 1: provider workers ============
create table if not exists public.platform_provider_worker_locks (
  command_id uuid primary key references public.platform_provider_commands(id) on delete cascade,
  locked_by text not null,
  locked_at timestamptz not null default now(),
  expires_at timestamptz not null
);
grant select on public.platform_provider_worker_locks to authenticated;
grant all on public.platform_provider_worker_locks to service_role;
alter table public.platform_provider_worker_locks enable row level security;
create policy worker_locks_admin_read on public.platform_provider_worker_locks
  for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table if not exists public.platform_provider_alerts (
  id uuid primary key default gen_random_uuid(),
  provider text check (provider in ('swan','adyen','rewards')),
  severity text not null check (severity in ('info','warning','critical')),
  alert_type text not null,
  title text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
grant select on public.platform_provider_alerts to authenticated;
grant all on public.platform_provider_alerts to service_role;
alter table public.platform_provider_alerts enable row level security;
create policy provider_alerts_admin_read on public.platform_provider_alerts
  for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.platform_claim_provider_commands(
  p_worker_id text,
  p_limit integer default 25
)
returns setof public.platform_provider_commands
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select c.id
    from public.platform_provider_commands c
    left join public.platform_provider_worker_locks l on l.command_id = c.id
    where c.status in ('queued','failed')
      and (c.next_attempt_at is null or c.next_attempt_at <= now())
      and (l.command_id is null or l.expires_at <= now())
    order by c.created_at
    for update of c skip locked
    limit greatest(1, least(p_limit,100))
  ),
  locked as (
    insert into public.platform_provider_worker_locks(command_id, locked_by, expires_at)
    select id, p_worker_id, now() + interval '5 minutes'
    from candidates
    on conflict (command_id) do update
      set locked_by = excluded.locked_by,
          locked_at = now(),
          expires_at = excluded.expires_at
    returning command_id
  )
  update public.platform_provider_commands c
  set status='processing',
      attempt_count=c.attempt_count+1
  from locked l
  where c.id=l.command_id
  returning c.*;
end;
$$;
revoke all on function public.platform_claim_provider_commands(text,integer) from public, anon, authenticated;
grant execute on function public.platform_claim_provider_commands(text,integer) to service_role;

create or replace function public.platform_complete_provider_command(
  p_command_id uuid,
  p_status text,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.platform_provider_commands
  set status = case
      when p_status='succeeded' then 'succeeded'
      when attempt_count >= 5 then 'dead_letter'
      else 'failed'
    end,
    last_error = p_error,
    next_attempt_at = case
      when p_status='succeeded' then null
      when attempt_count >= 5 then null
      else now() + make_interval(mins => least(60, attempt_count * attempt_count))
    end,
    processed_at = case when p_status='succeeded' then now() else processed_at end
  where id=p_command_id;

  delete from public.platform_provider_worker_locks where command_id=p_command_id;
end;
$$;
revoke all on function public.platform_complete_provider_command(uuid,text,text) from public, anon, authenticated;
grant execute on function public.platform_complete_provider_command(uuid,text,text) to service_role;

-- ============ STAGE 2: core persistence ============
create table if not exists public.platform_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  locale text not null default 'de-DE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  legal_form text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_organisation_members (
  organisation_id uuid not null references public.platform_organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organisation_id,user_id)
);

create or replace function public.platform_is_org_member(_org_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_organisation_members m
    where m.organisation_id = _org_id and m.user_id = _user_id and m.status = 'active'
  );
$$;

create table if not exists public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.platform_organisations(id) on delete cascade,
  account_type text not null,
  iban text,
  currency text not null default 'EUR',
  available_balance_minor bigint not null default 0,
  booked_balance_minor bigint not null default 0,
  status text not null default 'opening',
  provider text,
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.platform_can_access_account(_account_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_accounts a
    where a.id = _account_id
      and (a.owner_user_id = _user_id or public.platform_is_org_member(a.organisation_id, _user_id))
  );
$$;

create or replace function public.platform_owns_account(_account_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_accounts a
    where a.id = _account_id and a.owner_user_id = _user_id
  );
$$;

create table if not exists public.platform_pots (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.platform_accounts(id) on delete cascade,
  name text not null,
  balance_minor bigint not null default 0,
  target_minor bigint,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_beneficiaries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.platform_organisations(id) on delete cascade,
  name text not null,
  iban text not null,
  bic text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_transfers (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.platform_accounts(id) on delete cascade,
  beneficiary_id uuid references public.platform_beneficiaries(id) on delete set null,
  amount_minor bigint not null,
  currency text not null default 'EUR',
  reference text,
  status text not null default 'draft',
  idempotency_key text not null unique,
  provider_external_id text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_cards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.platform_accounts(id) on delete cascade,
  cardholder_user_id uuid references auth.users(id),
  card_type text not null check (card_type in ('physical','virtual','staff')),
  last_four text,
  status text not null default 'ordered',
  spending_limit_minor bigint,
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_merchants (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.platform_organisations(id) on delete cascade,
  display_name text not null,
  status text not null default 'onboarding',
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.platform_can_access_merchant(_merchant_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_merchants m
    where m.id = _merchant_id and public.platform_is_org_member(m.organisation_id, _user_id)
  );
$$;

create table if not exists public.platform_payments (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.platform_merchants(id) on delete cascade,
  amount_minor bigint not null,
  currency text not null default 'EUR',
  status text not null default 'created',
  provider_external_id text,
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_settlements (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.platform_merchants(id) on delete cascade,
  gross_minor bigint not null default 0,
  fees_minor bigint not null default 0,
  refunds_minor bigint not null default 0,
  net_minor bigint not null default 0,
  status text not null default 'pending',
  provider_external_id text,
  expected_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.platform_profiles to authenticated;
grant select on public.platform_organisations to authenticated;
grant select on public.platform_organisation_members to authenticated;
grant select on public.platform_accounts to authenticated;
grant select, insert, update, delete on public.platform_pots to authenticated;
grant select, insert, update, delete on public.platform_beneficiaries to authenticated;
grant select, insert on public.platform_transfers to authenticated;
grant select on public.platform_cards to authenticated;
grant select on public.platform_merchants to authenticated;
grant select on public.platform_payments to authenticated;
grant select on public.platform_settlements to authenticated;
grant all on public.platform_profiles, public.platform_organisations, public.platform_organisation_members,
  public.platform_accounts, public.platform_pots, public.platform_beneficiaries, public.platform_transfers,
  public.platform_cards, public.platform_merchants, public.platform_payments, public.platform_settlements
  to service_role;

alter table public.platform_profiles enable row level security;
alter table public.platform_organisations enable row level security;
alter table public.platform_organisation_members enable row level security;
alter table public.platform_accounts enable row level security;
alter table public.platform_pots enable row level security;
alter table public.platform_beneficiaries enable row level security;
alter table public.platform_transfers enable row level security;
alter table public.platform_cards enable row level security;
alter table public.platform_merchants enable row level security;
alter table public.platform_payments enable row level security;
alter table public.platform_settlements enable row level security;

create policy platform_profiles_own on public.platform_profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy platform_orgs_member_read on public.platform_organisations for select to authenticated
  using (public.platform_is_org_member(id, auth.uid()));

create policy platform_org_members_read on public.platform_organisation_members for select to authenticated
  using (user_id = auth.uid() or public.platform_is_org_member(organisation_id, auth.uid()));

create policy platform_accounts_read on public.platform_accounts for select to authenticated
  using (owner_user_id = auth.uid() or public.platform_is_org_member(organisation_id, auth.uid()));

create policy platform_pots_read on public.platform_pots for select to authenticated
  using (public.platform_can_access_account(account_id, auth.uid()));
create policy platform_pots_write on public.platform_pots for insert to authenticated
  with check (public.platform_owns_account(account_id, auth.uid()));
create policy platform_pots_update on public.platform_pots for update to authenticated
  using (public.platform_owns_account(account_id, auth.uid()))
  with check (public.platform_owns_account(account_id, auth.uid()));
create policy platform_pots_delete on public.platform_pots for delete to authenticated
  using (public.platform_owns_account(account_id, auth.uid()));

create policy platform_beneficiaries_read on public.platform_beneficiaries for select to authenticated
  using (owner_user_id = auth.uid() or public.platform_is_org_member(organisation_id, auth.uid()));
create policy platform_beneficiaries_write on public.platform_beneficiaries for insert to authenticated
  with check (owner_user_id = auth.uid());
create policy platform_beneficiaries_update on public.platform_beneficiaries for update to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy platform_beneficiaries_delete on public.platform_beneficiaries for delete to authenticated
  using (owner_user_id = auth.uid());

create policy platform_transfers_read on public.platform_transfers for select to authenticated
  using (public.platform_can_access_account(account_id, auth.uid()));
create policy platform_transfers_insert on public.platform_transfers for insert to authenticated
  with check (public.platform_owns_account(account_id, auth.uid()) and created_by = auth.uid());

create policy platform_cards_read on public.platform_cards for select to authenticated
  using (cardholder_user_id = auth.uid() or public.platform_can_access_account(account_id, auth.uid()));

create policy platform_merchants_read on public.platform_merchants for select to authenticated
  using (public.platform_is_org_member(organisation_id, auth.uid()));

create policy platform_payments_read on public.platform_payments for select to authenticated
  using (public.platform_can_access_merchant(merchant_id, auth.uid()));

create policy platform_settlements_read on public.platform_settlements for select to authenticated
  using (public.platform_can_access_merchant(merchant_id, auth.uid()));

-- ============ STAGE 3: notifications and operations ============
create table if not exists public.platform_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.platform_organisations(id) on delete set null,
  channel text not null check (channel in ('email','push','in_app','sms')),
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.platform_support_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  organisation_id uuid references public.platform_organisations(id) on delete set null,
  case_type text not null,
  priority text not null default 'normal',
  status text not null default 'open',
  subject text not null,
  description text,
  assigned_to uuid references auth.users(id),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.platform_incidents (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('minor','major','critical')),
  status text not null default 'open',
  title text not null,
  summary text,
  provider text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.platform_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  status text not null,
  expected_minor bigint not null default 0,
  actual_minor bigint not null default 0,
  difference_minor bigint generated always as (actual_minor-expected_minor) stored,
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

grant select on public.platform_notification_outbox to authenticated;
grant select, insert on public.platform_support_cases to authenticated;
grant select on public.platform_incidents to authenticated;
grant select on public.platform_reconciliation_runs to authenticated;
grant all on public.platform_notification_outbox, public.platform_support_cases,
  public.platform_incidents, public.platform_reconciliation_runs to service_role;

alter table public.platform_notification_outbox enable row level security;
alter table public.platform_support_cases enable row level security;
alter table public.platform_incidents enable row level security;
alter table public.platform_reconciliation_runs enable row level security;

create policy platform_notifications_read on public.platform_notification_outbox for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy platform_support_cases_read on public.platform_support_cases for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy platform_support_cases_insert on public.platform_support_cases for insert to authenticated
  with check (user_id = auth.uid());

create policy platform_incidents_read on public.platform_incidents for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy platform_reconciliation_read on public.platform_reconciliation_runs for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- updated_at triggers
create trigger trg_platform_profiles_updated before update on public.platform_profiles
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_organisations_updated before update on public.platform_organisations
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_org_members_updated before update on public.platform_organisation_members
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_accounts_updated before update on public.platform_accounts
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_pots_updated before update on public.platform_pots
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_beneficiaries_updated before update on public.platform_beneficiaries
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_transfers_updated before update on public.platform_transfers
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_cards_updated before update on public.platform_cards
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_merchants_updated before update on public.platform_merchants
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_payments_updated before update on public.platform_payments
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_settlements_updated before update on public.platform_settlements
  for each row execute function public.update_updated_at_column();
create trigger trg_platform_support_cases_updated before update on public.platform_support_cases
  for each row execute function public.update_updated_at_column();

commit;