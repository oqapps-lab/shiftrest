/**
 * TODAY-7 — unit tests for lib/caffeine-adaptive.ts
 *
 * Validates the half-life model: an early cup is clear for sleep, a late cup
 * triggers the warning, slow vs normal metabolisers differ, and the log
 * wrapper returns null when no cup is logged today.
 */

import {
  computeAdaptiveCaffeine,
  adaptiveCaffeineFromLog,
  fadeHoursFor,
} from '../lib/caffeine-adaptive';
import {
  logCaffeine,
  clearCaffeineLog,
} from '../lib/caffeine-log/store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  clearCaffeineLog();
});

describe('caffeine-adaptive — fadeHoursFor', () => {
  test('normal/unknown/null metaboliser fades in 6h', () => {
    expect(fadeHoursFor('normal')).toBe(6);
    expect(fadeHoursFor('unknown')).toBe(6);
    expect(fadeHoursFor(null)).toBe(6);
  });

  test('slow metaboliser fades in 8h', () => {
    expect(fadeHoursFor('slow')).toBe(8);
  });
});

describe('caffeine-adaptive — computeAdaptiveCaffeine', () => {
  // Sleep window opens at 23:00 for these cases.
  const SLEEP = 23;

  test('early cup is clear for sleep (normal)', () => {
    // 14:00 cup, normal → fades 20:00, well before 23:00 sleep.
    const r = computeAdaptiveCaffeine(14, 'normal', SLEEP);
    expect(r.clearForSleep).toBe(true);
    expect(r.fadesAt).toBe(20);
    // recommended cutoff = sleep - 6 = 17:00
    expect(r.recommendedCutoff).toBe(17);
  });

  test('late cup is NOT clear → warning (normal)', () => {
    // 19:00 cup, normal → fades 01:00 (next day), past 23:00 sleep.
    const r = computeAdaptiveCaffeine(19, 'normal', SLEEP);
    expect(r.clearForSleep).toBe(false);
    expect(r.fadesAt).toBe(1); // 25 → 01:00 on the ring
  });

  test('cup exactly at the recommended cutoff is still clear (boundary)', () => {
    // 17:00 cup, normal → fades exactly 23:00 == sleep → clear (>= boundary).
    const r = computeAdaptiveCaffeine(17, 'normal', SLEEP);
    expect(r.clearForSleep).toBe(true);
    expect(r.fadesAt).toBe(23);
  });

  test('slow vs normal differ for the same mid cup', () => {
    // 16:00 cup, sleep 23:00.
    const normal = computeAdaptiveCaffeine(16, 'normal', SLEEP);
    const slow = computeAdaptiveCaffeine(16, 'slow', SLEEP);
    // normal fades 22:00 (clear); slow fades 24:00→00:00 (NOT clear).
    expect(normal.clearForSleep).toBe(true);
    expect(slow.clearForSleep).toBe(false);
    // slow's recommended cutoff is 2h earlier than normal's.
    expect(normal.recommendedCutoff).toBe(17); // 23 - 6
    expect(slow.recommendedCutoff).toBe(15); // 23 - 8
    expect(slow.fadesAt).toBe(0); // 16 + 8 = 24 → 00:00
    expect(normal.fadesAt).toBe(22);
  });

  test('handles midnight-crossing sleep window (early-morning sleeper)', () => {
    // Night worker: sleeps at 08:00. A 23:00 cup, normal → fades 05:00,
    // which is before the 08:00 sleep → clear.
    const r = computeAdaptiveCaffeine(23, 'normal', 8);
    expect(r.fadesAt).toBe(5);
    expect(r.clearForSleep).toBe(true);
    // A 04:00 cup → fades 10:00, AFTER the 08:00 sleep → warning.
    const late = computeAdaptiveCaffeine(4, 'normal', 8);
    expect(late.fadesAt).toBe(10);
    expect(late.clearForSleep).toBe(false);
  });

  test('handles fractional (mid-hour) cup times', () => {
    const r = computeAdaptiveCaffeine(14.5, 'normal', SLEEP);
    expect(r.fadesAt).toBeCloseTo(20.5, 5);
    expect(r.clearForSleep).toBe(true);
  });
});

describe('caffeine-adaptive — adaptiveCaffeineFromLog', () => {
  test('null when no cup logged today', () => {
    expect(adaptiveCaffeineFromLog('normal', 23)).toBeNull();
  });

  test('returns a read derived from the logged cup', () => {
    logCaffeine();
    const r = adaptiveCaffeineFromLog('normal', 23);
    expect(r).not.toBeNull();
    expect(typeof r!.fadesAt).toBe('number');
    expect(typeof r!.clearForSleep).toBe('boolean');
    // lastCupHour echoes the just-logged "now" hour on the ring.
    const now = new Date();
    const expected = now.getHours() + now.getMinutes() / 60;
    expect(r!.lastCupHour).toBeCloseTo(expected, 1);
  });
});
