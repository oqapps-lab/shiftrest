-- 002_base_tables.sql

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  profession text CHECK (profession IN ('nurse', 'firefighter', 'factory', 'other')),
  chronotype_score smallint,
  chronotype text CHECK (chronotype IN ('lark', 'owl', 'intermediate')),
  caffeine_cups_per_day smallint CHECK (caffeine_cups_per_day BETWEEN 0 AND 20),
  caffeine_type text CHECK (caffeine_type IN ('coffee', 'tea', 'energy_drink')),
  caffeine_sensitivity text CHECK (caffeine_sensitivity IN ('normal', 'slow', 'unknown')),
  uses_melatonin boolean,
  melatonin_dose_mg numeric(3,1),
  has_children boolean,
  family_commitments jsonb DEFAULT '[]',
  commute_minutes smallint NOT NULL DEFAULT 30 CHECK (commute_minutes BETWEEN 0 AND 180),
  main_problem text CHECK (main_problem IN ('cant_sleep', 'transition', 'fatigue', 'caffeine')),
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_step smallint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled boolean NOT NULL DEFAULT true,
  notify_sleep_reminder boolean NOT NULL DEFAULT true,
  notify_sleep_reminder_minutes smallint NOT NULL DEFAULT 30 CHECK (notify_sleep_reminder_minutes BETWEEN 5 AND 120),
  notify_caffeine_cutoff boolean NOT NULL DEFAULT true,
  notify_melatonin boolean NOT NULL DEFAULT true,
  notify_dark_glasses boolean NOT NULL DEFAULT true,
  notify_transition_steps boolean NOT NULL DEFAULT true,
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language text NOT NULL DEFAULT 'en',
  timezone text,
  expo_push_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.sleep_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak smallint NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak smallint NOT NULL DEFAULT 0,
  last_streak_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT longest_gte_current CHECK (longest_streak >= current_streak)
);

ALTER TABLE public.sleep_streaks ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS sleep_streaks_updated_at ON public.sleep_streaks;
CREATE TRIGGER sleep_streaks_updated_at
  BEFORE UPDATE ON public.sleep_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
