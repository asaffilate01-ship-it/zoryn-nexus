CREATE TABLE public.provider_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  resource_type text NOT NULL,
  provider_id text NOT NULL,
  zoryn_id uuid,
  zoryn_reference text,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, resource_type, provider_id)
);

GRANT SELECT ON public.provider_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_resources TO authenticated;
GRANT ALL ON public.provider_resources TO service_role;

ALTER TABLE public.provider_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo provider resources are public" ON public.provider_resources
  FOR SELECT TO anon USING (is_demo = true);
CREATE POLICY "Authenticated can read provider resources" ON public.provider_resources
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can write provider resources" ON public.provider_resources
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_provider_resources_updated_at
  BEFORE UPDATE ON public.provider_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.provider_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS error text,
  ADD COLUMN IF NOT EXISTS resource_id text,
  ADD COLUMN IF NOT EXISTS occurred_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS provider_events_provider_event_id_key
  ON public.provider_events (provider, event_id);

INSERT INTO public.provider_resources (provider, resource_type, provider_id, zoryn_reference, is_demo) VALUES
  ('swan','account_holder','ah_9f21','Lena Hoffmann', true),
  ('swan','account','acc_44a1','DE89 3704 0044 0532 0130 00', true),
  ('swan','card','crd_4821','Zoryn Metal', true),
  ('adyen','account_holder','AH_CAFE1','Cafe Berlin Mitte', true),
  ('adyen','store','ST_MITTE','Mitte store', true),
  ('adyen','terminal','TERM_0031','Mitte counter', true),
  ('rewards','wallet','rw_1180','Personal rewards wallet', true)
ON CONFLICT (provider, resource_type, provider_id) DO NOTHING;

INSERT INTO public.provider_events (provider, event_id, event_type, resource_id, status, attempts, error, occurred_at, payload, is_demo) VALUES
  ('swan','evt_ah_9f21_1','AccountHolder.Updated','ah_9f21','processed',1,NULL,'2026-08-01T09:12:00Z','{"provider":"swan"}'::jsonb,true),
  ('adyen','evt_pay_88213','AUTHORISATION','pay_88213','processed',1,NULL,'2026-08-01T09:02:00Z','{"provider":"adyen"}'::jsonb,true),
  ('adyen','evt_report_20260801','REPORT_AVAILABLE','settlement_2026_08_01','retrying',3,'Downstream settlement import timed out (retry in 5m).','2026-08-01T08:40:00Z','{"provider":"adyen"}'::jsonb,true),
  ('swan','evt_card_9034','Card.Suspended','crd_9034','dead_letter',6,'Unknown card reference — resource mapping missing.','2026-07-31T21:15:00Z','{"provider":"swan"}'::jsonb,true)
ON CONFLICT (provider, event_id) DO NOTHING;