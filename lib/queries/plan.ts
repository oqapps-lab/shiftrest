/**
 * useGeneratedPlan() — read or trigger an OpenAI-backed daily sleep plan.
 *
 * On mount:
 *  1. Look up `sleep_plans` row for (user_id, today). If present → return it.
 *  2. Else POST to Edge Function `plan-generator` (which writes the row +
 *     returns it). The function caches per (user_id, date), so the next
 *     mount short-circuits at step 1.
 *
 * Fallback when not signed in OR Edge Function fails: returns null and
 * consumers fall back to mockPlan.
 *
 * The plan shape we return is `SleepPlanRow`; the per-screen "RECS"
 * recommendations live in `metadata.recommendations` so consumers can
 * destructure them.
 */

import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth/store';
import { EVENTS } from './index';

export interface PlanRecommendation {
  type: 'caffeine' | 'melatonin' | 'light' | 'nap' | 'sleep_window' | 'wind_down';
  eyebrow: string;
  hero: string;
  body: string;
  locked: boolean;
}

export interface SleepPlanRow {
  id: string;
  user_id: string;
  date: string;
  plan_type: 'work_day' | 'day_off' | 'transition';
  sleep_start: string;          // ISO timestamp (treated as local)
  sleep_end: string;
  sleep_duration_minutes: number;
  caffeine_cutoff_at: string | null;
  melatonin_at: string | null;
  melatonin_dose_mg: number | null;
  melatonin_type: 'phase_advance' | 'phase_delay' | null;
  nap_start: string | null;
  nap_end: string | null;
  wind_down_start: string | null;
  explanation: string | null;
  generation_method: 'ai' | 'rule_based';
  metadata: { recommendations?: PlanRecommendation[] };
  created_at: string;
}

interface QueryResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: (force?: boolean) => void;
}

function todayLocalIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useGeneratedPlan(date: string = todayLocalIso()): QueryResult<SleepPlanRow | null> {
  const { user } = useAuth();
  const [data, setData] = useState<SleepPlanRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((force = false) => {
    if (force) {
      // Bypass DB lookup, force regenerate
      setTick((t) => t + 1);
    } else {
      setTick((t) => t + 1);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Try cache first.
        const { data: cached, error: cacheErr } = await supabase!
          .from('sleep_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', date)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!alive) return;
        if (cacheErr) {
          setError(cacheErr);
          setLoading(false);
          return;
        }
        if (cached) {
          setData(cached as SleepPlanRow);
          setLoading(false);
          return;
        }

        // 2. No cache → invoke generator. Wrap in try/catch separately
        // so a transient network failure (cold start, offline) doesn't
        // bubble up to LogBox; consumers gracefully fall back to mock.
        let invokeData: { plan?: SleepPlanRow } | undefined;
        let invokeErr: unknown = null;
        try {
          const result = await supabase!.functions.invoke('plan-generator', {
            body: { date },
          });
          invokeData = result.data as { plan?: SleepPlanRow } | undefined;
          invokeErr = result.error;
        } catch (e) {
          invokeErr = e;
        }

        if (!alive) return;
        if (invokeErr) {
          // Don't promote network errors to React state — they fire LogBox
          // toasts in dev. Just log to console and fall back silently.
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[plan-generator] invoke failed, using fallback', invokeErr);
          }
          setData(null);
          setLoading(false);
          return;
        }

        const plan = (invokeData as { plan?: SleepPlanRow })?.plan;
        if (plan) {
          setData(plan);
        } else {
          setData(null);
        }
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
  }, [user?.id, date, tick]);

  // Refetch when something else (e.g. profile edit) signals the plan is stale.
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('plan:changed', () => refetch());
    return () => sub.remove();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Re-use shared event channel for plan invalidation.
export function emitPlanChanged() {
  DeviceEventEmitter.emit('plan:changed');
}

// Convenience for screens: extract a "HH:MM" from an ISO timestamp.
export function formatPlanHour(iso: string | null | undefined): string {
  if (!iso) return '';
  // Strip any timezone — server stored "YYYY-MM-DDTHH:MM:00" without offset.
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : '';
}

// Convenience: float "hour" usable by formatRelativeTime / TimelineRing.
export function planHourAsFloat(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return null;
  return Number(m[1]) + Number(m[2]) / 60;
}

// Mock placeholder for use on `EVENTS` import (not directly used here).
export const _events = EVENTS;
