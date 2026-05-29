-- 20260529000001_security_fixes_r19.sql
-- R19 security audit fixes:
-- S-2: community_stories UPDATE missing WITH CHECK → users could self-approve
-- S-3: subscriptions INSERT accepts arbitrary status/plan → users could grant premium

-- ─────────────────────────────────────────────────────────────────────────────
-- S-3 FIX: subscriptions self-grant blocker
-- ─────────────────────────────────────────────────────────────────────────────
-- The previous policy `FOR INSERT WITH CHECK (auth.uid() = user_id)` accepted
-- any status/plan, so a signed-in user could insert
-- { user_id: me, status: 'active', plan: 'premium_annual', current_period_end: '2099-01-01' }
-- and self-grant premium without ever talking to Adapty.
--
-- Tighten: client can only insert their own row in the FREE tier. Premium
-- transitions must go through the Adapty webhook (service_role) or the
-- existing activate_self_service_trial RPC.

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'free'
    AND plan = 'free'
  );

-- UPDATE was already missing — block client-side updates entirely. Premium
-- writes must come through service_role (webhook) or the SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
-- Intentionally no replacement: only service_role can mutate subscriptions.

-- ─────────────────────────────────────────────────────────────────────────────
-- S-2 FIX: community_stories self-approve blocker
-- ─────────────────────────────────────────────────────────────────────────────
-- The previous UPDATE policy `USING (auth.uid() = user_id)` (no WITH CHECK)
-- let an author run
-- `update community_stories set approved=true, ai_summary='spam' where id=mine`
-- bypassing moderation. Tighten:
--   - only unapproved rows can be updated by the author
--   - only `reactions` can be changed by the author; `approved` + `ai_summary`
--     are owned by the moderator workflow / Edge Function (service_role).

DROP POLICY IF EXISTS "Users can update own story" ON public.community_stories;
DROP POLICY IF EXISTS "Users can update own community_stories" ON public.community_stories;

-- New policy: author may only touch their own row, and only while pending,
-- and only the `reactions` field is mutable (everything else stays NULL/preserves).
-- Postgres can't express column-level WITH CHECK; we'll layer a BEFORE UPDATE
-- trigger to reject changes to protected columns.

CREATE POLICY "Authors can react to own pending story" ON public.community_stories
  FOR UPDATE
  USING (auth.uid() = user_id AND approved = false)
  WITH CHECK (auth.uid() = user_id AND approved = false);

CREATE OR REPLACE FUNCTION public.community_stories_block_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- service_role bypasses this trigger via SECURITY INVOKER + RLS exemption.
  -- For authenticated users, reject any change to moderation-owned columns.
  IF auth.role() = 'authenticated' THEN
    IF NEW.approved IS DISTINCT FROM OLD.approved THEN
      RAISE EXCEPTION 'Column "approved" is moderator-owned';
    END IF;
    IF NEW.ai_summary IS DISTINCT FROM OLD.ai_summary THEN
      RAISE EXCEPTION 'Column "ai_summary" is moderator-owned';
    END IF;
    IF NEW.raw_text IS DISTINCT FROM OLD.raw_text THEN
      RAISE EXCEPTION 'Column "raw_text" is immutable after submission';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_stories_protect_cols ON public.community_stories;
CREATE TRIGGER community_stories_protect_cols
  BEFORE UPDATE ON public.community_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.community_stories_block_protected_columns();
