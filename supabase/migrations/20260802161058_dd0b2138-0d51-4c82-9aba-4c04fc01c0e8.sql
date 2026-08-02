-- Stage 4: acquiring persistence

alter table public.platform_merchants
  add column if not exists legal_name text,
  add column if not exists trading_name text,
  add column if not exists category_code text;

create table if not exists public.platform_stores (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.platform_merchants(id) on delete cascade,
  name text not null,
  address jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.platform_stores to authenticated;
grant all on public.platform_stores to service_role;
alter table public.platform_stores enable row level security;
create policy "stores readable by merchant members" on public.platform_stores
  for select to authenticated
  using (public.platform_can_access_merchant(merchant_id, auth.uid()));
create trigger platform_stores_updated_at before update on public.platform_stores
  for each row execute function public.update_updated_at_column();

create table if not exists public.platform_payment_links (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.platform_merchants(id) on delete cascade,
  label text,
  amount_minor bigint,
  currency text not null default 'EUR',
  status text not null default 'active',
  expires_at timestamptz,
  provider_external_id text,
  public_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.platform_payment_links to authenticated;
grant all on public.platform_payment_links to service_role;
alter table public.platform_payment_links enable row level security;
create policy "payment links readable by merchant members" on public.platform_payment_links
  for select to authenticated
  using (public.platform_can_access_merchant(merchant_id, auth.uid()));
create trigger platform_payment_links_updated_at before update on public.platform_payment_links
  for each row execute function public.update_updated_at_column();

alter table public.platform_payments
  add column if not exists store_id uuid references public.platform_stores(id) on delete set null,
  add column if not exists payment_method text,
  add column if not exists captured_minor bigint not null default 0,
  add column if not exists refunded_minor bigint not null default 0;

create table if not exists public.platform_refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.platform_payments(id) on delete cascade,
  amount_minor bigint not null,
  status text not null default 'submitted',
  reason text,
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_refunds_payment_idx on public.platform_refunds (payment_id);
grant select on public.platform_refunds to authenticated;
grant all on public.platform_refunds to service_role;
alter table public.platform_refunds enable row level security;
create policy "refunds readable by merchant members" on public.platform_refunds
  for select to authenticated
  using (
    exists (
      select 1 from public.platform_payments p
      where p.id = payment_id and public.platform_can_access_merchant(p.merchant_id, auth.uid())
    )
  );
create trigger platform_refunds_updated_at before update on public.platform_refunds
  for each row execute function public.update_updated_at_column();

create table if not exists public.platform_chargebacks (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.platform_payments(id) on delete cascade,
  amount_minor bigint not null,
  status text not null default 'opened',
  reason text,
  defence_due_at timestamptz,
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_chargebacks_payment_idx on public.platform_chargebacks (payment_id);
grant select on public.platform_chargebacks to authenticated;
grant all on public.platform_chargebacks to service_role;
alter table public.platform_chargebacks enable row level security;
create policy "chargebacks readable by merchant members" on public.platform_chargebacks
  for select to authenticated
  using (
    exists (
      select 1 from public.platform_payments p
      where p.id = payment_id and public.platform_can_access_merchant(p.merchant_id, auth.uid())
    )
  );
create trigger platform_chargebacks_updated_at before update on public.platform_chargebacks
  for each row execute function public.update_updated_at_column();

alter table public.platform_settlements
  add column if not exists chargebacks_minor bigint not null default 0;

create table if not exists public.platform_terminals (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.platform_merchants(id) on delete cascade,
  store_id uuid references public.platform_stores(id) on delete set null,
  name text,
  terminal_type text not null check (terminal_type in ('physical','tap_to_pay')),
  status text not null default 'unregistered',
  battery_percent integer,
  last_seen_at timestamptz,
  device_reference text,
  provider_external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.platform_terminals to authenticated;
grant all on public.platform_terminals to service_role;
alter table public.platform_terminals enable row level security;
create policy "terminals readable by merchant members" on public.platform_terminals
  for select to authenticated
  using (public.platform_can_access_merchant(merchant_id, auth.uid()));
create trigger platform_terminals_updated_at before update on public.platform_terminals
  for each row execute function public.update_updated_at_column();