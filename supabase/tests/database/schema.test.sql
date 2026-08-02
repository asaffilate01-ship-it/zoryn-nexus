-- Stage 4 — schema release gate.
-- Runs on a local `supabase db reset` in CI. Every assertion raises an
-- exception on failure, so a red run blocks the release.

do $$
declare
  t text;
  missing text[] := '{}';
begin
  foreach t in array array[
    'platform_profiles','platform_organisations','platform_organisation_members',
    'platform_accounts','platform_pots','platform_beneficiaries','platform_transfers',
    'platform_cards','platform_merchants','platform_payments','platform_settlements',
    'platform_provider_connections','platform_provider_resources','platform_provider_commands',
    'platform_provider_events','platform_provider_worker_locks','platform_provider_alerts',
    'platform_onboarding_cases','platform_audit_events','platform_notification_outbox',
    'platform_support_cases','platform_incidents','platform_reconciliation_runs'
  ]
  loop
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      missing := missing || t;
    end if;
  end loop;

  if array_length(missing, 1) is not null then
    raise exception 'missing tables: %', missing;
  end if;
end $$;

-- Every public table must have row level security enabled.
do $$
declare
  unsecured text[];
begin
  select array_agg(c.relname)
  into unsecured
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

  if unsecured is not null then
    raise exception 'tables without RLS: %', unsecured;
  end if;
end $$;

-- Command and event queues need their idempotency constraints.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'platform_provider_commands'
      and indexdef ilike '%unique%idempotency_key%'
  ) then
    raise exception 'platform_provider_commands is missing the unique idempotency_key index';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'platform_provider_events'
      and indexdef ilike '%unique%provider%event_id%'
  ) then
    raise exception 'platform_provider_events is missing the unique (provider, event_id) index';
  end if;
end $$;

-- Worker routines must exist and be security definer.
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'platform_claim_provider_commands',
    'platform_complete_provider_command',
    'has_role',
    'check_rate_limit'
  ]
  loop
    if not exists (
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = fn and p.prosecdef
    ) then
      raise exception 'missing security definer function: %', fn;
    end if;
  end loop;
end $$;

-- Data API grants: any table with policies must be reachable by authenticated.
do $$
declare
  ungranted text[];
begin
  select array_agg(distinct c.relname)
  into ungranted
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join pg_policy pol on pol.polrelid = c.oid
  where n.nspname = 'public'
    and not has_table_privilege('authenticated', c.oid, 'SELECT');

  if ungranted is not null then
    raise exception 'tables with policies but no authenticated grant: %', ungranted;
  end if;
end $$;

select 'schema gates passed' as result;
