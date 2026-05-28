-- F20-P2 — Community user stories.
--
-- Users share short prompts ("what helps you sleep") and the
-- back-end / our moderation queue produces an `ai_summary` that
-- is the public-facing version. We never display raw_text to
-- other users, only the curated summary.

CREATE TABLE IF NOT EXISTS public.community_stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profession   TEXT,                              -- nurse / firefighter / factory / null
  raw_text     TEXT NOT NULL CHECK (length(raw_text) BETWEEN 1 AND 1000),
  ai_summary   TEXT,                              -- populated by Edge Function
  approved     BOOLEAN NOT NULL DEFAULT false,    -- moderator gates visibility
  locale       TEXT NOT NULL DEFAULT 'en',
  reactions    INTEGER NOT NULL DEFAULT 0,        -- "this helps me too" counter
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_stories_approved_idx
  ON public.community_stories(approved, profession, created_at DESC);

CREATE INDEX IF NOT EXISTS community_stories_user_idx
  ON public.community_stories(user_id, created_at DESC);

-- RLS
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can SELECT approved stories
DROP POLICY IF EXISTS "stories_select_approved" ON public.community_stories;
CREATE POLICY "stories_select_approved" ON public.community_stories
  FOR SELECT
  USING (approved = true OR auth.uid() = user_id);

-- Authenticated users can INSERT their own story
DROP POLICY IF EXISTS "stories_insert_own" ON public.community_stories;
CREATE POLICY "stories_insert_own" ON public.community_stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE / DELETE only their own story (before approval)
DROP POLICY IF EXISTS "stories_update_own" ON public.community_stories;
CREATE POLICY "stories_update_own" ON public.community_stories
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_delete_own" ON public.community_stories;
CREATE POLICY "stories_delete_own" ON public.community_stories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions counter increment helper (server-side, can't be gamed)
CREATE OR REPLACE FUNCTION public.story_react(story_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_stories
     SET reactions = reactions + 1
   WHERE id = story_id AND approved = true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.story_react TO authenticated;
