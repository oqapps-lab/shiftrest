-- 003_schedule_tables.sql

CREATE TABLE IF NOT EXISTS public.shift_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  profession text NOT NULL DEFAULT 'all' CHECK (profession IN ('nurse', 'firefighter', 'factory', 'all')),
  pattern jsonb NOT NULL,
  cycle_days smallint NOT NULL CHECK (cycle_days > 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS shift_templates_updated_at ON public.shift_templates;
CREATE TRIGGER shift_templates_updated_at
  BEFORE UPDATE ON public.shift_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.user_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.shift_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  repeat_weeks smallint NOT NULL DEFAULT 4 CHECK (repeat_weeks BETWEEN 1 AND 12),
  custom_pattern jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT end_after_start CHECK (end_date >= start_date)
);

ALTER TABLE public.user_schedules ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS user_schedules_updated_at ON public.user_schedules;
CREATE TRIGGER user_schedules_updated_at
  BEFORE UPDATE ON public.user_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES public.user_schedules(id) ON DELETE SET NULL,
  date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  shift_type text NOT NULL CHECK (shift_type IN ('day', 'night')),
  is_manual boolean NOT NULL DEFAULT false,
  is_overtime boolean NOT NULL DEFAULT false,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shifts_end_after_start CHECK (end_time > start_time)
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS shifts_updated_at ON public.shifts;
CREATE TRIGGER shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
