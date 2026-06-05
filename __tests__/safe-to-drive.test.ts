/**
 * Unit tests for lib/safe-to-drive.ts — the post-shift drowsy-driving
 * self-check classifier. Pure + deterministic, so we assert the exact
 * risk tier + recommendation set for every answer combination.
 *
 * Acceptance: answers → risk → recommendation set, deterministic, never
 * under-warns (acute sleepiness always escalates).
 */

import {
  classifyDriveRisk,
  recsForRisk,
  type Alertness,
  type PreShiftSleep,
} from '../lib/safe-to-drive';

describe('classifyDriveRisk — risk tiers', () => {
  test('wide awake + 7h+ → low risk, reassurance only', () => {
    const r = classifyDriveRisk('awake', '7plus');
    expect(r.risk).toBe('low');
    expect(r.recs).toEqual(['good']);
  });

  test('wide awake + under 6h → elevated (micro-sleep risk persists)', () => {
    const r = classifyDriveRisk('awake', 'under6');
    expect(r.risk).toBe('elevated');
    expect(r.recs).toEqual(['nap', 'caffeine']);
  });

  test('foggy + 7h+ → elevated', () => {
    const r = classifyDriveRisk('foggy', '7plus');
    expect(r.risk).toBe('elevated');
    expect(r.recs).toEqual(['nap', 'caffeine']);
  });

  test('foggy + under 6h → escalates to high', () => {
    const r = classifyDriveRisk('foggy', 'under6');
    expect(r.risk).toBe('high');
    expect(r.recs).toEqual(['nap', 'caffeine', 'rideshare']);
  });

  test('running on empty → high regardless of sleep', () => {
    expect(classifyDriveRisk('empty', '7plus').risk).toBe('high');
    expect(classifyDriveRisk('empty', 'under6').risk).toBe('high');
    expect(classifyDriveRisk('empty', null).risk).toBe('high');
  });
});

describe('classifyDriveRisk — Q2 unanswered (conservative branch)', () => {
  test('wide awake, no sleep answer → low', () => {
    expect(classifyDriveRisk('awake', null).risk).toBe('low');
  });

  test('foggy, no sleep answer → elevated (never under-warns)', () => {
    expect(classifyDriveRisk('foggy', null).risk).toBe('elevated');
  });
});

describe('recsForRisk — recommendation ordering', () => {
  test('low → reassurance', () => {
    expect(recsForRisk('low')).toEqual(['good']);
  });
  test('elevated → nap then caffeine', () => {
    expect(recsForRisk('elevated')).toEqual(['nap', 'caffeine']);
  });
  test('high → nap, caffeine, then defer the drive', () => {
    expect(recsForRisk('high')).toEqual(['nap', 'caffeine', 'rideshare']);
  });
});

describe('classifyDriveRisk — exhaustive determinism', () => {
  test('every answer combination yields a stable, non-empty rec set', () => {
    const alertnessOptions: Alertness[] = ['awake', 'foggy', 'empty'];
    const sleepOptions: PreShiftSleep[] = ['7plus', 'under6', null];
    for (const a of alertnessOptions) {
      for (const s of sleepOptions) {
        const r1 = classifyDriveRisk(a, s);
        const r2 = classifyDriveRisk(a, s);
        expect(r1).toEqual(r2);
        expect(r1.recs.length).toBeGreaterThan(0);
        expect(['low', 'elevated', 'high']).toContain(r1.risk);
      }
    }
  });
});
