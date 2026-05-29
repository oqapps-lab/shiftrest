/**
 * Unit tests for lib/local-shifts/store.tsx
 * Pure-function paths (set / remove / clear / getLocalShifts).
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import {
  setLocalShift,
  removeLocalShift,
  clearLocalShifts,
  getLocalShifts,
} from '../lib/local-shifts/store';

beforeEach(() => {
  clearLocalShifts();
});

describe('local-shifts/store — setLocalShift', () => {
  test('stores day kind', () => {
    setLocalShift('2026-05-27', 'day');
    expect(getLocalShifts()['2026-05-27']).toBe('day');
  });
  test('stores night kind', () => {
    setLocalShift('2026-05-28', 'night');
    expect(getLocalShifts()['2026-05-28']).toBe('night');
  });
  test('stores off kind', () => {
    setLocalShift('2026-05-29', 'off');
    expect(getLocalShifts()['2026-05-29']).toBe('off');
  });
  test('overwrites existing entry', () => {
    setLocalShift('2026-05-30', 'day');
    setLocalShift('2026-05-30', 'night');
    expect(getLocalShifts()['2026-05-30']).toBe('night');
  });
  test('stores multiple dates independently', () => {
    setLocalShift('2026-05-27', 'day');
    setLocalShift('2026-05-28', 'night');
    setLocalShift('2026-05-29', 'off');
    const all = getLocalShifts();
    expect(all['2026-05-27']).toBe('day');
    expect(all['2026-05-28']).toBe('night');
    expect(all['2026-05-29']).toBe('off');
  });
});

describe('local-shifts/store — removeLocalShift', () => {
  test('removes specific date', () => {
    setLocalShift('2026-05-27', 'day');
    setLocalShift('2026-05-28', 'night');
    removeLocalShift('2026-05-27');
    const all = getLocalShifts();
    expect(all['2026-05-27']).toBeUndefined();
    expect(all['2026-05-28']).toBe('night');
  });
  test('no-op when key absent', () => {
    setLocalShift('2026-05-27', 'day');
    expect(() => removeLocalShift('2099-12-31')).not.toThrow();
    expect(getLocalShifts()['2026-05-27']).toBe('day');
  });
});

describe('local-shifts/store — clearLocalShifts', () => {
  test('wipes all entries', () => {
    setLocalShift('2026-05-27', 'day');
    setLocalShift('2026-05-28', 'night');
    clearLocalShifts();
    expect(getLocalShifts()).toEqual({});
  });
  test('idempotent on empty', () => {
    expect(() => {
      clearLocalShifts();
      clearLocalShifts();
    }).not.toThrow();
    expect(getLocalShifts()).toEqual({});
  });
});

describe('local-shifts/store — getLocalShifts', () => {
  test('returns empty object initially', () => {
    expect(getLocalShifts()).toEqual({});
  });
  test('returns the live map (reference, but new map per set)', () => {
    setLocalShift('2026-05-27', 'day');
    const snap1 = getLocalShifts();
    setLocalShift('2026-05-28', 'night');
    const snap2 = getLocalShifts();
    // snap2 should have the new entry; snap1 should not (immutable)
    expect(snap1['2026-05-28']).toBeUndefined();
    expect(snap2['2026-05-28']).toBe('night');
  });
});
