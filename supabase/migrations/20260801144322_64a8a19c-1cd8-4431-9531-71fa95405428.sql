CREATE TABLE public.rewards_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  tenant_slug text NOT NULL DEFAULT 'zoryn',
  provider text NOT NULL DEFAULT 'zoryn',
  provider_reference text NOT NULL,
  platform_user_id uuid,
  loyalty_account_id uuid REFERENCES public.loyalty_accounts(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  points bigint NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'EUR',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rewards_outbox_status_check CHECK (status IN ('pending','delivering','delivered','retrying','failed','skipped')),
  CONSTRAINT rewards_outbox_unique_ref UNIQUE (provider, provider_reference, event_type)
);

GRANT SELECT ON public.rewards_outbox TO anon;
GRANT SELECT ON public.rewards_outbox TO authenticated;
GRANT ALL ON public.rewards_outbox TO service_role;

ALTER TABLE public.rewards_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo rewards outbox is readable"
  ON public.rewards_outbox FOR SELECT
  USING (is_demo = true);

CREATE TRIGGER update_rewards_outbox_updated_at
  BEFORE UPDATE ON public.rewards_outbox
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX rewards_outbox_pending_idx ON public.rewards_outbox (status, next_attempt_at);

ALTER TABLE public.loyalty_entries
  ADD COLUMN idempotency_key text,
  ADD COLUMN transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  ADD COLUMN source text NOT NULL DEFAULT 'manual';

CREATE UNIQUE INDEX loyalty_entries_idempotency_key_idx
  ON public.loyalty_entries (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.provider_events
  ADD COLUMN next_attempt_at timestamptz;

CREATE INDEX provider_events_retry_idx
  ON public.provider_events (status, next_attempt_at);