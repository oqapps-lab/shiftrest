/**
 * Unit tests for lib/schedule/apply-template.ts
 * Validates rotation preview-cell mapping and 4-week generation.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock supabase as null so the anon path is exercised
jest.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { applyScheduleTemplate } from '../lib/schedule/apply-template';

describe('applyScheduleTemplate — anon path', () => {
  test('returns 0,0,0 for unknown schedule id', async () => {
    const result = await applyScheduleTemplate('not-a-real-id', {
      startIso: '2026-05-27',
      weeks: 4,
    });
    expect(result).toEqual({ inserted: 0, skippedExisting: 0, errored: 0 });
  });

  test('returns 0,0,0 for custom (empty preview)', async () => {
    const result = await applyScheduleTemplate('custom', {
      startIso: '2026-05-27',
      weeks: 4,
    });
    expect(result).toEqual({ inserted: 0, skippedExisting: 0, errored: 0 });
  });

  test('3x12 anon inserts 28 days (4 weeks)', async () => {
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 4,
    });
    expect(result.inserted).toBe(28);
  });

  test('3x12 anon inserts 7 days (1 week)', async () => {
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 1,
    });
    expect(result.inserted).toBe(7);
  });

  test('24/48 anon inserts full window', async () => {
    const result = await applyScheduleTemplate('24-48', {
      startIso: '2026-05-27',
      weeks: 2,
    });
    expect(result.inserted).toBe(14);
  });

  test('continental anon inserts full window', async () => {
    const result = await applyScheduleTemplate('continental', {
      startIso: '2026-05-27',
      weeks: 4,
    });
    expect(result.inserted).toBe(28);
  });

  test('default weeks is 4', async () => {
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
    });
    expect(result.inserted).toBe(28);
  });

  test('default startIso is today (uses local date)', async () => {
    const result = await applyScheduleTemplate('3x12-day-night', { weeks: 1 });
    expect(result.inserted).toBe(7);
  });

  test('skippedExisting and errored both 0 for anon (no DB)', async () => {
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 4,
    });
    expect(result.skippedExisting).toBe(0);
    expect(result.errored).toBe(0);
  });

  test('48/96 returns 28 rows for 4 weeks', async () => {
    const result = await applyScheduleTemplate('48-96', {
      startIso: '2026-05-27',
      weeks: 4,
    });
    expect(result.inserted).toBe(28);
  });
});
