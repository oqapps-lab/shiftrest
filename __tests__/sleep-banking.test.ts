/**
 * Unit tests for lib/sleep-banking.ts — TODAY-11.
 *
 * Covers the four acceptance cases: BANK (night shift tomorrow), RECOVER
 * (off today after a ≥2-day run), NONE (neither), and the edge case where an
 * OFF day is NOT preceded by a run → NONE.
 */

import { sleepBankingState } from '../lib/sleep-banking';
import type { LocalShiftMap } from '../lib/local-shifts/store';

// 27 May 2026 (local) as the fixed 'today' for deterministic ISO math.
const TODAY = new Date(2026, 4, 27);

describe('sleepBankingState — BANK', () => {
  test('night shift TOMORROW → bank (when=tomorrow) with a nap window', () => {
    const shifts: LocalShiftMap = {
      '2026-05-27': 'off',
      '2026-05-28': 'night',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'off',
    });
    expect(r.mode).toBe('bank');
    if (r.mode === 'bank') {
      expect(r.params.when).toBe('tomorrow');
      // napWindowForShift('night') → full_cycle 14:00 / 90 min
      expect(r.params.nap.kind).toBe('full_cycle');
      expect(r.params.nap.hour).toBe(14);
      expect(r.params.nap.durationMin).toBe(90);
    }
  });

  test('night shift TODAY (no entry tomorrow) → bank (when=today)', () => {
    const shifts: LocalShiftMap = { '2026-05-27': 'night' };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'day',
    });
    expect(r.mode).toBe('bank');
    if (r.mode === 'bank') expect(r.params.when).toBe('today');
  });

  test('falls back to currentShift toggle when calendar empty (night today)', () => {
    const r = sleepBankingState({
      localShifts: {},
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'night',
    });
    expect(r.mode).toBe('bank');
    if (r.mode === 'bank') expect(r.params.when).toBe('today');
  });

  test('24/48 schedule: a scheduled day tomorrow is a hard 24h block → bank', () => {
    const shifts: LocalShiftMap = {
      '2026-05-27': 'off',
      '2026-05-28': 'day',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: '24-48',
      currentShift: 'off',
    });
    expect(r.mode).toBe('bank');
  });

  test('bank wins over recover when a hard shift is today AND a run just ended', () => {
    // Two work days before today, but today itself is a night shift.
    const shifts: LocalShiftMap = {
      '2026-05-25': 'day',
      '2026-05-26': 'day',
      '2026-05-27': 'night',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'night',
    });
    expect(r.mode).toBe('bank');
  });
});

describe('sleepBankingState — RECOVER', () => {
  test('off today after a 3-day run → recover with anchor window + paceDays', () => {
    const shifts: LocalShiftMap = {
      '2026-05-24': 'night',
      '2026-05-25': 'night',
      '2026-05-26': 'day',
      '2026-05-27': 'off',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'off',
    });
    expect(r.mode).toBe('recover');
    if (r.mode === 'recover') {
      expect(r.params.runLength).toBe(3);
      // anchorSleepWindow() → 04:00 — 08:00
      expect(r.params.anchor.startHour).toBe(4);
      expect(r.params.anchor.endHour).toBe(8);
      expect(r.params.paceDays).toBe(2);
    }
  });

  test('a longer run (≥4 days) bumps paceDays to 3', () => {
    const shifts: LocalShiftMap = {
      '2026-05-23': 'day',
      '2026-05-24': 'day',
      '2026-05-25': 'night',
      '2026-05-26': 'night',
      '2026-05-27': 'off',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'off',
    });
    expect(r.mode).toBe('recover');
    if (r.mode === 'recover') {
      expect(r.params.runLength).toBe(4);
      expect(r.params.paceDays).toBe(3);
    }
  });
});

describe('sleepBankingState — NONE', () => {
  test('off today with only ONE preceding work day → none (not a run)', () => {
    const shifts: LocalShiftMap = {
      '2026-05-25': 'off',
      '2026-05-26': 'day',
      '2026-05-27': 'off',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'off',
    });
    expect(r.mode).toBe('none');
  });

  test('off today NOT preceded by any worked day → none', () => {
    const shifts: LocalShiftMap = {
      '2026-05-26': 'off',
      '2026-05-27': 'off',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'off',
    });
    expect(r.mode).toBe('none');
  });

  test('plain day worker, day today + day tomorrow → none', () => {
    const shifts: LocalShiftMap = {
      '2026-05-27': 'day',
      '2026-05-28': 'day',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'day',
    });
    expect(r.mode).toBe('none');
  });

  test('gap (off) between work days breaks the run → none', () => {
    const shifts: LocalShiftMap = {
      '2026-05-24': 'day',
      '2026-05-25': 'off', // breaks the run
      '2026-05-26': 'day',
      '2026-05-27': 'off',
    };
    const r = sleepBankingState({
      localShifts: shifts,
      today: TODAY,
      nextShift: null,
      scheduleId: null,
      currentShift: 'off',
    });
    expect(r.mode).toBe('none');
  });
});
