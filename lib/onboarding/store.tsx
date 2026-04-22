/**
 * OnboardingProvider — single source of truth for the 10-step quiz answers.
 *
 * - Persists to AsyncStorage so the user can quit mid-funnel and resume.
 * - Exposes `update()` and `reset()` for screens.
 * - Provides `completed` boolean for the root layout's "skip to tabs"
 *   redirect (set by `markCompleted()` after notifications screen).
 *
 * Stage 6.5 hook: when `supabase` becomes configured AND a session
 * exists, we'll add a `syncToProfile()` that runs `supabase.from('profiles')
 * .upsert(...)` from this state. For now it lives in-memory + on-device.
 *
 * Shape mirrors the `profiles` columns in docs/05-database/DATABASE-SCHEMA.md
 * so the future sync is a 1:1 mapping.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockChronotypeQuestions } from '../../mock/user';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth/store';

const STORAGE_KEY = 'shiftrest:onboarding:v1';

export type Profession = 'nurse' | 'firefighter' | 'factory' | 'other';
export type ScheduleId = '3x12-day-night' | '24-48' | '48-96' | 'continental' | 'custom';
export type ShiftKind = 'day' | 'night' | 'off';
export type MainProblem = 'falling-asleep' | 'transitions' | 'fatigue' | 'caffeine';
export type CaffeineType = 'coffee' | 'tea' | 'energy';
export type CaffeineSensitivity = 'normal' | 'slow' | 'unknown';
export type PickupTime = '14' | '15' | '16' | '17';
export type MelatoninTime = '20' | '22' | '00';

export interface OnboardingState {
  // S02 profession
  profession: Profession | null;

  // S03 schedule
  scheduleId: ScheduleId | null;

  // S04 current-shift
  currentShift: ShiftKind;
  commuteMinutes: number;

  // S05 main problem
  mainProblem: MainProblem | null;

  // S07 chronotype (3-question MEQ — answers keyed by question id)
  chronotypeAnswers: Record<string, string>;

  // S08 caffeine
  caffeineCupsPerDay: number;
  caffeineType: CaffeineType | null;
  caffeineSensitivity: CaffeineSensitivity | null;

  // S09 melatonin
  takesMelatonin: boolean;
  melatoninDoseMg: string | null; // string-keyed in mock for chip group
  melatoninTime: MelatoninTime;

  // S10 family
  hasChildren: boolean;
  pickupTime: PickupTime;
  otherCommitments: string;

  // S11 name
  displayName: string;

  // Funnel completion marker (true after notifications screen exits)
  completed: boolean;
}

const INITIAL: OnboardingState = {
  profession: null,
  scheduleId: null,
  currentShift: 'day',
  commuteMinutes: 30,
  mainProblem: null,
  chronotypeAnswers: {},
  caffeineCupsPerDay: 2,
  caffeineType: null,
  caffeineSensitivity: null,
  takesMelatonin: false,
  melatoninDoseMg: null,
  melatoninTime: '22',
  hasChildren: false,
  pickupTime: '15',
  otherCommitments: '',
  displayName: '',
  completed: false,
};

// ─── Profile-row mapping ────────────────────────────────────────────────────
// Mirrors docs/05-database/DATABASE-SCHEMA.md — profiles table.

const CHRONOTYPE_VALUE_SCORE: Record<string, number> = {
  morning: 1,
  mid: 2,
  evening: 3,
  strong_evening: 4,
};

/** Sum of the chosen options' values across the 3 MEQ-lite questions (3-12). */
export function computeChronotypeScore(answers: Record<string, string>): number | null {
  let score = 0;
  let answered = 0;
  for (const q of mockChronotypeQuestions) {
    const optId = answers[q.id];
    if (!optId) continue;
    const opt = q.options.find((o) => o.id === optId);
    if (!opt) continue;
    score += CHRONOTYPE_VALUE_SCORE[opt.value] ?? 0;
    answered++;
  }
  return answered === mockChronotypeQuestions.length ? score : null;
}

/** Bucket the 3-12 score: ≤5 lark, 6-8 intermediate, ≥9 owl. */
export function chronotypeBucket(score: number | null): 'lark' | 'intermediate' | 'owl' | null {
  if (score == null) return null;
  if (score <= 5) return 'lark';
  if (score <= 8) return 'intermediate';
  return 'owl';
}

/** Shape a row for `supabase.from('profiles').upsert(...)`. */
export function mapToProfileRow(state: OnboardingState, userId: string) {
  const score = computeChronotypeScore(state.chronotypeAnswers);
  const familyCommitments: { time: string; description: string }[] = [];
  if (state.hasChildren) {
    familyCommitments.push({
      time: `${state.pickupTime}:00`,
      description: 'School pickup',
    });
  }
  if (state.otherCommitments.trim()) {
    familyCommitments.push({
      time: '',
      description: state.otherCommitments.trim(),
    });
  }
  return {
    id: userId,
    display_name: state.displayName.trim() || null,
    profession: state.profession,
    chronotype_score: score,
    chronotype: chronotypeBucket(score),
    caffeine_cups_per_day: state.caffeineCupsPerDay,
    caffeine_type: state.caffeineType,
    caffeine_sensitivity: state.caffeineSensitivity,
    uses_melatonin: state.takesMelatonin,
    melatonin_dose_mg: state.melatoninDoseMg ? Number(state.melatoninDoseMg) : null,
    has_children: state.hasChildren,
    family_commitments: familyCommitments,
    commute_minutes: state.commuteMinutes,
    main_problem: state.mainProblem,
    onboarding_completed: state.completed,
    updated_at: new Date().toISOString(),
  };
}

interface OnboardingContextValue {
  state: OnboardingState;
  hydrated: boolean;
  update: (patch: Partial<OnboardingState>) => void;
  markCompleted: () => void;
  reset: () => void;
  /** Push current onboarding state to `profiles` table. No-op without env or session. */
  syncProfile: () => Promise<{ error: Error | null; skipped?: 'no_supabase' | 'no_user' }>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const auth = useAuth();
  const lastSyncedRef = useRef<string>(''); // payload hash, prevents redundant upserts

  // Hydrate from AsyncStorage on mount.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<OnboardingState>;
            setState({ ...INITIAL, ...parsed });
          } catch {
            // Corrupt cache — start fresh.
          }
        }
        setHydrated(true);
      })
      .catch(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => null);
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const markCompleted = useCallback(() => {
    setState((prev) => ({ ...prev, completed: true }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL);
    lastSyncedRef.current = '';
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => null);
  }, []);

  const syncProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null, skipped: 'no_supabase' as const };
    }
    if (!auth.user?.id) {
      return { error: null, skipped: 'no_user' as const };
    }
    const row = mapToProfileRow(state, auth.user.id);
    const fingerprint = JSON.stringify(row);
    if (fingerprint === lastSyncedRef.current) {
      return { error: null }; // already up-to-date
    }
    const { error } = await supabase.from('profiles').upsert(row);
    if (!error) lastSyncedRef.current = fingerprint;
    return { error: error as Error | null };
  }, [auth.user?.id, state]);

  // Auto-sync when (a) the user signs in, (b) onboarding is marked completed,
  // or (c) any quiz answer changes after both conditions hold.
  useEffect(() => {
    if (!hydrated) return;
    if (!auth.user?.id || !state.completed) return;
    syncProfile().catch(() => null);
  }, [hydrated, auth.user?.id, state, syncProfile]);

  const value = useMemo<OnboardingContextValue>(
    () => ({ state, hydrated, update, markCompleted, reset, syncProfile }),
    [state, hydrated, update, markCompleted, reset, syncProfile],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>.');
  }
  return ctx;
}
