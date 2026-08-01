CREATE TABLE public.demo_baseline (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_name, row_id)
);

GRANT ALL ON public.demo_baseline TO service_role;

ALTER TABLE public.demo_baseline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_baseline is server only" ON public.demo_baseline FOR SELECT TO authenticated USING (false);

CREATE TRIGGER update_demo_baseline_updated_at BEFORE UPDATE ON public.demo_baseline
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'financial_accounts', id, to_jsonb(t) - 'id' FROM public.financial_accounts t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'pots', id, to_jsonb(t) - 'id' FROM public.pots t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'cards', id, to_jsonb(t) - 'id' FROM public.cards t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'transactions', id, to_jsonb(t) - 'id' FROM public.transactions t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'internal_transfers', id, to_jsonb(t) - 'id' FROM public.internal_transfers t;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'merchants', id, to_jsonb(t) - 'id' FROM public.merchants t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'terminals', id, to_jsonb(t) - 'id' FROM public.terminals t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'payment_links', id, to_jsonb(t) - 'id' FROM public.payment_links t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'loyalty_accounts', id, to_jsonb(t) - 'id' FROM public.loyalty_accounts t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'loyalty_entries', id, to_jsonb(t) - 'id' FROM public.loyalty_entries t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'support_cases', id, to_jsonb(t) - 'id' FROM public.support_cases t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'provider_events', id, to_jsonb(t) - 'id' FROM public.provider_events t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'audit_logs', id, to_jsonb(t) - 'id' FROM public.audit_logs t WHERE is_demo;
INSERT INTO public.demo_baseline (table_name, row_id, data)
SELECT 'rewards_outbox', id, to_jsonb(t) - 'id' FROM public.rewards_outbox t WHERE is_demo;