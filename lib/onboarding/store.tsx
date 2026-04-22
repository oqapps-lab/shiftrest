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
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface OnboardingContextValue {
  state: OnboardingState;
  hydrated: boolean;
  update: (patch: Partial<OnboardingState>) => void;
  markCompleted: () => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

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
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => null);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ state, hydrated, update, markCompleted, reset }),
    [state, hydrated, update, markCompleted, reset],
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
