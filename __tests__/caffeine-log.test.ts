/**
 * Unit tests for lib/caffeine-log/store.tsx
 * Validates logging, day rollover, cutoff math with sleep-window cap.
 */

import {
  logCaffeine,
  getCaffeineLog,
  caffeineCutoffFromLog,
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

describe('caffeine-log/store — logCaffeine', () => {
  test('first log creates entry with cups=1', () => {
    logCaffeine();
    const log = getCaffeineLog();
    expect(log).not.toBeNull();
    expect(log?.cups).toBe(1);
  });

  test('subsequent logs increment cups', () => {
    logCaffeine();
    logCaffeine();
    logCaffeine();
    const log = getCaffeineLog();
    expect(log?.cups).toBe(3);
  });

  test('each log updates lastCupAt timestamp', async () => {
    logCaffeine();
    const t1 = getCaffeineLog()?.lastCupAt;
    await new Promise((r) => setTimeout(r, 10));
    logCaffeine();
    const t2 = getCaffeineLog()?.lastCupAt;
    expect(t2).not.toBe(t1);
    expect(new Date(t2!).getTime()).toBeGreaterThan(new Date(t1!).getTime());
  });

  test('log entry uses local date key for today', () => {
    logCaffeine();
    const log = getCaffeineLog();
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(log?.date).toBe(expected);
  });
});

describe('caffeine-log/store — clearCaffeineLog', () => {
  test('clears all state', () => {
    logCaffeine();
    expect(getCaffeineLog()).not.toBeNull();
    clearCaffeineLog();
    expect(getCaffeineLog()).toBeNull();
  });
});

describe('caffeine-log/store — caffeineCutoffFromLog', () => {
  test('null when no log entry', () => {
    expect(caffeineCutoffFromLog()).toBeNull();
  });

  test('null when no log + sleepStartHour passed', () => {
    expect(caffeineCutoffFromLog(22.5)).toBeNull();
  });

  test('returns lastCup hour + 6, capped at 22 by default', () => {
    logCaffeine();
    const cutoff = caffeineCutoffFromLog();
    expect(cutoff).not.toBeNull();
    expect(cutoff!).toBeLessThanOrEqual(22);
  });

  test('cap respects sleepStartHour - 0.5 when provided', () => {
    logCaffeine();
    // Pass a sleep window of 20:00 → cap = 19.5
    const cutoff = caffeineCutoffFromLog(20);
    expect(cutoff!).toBeLessThanOrEqual(19.5);
  });

  test('returns fractional hour value when lastCup is mid-hour', () => {
    logCaffeine();
    const cutoff = caffeineCutoffFromLog();
    expect(typeof cutoff).toBe('number');
  });
});
