/**
 * Unit tests for lib/transition/generate.ts
 * Validates rule-based transition plan generation + auto-detect.
 */

import {
  generateTransitionPlan,
  detectTransitionOpportunity,
  type TransitionType,
} from '../lib/transition/generate';
import type { ShiftKind } from '../lib/onboarding/store';

describe('generateTransitionPlan — Night→Day', () => {
  const start = new Date(2026, 4, 27);  // 27 May 2026

  test('returns transition_type = night_to_day', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    expect(plan.transition_type).toBe('night_to_day');
  });

  test('total_days = 2', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    expect(plan.total_days).toBe(2);
  });

  test('start_date matches input', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    expect(plan.start_date).toBe('2026-05-27');
  });

  test('end_date is +1 day', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    expect(plan.end_date).toBe('2026-05-28');
  });

  test('total_steps matches steps.length', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    expect(plan.total_steps).toBe(plan.steps.length);
  });

  test('steps are split across 2 days', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    const days = new Set(plan.steps.map((s) => s.day_number));
    expect(days).toEqual(new Set([1, 2]));
  });

  test('opt-out melatonin skips melatonin steps', () => {
    const planWith = generateTransitionPlan('night_to_day', start, { takesMelatonin: true });
    const planWithout = generateTransitionPlan('night_to_day', start, { takesMelatonin: false });
    const melatoninStepsWith = planWith.steps.filter((s) => s.action_type === 'melatonin');
    const melatoninStepsWithout = planWithout.steps.filter((s) => s.action_type === 'melatonin');
    expect(melatoninStepsWith.length).toBeGreaterThan(0);
    expect(melatoninStepsWithout.length).toBe(0);
  });

  test('caffeineCupsPerDay=0 skips caffeine steps', () => {
    const planWith = generateTransitionPlan('night_to_day', start, { caffeineCupsPerDay: 2 });
    const planWithout = generateTransitionPlan('night_to_day', start, { caffeineCupsPerDay: 0 });
    const caffWith = planWith.steps.filter((s) => s.action_type === 'caffeine');
    const caffWithout = planWithout.steps.filter((s) => s.action_type === 'caffeine');
    expect(caffWith.length).toBeGreaterThan(0);
    expect(caffWithout.length).toBe(0);
  });

  test('usesLightTherapy=false skips light steps', () => {
    const planWith = generateTransitionPlan('night_to_day', start, { usesLightTherapy: true });
    const planWithout = generateTransitionPlan('night_to_day', start, { usesLightTherapy: false });
    const lightWith = planWith.steps.filter((s) => s.action_type === 'light');
    const lightWithout = planWithout.steps.filter((s) => s.action_type === 'light');
    expect(lightWith.length).toBeGreaterThan(0);
    expect(lightWithout.length).toBe(0);
  });

  test('each step has scheduled_time in ISO local format (no Z)', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    for (const step of plan.steps) {
      expect(step.scheduled_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      expect(step.scheduled_time).not.toContain('Z');
    }
  });

  test('day 1 steps are dated start_date', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    const day1 = plan.steps.filter((s) => s.day_number === 1);
    for (const s of day1) {
      expect(s.scheduled_time.startsWith('2026-05-27')).toBe(true);
    }
  });

  test('day 2 steps are dated end_date', () => {
    const plan = generateTransitionPlan('night_to_day', start, {});
    const day2 = plan.steps.filter((s) => s.day_number === 2);
    for (const s of day2) {
      expect(s.scheduled_time.startsWith('2026-05-28')).toBe(true);
    }
  });

  test('step_order is sequential within each day', () => {
    const plan = generateTransitionPlan('night_to_day', start, { takesMelatonin: true });
    const day1 = plan.steps.filter((s) => s.day_number === 1);
    const orders = day1.map((s) => s.step_order);
    expect(orders).toEqual(Array.from({ length: orders.length }, (_, i) => i + 1));
  });

  test('full prefs produces both melatonin and caffeine on day 1', () => {
    const plan = generateTransitionPlan('night_to_day', start, {
      takesMelatonin: true,
      caffeineCupsPerDay: 2,
      usesLightTherapy: true,
    });
    const day1 = plan.steps.filter((s) => s.day_number === 1);
    const types = day1.map((s) => s.action_type);
    expect(types).toContain('melatonin');
    expect(types).toContain('caffeine');
    expect(types).toContain('light');
    expect(types).toContain('sleep');
  });
});

describe('generateTransitionPlan — Day→Night', () => {
  const start = new Date(2026, 4, 27);

  test('returns transition_type = day_to_night', () => {
    const plan = generateTransitionPlan('day_to_night', start, {});
    expect(plan.transition_type).toBe('day_to_night');
  });

  test('day 2 has a wake step', () => {
    const plan = generateTransitionPlan('day_to_night', start, {});
    const day2 = plan.steps.filter((s) => s.day_number === 2);
    const wakeSteps = day2.filter((s) => s.action_type === 'wake');
    expect(wakeSteps.length).toBeGreaterThan(0);
  });

  test('respects light therapy opt-out', () => {
    const planWith = generateTransitionPlan('day_to_night', start, { usesLightTherapy: true });
    const planWithout = generateTransitionPlan('day_to_night', start, { usesLightTherapy: false });
    expect(planWith.steps.filter((s) => s.action_type === 'light').length).toBeGreaterThan(0);
    expect(planWithout.steps.filter((s) => s.action_type === 'light').length).toBe(0);
  });

  test('respects caffeine opt-out', () => {
    const plan = generateTransitionPlan('day_to_night', start, { caffeineCupsPerDay: 0 });
    expect(plan.steps.filter((s) => s.action_type === 'caffeine').length).toBe(0);
  });
});

describe('detectTransitionOpportunity', () => {
  const todayIso = '2026-05-27';

  test('returns null when map empty', () => {
    const result = detectTransitionOpportunity(new Map(), todayIso);
    expect(result).toBeNull();
  });

  test('detects night today → off tomorrow as night_to_day', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'night'],
      ['2026-05-28', 'off'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result).toEqual({ type: 'night_to_day', startIso: '2026-05-27' });
  });

  test('detects night today → day tomorrow as night_to_day', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'night'],
      ['2026-05-28', 'day'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result?.type).toBe('night_to_day');
  });

  test('detects day today → night tomorrow as day_to_night', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'day'],
      ['2026-05-28', 'night'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result).toEqual({ type: 'day_to_night', startIso: '2026-05-27' });
  });

  test('detects pivot 3 days ahead within 7-day window', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-30', 'night'],
      ['2026-05-31', 'off'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result?.startIso).toBe('2026-05-30');
  });

  test('returns null when no pivot in next 7 days', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'off'],
      ['2026-05-28', 'off'],
      ['2026-05-29', 'off'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result).toBeNull();
  });

  test('night→night does NOT trigger', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'night'],
      ['2026-05-28', 'night'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result).toBeNull();
  });

  test('day→day does NOT trigger', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'day'],
      ['2026-05-28', 'day'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result).toBeNull();
  });

  test('returns earliest opportunity if multiple exist', () => {
    const m = new Map<string, ShiftKind>([
      ['2026-05-27', 'day'],
      ['2026-05-28', 'night'],
      ['2026-05-30', 'day'],
      ['2026-05-31', 'night'],
    ]);
    const result = detectTransitionOpportunity(m, todayIso);
    expect(result?.startIso).toBe('2026-05-27');
  });
});
