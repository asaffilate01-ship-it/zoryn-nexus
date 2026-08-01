CREATE TABLE public.onboarding_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_kind text NOT NULL DEFAULT 'personal',
  subject_reference text NOT NULL,
  state text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  action_type text NOT NULL DEFAULT 'upload',
  due_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.onboarding_actions TO anon;
GRANT SELECT ON public.onboarding_actions TO authenticated;
GRANT ALL ON public.onboarding_actions TO service_role;
ALTER TABLE public.onboarding_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo onboarding actions are public" ON public.onboarding_actions FOR SELECT TO anon USING (is_demo = true);
CREATE POLICY "Authenticated can read onboarding actions" ON public.onboarding_actions FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_onboarding_actions_updated_at BEFORE UPDATE ON public.onboarding_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.provider_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'not_configured',
  latency_ms integer NOT NULL DEFAULT 0,
  last_event_at timestamptz,
  message text NOT NULL DEFAULT '',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_health TO anon;
GRANT SELECT ON public.provider_health TO authenticated;
GRANT ALL ON public.provider_health TO service_role;
ALTER TABLE public.provider_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo provider health is public" ON public.provider_health FOR SELECT TO anon USING (is_demo = true);
CREATE POLICY "Authenticated can read provider health" ON public.provider_health FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_provider_health_updated_at BEFORE UPDATE ON public.provider_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.provider_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  state text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  sort_order integer NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_scenarios TO anon;
GRANT SELECT ON public.provider_scenarios TO authenticated;
GRANT ALL ON public.provider_scenarios TO service_role;
ALTER TABLE public.provider_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo scenarios are public" ON public.provider_scenarios FOR SELECT TO anon USING (is_demo = true);
CREATE POLICY "Authenticated can read scenarios" ON public.provider_scenarios FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_provider_scenarios_updated_at BEFORE UPDATE ON public.provider_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.onboarding_actions (subject_kind, subject_reference, state, title, description, action_type, due_at, sort_order, is_demo) VALUES
 ('personal','Amer Saleem','identity_required','Identity check required','Resume the secure hosted verification with the regulated banking partner before the account can be opened.','verify',NULL,1,true),
 ('personal','Amer Saleem','document_required','One document needed','Upload proof of address issued within the last three months.','upload','2026-08-08T00:00:00Z',2,true),
 ('personal','Amer Saleem','under_review','Application under review','No action is needed. We notify the customer as soon as the regulated partner completes its review.','review',NULL,3,true),
 ('business','Nordwind Handel UG','additional_information_required','Updated shareholder register requested','The regulated partner needs an updated shareholder register before the business account is activated.','upload','2026-08-10T00:00:00Z',4,true),
 ('business','Cafe 1 Demo','account_opening','Fund the account to activate acquiring','Transfer at least EUR 1 to complete activation of the settlement account.','fund',NULL,5,true);

INSERT INTO public.provider_health (provider, status, latency_ms, last_event_at, message, is_demo) VALUES
 ('swan','not_configured',0,NULL,'Banking adapter in mock mode. Add sandbox credentials to enable live calls.',true),
 ('adyen','not_configured',0,NULL,'Acquiring adapter in mock mode. Onboarding, payments and settlement are simulated.',true),
 ('rewards','operational',84,'2026-08-01T09:12:00Z','Universal points wallet and cashback routing available.',true),
 ('mock','operational',22,'2026-08-01T09:30:00Z','Mock provider serving all demo journeys.',true);

INSERT INTO public.provider_scenarios (group_key, title, description, state, severity, sort_order, is_demo) VALUES
 ('personal','Identity verification resumed','Customer abandons hosted onboarding and returns two days later to finish verification.','identity_required','medium',1,true),
 ('personal','SEPA direct debit returned','An R-transaction arrives after booking and the balance plus category are corrected.','returned','high',2,true),
 ('personal','Lost card replacement','Card reported lost, permanently blocked, replacement ordered and shipped.','replaced','medium',3,true),
 ('personal','Duplicate webhook ignored','The same provider event id arrives twice and the second delivery is discarded.','processed','low',4,true),
 ('business','Supplier payment awaiting approval','A payment above the approval limit waits for a second approver and provider SCA.','awaiting_approval','medium',5,true),
 ('business','KYB additional information','Regulated partner requests an updated shareholder register before activation.','additional_information_required','high',6,true),
 ('pay','Chargeback opened','Cardholder disputes a contactless payment; evidence is collected within the SLA.','chargeback_opened','critical',7,true),
 ('pay','Terminal offline','Kitchen terminal drops to 14% battery and goes offline mid-service.','failed','high',8,true),
 ('admin','Webhook dead-letter triage','An unmapped card reference is replayed after the provider resource mapping is repaired.','dead_letter','critical',9,true),
 ('admin','Account restricted for review','Risk engine restricts outgoing payments while a compliance case is open.','restricted','high',10,true);

INSERT INTO public.transactions (account_id, provider, provider_reference, title, subtitle, kind, amount, currency, status, occurred_at, metadata, is_demo) VALUES
 ('c0000000-0000-4000-8000-000000000001','swan','tx_pending_dbahn','Deutsche Bahn','Card 4412 authorisation','card',-48.90,'EUR','pending','2026-07-30T12:10:00Z','{"category":"Travel","rewards_points":48}'::jsonb,true),
 ('c0000000-0000-4000-8000-000000000001','swan','tx_booked_rewe','REWE Markt','Card 4412','card',-62.35,'EUR','booked','2026-08-01T08:22:00Z','{"category":"Groceries","rewards_points":62}'::jsonb,true),
 ('c0000000-0000-4000-8000-000000000001','swan','tx_returned_stadtwerke','Stadtwerke Muenchen','SEPA direct debit R-transaction','sepa',-84.00,'EUR','returned','2026-07-29T06:00:00Z','{"category":"Utilities"}'::jsonb,true),
 ('c0000000-0000-4000-8000-000000000001','swan','tx_reversed_hotel','Hotel Adlon','Pre-authorisation released','card',-250.00,'EUR','reversed','2026-07-28T18:30:00Z','{"category":"Travel"}'::jsonb,true);

ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_card_type_check;
ALTER TABLE public.cards ADD CONSTRAINT cards_card_type_check CHECK (card_type IN ('physical','virtual','staff'));

INSERT INTO public.cards (id, account_id, provider, provider_reference, name, last_four, card_type, status, monthly_limit, spent, is_demo) VALUES
 ('e0000000-0000-4000-8000-000000000015','c0000000-0000-4000-8000-000000000002','swan','crd_staff_0031','Staff card — Cafe counter','6620','staff','active',400.00,182.40,true),
 ('e0000000-0000-4000-8000-000000000016','c0000000-0000-4000-8000-000000000001','swan','crd_replacement','Replacement card','7715','physical','shipped',2000.00,0,true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.terminals (merchant_id, provider, provider_reference, name, status, battery, last_seen_at, is_demo) VALUES
 ('11110000-0000-4000-8000-000000000001','adyen','TERM_0033','Terminal 03 — Kitchen','offline',14,'2026-08-01T11:05:00Z',true);