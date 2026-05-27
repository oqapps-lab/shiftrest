/**
 * Unit tests for lib/schedule/apply-template.ts SIGNED path.
 * Mocks supabase to exercise the existing-row skip + insert branches.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Capture last insert call to assert payload shape
let lastInsertPayload: any[] = [];
let nextSelectReturn: { data: { date: string }[] } = { data: [] };
let nextInsertError: { message: string } | null = null;

const mockChain = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  is: jest.fn(function () {
    return Promise.resolve(nextSelectReturn);
  }),
  insert: jest.fn((payload: any[]) => {
    lastInsertPayload = payload;
    return Promise.resolve({ error: nextInsertError });
  }),
};

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockChain),
  },
  isSupabaseConfigured: true,
}));

import { applyScheduleTemplate } from '../lib/schedule/apply-template';

beforeEach(() => {
  lastInsertPayload = [];
  nextSelectReturn = { data: [] };
  nextInsertError = null;
});

describe('applyScheduleTemplate — signed path', () => {
  test('inserts 3x12 pattern when no existing rows', async () => {
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 1,
      userId: 'user-123',
    });
    expect(result.inserted).toBeGreaterThan(0);
    // 7 days - off days = day/night ones inserted
    expect(result.skippedExisting).toBe(0);
    expect(result.errored).toBe(0);
  });

  test('insert payload has user_id, date, start_time, end_time, shift_type', async () => {
    await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 1,
      userId: 'user-123',
    });
    expect(lastInsertPayload.length).toBeGreaterThan(0);
    const row = lastInsertPayload[0];
    expect(row.user_id).toBe('user-123');
    expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(row.start_time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(row.end_time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(['day', 'night']).toContain(row.shift_type);
  });

  test('off rows are skipped from insert (no shifts table entry)', async () => {
    await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 4,
      userId: 'user-123',
    });
    for (const row of lastInsertPayload) {
      expect(row.shift_type).not.toBe('off');
    }
  });

  test('skips existing dates from insert', async () => {
    nextSelectReturn = { data: [{ date: '2026-05-27' }, { date: '2026-05-28' }] };
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 1,
      userId: 'user-123',
    });
    expect(result.skippedExisting).toBe(2);
    // None of the inserted rows should be those two dates
    const inserted = lastInsertPayload.map((r) => r.date);
    expect(inserted).not.toContain('2026-05-27');
    expect(inserted).not.toContain('2026-05-28');
  });

  test('skippedExisting=N when all dates already populated', async () => {
    nextSelectReturn = {
      data: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2026, 4, 27 + i);
        return {
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        };
      }),
    };
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 1,
      userId: 'user-123',
    });
    expect(result.inserted).toBe(0);
    expect(result.skippedExisting).toBe(7);
  });

  test('returns errored when insert fails', async () => {
    nextInsertError = { message: 'rls policy violation' };
    const result = await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 1,
      userId: 'user-123',
    });
    expect(result.errored).toBeGreaterThan(0);
    expect(result.inserted).toBe(0);
  });

  test('night shift creates cross-midnight end_time', async () => {
    await applyScheduleTemplate('3x12-day-night', {
      startIso: '2026-05-27',
      weeks: 4,
      userId: 'user-123',
    });
    const nightRows = lastInsertPayload.filter((r) => r.shift_type === 'night');
    expect(nightRows.length).toBeGreaterThan(0);
    for (const row of nightRows) {
      const start = new Date(row.start_time);
      const end = new Date(row.end_time);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    }
  });
});
