/**
 * Local transition-plan store for anonymous users (no Supabase auth).
 * Mirrors the shape of useActiveTransitionPlan() so the same Home/Modal
 * UI works for signed-in and demo modes.
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import type { TransitionPlanWithSteps, TransitionStepRow } from '../queries';

const EVT = 'shiftrest:local_transition_changed';
let _state: TransitionPlanWithSteps | null = null;

export function setLocalTransitionPlan(plan: TransitionPlanWithSteps): void {
  _state = plan;
  DeviceEventEmitter.emit(EVT);
}

export function clearLocalTransitionPlan(): void {
  _state = null;
  DeviceEventEmitter.emit(EVT);
}

export function useLocalTransitionPlan(): TransitionPlanWithSteps | null {
  const [snap, setSnap] = useState<TransitionPlanWithSteps | null>(_state);
  useEffect(() => {
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
  DeviceEventEmitter.emit(EVT);
}
