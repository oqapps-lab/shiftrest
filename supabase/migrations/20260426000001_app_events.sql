-- App-level event log. Single append-only table for product analytics +
-- forensics. Future event types are added without DDL — payload is jsonb.
--
-- RLS: users can only read/insert their own events. Service role bypasses
-- (used by edge functions when emitting on behalf of a user).
--
-- Why no aggregate-friendly columns: keep the table dumb. Aggregations
-- live in materialised views or downstream tools so the writer stays cheap.

CREATE TABLE IF NOT EXISTS public.app_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_platform TEXT,
  client_app_version TEXT
);

CREATE INDEX IF NOT EXISTS app_events_user_created_idx
  ON public.app_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS app_events_type_created_idx
  ON public.app_events (event_type, created_at DESC);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_events" ON public.app_events;
CREATE POLICY "users_read_own_events" ON public.app_events
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_events" ON public.app_events;
CREATE POLICY "users_insert_own_events" ON public.app_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
