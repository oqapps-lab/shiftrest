-- 007_rls_policies.sql
-- All policies use DROP IF EXISTS / CREATE for idempotency.

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- shift_templates (public read)
DROP POLICY IF EXISTS "Anyone can read active templates" ON public.shift_templates;
CREATE POLICY "Anyone can read active templates" ON public.shift_templates FOR SELECT USING (is_active = true);

-- user_schedules
DROP POLICY IF EXISTS "Users can view own schedules" ON public.user_schedules;
CREATE POLICY "Users can view own schedules" ON public.user_schedules FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own schedules" ON public.user_schedules;
CREATE POLICY "Users can insert own schedules" ON public.user_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedules" ON public.user_schedules;
CREATE POLICY "Users can update own schedules" ON public.user_schedules FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own schedules" ON public.user_schedules;
CREATE POLICY "Users can delete own schedules" ON public.user_schedules FOR DELETE USING (auth.uid() = user_id);

-- shifts
DROP POLICY IF EXISTS "Users can view own shifts" ON public.shifts;
CREATE POLICY "Users can view own shifts" ON public.shifts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own shifts" ON public.shifts;
CREATE POLICY "Users can insert own shifts" ON public.shifts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shifts" ON public.shifts;
CREATE POLICY "Users can update own shifts" ON public.shifts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shifts" ON public.shifts;
CREATE POLICY "Users can delete own shifts" ON public.shifts FOR DELETE USING (auth.uid() = user_id);

-- sleep_plans
DROP POLICY IF EXISTS "Users can view own sleep plans" ON public.sleep_plans;
CREATE POLICY "Users can view own sleep plans" ON public.sleep_plans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sleep plans" ON public.sleep_plans;
CREATE POLICY "Users can insert own sleep plans" ON public.sleep_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sleep plans" ON public.sleep_plans;
CREATE POLICY "Users can update own sleep plans" ON public.sleep_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sleep plans" ON public.sleep_plans;
CREATE POLICY "Users can delete own sleep plans" ON public.sleep_plans FOR DELETE USING (auth.uid() = user_id);

-- transition_plans
DROP POLICY IF EXISTS "Users can view own transition plans" ON public.transition_plans;
CREATE POLICY "Users can view own transition plans" ON public.transition_plans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transition plans" ON public.transition_plans;
CREATE POLICY "Users can insert own transition plans" ON public.transition_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transition plans" ON public.transition_plans;
CREATE POLICY "Users can update own transition plans" ON public.transition_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transition plans" ON public.transition_plans;
CREATE POLICY "Users can delete own transition plans" ON public.transition_plans FOR DELETE USING (auth.uid() = user_id);

-- transition_steps
DROP POLICY IF EXISTS "Users can view own transition steps" ON public.transition_steps;
CREATE POLICY "Users can view own transition steps" ON public.transition_steps FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transition steps" ON public.transition_steps;
CREATE POLICY "Users can insert own transition steps" ON public.transition_steps FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transition steps" ON public.transition_steps;
CREATE POLICY "Users can update own transition steps" ON public.transition_steps FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transition steps" ON public.transition_steps;
CREATE POLICY "Users can delete own transition steps" ON public.transition_steps FOR DELETE USING (auth.uid() = user_id);

-- sleep_streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.sleep_streaks;
CREATE POLICY "Users can view own streaks" ON public.sleep_streaks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streaks" ON public.sleep_streaks;
CREATE POLICY "Users can insert own streaks" ON public.sleep_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaks" ON public.sleep_streaks;
CREATE POLICY "Users can update own streaks" ON public.sleep_streaks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_requests
DROP POLICY IF EXISTS "Users can view own ai requests" ON public.ai_requests;
CREATE POLICY "Users can view own ai requests" ON public.ai_requests FOR SELECT USING (auth.uid() = user_id);
