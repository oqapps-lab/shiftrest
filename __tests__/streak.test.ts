/**
 * TODAY-4 — unit tests for lib/streak.ts.
 *
 * Covers the pure resolver (consecutive continues, same-day no-op,
 * 1-day-gap+freeze keeps streak & consumes freeze, 1-day-gap+no-freeze
 * resets, multi-day-gap resets) and the AsyncStorage ledger (grant 2 /
 * month, consume decrements, month rollover refills).
 */

import {
  resolveStreak,
  normalizeLedger,
  availableFromLedger,
  monthKey,
  getAvailableFreezes,
  consumeFreeze,
  FREEZE_STORAGE_KEY,
  FREEZES_PER_MONTH,
  type FreezeLedger,
} from '../lib/streak';

// In-memory AsyncStorage mock so ledger persistence is observable.
let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

beforeEach(() => {
  mockStore = {};
});

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('resolveStreak — pure resolver', () => {
  const today = new Date(2026, 5, 15); // 2026-06-15 local

  test('same-day log → unchanged, not at risk, no freeze', () => {
    const r = resolveStreak({ lastDateIso: iso(today), currentStreak: 7, today, freezes: 2 });
    expect(r).toEqual({ streak: 7, freezeConsumed: false, atRisk: false });
  });

  test('consecutive (logged yesterday) → streak intact, AT RISK, no freeze', () => {
    const yest = new Date(2026, 5, 14);
    const r = resolveStreak({ lastDateIso: iso(yest), currentStreak: 7, today, freezes: 2 });
    expect(r).toEqual({ streak: 7, freezeConsumed: false, atRisk: true });
  });

  test('1 missed day + freeze available → KEEP streak, consume freeze, at risk', () => {
    const twoAgo = new Date(2026, 5, 13);
    const r = resolveStreak({ lastDateIso: iso(twoAgo), currentStreak: 7, today, freezes: 2 });
    expect(r).toEqual({ streak: 7, freezeConsumed: true, atRisk: true });
  });

  test('1 missed day + NO freeze → reset to 0', () => {
    const twoAgo = new Date(2026, 5, 13);
    const r = resolveStreak({ lastDateIso: iso(twoAgo), currentStreak: 7, today, freezes: 0 });
    expect(r).toEqual({ streak: 0, freezeConsumed: false, atRisk: false });
  });

  test('multi-day gap (3 days) even with freezes → reset', () => {
    const threeAgo = new Date(2026, 5, 12);
    const r = resolveStreak({ lastDateIso: iso(threeAgo), currentStreak: 9, today, freezes: 2 });
    expect(r).toEqual({ streak: 0, freezeConsumed: false, atRisk: false });
  });

  test('no lastDate → passthrough, not at risk', () => {
    const r = resolveStreak({ lastDateIso: null, currentStreak: 0, today, freezes: 2 });
    expect(r).toEqual({ streak: 0, freezeConsumed: false, atRisk: false });
  });

  test('streak 0 → never at risk, never consumes a freeze', () => {
    const yest = new Date(2026, 5, 14);
    const r = resolveStreak({ lastDateIso: iso(yest), currentStreak: 0, today, freezes: 2 });
    expect(r).toEqual({ streak: 0, freezeConsumed: false, atRisk: false });
  });

  test('clock skew (lastDate in the future) → treated as logged today', () => {
    const tomorrow = new Date(2026, 5, 16);
    const r = resolveStreak({ lastDateIso: iso(tomorrow), currentStreak: 4, today, freezes: 1 });
    expect(r).toEqual({ streak: 4, freezeConsumed: false, atRisk: false });
  });

  test('1 missed day crossing a month boundary still consumes a freeze', () => {
    const jul1 = new Date(2026, 6, 1); // 2026-07-01
    const jun29 = new Date(2026, 5, 29); // 2026-06-29 → 1 missed day (06-30)
    const r = resolveStreak({ lastDateIso: iso(jun29), currentStreak: 12, today: jul1, freezes: 1 });
    expect(r).toEqual({ streak: 12, freezeConsumed: true, atRisk: true });
  });

  test('malformed lastDate → safe passthrough', () => {
    const r = resolveStreak({ lastDateIso: 'not-a-date', currentStreak: 5, today, freezes: 2 });
    expect(r).toEqual({ streak: 5, freezeConsumed: false, atRisk: false });
  });
});

describe('freeze ledger — pure helpers', () => {
  test('normalizeLedger refills used→0 on month change', () => {
    const now = new Date(2026, 5, 15); // 2026-06
    const stale: FreezeLedger = { month: '2026-05', used: 2 };
    expect(normalizeLedger(stale, now)).toEqual({ month: '2026-06', used: 0 });
  });

  test('normalizeLedger keeps used within the same month', () => {
    const now = new Date(2026, 5, 15);
    const cur: FreezeLedger = { month: '2026-06', used: 1 };
    expect(normalizeLedger(cur, now)).toEqual({ month: '2026-06', used: 1 });
  });

  test('normalizeLedger clamps a corrupt over-count', () => {
    const now = new Date(2026, 5, 15);
    expect(normalizeLedger({ month: '2026-06', used: 99 }, now)).toEqual({
      month: '2026-06',
      used: FREEZES_PER_MONTH,
    });
  });

  test('availableFromLedger = 2 - used', () => {
    expect(availableFromLedger({ month: '2026-06', used: 0 })).toBe(2);
    expect(availableFromLedger({ month: '2026-06', used: 2 })).toBe(0);
  });

  test('monthKey formats local YYYY-MM', () => {
    expect(monthKey(new Date(2026, 0, 9))).toBe('2026-01');
    expect(monthKey(new Date(2026, 11, 31))).toBe('2026-12');
  });
});

describe('freeze ledger — AsyncStorage', () => {
  const now = new Date(2026, 5, 15);

  test('fresh device grants 2 freezes this month', async () => {
    await expect(getAvailableFreezes(now)).resolves.toBe(2);
  });

  test('consume decrements remaining and persists', async () => {
    await expect(consumeFreeze(now)).resolves.toBe(1);
    await expect(getAvailableFreezes(now)).resolves.toBe(1);
    await expect(consumeFreeze(now)).resolves.toBe(0);
    await expect(getAvailableFreezes(now)).resolves.toBe(0);
  });

  test('consume past the monthly cap is a no-op', async () => {
    await consumeFreeze(now);
    await consumeFreeze(now);
    await expect(consumeFreeze(now)).resolves.toBe(0);
    const raw = mockStore[FREEZE_STORAGE_KEY];
    expect(JSON.parse(raw).used).toBe(FREEZES_PER_MONTH);
  });

  test('month rollover refills the allowance', async () => {
    await consumeFreeze(now); // June: used 1
    await consumeFreeze(now); // June: used 2 → 0 left
    await expect(getAvailableFreezes(now)).resolves.toBe(0);

    const nextMonth = new Date(2026, 6, 2); // 2026-07-02
    await expect(getAvailableFreezes(nextMonth)).resolves.toBe(2);
    // and the persisted ledger now points at the new month
    expect(JSON.parse(mockStore[FREEZE_STORAGE_KEY]).month).toBe('2026-07');
  });
});
