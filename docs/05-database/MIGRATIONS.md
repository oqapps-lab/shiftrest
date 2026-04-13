# Migrations — ShiftRest
**Дата: 13 апреля 2026**

> Идемпотентные SQL-миграции для Supabase (PostgreSQL). Выполняются последовательно.

---

## Порядок миграций

| # | Файл | Содержание |
|---|------|-----------|
| 001 | Функции и триггеры | `update_updated_at()`, `handle_new_user()` |
| 002 | Базовые таблицы | profiles, user_settings, sleep_streaks |
| 003 | Расписание | shift_templates, user_schedules, shifts |
| 004 | Планы сна | sleep_plans, transition_plans, transition_steps |
| 005 | Подписки и AI | subscriptions, ai_requests |
| 006 | Индексы | Все неавтоматические индексы |
| 007 | RLS-политики | Все политики |
| 008 | Seed-данные | Шаблоны ротаций |

---

## Миграция 001: Функции и триггеры

```sql
-- 001_functions_and_triggers.sql

-- Функция автообновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция автосоздания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);

  INSERT INTO public.sleep_streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Миграция 002: Базовые таблицы

```sql
-- 002_base_tables.sql

-- Profiles
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

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- User Settings
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

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Sleep Streaks
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

CREATE TRIGGER sleep_streaks_updated_at
  BEFORE UPDATE ON public.sleep_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Миграция 003: Расписание

```sql
-- 003_schedule_tables.sql

-- Shift Templates (справочник)
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

CREATE TRIGGER shift_templates_updated_at
  BEFORE UPDATE ON public.shift_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- User Schedules
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

CREATE TRIGGER user_schedules_updated_at
  BEFORE UPDATE ON public.user_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Shifts
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
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Миграция 004: Планы сна

```sql
-- 004_sleep_plan_tables.sql

-- Sleep Plans
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

CREATE TRIGGER sleep_plans_updated_at
  BEFORE UPDATE ON public.sleep_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Уникальный план на дату (с учётом мягкого удаления)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sleep_plans_user_date_unique
  ON public.sleep_plans (user_id, date)
  WHERE deleted_at IS NULL;

-- Transition Plans
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
  CONSTRAINT end_after_start CHECK (end_date >= start_date),
  CONSTRAINT steps_valid CHECK (completed_steps <= total_steps)
);

ALTER TABLE public.transition_plans ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER transition_plans_updated_at
  BEFORE UPDATE ON public.transition_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Transition Steps
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

CREATE TRIGGER transition_steps_updated_at
  BEFORE UPDATE ON public.transition_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Миграция 005: Подписки и AI

```sql
-- 005_subscriptions_and_ai.sql

-- Subscriptions
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

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- AI Requests (лог)
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

-- Добавляем FK для ai_request_id (теперь таблица ai_requests существует)
ALTER TABLE public.sleep_plans
  ADD CONSTRAINT fk_sleep_plans_ai_request
  FOREIGN KEY (ai_request_id) REFERENCES public.ai_requests(id)
  ON DELETE SET NULL;

ALTER TABLE public.transition_plans
  ADD CONSTRAINT fk_transition_plans_ai_request
  FOREIGN KEY (ai_request_id) REFERENCES public.ai_requests(id)
  ON DELETE SET NULL;
```

---

## Миграция 006: Индексы

```sql
-- 006_indexes.sql

-- Shifts
CREATE INDEX IF NOT EXISTS idx_shifts_user_date
  ON public.shifts (user_id, date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_user_range
  ON public.shifts (user_id, start_time, end_time)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_schedule
  ON public.shifts (schedule_id)
  WHERE schedule_id IS NOT NULL;

-- User Schedules
CREATE INDEX IF NOT EXISTS idx_user_schedules_user_id
  ON public.user_schedules (user_id);

CREATE INDEX IF NOT EXISTS idx_user_schedules_active
  ON public.user_schedules (user_id)
  WHERE is_active = true;

-- Sleep Plans
CREATE INDEX IF NOT EXISTS idx_sleep_plans_shift
  ON public.sleep_plans (shift_id)
  WHERE shift_id IS NOT NULL;

-- Transition Plans
CREATE INDEX IF NOT EXISTS idx_transition_plans_user_status
  ON public.transition_plans (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transition_plans_user_dates
  ON public.transition_plans (user_id, start_date, end_date)
  WHERE deleted_at IS NULL;

-- Transition Steps
CREATE INDEX IF NOT EXISTS idx_transition_steps_plan
  ON public.transition_steps (plan_id, day_number, step_order);

CREATE INDEX IF NOT EXISTS idx_transition_steps_user
  ON public.transition_steps (user_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_adapty_profile_id
  ON public.subscriptions (adapty_profile_id)
  WHERE adapty_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions (status)
  WHERE status != 'free';

-- AI Requests
CREATE INDEX IF NOT EXISTS idx_ai_requests_user
  ON public.ai_requests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_requests_status
  ON public.ai_requests (status, created_at DESC)
  WHERE status != 'success';

-- Shift Templates
CREATE INDEX IF NOT EXISTS idx_shift_templates_profession
  ON public.shift_templates (profession)
  WHERE is_active = true;
```

---

## Миграция 007: RLS-политики

```sql
-- 007_rls_policies.sql

-- ============================================================
-- profiles
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- user_settings
-- ============================================================
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: только через service_role (Adapty webhook)

-- ============================================================
-- shift_templates (публичное чтение)
-- ============================================================
CREATE POLICY "Anyone can read active templates"
  ON public.shift_templates FOR SELECT
  USING (is_active = true);

-- INSERT/UPDATE/DELETE: только через service_role

-- ============================================================
-- user_schedules
-- ============================================================
CREATE POLICY "Users can view own schedules"
  ON public.user_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON public.user_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON public.user_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON public.user_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- shifts
-- ============================================================
CREATE POLICY "Users can view own shifts"
  ON public.shifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shifts"
  ON public.shifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts"
  ON public.shifts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts"
  ON public.shifts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- sleep_plans
-- ============================================================
CREATE POLICY "Users can view own sleep plans"
  ON public.sleep_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep plans"
  ON public.sleep_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep plans"
  ON public.sleep_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep plans"
  ON public.sleep_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- transition_plans
-- ============================================================
CREATE POLICY "Users can view own transition plans"
  ON public.transition_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transition plans"
  ON public.transition_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transition plans"
  ON public.transition_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transition plans"
  ON public.transition_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- transition_steps
-- ============================================================
CREATE POLICY "Users can view own transition steps"
  ON public.transition_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transition steps"
  ON public.transition_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transition steps"
  ON public.transition_steps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transition steps"
  ON public.transition_steps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- sleep_streaks
-- ============================================================
CREATE POLICY "Users can view own streaks"
  ON public.sleep_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.sleep_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.sleep_streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ai_requests
-- ============================================================
CREATE POLICY "Users can view own ai requests"
  ON public.ai_requests FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: только через service_role (Edge Function)
```

---

## Миграция 008: Seed-данные

```sql
-- 008_seed_shift_templates.sql

INSERT INTO public.shift_templates (name, slug, description, profession, pattern, cycle_days, sort_order)
VALUES
  -- Медсёстры
  (
    '3x12 Night',
    '3x12-night',
    '3 ночных по 12 часов, 4 выходных',
    'nurse',
    '{"cycle": [
      {"type": "night", "start": "19:00", "end": "07:00"},
      {"type": "night", "start": "19:00", "end": "07:00"},
      {"type": "night", "start": "19:00", "end": "07:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    7,
    10
  ),
  (
    '3x12 Day',
    '3x12-day',
    '3 дневных по 12 часов, 4 выходных',
    'nurse',
    '{"cycle": [
      {"type": "day", "start": "07:00", "end": "19:00"},
      {"type": "day", "start": "07:00", "end": "19:00"},
      {"type": "day", "start": "07:00", "end": "19:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    7,
    11
  ),
  (
    '3x12 Rotating',
    '3x12-rotating',
    '3 дневных, 4 выходных, 3 ночных, 4 выходных',
    'nurse',
    '{"cycle": [
      {"type": "day", "start": "07:00", "end": "19:00"},
      {"type": "day", "start": "07:00", "end": "19:00"},
      {"type": "day", "start": "07:00", "end": "19:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "night", "start": "19:00", "end": "07:00"},
      {"type": "night", "start": "19:00", "end": "07:00"},
      {"type": "night", "start": "19:00", "end": "07:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    14,
    12
  ),

  -- Пожарные / EMS
  (
    '24/48',
    '24-48',
    '24 часа на дежурстве, 48 часов выходных',
    'firefighter',
    '{"cycle": [
      {"type": "day", "start": "08:00", "end": "08:00"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    3,
    20
  ),
  (
    '48/96',
    '48-96',
    '48 часов на дежурстве, 96 часов выходных',
    'firefighter',
    '{"cycle": [
      {"type": "day", "start": "08:00", "end": "08:00"},
      {"type": "day", "start": "08:00", "end": "08:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    6,
    21
  ),

  -- Фабрика
  (
    'Continental 2/2/4',
    'continental-2-2-4',
    '2 дневных, 2 ночных, 4 выходных',
    'factory',
    '{"cycle": [
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    8,
    30
  ),
  (
    'DuPont',
    'dupont',
    '4 ночных, 3 off, 3 дневных, 1 off, 3 ночных, 3 off, 4 дневных, 7 off',
    'factory',
    '{"cycle": [
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "off"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "night", "start": "18:00", "end": "06:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "day", "start": "06:00", "end": "18:00"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"},
      {"type": "off"}
    ]}'::jsonb,
    28,
    31
  )
ON CONFLICT (slug) DO NOTHING;

-- Триггер автосоздания профиля (привязан здесь, т.к. все таблицы уже существуют)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Применение миграций

### Через Supabase CLI
```bash
supabase migration new 001_functions_and_triggers
supabase migration new 002_base_tables
supabase migration new 003_schedule_tables
supabase migration new 004_sleep_plan_tables
supabase migration new 005_subscriptions_and_ai
supabase migration new 006_indexes
supabase migration new 007_rls_policies
supabase migration new 008_seed_shift_templates
```

### Через Supabase Dashboard
SQL Editor → вставить каждую миграцию последовательно.

### Откат
Для отката создать обратные миграции: `DROP TABLE IF EXISTS ... CASCADE`.

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — полная схема
- [RLS-POLICIES.md](./RLS-POLICIES.md) — описание политик
