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
import { emitPlanChanged } from '../queries/plan';

const STORAGE_KEY = 'shiftrest:onboarding:v1';

export type Profession = 'nurse' | 'firefighter' | 'factory' | 'other';
export type ScheduleId = '3x12-day-night' | '24-48' | '48-96' | 'continental' | 'custom';
export type ShiftKind = 'day' | 'night' | 'off';
export type NextShift = 'tonight' | 'tomorrow_am' | 'tomorrow_pm' | 'day_after' | 'on_break';
export type MainProblem = 'falling-asleep' | 'transitions' | 'fatigue' | 'caffeine';
export type CaffeineType = 'coffee' | 'tea' | 'energy';
export type CaffeineSensitivity = 'normal' | 'slow' | 'unknown';
export type PickupTime = '14' | '15' | '16' | '17';
// Standard presets are 20/22/00. Anything else stored as raw "HH:MM"
// (custom wheel pick). Code that compares should test against the
// preset literals; everything else is custom.
export type MelatoninTime = '20' | '22' | '00' | string;

export interface OnboardingState {
  // S02 profession
  profession: Profession | null;

  // S03 schedule
  scheduleId: ScheduleId | null;

  // S04 current-shift
  currentShift: ShiftKind;
  // Start/end of current shift as "HH:MM" strings (24-hour). Allows wheel
  // time picker to write user-chosen values instead of relying on static
  // SHIFT_TIMES presets.
  currentShiftStart: string;
  currentShiftEnd: string;
  commuteMinutes: number;

  // S05 next-shift — when's the next shift starting (drives 36h pre-shift plan)
  nextShift: NextShift | null;

  // S06 main problem
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

  // B3: local avatar photo URI (profile + story authorship). Local-only
  // for now; a future build uploads to Supabase storage for the public feed.
  avatarUri: string | null;

  // Settings-only: bright-light therapy opt-in (Plan tab shows light cards
  // when true). Not yet persisted to profiles table; local-only.
  usesLightTherapy: boolean;

  // Funnel completion marker (true after notifications screen exits)
  completed: boolean;

  // R13-1: last onboarding route visited so Welcome can resume the
  // user after an app kill instead of restarting from S01.
  lastOnboardingRoute: string | null;
}

const INITIAL: OnboardingState = {
  profession: null,
  scheduleId: null,
  currentShift: 'day',
  currentShiftStart: '07:00',
  currentShiftEnd: '19:00',
  commuteMinutes: 30,
  nextShift: null,
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
  avatarUri: null,
  // Default ON for new users — bright light therapy is the strongest
  // evidence-based intervention for shift adaptation and costs nothing to
  // display. Users can turn it off from Settings → Light therapy.
  usesLightTherapy: true,
  completed: false,
  lastOnboardingRoute: null,
};

// ─── Profile-row mapping ────────────────────────────────────────────────────
// Mirrors docs/05-database/DATABASE-SCHEMA.md — profiles table.

const CHRONOTYPE_VALUE_SCORE: Record<string, number> = {
  morning: 1,
  mid: 2,
  evening: 3,
  strong_evening: 4,
};

/** Sum of the chosen options' values across the 3 MEQ-lite questions (3-11, Q2 maxes at 3). */
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

// App-side IDs (used in mock + UI selection state) → DB CHECK values
// (declared in supabase/migrations/20260425000002_base_tables.sql).
// Keep these here so changes to either side are obvious to reviewers.
const CAFFEINE_TYPE_TO_DB: Record<CaffeineType, string> = {
  coffee: 'coffee',
  tea: 'tea',
  energy: 'energy_drink',
};

const MAIN_PROBLEM_TO_DB: Record<MainProblem, string> = {
  'falling-asleep': 'cant_sleep',
  transitions: 'transition',
  fatigue: 'fatigue',
  caffeine: 'caffeine',
};

// Reverse maps for hydrating local state FROM a profiles row.
const CAFFEINE_TYPE_FROM_DB: Record<string, CaffeineType> = {
  coffee: 'coffee',
  tea: 'tea',
  energy_drink: 'energy',
};

const MAIN_PROBLEM_FROM_DB: Record<string, MainProblem> = {
  cant_sleep: 'falling-asleep',
  transition: 'transitions',
  fatigue: 'fatigue',
  caffeine: 'caffeine',
};

interface ProfileRow {
  display_name: string | null;
  profession: string | null;
  caffeine_cups_per_day: number | null;
  caffeine_type: string | null;
  caffeine_sensitivity: string | null;
  uses_melatonin: boolean | null;
  melatonin_dose_mg: number | null;
  has_children: boolean | null;
  family_commitments: { time: string; description: string }[] | null;
  commute_minutes: number | null;
  main_problem: string | null;
  onboarding_completed: boolean | null;
}

/** Translate a `profiles` row back into a partial OnboardingState patch. */
export function mapFromProfileRow(row: ProfileRow): Partial<OnboardingState> {
  const patch: Partial<OnboardingState> = {};
  if (row.display_name) patch.displayName = row.display_name;
  if (row.profession && ['nurse', 'firefighter', 'factory', 'other'].includes(row.profession)) {
    patch.profession = row.profession as Profession;
  }
  if (typeof row.caffeine_cups_per_day === 'number') {
    patch.caffeineCupsPerDay = row.caffeine_cups_per_day;
  }
  if (row.caffeine_type && CAFFEINE_TYPE_FROM_DB[row.caffeine_type]) {
    patch.caffeineType = CAFFEINE_TYPE_FROM_DB[row.caffeine_type];
  }
  if (row.caffeine_sensitivity && ['normal', 'slow', 'unknown'].includes(row.caffeine_sensitivity)) {
    patch.caffeineSensitivity = row.caffeine_sensitivity as CaffeineSensitivity;
  }
  if (typeof row.uses_melatonin === 'boolean') patch.takesMelatonin = row.uses_melatonin;
  if (typeof row.melatonin_dose_mg === 'number') patch.melatoninDoseMg = String(row.melatonin_dose_mg);
  if (typeof row.has_children === 'boolean') patch.hasChildren = row.has_children;
  if (typeof row.commute_minutes === 'number') patch.commuteMinutes = row.commute_minutes;
  if (row.main_problem && MAIN_PROBLEM_FROM_DB[row.main_problem]) {
    patch.mainProblem = MAIN_PROBLEM_FROM_DB[row.main_problem];
  }
  if (row.onboarding_completed) patch.completed = true;

  // Family commitments → split back into pickup time + free-text "other".
  if (Array.isArray(row.family_commitments)) {
    for (const fc of row.family_commitments) {
      if (fc.description === 'School pickup' && fc.time) {
        const hour = fc.time.slice(0, 2);
        if (['14', '15', '16', '17'].includes(hour)) {
          patch.pickupTime = hour as PickupTime;
        }
      } else if (fc.description) {
        patch.otherCommitments = fc.description;
      }
    }
  }

  return patch;
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
    caffeine_type: state.caffeineType ? CAFFEINE_TYPE_TO_DB[state.caffeineType] : null,
    caffeine_sensitivity: state.caffeineSensitivity,
    uses_melatonin: state.takesMelatonin,
    melatonin_dose_mg: state.melatoninDoseMg ? Number(state.melatoninDoseMg) : null,
    has_children: state.hasChildren,
    family_commitments: familyCommitments,
    commute_minutes: state.commuteMinutes,
    main_problem: state.mainProblem ? MAIN_PROBLEM_TO_DB[state.mainProblem] : null,
    onboarding_completed: state.completed,
    updated_at: new Date().toISOString(),
  };
}

interface OnboardingContextValue {
  state: OnboardingState;
  hydrated: boolean;
  /**
   * True while a reverse-sync (server `profiles` row → local store) is in
   * flight after first session-restore on a fresh AsyncStorage. Welcome
   * screen reads this to avoid flashing for users who have a server-side
   * onboarded profile but an empty device cache (e.g. after reinstall).
   */
  reverseSyncing: boolean;
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
  const [reverseSyncing, setReverseSyncing] = useState(false);
  const [reverseHydrateTick, setReverseHydrateTick] = useState(0);
  const auth = useAuth();
  const lastSyncedRef = useRef<string>(''); // payload hash, prevents redundant upserts
  const reverseHydratedRef = useRef<string>(''); // userId we've already reverse-hydrated for

  // Hydrate from AsyncStorage on mount.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<OnboardingState>;
            // Migrate legacy profession id 'fire' → 'firefighter' (R3-2 fix)
            if ((parsed as { profession?: string }).profession === 'fire') {
              (parsed as { profession?: Profession }).profession = 'firefighter';
            }
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

  // Persist on every change after hydration. R19/H1: debounced 300ms so
  // keystroke-rate typing in displayName / otherCommitments doesn't disk-
  // write on every character. Trailing flush via timeout ref.
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => null);
    }, 300);
    return () => {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    };
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const markCompleted = useCallback(() => {
    // R13-1: clear the resume marker so a future re-open with a stale
    // route doesn't bounce a completed user back into /onboarding.
    setState((prev) => ({ ...prev, completed: true, lastOnboardingRoute: null }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL);
    lastSyncedRef.current = '';
    reverseHydratedRef.current = '';
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => null);
    // Re-arm the reverse-hydrate effect — without this it would not
    // re-fire (its deps haven't changed) and the user would stay on
    // a blank store after a dev reset.
    setReverseHydrateTick((t) => t + 1);
  }, []);

  const syncProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null, skipped: 'no_supabase' as const };
    }
    if (!auth.user?.id) {
      return { error: null, skipped: 'no_user' as const };
    }
    const row = mapToProfileRow(state, auth.user.id);
    // G1 (CRITICAL freeze fix): exclude the always-changing `updated_at`
    // timestamp from the dedupe fingerprint. It was stamped with
    // `new Date()` on every call, so the fingerprint was ALWAYS new — the
    // guard below never short-circuited, and the auto-sync effect (which
    // depends on `state`) turned every state change into an upsert +
    // emitPlanChanged() → plan refetch → re-render → state churn → upsert…
    // an app-wide freezing loop for signed-in users. Hash only the real
    // fields; the timestamp still goes to the DB, just not to the guard.
    const { updated_at: _ignoredTs, ...stableRow } = row;
    const fingerprint = JSON.stringify(stableRow);
    if (fingerprint === lastSyncedRef.current) {
      return { error: null }; // already up-to-date — nothing meaningful changed
    }
    // Optimistically claim this fingerprint BEFORE the await so rapid
    // back-to-back calls (e.g. while a toggle re-renders) dedupe instead of
    // stacking upserts. Reset on failure so a real change can retry.
    lastSyncedRef.current = fingerprint;
    const { error } = await supabase.from('profiles').upsert(row);
    if (error) {
      lastSyncedRef.current = '';
    } else {
      // M9 — tell the plan query its cache is stale. Without this, edits in
      // Settings → Sleep preferences silently update profiles but the Plan
      // tab keeps showing the pre-edit generated plan until app restart.
      emitPlanChanged();
    }
    return { error: error as Error | null };
  }, [auth.user?.id, state]);

  // Auto-sync when (a) the user signs in, (b) onboarding is marked completed,
  // or (c) any quiz answer changes after both conditions hold.
  useEffect(() => {
    if (!hydrated) return;
    if (!auth.user?.id || !state.completed) return;
    syncProfile().catch(() => null);
  }, [hydrated, auth.user?.id, state, syncProfile]);

  // Reverse-sync: when the user signs in fresh (e.g. on a new device or
  // after sign-out), hydrate the local store from their `profiles` row.
  // Only runs when local state is essentially blank (no profession set
  // and not yet completed) — never overwrites a populated local store
  // because their device-state may have unsaved progress.
  useEffect(() => {
    if (!hydrated) return;
    if (!isSupabaseConfigured || !supabase) return;
    const userId = auth.user?.id;
    if (!userId) return;
    if (reverseHydratedRef.current === userId) return;

    // Skip if local state already has populated answers.
    if (state.profession || state.completed || state.displayName) {
      reverseHydratedRef.current = userId;
      return;
    }

    let alive = true;
    setReverseSyncing(true);
    (async () => {
      const { data: row, error } = await supabase!
        .from('profiles')
        .select(
          'display_name, profession, caffeine_cups_per_day, caffeine_type, caffeine_sensitivity, uses_melatonin, melatonin_dose_mg, has_children, family_commitments, commute_minutes, main_problem, onboarding_completed',
        )
        .eq('id', userId)
        .maybeSingle();
      if (!alive) return;
      if (error || !row) {
        reverseHydratedRef.current = userId;
        setReverseSyncing(false);
        return;
      }
      const patch = mapFromProfileRow(row as ProfileRow);
      if (Object.keys(patch).length > 0) {
        setState((prev) => ({ ...prev, ...patch }));
      }
      reverseHydratedRef.current = userId;
      setReverseSyncing(false);
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, auth.user?.id, reverseHydrateTick]);

  const value = useMemo<OnboardingContextValue>(
    () => ({ state, hydrated, reverseSyncing, update, markCompleted, reset, syncProfile }),
    [state, hydrated, reverseSyncing, update, markCompleted, reset, syncProfile],
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
