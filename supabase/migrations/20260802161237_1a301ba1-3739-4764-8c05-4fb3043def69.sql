-- Stage 6: final hardening

alter table public.platform_reconciliation_runs
  add column if not exists provider text;

alter table public.platform_incidents
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists follow_up text;

create table if not exists public.platform_launch_acceptance (
  id uuid primary key default gen_random_uuid(),
  release_name text not null,
  engineering_passed boolean not null default false,
  security_passed boolean not null default false,
  swan_passed boolean not null default false,
  adyen_passed boolean not null default false,
  operations_passed boolean not null default false,
  legal_passed boolean not null default false,
  pilot_passed boolean not null default false,
  approved boolean generated always as (
    engineering_passed and security_passed and swan_passed and adyen_passed
    and operations_passed and legal_passed and pilot_passed
  ) stored,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.platform_launch_acceptance to authenticated;
grant all on public.platform_launch_acceptance to service_role;
alter table public.platform_launch_acceptance enable row level security;

create policy "launch acceptance readable by admins" on public.platform_launch_acceptance
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.zoryn_role));

create trigger platform_launch_acceptance_updated_at
  before update on public.platform_launch_acceptance
  for each row execute function public.update_updated_at_column();