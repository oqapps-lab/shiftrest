/**
 * Unit tests for lib/derive.ts pure functions.
 * Validates formatting + math correctness across edge cases.
 */

import {
  getGreeting,
  formatRelativeTime,
  formatTrialRemaining,
  formatStreak,
  clampDisplayName,
  firstName,
  countCompleted,
  formatHour,
  formatHourRange,
  hoursBetween,
  formatMonthYear,
  formatDayMonth,
} from '../lib/derive';

// Mock t() so tests don't depend on i18n setup
jest.mock('../lib/i18n', () => ({
  t: (key: string, opts?: Record<string, unknown>): string => {
    // Return a deterministic identifier so we can assert which branch fired
    if (!opts) return `[${key}]`;
    const args = Object.entries(opts).map(([k, v]) => `${k}=${v}`).join(',');
    return `[${key}{${args}}]`;
  },
}));

describe('getGreeting', () => {
  test('night (0-4:59)', () => {
    expect(getGreeting(0)).toBe('[greetings.night]');
    expect(getGreeting(4.99)).toBe('[greetings.night]');
  });
  test('morning (5-11:59)', () => {
    expect(getGreeting(5)).toBe('[greetings.morning]');
    expect(getGreeting(11.99)).toBe('[greetings.morning]');
  });
  test('afternoon (12-17:59)', () => {
    expect(getGreeting(12)).toBe('[greetings.afternoon]');
    expect(getGreeting(17.99)).toBe('[greetings.afternoon]');
  });
  test('evening (18-23:59)', () => {
    expect(getGreeting(18)).toBe('[greetings.evening]');
    expect(getGreeting(23.99)).toBe('[greetings.evening]');
  });
});

describe('formatRelativeTime', () => {
  test('same hour returns now', () => {
    expect(formatRelativeTime(10, 10)).toBe('[rel.now]');
  });
  test('sub-minute returns now (regression: was "in 0m")', () => {
    expect(formatRelativeTime(10, 10.001)).toBe('[rel.now]');
    expect(formatRelativeTime(10, 10 + 0.5 / 60)).toBe('[rel.now]');
  });
  test('30 minutes ahead', () => {
    expect(formatRelativeTime(10, 10.5)).toBe('[rel.m_away{m=30}]');
  });
  test('4 hours ahead', () => {
    expect(formatRelativeTime(10, 14)).toBe('[rel.h_away{h=4}]');
  });
  test('3h 30m ahead', () => {
    expect(formatRelativeTime(10.5, 14)).toBe('[rel.hm_away{h=3,m=30}]');
  });
  test('wraps past midnight (14 → 10 next day = 20h)', () => {
    expect(formatRelativeTime(14, 10)).toBe('[rel.h_away{h=20}]');
  });
  test('23.99 → 0 (1 minute past midnight)', () => {
    expect(formatRelativeTime(23.99, 0)).toBe('[rel.m_away{m=1}]');
  });
});

describe('formatTrialRemaining', () => {
  const today = new Date(2026, 4, 20); // 2026-05-20

  test('5 days remaining', () => {
    expect(formatTrialRemaining('2026-05-25', today)).toBe('[trial.n_days{n=5}]');
  });
  test('ends today', () => {
    expect(formatTrialRemaining('2026-05-20', today)).toBe('[trial.ends_today]');
  });
  test('one day', () => {
    expect(formatTrialRemaining('2026-05-21', today)).toBe('[trial.one_day]');
  });
  test('expired', () => {
    expect(formatTrialRemaining('2026-05-19', today)).toBe('[trial.expired]');
  });
  test('invalid date returns expired', () => {
    expect(formatTrialRemaining('not-a-date', today)).toBe('[trial.expired]');
  });
});

describe('formatStreak', () => {
  test('1 = singular', () => {
    expect(formatStreak(1)).toBe('1 [streak.suffix_one]');
  });
  test('0 = other', () => {
    expect(formatStreak(0)).toBe('0 [streak.suffix_other]');
  });
  test('14 = other', () => {
    expect(formatStreak(14)).toBe('14 [streak.suffix_other]');
  });
});

describe('clampDisplayName', () => {
  test('null/undefined → empty', () => {
    expect(clampDisplayName(null)).toBe('');
    expect(clampDisplayName(undefined)).toBe('');
    expect(clampDisplayName('')).toBe('');
  });
  test('short name unchanged', () => {
    expect(clampDisplayName('Marina')).toBe('Marina');
  });
  test('trims whitespace', () => {
    expect(clampDisplayName('  Marina  ')).toBe('Marina');
  });
  test('long name clamped at word boundary', () => {
    const long = 'Alexander Petrov-Smirnoff the Third';
    const out = clampDisplayName(long, 24);
    expect(out.length).toBeLessThanOrEqual(25); // 24 + ellipsis
    expect(out.endsWith('…')).toBe(true);
  });
  test('unbroken string clamped raw', () => {
    expect(clampDisplayName('SupercalifragilisticexpialidociousVeryLong', 24)).toBe(
      'Supercalifragilisticexpi…',
    );
  });
});

describe('firstName', () => {
  test('extracts first word', () => {
    expect(firstName('Marina Petrov')).toBe('Marina');
  });
  test('handles single name', () => {
    expect(firstName('Marina')).toBe('Marina');
  });
  test('null returns empty', () => {
    expect(firstName(null)).toBe('');
    expect(firstName(undefined)).toBe('');
  });
});

describe('countCompleted', () => {
  test('counts done items', () => {
    const steps = [{ done: true }, { done: false }, { done: true }];
    expect(countCompleted(steps)).toBe(2);
  });
  test('empty array', () => {
    expect(countCompleted([])).toBe(0);
  });
  test('all false', () => {
    expect(countCompleted([{ done: false }, { done: false }])).toBe(0);
  });
});

describe('formatHour', () => {
  test('basic cases', () => {
    expect(formatHour(0)).toBe('00:00');
    expect(formatHour(7.5)).toBe('07:30');
    expect(formatHour(12.25)).toBe('12:15');
    expect(formatHour(23.5)).toBe('23:30');
  });
  test('regression: 23.99999 → 00:00 not 23:60', () => {
    expect(formatHour(23.99999)).toBe('00:00');
    expect(formatHour(7.999)).toBe('08:00');
  });
  test('24 normalizes to 00:00', () => {
    expect(formatHour(24)).toBe('00:00');
  });
  test('overflow wraps', () => {
    expect(formatHour(25.5)).toBe('01:30');
  });
  test('negative wraps to positive', () => {
    expect(formatHour(-1)).toBe('23:00');
  });
});

describe('formatHourRange', () => {
  test('basic', () => {
    expect(formatHourRange(23, 7)).toBe('23:00 — 07:00');
    expect(formatHourRange(7.5, 19.5)).toBe('07:30 — 19:30');
  });
});

describe('hoursBetween', () => {
  test('same hour = 0', () => {
    expect(hoursBetween(7, 7)).toBe(0);
  });
  test('forward', () => {
    expect(hoursBetween(7, 19)).toBe(12);
  });
  test('wraps midnight', () => {
    expect(hoursBetween(23, 2)).toBe(3);
  });
  test('backward becomes forward via wrap', () => {
    expect(hoursBetween(23, 22)).toBe(23); // 22 the next day
  });
});

describe('formatMonthYear', () => {
  test('returns months_full[idx] + year', () => {
    const may = new Date(2026, 4, 15); // Month 4 = May
    // Will return "[date.months_full] 2026" since mock returns identifier;
    // we just verify it doesn't crash and includes the year.
    const out = formatMonthYear(may);
    expect(out).toContain('2026');
  });
});

describe('formatDayMonth', () => {
  test('returns day + months_short[idx]', () => {
    const may15 = new Date(2026, 4, 15);
    const out = formatDayMonth(may15);
    expect(out).toContain('15');
  });
});
