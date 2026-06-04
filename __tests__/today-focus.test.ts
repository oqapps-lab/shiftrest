/**
 * Unit tests for lib/today-focus.ts (TODAY-6 "Today's Focus").
 *
 * Pure module — no RN/AsyncStorage mocks needed. Each test pins one
 * precedence branch and asserts the chosen focus key, glyph, and that an
 * exact {{time}} param is produced. Determinism is verified by re-running
 * the same inputs.
 */

import {
  computeTodaysFocus,
  type FocusArgs,
  type WeeklyTally,
} from '../lib/today-focus';
import type { SuggestedPlan } from '../lib/derive';

const DAY_PLAN: SuggestedPlan = {
  sleepStart: 23,
  sleepEnd: 7,
  caffeineCutoff: '14:00',
  melatoninTime: '21:30',
  shiftStart: 7,
  shiftEnd: 19,
};

const NIGHT_PLAN: SuggestedPlan = {
  sleepStart: 9,
  sleepEnd: 17,
  caffeineCutoff: '02:00',
  melatoninTime: '07:30',
  shiftStart: 19,
  shiftEnd: 7,
};

function baseArgs(overrides: Partial<FocusArgs> = {}): FocusArgs {
  return {
    nowHour: 10,
    shift: 'day',
    plan: DAY_PLAN,
    takesMelatonin: false,
    caffeineCupsPerDay: 2,
    caffeineSensitivity: 'normal',
    cupsToday: 0,
    lastCupHour: null,
    tally: null,
    napHour: 14,
    ...overrides,
  };
}

const HHMM = /^\d{2}:\d{2}$/;

describe('computeTodaysFocus — precedence 1: caffeine load', () => {
  test('cups today >= daily norm → caffeine_load with exact cutoff time', () => {
    const r = computeTodaysFocus(baseArgs({ caffeineCupsPerDay: 2, cupsToday: 2 }));
    expect(r.key).toBe('caffeine_load');
    expect(r.glyph).toBe('coffee');
    expect(r.params.time).toMatch(HHMM);
    expect(r.titleKey).toBe('today.focus.caffeine_load_title');
  });

  test('a late cup (close to sleep) → caffeine_load even under norm', () => {
    // Day plan: sleep 23:00, recommended cutoff = min(14:00, 17:00) = 14:00.
    // A cup at 18:00 is AFTER the cutoff → late.
    const r = computeTodaysFocus(
      baseArgs({ caffeineCupsPerDay: 4, cupsToday: 1, lastCupHour: 18, nowHour: 18.5 }),
    );
    expect(r.key).toBe('caffeine_load');
    expect(r.params.time).toMatch(HHMM);
  });

  test('slow metaboliser gets an earlier recommended cutoff', () => {
    const normal = computeTodaysFocus(
      baseArgs({ cupsToday: 2, caffeineSensitivity: 'normal' }),
    );
    const slow = computeTodaysFocus(
      baseArgs({ cupsToday: 2, caffeineSensitivity: 'slow' }),
    );
    // Slow buffer pushes the cutoff earlier (or equal when clamped by plan).
    expect(slow.params.time <= normal.params.time).toBe(true);
  });

  test('caffeine NOT surfaced when user opted out (norm = 0)', () => {
    const r = computeTodaysFocus(
      baseArgs({ caffeineCupsPerDay: 0, cupsToday: 3, lastCupHour: 20 }),
    );
    expect(r.key).not.toBe('caffeine_load');
  });
});

describe('computeTodaysFocus — precedence 2: rough-night streak', () => {
  test('trend down → rough_streak with the nap-window time', () => {
    const tally: WeeklyTally = { good: 1, ok: 1, bad: 1, trend: 'down' };
    const r = computeTodaysFocus(baseArgs({ tally, napHour: 14 }));
    expect(r.key).toBe('rough_streak');
    expect(r.glyph).toBe('bed');
    expect(r.params.time).toMatch(HHMM);
    expect(r.params.time).toBe('14:00');
  });

  test('>=2 rough nights (flat trend) → rough_streak', () => {
    const tally: WeeklyTally = { good: 0, ok: 2, bad: 2, trend: 'flat' };
    const r = computeTodaysFocus(baseArgs({ tally }));
    expect(r.key).toBe('rough_streak');
  });

  test('caffeine load OUTRANKS a rough streak (precedence 1 wins)', () => {
    const tally: WeeklyTally = { good: 0, ok: 0, bad: 3, trend: 'down' };
    const r = computeTodaysFocus(baseArgs({ cupsToday: 5, tally }));
    expect(r.key).toBe('caffeine_load');
  });
});

describe('computeTodaysFocus — precedence 3: night nap before nadir', () => {
  test('night shift, evening, nadir ahead → night_nap around 03:00', () => {
    const r = computeTodaysFocus(
      baseArgs({ shift: 'night', plan: NIGHT_PLAN, nowHour: 22, napHour: 14 }),
    );
    expect(r.key).toBe('night_nap');
    expect(r.glyph).toBe('bed');
    expect(r.params.time).toBe('03:00');
  });

  test('night shift already past the nadir (morning) → NOT night_nap', () => {
    const r = computeTodaysFocus(
      baseArgs({ shift: 'night', plan: NIGHT_PLAN, nowHour: 4 }),
    );
    expect(r.key).not.toBe('night_nap');
  });
});

describe('computeTodaysFocus — precedence 4: phase-default fallbacks', () => {
  test('inside the sleep window → sleep_window, time = wake time', () => {
    const r = computeTodaysFocus(baseArgs({ nowHour: 2, plan: DAY_PLAN }));
    expect(r.key).toBe('sleep_window');
    expect(r.params.time).toBe('07:00');
  });

  test('sleep opens within 90 min, melatonin user → wind_down at dose time', () => {
    const r = computeTodaysFocus(
      baseArgs({ nowHour: 22, plan: DAY_PLAN, takesMelatonin: true }),
    );
    expect(r.key).toBe('wind_down');
    expect(r.params.time).toBe('21:30');
  });

  test('sleep opens within 90 min, no melatonin → wind_down at sleep start', () => {
    const r = computeTodaysFocus(
      baseArgs({ nowHour: 22, plan: DAY_PLAN, takesMelatonin: false }),
    );
    expect(r.key).toBe('wind_down');
    expect(r.params.time).toBe('23:00');
  });

  test('caffeine cutoff still ahead → caffeine_cutoff with its time', () => {
    // 10:00, cutoff 14:00, no heavy load, no rough streak.
    const r = computeTodaysFocus(baseArgs({ nowHour: 10, cupsToday: 0 }));
    expect(r.key).toBe('caffeine_cutoff');
    expect(r.params.time).toBe('14:00');
  });

  test('no signals, cutoff passed → steady default points at sleep start', () => {
    // 16:00: cutoff (14:00) already passed, sleep at 23:00 still >90min away,
    // no caffeine load, no rough streak → steady.
    const r = computeTodaysFocus(
      baseArgs({ nowHour: 16, caffeineCupsPerDay: 0, cupsToday: 0 }),
    );
    expect(r.key).toBe('steady');
    expect(r.glyph).toBe('sparkle');
    expect(r.params.time).toBe('23:00');
  });
});

describe('computeTodaysFocus — robustness & determinism', () => {
  test('always returns one focus with i18n keys + a time param', () => {
    const r = computeTodaysFocus(baseArgs());
    expect(r.titleKey.startsWith('today.focus.')).toBe(true);
    expect(r.bodyKey.startsWith('today.focus.')).toBe(true);
    expect(typeof r.params.time).toBe('string');
  });

  test('non-finite nowHour never throws and still returns a focus', () => {
    const r = computeTodaysFocus(baseArgs({ nowHour: Number.NaN }));
    expect(r.key).toBeTruthy();
  });

  test('deterministic — same inputs give the same focus', () => {
    const args = baseArgs({ cupsToday: 2 });
    expect(computeTodaysFocus(args)).toEqual(computeTodaysFocus(args));
  });
});
