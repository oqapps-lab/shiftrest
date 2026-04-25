-- 006_indexes.sql

CREATE INDEX IF NOT EXISTS idx_shifts_user_date
  ON public.shifts (user_id, date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_user_range
  ON public.shifts (user_id, start_time, end_time)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_schedule
  ON public.shifts (schedule_id)
  WHERE schedule_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_schedules_user_id
  ON public.user_schedules (user_id);

CREATE INDEX IF NOT EXISTS idx_user_schedules_active
  ON public.user_schedules (user_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sleep_plans_shift
  ON public.sleep_plans (shift_id)
  WHERE shift_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transition_plans_user_status
  ON public.transition_plans (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transition_plans_user_dates
  ON public.transition_plans (user_id, start_date, end_date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transition_steps_plan
  ON public.transition_steps (plan_id, day_number, step_order);

CREATE INDEX IF NOT EXISTS idx_transition_steps_user
  ON public.transition_steps (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_adapty_profile_id
  ON public.subscriptions (adapty_profile_id)
  WHERE adapty_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions (status)
  WHERE status != 'free';

CREATE INDEX IF NOT EXISTS idx_ai_requests_user
  ON public.ai_requests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_requests_status
  ON public.ai_requests (status, created_at DESC)
  WHERE status != 'success';

CREATE INDEX IF NOT EXISTS idx_shift_templates_profession
  ON public.shift_templates (profession)
  WHERE is_active = true;
