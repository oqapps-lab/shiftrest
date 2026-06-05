-- 20260530000001_perf_indexes_r19.sql
-- R19 DB-query audit perf fix:
-- I-1: fetchApprovedStories filters approved=true + locale=eq + or(profession)
--      ordered by created_at DESC. The existing index
--      community_stories_approved_idx (approved, profession, created_at DESC)
--      omits `locale`, so the locale equality filter can't be served by it.
--      Add a partial index keyed on the actual query shape.

CREATE INDEX IF NOT EXISTS community_stories_locale_idx
  ON public.community_stories(locale, created_at DESC)
  WHERE approved = true;
