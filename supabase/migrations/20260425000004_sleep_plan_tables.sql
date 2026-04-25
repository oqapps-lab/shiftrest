-- 004_sleep_plan_tables.sql

CREATE TABLE IF NOT EXISTS public.sleep_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  date date NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('work_day', 'day_off', 'transition')),
  sleep_start timestamptz NOT NULL,
  sleep_end timestamptz NOT NULL,
  sleep_duration_minutes smallint NOT NULL CHECK (sleep_duration_minutes BETWEEN 60 AND 840),
  caffeine_cutoff_at timestamptz,
  melatonin_at timestamptz,
  melatonin_dose_mg numeric(3,1),
  melatonin_type text CHECK (melatonin_type IN ('phase_advance', 'phase_delay')),
  nap_start timestamptz,
  nap_end timestamptz,
  wind_down_start timestamptz,
  explanation text,
  generation_method text NOT NULL DEFAULT 'rule_based' CHECK (generation_method IN ('ai', 'rule_based')),
  ai_request_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sleep_plans ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS sleep_plans_updated_at ON public.sleep_plans;
CREATE TRIGGER sleep_plans_updated_at
  BEFORE UPDATE ON public.sleep_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_sleep_plans_user_date_unique
  ON public.sleep_plans (user_id, date)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.transition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transition_type text NOT NULL CHECK (transition_type IN ('night_to_day', 'day_to_night')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days smallint NOT NULL CHECK (total_days BETWEEN 1 AND 5),
  total_steps smallint NOT NULL,
  completed_steps smallint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  generation_method text NOT NULL DEFAULT 'rule_based' CHECK (generation_method IN ('ai', 'rule_based')),
  ai_request_id uuid,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transition_plans_end_after_start CHECK (end_date >= start_date),
  CONSTRAINT transition_plans_steps_valid CHECK (completed_steps <= total_steps)
);

ALTER TABLE public.transition_plans ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS transition_plans_updated_at ON public.transition_plans;
CREATE TRIGGER transition_plans_updated_at
  BEFORE UPDATE ON public.transition_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.transition_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.transition_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number smallint NOT NULL CHECK (day_number > 0),
  step_order smallint NOT NULL CHECK (step_order > 0),
  scheduled_time timestamptz NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('dark_glasses', 'melatonin', 'sleep', 'wake', 'light_seek', 'light_avoid', 'nap', 'custom')),
  title text NOT NULL,
  description text,
  explanation text,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transition_steps ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS transition_steps_updated_at ON public.transition_steps;
CREATE TRIGGER transition_steps_updated_at
  BEFORE UPDATE ON public.transition_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
