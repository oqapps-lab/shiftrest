-- 005_subscriptions_and_ai.sql

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  adapty_profile_id text,
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'trial', 'active', 'expired', 'cancelled', 'grace_period')),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium_monthly', 'premium_annual')),
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancellation_date timestamptz,
  store text CHECK (store IN ('app_store', 'google_play')),
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('sleep_plan', 'transition_plan')),
  prompt text NOT NULL,
  response jsonb,
  model text NOT NULL,
  tokens_input integer NOT NULL DEFAULT 0 CHECK (tokens_input >= 0),
  tokens_output integer NOT NULL DEFAULT 0 CHECK (tokens_output >= 0),
  cost_cents smallint NOT NULL DEFAULT 0 CHECK (cost_cents >= 0),
  duration_ms integer,
  status text NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sleep_plans
  DROP CONSTRAINT IF EXISTS fk_sleep_plans_ai_request;
ALTER TABLE public.sleep_plans
  ADD CONSTRAINT fk_sleep_plans_ai_request
  FOREIGN KEY (ai_request_id) REFERENCES public.ai_requests(id)
  ON DELETE SET NULL;

ALTER TABLE public.transition_plans
  DROP CONSTRAINT IF EXISTS fk_transition_plans_ai_request;
ALTER TABLE public.transition_plans
  ADD CONSTRAINT fk_transition_plans_ai_request
  FOREIGN KEY (ai_request_id) REFERENCES public.ai_requests(id)
  ON DELETE SET NULL;
