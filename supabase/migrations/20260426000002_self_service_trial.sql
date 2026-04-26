-- Self-service trial activation. Stage-6 placeholder for the Adapty flow.
--
-- Why an RPC instead of just adding an UPDATE policy: a permissive UPDATE
-- policy on subscriptions would let users set status='active' indefinitely.
-- This SECURITY DEFINER function only flips a 'free' row to 'trial' with
-- a 7-day window — anything else is rejected.
--
-- Adapty (Stage 7) writes through a webhook with service_role and bypasses
-- this; this function is solely for the unauthenticated self-service path.

CREATE OR REPLACE FUNCTION public.activate_self_service_trial(target_plan text DEFAULT 'premium_monthly')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'sign-in required';
  END IF;
  IF target_plan NOT IN ('premium_monthly','premium_annual') THEN
    RAISE EXCEPTION 'invalid plan';
  END IF;
  UPDATE public.subscriptions
  SET status = 'trial',
      plan = target_plan,
      trial_start = now(),
      trial_end = now() + interval '7 days'
  WHERE user_id = v_user
    AND status = 'free';
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_self_service_trial(text) TO authenticated;
