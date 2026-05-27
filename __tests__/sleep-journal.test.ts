/**
 * Unit tests for lib/sleep-journal/store.tsx
 * Validates rating set/get, recent N days slice, counter.
 */

import {
  setSleepRating,
  ratingForToday,
  recentJournalDays,
  journaledDayCount,
  clearSleepRating,
  getSleepJournal,
  weeklyAdaptScore,
  type SleepRating,
} from '../lib/sleep-journal/store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  // Wipe in-memory state — direct mutation since no exposed clearAll
  const cache = getSleepJournal();
  for (const k of Object.keys(cache.entries)) {
    clearSleepRating(new Date(k + 'T00:00:00'));
  }
});

describe('sleep-journal/store — setSleepRating', () => {
  test('sets today rating with no date arg', () => {
    setSleepRating('good');
    expect(ratingForToday()).toBe('good');
  });

  test('latest set overwrites previous for same day', () => {
    setSleepRating('good');
    setSleepRating('bad');
    expect(ratingForToday()).toBe('bad');
  });

  test('explicit date stores under that key', () => {
    const may15 = new Date(2026, 4, 15);
    setSleepRating('ok', may15);
    const all = getSleepJournal();
    expect(all.entries['2026-05-15']).toBe('ok');
  });

  test('all three rating values accepted', () => {
    const ratings: SleepRating[] = ['good', 'ok', 'bad'];
    for (const r of ratings) {
      setSleepRating(r);
      expect(ratingForToday()).toBe(r);
    }
  });
});

describe('sleep-journal/store — ratingForToday', () => {
  test('null when nothing set', () => {
    expect(ratingForToday()).toBeNull();
  });

  test('returns set value', () => {
    setSleepRating('good');
    expect(ratingForToday()).toBe('good');
  });
});

describe('sleep-journal/store — journaledDayCount', () => {
  test('0 when empty', () => {
    expect(journaledDayCount()).toBe(0);
  });

  test('1 after single set', () => {
    setSleepRating('good');
    expect(journaledDayCount()).toBe(1);
  });

  test('counts unique days, not duplicates', () => {
    const today = new Date();
    setSleepRating('good', today);
    setSleepRating('bad', today); // same day, overwrite
    expect(journaledDayCount()).toBe(1);
  });

  test('counts multiple days separately', () => {
    setSleepRating('good', new Date(2026, 4, 15));
    setSleepRating('ok', new Date(2026, 4, 16));
    setSleepRating('bad', new Date(2026, 4, 17));
    expect(journaledDayCount()).toBe(3);
  });
});

describe('sleep-journal/store — recentJournalDays', () => {
  test('returns N days array', () => {
    const days = recentJournalDays(14);
    expect(days).toHaveLength(14);
  });

  test('default n=14', () => {
    const days = recentJournalDays();
    expect(days).toHaveLength(14);
  });

  test('last entry is today', () => {
    const days = recentJournalDays(7);
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(days[days.length - 1].iso).toBe(expected);
  });

  test('all entries have iso and rating fields', () => {
    const days = recentJournalDays(5);
    for (const d of days) {
      expect(d).toHaveProperty('iso');
      expect(d).toHaveProperty('rating');
    }
  });

  test('null rating when day not logged', () => {
    const days = recentJournalDays(14);
    expect(days[0].rating).toBeNull();
  });

  test('actual rating surfaces when day logged', () => {
    setSleepRating('good');
    const days = recentJournalDays(14);
    expect(days[days.length - 1].rating).toBe('good');
  });

  test('returns days in chronological order (oldest first)', () => {
    const days = recentJournalDays(5);
    for (let i = 1; i < days.length; i++) {
      expect(days[i].iso > days[i - 1].iso).toBe(true);
    }
  });

  test('n=30 returns 30 days', () => {
    const days = recentJournalDays(30);
    expect(days).toHaveLength(30);
  });
});

describe('sleep-journal/store — weeklyAdaptScore (F9)', () => {
  test('null when fewer than 3 entries', () => {
    expect(weeklyAdaptScore()).toBeNull();
    setSleepRating('good');
    expect(weeklyAdaptScore()).toBeNull();
    setSleepRating('ok', new Date(Date.now() - 86400000));
    expect(weeklyAdaptScore()).toBeNull();
  });

  test('all-good across 5 days yields high score', () => {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      setSleepRating('good', d);
    }
    const score = weeklyAdaptScore();
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(80);
  });

  test('all-bad across 5 days yields low score', () => {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      setSleepRating('bad', d);
    }
    const score = weeklyAdaptScore();
    expect(score).not.toBeNull();
    expect(score!).toBeLessThan(20);
  });

  test('mixed entries land somewhere in middle', () => {
    setSleepRating('good', new Date(Date.now() - 0));
    setSleepRating('ok', new Date(Date.now() - 86400000));
    setSleepRating('bad', new Date(Date.now() - 2 * 86400000));
    setSleepRating('good', new Date(Date.now() - 3 * 86400000));
    const score = weeklyAdaptScore();
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(0);
    expect(score!).toBeLessThan(100);
  });

  test('returned integer in [0..100]', () => {
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      setSleepRating(i % 2 === 0 ? 'good' : 'bad', d);
    }
    const score = weeklyAdaptScore();
    expect(score).not.toBeNull();
    expect(Number.isInteger(score!)).toBe(true);
    expect(score!).toBeGreaterThanOrEqual(0);
    expect(score!).toBeLessThanOrEqual(100);
  });

  test('entries older than 14 days do NOT count', () => {
    setSleepRating('good');
    setSleepRating('good', new Date(Date.now() - 86400000));
    setSleepRating('good', new Date(Date.now() - 2 * 86400000));
    // Far-past entry — should NOT affect today's score
    setSleepRating('bad', new Date(Date.now() - 30 * 86400000));
    const score = weeklyAdaptScore();
    expect(score!).toBeGreaterThan(80);
  });
});

describe('sleep-journal/store — clearSleepRating', () => {
  test('removes today entry', () => {
    setSleepRating('good');
    clearSleepRating();
    expect(ratingForToday()).toBeNull();
  });

  test('does not affect other days', () => {
    const may15 = new Date(2026, 4, 15);
    const may16 = new Date(2026, 4, 16);
    setSleepRating('good', may15);
    setSleepRating('ok', may16);
    clearSleepRating(may15);
    expect(getSleepJournal().entries['2026-05-15']).toBeUndefined();
    expect(getSleepJournal().entries['2026-05-16']).toBe('ok');
  });
});
