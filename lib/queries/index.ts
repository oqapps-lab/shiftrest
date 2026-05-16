/**
 * Read-side hooks for ShiftRest.
 *
 * Conventions:
 * - Each hook returns `{ data, loading, error, refetch }`.
 * - When `auth.user` is null OR Supabase isn't configured, hooks resolve
 *   `data: null/[]` immediately and screens fall back to mockUser.
 * - Cross-screen invalidation goes via `DeviceEventEmitter`. After a
 *   mutation (e.g. add-shift insert), emit a string from `EVENTS` and
 *   any subscribed hook re-runs.
 */

import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth/store';

export const EVENTS = {
  shiftsChanged: 'shifts:changed',
  streakChanged: 'streak:changed',
  transitionChanged: 'transition:changed',
  profileStatsChanged: 'profile-stats:changed',
  subscriptionChanged: 'subscription:changed',
} as const;

export function emitChange(event: (typeof EVENTS)[keyof typeof EVENTS]) {
  DeviceEventEmitter.emit(event);
}

interface QueryResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ─── Sleep streak ───────────────────────────────────────────────────────────

export interface SleepStreakRow {
  current_streak: number;
  longest_streak: number;
  last_streak_date: string | null;
}

export function useStreak(): QueryResult<SleepStreakRow | null> {
  const { user } = useAuth();
  const [data, setData] = useState<SleepStreakRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    supabase
      .from('sleep_streaks')
      .select('current_streak, longest_streak, last_streak_date')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: row, error: err }) => {
        if (!alive) return;
        setData((row as SleepStreakRow | null) ?? null);
        setError(err ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user?.id, tick]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVENTS.streakChanged, refetch);
    return () => sub.remove();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Shifts in date range ───────────────────────────────────────────────────

export interface ShiftRow {
  id: string;
  date: string; // YYYY-MM-DD
  shift_type: 'day' | 'night';
  start_time: string;
  end_time: string;
  is_manual: boolean;
}

export function useShifts(startIso: string, endIso: string): QueryResult<ShiftRow[]> {
  const { user } = useAuth();
  const [data, setData] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setData([]);
      return;
    }
    let alive = true;
    setLoading(true);
    supabase
      .from('shifts')
      .select('id, date, shift_type, start_time, end_time, is_manual')
      .eq('user_id', user.id)
      .gte('date', startIso)
      .lte('date', endIso)
      .is('deleted_at', null)
      .order('date', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (!alive) return;
        setData((rows as ShiftRow[]) ?? []);
        setError(err ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user?.id, startIso, endIso, tick]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVENTS.shiftsChanged, refetch);
    return () => sub.remove();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Active transition plan + steps ─────────────────────────────────────────

export interface TransitionStepRow {
  id: string;
  day_number: number;
  step_order: number;
  scheduled_time: string;
  action_type: string;
  title: string;
  description: string | null;
  is_completed: boolean;
}

export interface TransitionPlanWithSteps {
  id: string;
  transition_type: 'night_to_day' | 'day_to_night';
  start_date: string;
  end_date: string;
  total_days: number;
  total_steps: number;
  completed_steps: number;
  status: 'active' | 'completed' | 'abandoned';
  steps: TransitionStepRow[];
}

export function useActiveTransitionPlan(): QueryResult<TransitionPlanWithSteps | null> {
  const { user } = useAuth();
  const [data, setData] = useState<TransitionPlanWithSteps | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const { data: planRow, error: planErr } = await supabase!
          .from('transition_plans')
          .select(
            'id, transition_type, start_date, end_date, total_days, total_steps, completed_steps, status',
          )
          .eq('user_id', user.id)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!alive) return;
        if (planErr) {
          setError(planErr);
          setLoading(false);
          return;
        }
        if (!planRow) {
          setData(null);
          setError(null);
          setLoading(false);
          return;
        }

        const { data: stepRows, error: stepErr } = await supabase!
          .from('transition_steps')
          .select(
            'id, day_number, step_order, scheduled_time, action_type, title, description, is_completed',
          )
          .eq('plan_id', planRow.id)
          .order('day_number', { ascending: true })
          .order('step_order', { ascending: true });

        if (!alive) return;
        if (stepErr) {
          setError(stepErr);
          setLoading(false);
          return;
        }

        setData({
          ...(planRow as Omit<TransitionPlanWithSteps, 'steps'>),
          steps: (stepRows as TransitionStepRow[]) ?? [],
        });
        setError(null);
        setLoading(false);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id, tick]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVENTS.transitionChanged, refetch);
    return () => sub.remove();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Subscription state ────────────────────────────────────────────────────

export type SubscriptionStatus = 'free' | 'trial' | 'active' | 'expired' | 'cancelled' | 'grace_period';
export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_annual';

export interface SubscriptionRow {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trial_start: string | null;
  trial_end: string | null;
  current_period_end: string | null;
}

/**
 * Activate a self-service 7-day trial via RPC. Stage 6 placeholder until
 * Adapty (Stage 7) replaces this with a real purchase flow.
 *
 * The RPC `public.activate_self_service_trial` runs SECURITY DEFINER and
 * only flips the row when current status='free' — prevents abuse
 * (re-arming after expiry, jumping to 'active') without service_role.
 *
 * Callers should `emitChange(EVENTS.subscriptionChanged)` after success
 * so the UI updates without waiting for the next refetch tick.
 */
export async function startTrial(plan: SubscriptionPlan = 'premium_monthly'): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase is not configured.') };
  }
  if (plan === 'free') {
    return { error: new Error('free is not a trial plan') };
  }

  const { error } = await supabase.rpc('activate_self_service_trial', { target_plan: plan });
  return { error };
}

export function useSubscription(): QueryResult<SubscriptionRow | null> {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    supabase
      .from('subscriptions')
      .select('status, plan, trial_start, trial_end, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: row, error: err }) => {
        if (!alive) return;
        setData((row as SubscriptionRow | null) ?? null);
        setError(err ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user?.id, tick]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVENTS.subscriptionChanged, refetch);
    return () => sub.remove();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Profile stats (DAYS / PLANS / ON PLAN) ─────────────────────────────────

export interface ProfileStats {
  /** Days since auth.users.created_at, floored. */
  daysInApp: number;
  /** Count of transition_plans rows with status='completed'. */
  plansCompleted: number;
  /** 0–100 % adherence on the active plan (completed_steps / total_steps). */
  onPlanPct: number | null;
}

export function useProfileStats(): QueryResult<ProfileStats | null> {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const created = user.created_at ? new Date(user.created_at).getTime() : Date.now();
        const daysInApp = Math.max(0, Math.floor((Date.now() - created) / 86_400_000));

        const { count: plansCount, error: countErr } = await supabase!
          .from('transition_plans')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .is('deleted_at', null);

        if (!alive) return;
        if (countErr) {
          setError(countErr);
          setLoading(false);
          return;
        }

        const { data: activePlan, error: planErr } = await supabase!
          .from('transition_plans')
          .select('total_steps, completed_steps')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!alive) return;
        if (planErr) {
          setError(planErr);
          setLoading(false);
          return;
        }

        const onPlanPct =
          activePlan && activePlan.total_steps > 0
            ? Math.round((activePlan.completed_steps / activePlan.total_steps) * 100)
            : null;

        setData({
          daysInApp,
          plansCompleted: plansCount ?? 0,
          onPlanPct,
        });
        setError(null);
        setLoading(false);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id, user?.created_at, tick]);

  useEffect(() => {
    const subA = DeviceEventEmitter.addListener(EVENTS.transitionChanged, refetch);
    const subB = DeviceEventEmitter.addListener(EVENTS.profileStatsChanged, refetch);
    return () => {
      subA.remove();
      subB.remove();
    };
  }, [refetch]);

  return { data, loading, error, refetch };
}
