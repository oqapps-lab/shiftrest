-- 20260530000002_shifts_unique_index_r19.sql
-- R19 DB-query audit, R-2: applyScheduleTemplate does a read-then-write
-- (SELECT existing dates → filter → bulk INSERT). Two concurrent applies
-- (or a manual add mid-flight) can race past the SELECT and insert
-- duplicate (user_id, date) rows. The durable fix is a UNIQUE partial
-- index so the DB rejects dupes, plus an upsert in app code.
--
-- ⚠️ ORDER MATTERS — this migration must run BEFORE the apply-template
--    code is switched to `.upsert(..., { onConflict: 'user_id,date' })`.
--    Shipping that code without this index live throws
--    "no unique or exclusion constraint matching the ON CONFLICT" and
--    breaks schedule-apply for everyone. See the TODO in
--    lib/schedule/apply-template.ts.
--
-- The CREATE UNIQUE INDEX itself fails if duplicate live rows already
-- exist, so we dedupe first: soft-delete all but the newest row per
-- (user_id, date) among non-deleted rows.

-- 1. Dedupe — keep the most recently created live row per (user_id, date).
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY user_id, date
           ORDER BY created_at DESC, id DESC
         ) AS rn
  FROM public.shifts
  WHERE deleted_at IS NULL
)
UPDATE public.shifts
SET deleted_at = now()
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2. Unique partial index — one live shift per (user_id, date).
CREATE UNIQUE INDEX IF NOT EXISTS shifts_user_date_unique
  ON public.shifts(user_id, date)
  WHERE deleted_at IS NULL;
