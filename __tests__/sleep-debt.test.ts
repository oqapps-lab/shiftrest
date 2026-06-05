/**
 * Unit tests for lib/sleep-debt.ts — the cumulative sleep-debt model.
 *
 * Pure + deterministic. We pin a fixed `today` and build hours-by-date maps
 * relative to it so the window math is reproducible regardless of when the
 * suite runs. Acceptance: no logged days → none/empty (no fake number),
 * accumulating deficit → moderate/severe, clears math, partial logging only
 * counts logged days.
 */

import {
  computeSleepDebt,
  sleepNeedForChronotype,
  DEFAULT_SLEEP_NEED,
} from '../lib/sleep-debt';

const TODAY = new Date(2026, 5, 4); // 2026-06-04, fixed reference

/** Build YYYY-MM-DD for `daysAgo` before TODAY. */
function iso(daysAgo: number): string {
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('computeSleepDebt — empty / honest empty state', () => {
  test('no logged days → none, zero debt, zero clears, zero loggedDays', () => {
    const r = computeSleepDebt({}, DEFAULT_SLEEP_NEED, TODAY);
    expect(r.debtHours).toBe(0);
    expect(r.severity).toBe('none');
    expect(r.clearsInDays).toBe(0);
    expect(r.loggedDays).toBe(0);
  });

  test('all logged days at or above need → none, no fake debt', () => {
    const map = { [iso(0)]: 8, [iso(1)]: 7.5, [iso(2)]: 9 };
    const r = computeSleepDebt(map, 7.5, TODAY);
    expect(r.debtHours).toBe(0);
    expect(r.severity).toBe('none');
    expect(r.clearsInDays).toBe(0);
    expect(r.loggedDays).toBe(3);
  });
});

describe('computeSleepDebt — severity bands', () => {
  test('a single small shortfall → mild (<2h)', () => {
    // one day 1h short of 7.5h need
    const r = computeSleepDebt({ [iso(0)]: 6.5 }, 7.5, TODAY);
    expect(r.debtHours).toBe(1);
    expect(r.severity).toBe('mild');
  });

  test('accumulating deficit lands moderate (2–5h)', () => {
    // three days each ~1.5h short → 4.5h debt
    const map = { [iso(0)]: 6, [iso(1)]: 6, [iso(2)]: 6 };
    const r = computeSleepDebt(map, 7.5, TODAY);
    expect(r.debtHours).toBe(4.5);
    expect(r.severity).toBe('moderate');
  });

  test('heavy accumulating deficit → severe (>5h)', () => {
    // four days each 2h short → 8h debt
    const map = { [iso(0)]: 5.5, [iso(1)]: 5.5, [iso(2)]: 5.5, [iso(3)]: 5.5 };
    const r = computeSleepDebt(map, 7.5, TODAY);
    expect(r.debtHours).toBe(8);
    expect(r.severity).toBe('severe');
  });

  test('boundary: exactly 2h debt → moderate (band is 2–5 inclusive)', () => {
    const r = computeSleepDebt({ [iso(0)]: 5.5 }, 7.5, TODAY);
    expect(r.debtHours).toBe(2);
    expect(r.severity).toBe('moderate');
  });
});

describe('computeSleepDebt — clears-in math', () => {
  test('clears = ceil(debt / 1.5)', () => {
    // 4.5h debt / 1.5 = 3 days exactly
    const r = computeSleepDebt({ [iso(0)]: 6, [iso(1)]: 6, [iso(2)]: 6 }, 7.5, TODAY);
    expect(r.clearsInDays).toBe(3);
  });

  test('non-integer ratio rounds up', () => {
    // 8h debt / 1.5 = 5.33 → 6 days
    const map = { [iso(0)]: 5.5, [iso(1)]: 5.5, [iso(2)]: 5.5, [iso(3)]: 5.5 };
    const r = computeSleepDebt(map, 7.5, TODAY);
    expect(r.clearsInDays).toBe(6);
  });
});

describe('computeSleepDebt — partial logging & windowing', () => {
  test('only logged days count; over-sleep does NOT offset other days', () => {
    // one short day (-2h), one long day (+2h). Debt counts only the shortfall.
    const map = { [iso(0)]: 5.5, [iso(1)]: 9.5 };
    const r = computeSleepDebt(map, 7.5, TODAY);
    expect(r.debtHours).toBe(2);
    expect(r.loggedDays).toBe(2);
    expect(r.severity).toBe('moderate');
  });

  test('days outside the window are ignored', () => {
    // a big deficit 20 days ago must not count in a 14-day window
    const r = computeSleepDebt({ [iso(20)]: 3 }, 7.5, TODAY, 14);
    expect(r.debtHours).toBe(0);
    expect(r.loggedDays).toBe(0);
    expect(r.severity).toBe('none');
  });

  test('corrupt / non-positive values are skipped, not treated as 0h sleep', () => {
    const map: Record<string, number> = {
      [iso(0)]: 0, // not a real log
      [iso(1)]: -3, // corrupt
      [iso(2)]: Number.NaN, // corrupt
      [iso(3)]: 6.5, // the only valid log → 1h short
    };
    const r = computeSleepDebt(map, 7.5, TODAY);
    expect(r.loggedDays).toBe(1);
    expect(r.debtHours).toBe(1);
    expect(r.severity).toBe('mild');
  });
});

describe('sleepNeedForChronotype', () => {
  test('default is 7.5h', () => {
    expect(DEFAULT_SLEEP_NEED).toBe(7.5);
    expect(sleepNeedForChronotype(null)).toBe(7.5);
    expect(sleepNeedForChronotype('intermediate')).toBe(7.5);
  });

  test('owls need slightly more, larks slightly less', () => {
    expect(sleepNeedForChronotype('owl')).toBe(7.75);
    expect(sleepNeedForChronotype('lark')).toBe(7.25);
  });

  test('determinism — same inputs, same result', () => {
    const map = { [iso(0)]: 6, [iso(1)]: 6 };
    expect(computeSleepDebt(map, 7.5, TODAY)).toEqual(computeSleepDebt(map, 7.5, TODAY));
  });
});
