/**
 * Local transition-plan store for anonymous users (no Supabase auth).
 * Mirrors the shape of useActiveTransitionPlan() so the same Home/Modal
 * UI works for signed-in and demo modes. Persists to AsyncStorage so an
 * anon user who creates a plan, closes the app and reopens still sees it.
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TransitionPlanWithSteps, TransitionStepRow } from '../queries';

const EVT = 'shiftrest:local_transition_changed';
const STORAGE_KEY = 'shiftrest:local-transition:v1';

let _state: TransitionPlanWithSteps | null = null;
let hydrated = false;

async function hydrate(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) _state = JSON.parse(raw) as TransitionPlanWithSteps;
  } catch {
    // ignore corrupt blob
  }
  hydrated = true;
  // Notify subscribers once hydration completes so any mounted views pick up
  // the restored plan (e.g. Home transition card shows after reopen).
  DeviceEventEmitter.emit(EVT);
}

void hydrate();

function persist() {
  if (_state) {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } else {
    void AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export function setLocalTransitionPlan(plan: TransitionPlanWithSteps): void {
  _state = plan;
  persist();
  DeviceEventEmitter.emit(EVT);
}

/** Direct read of the current local transition plan (snapshot, not a hook).
 *  Primarily used by unit tests to assert mutations without going through
 *  the React subscription. */
export function getLocalTransitionPlan(): TransitionPlanWithSteps | null {
  return _state;
}

export function clearLocalTransitionPlan(): void {
  _state = null;
  persist();
  DeviceEventEmitter.emit(EVT);
}

export function useLocalTransitionPlan(): TransitionPlanWithSteps | null {
  const [snap, setSnap] = useState<TransitionPlanWithSteps | null>(_state);
  useEffect(() => {
    // Snapshot on mount in case hydration completed before we subscribed.
    setSnap(_state);
    const sub = DeviceEventEmitter.addListener(EVT, () => setSnap(_state));
    return () => sub.remove();
  }, []);
  return snap;
}

/** Toggle a step's completion. */
export function toggleLocalTransitionStep(stepId: string): void {
  if (!_state) return;
  const next: TransitionStepRow[] = _state.steps.map((s) =>
    s.id === stepId ? { ...s, is_completed: !s.is_completed } : s,
  );
  const completed = next.filter((s) => s.is_completed).length;
  _state = { ..._state, steps: next, completed_steps: completed };
  persist();
  DeviceEventEmitter.emit(EVT);
}
