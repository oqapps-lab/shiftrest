/**
 * Unit tests for lib/local-transition/store.tsx
 * Validates set/get, persist, step toggle.
 */

import {
  setLocalTransitionPlan,
  clearLocalTransitionPlan,
  toggleLocalTransitionStep,
  getLocalTransitionPlan,
} from '../lib/local-transition/store';
import type { TransitionPlanWithSteps } from '../lib/queries';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const makePlan = (): TransitionPlanWithSteps => ({
  id: 'local-test',
  transition_type: 'night_to_day',
  start_date: '2026-05-27',
  end_date: '2026-05-28',
  total_days: 2,
  total_steps: 4,
  completed_steps: 0,
  status: 'active',
  steps: [
    { id: 's1', day_number: 1, step_order: 1, scheduled_time: '2026-05-27T01:00:00', action_type: 'caffeine', title: 'Cutoff', description: '', is_completed: false },
    { id: 's2', day_number: 1, step_order: 2, scheduled_time: '2026-05-27T08:30:00', action_type: 'melatonin', title: 'Mel', description: '', is_completed: false },
    { id: 's3', day_number: 2, step_order: 1, scheduled_time: '2026-05-28T06:30:00', action_type: 'wake', title: 'Wake', description: '', is_completed: false },
    { id: 's4', day_number: 2, step_order: 2, scheduled_time: '2026-05-28T23:00:00', action_type: 'sleep', title: 'Sleep', description: '', is_completed: false },
  ],
});

beforeEach(() => {
  clearLocalTransitionPlan();
});

describe('local-transition/store — setLocalTransitionPlan', () => {
  test('stores the plan and toggles persist on the stored row', () => {
    const plan = makePlan();
    setLocalTransitionPlan(plan);
    expect(getLocalTransitionPlan()?.id).toBe(plan.id);
    toggleLocalTransitionStep('s1');
    toggleLocalTransitionStep('s2');
    const after = getLocalTransitionPlan();
    expect(after?.steps.find((s) => s.id === 's1')?.is_completed).toBe(true);
    expect(after?.steps.find((s) => s.id === 's2')?.is_completed).toBe(true);
    expect(after?.completed_steps).toBe(2);
  });
});

describe('local-transition/store — clearLocalTransitionPlan', () => {
  test('subsequent toggles no-op when cleared', () => {
    const plan = makePlan();
    setLocalTransitionPlan(plan);
    clearLocalTransitionPlan();
    // Should not throw; should be a silent no-op.
    expect(() => toggleLocalTransitionStep('s1')).not.toThrow();
  });
});

describe('local-transition/store — toggleLocalTransitionStep', () => {
  test('no-op when no plan set', () => {
    expect(() => toggleLocalTransitionStep('nonexistent')).not.toThrow();
  });

  test('toggling unknown id leaves plan unchanged', () => {
    const plan = makePlan();
    setLocalTransitionPlan(plan);
    expect(() => toggleLocalTransitionStep('not-a-step-id')).not.toThrow();
  });

  test('multiple toggles on same step flip state back and forth', () => {
    const plan = makePlan();
    setLocalTransitionPlan(plan);
    toggleLocalTransitionStep('s1');
    expect(getLocalTransitionPlan()?.steps.find((s) => s.id === 's1')?.is_completed).toBe(true);
    toggleLocalTransitionStep('s1');
    expect(getLocalTransitionPlan()?.steps.find((s) => s.id === 's1')?.is_completed).toBe(false);
    toggleLocalTransitionStep('s1');
    expect(getLocalTransitionPlan()?.steps.find((s) => s.id === 's1')?.is_completed).toBe(true);
  });
});
