/**
 * TODAY-5 — unit tests for the new plan-timed reminder fire-time math.
 *
 * Covers the two pure helpers added for the rate-sleep morning nudge and the
 * night-shift nadir nap. We mock the native/IO deps so importing
 * lib/notifications.ts under jest-expo doesn't touch real modules; the helpers
 * under test are pure and side-effect free.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
}));
jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('../lib/i18n', () => ({ t: (k: string) => `[${k}]` }));
jest.mock('../lib/events', () => ({ logEvent: jest.fn() }));

import { nadirNapFireTime, rateSleepFireTime, NADIR_ONSET } from '../lib/notifications';

describe('nadirNapFireTime', () => {
  it('defaults to 30 min before the 02:30 nadir onset → 02:00', () => {
    expect(nadirNapFireTime()).toEqual({ hour: 2, minute: 0 });
  });

  it('honours a custom lead', () => {
    expect(nadirNapFireTime(45)).toEqual({ hour: 1, minute: 45 });
  });

  it('wraps correctly past midnight for a large lead', () => {
    // 02:30 − 180 min = 23:30 the previous day.
    expect(nadirNapFireTime(180)).toEqual({ hour: 23, minute: 30 });
  });

  it('exposes the nadir onset as 02:30', () => {
    expect(NADIR_ONSET).toEqual({ hour: 2, minute: 30 });
  });
});

describe('rateSleepFireTime', () => {
  it('fires 15 min after a 07:00 day-shift wake', () => {
    expect(rateSleepFireTime({ hour: 7, minute: 0 })).toEqual({ hour: 7, minute: 15 });
  });

  it('fires 15 min after a 17:00 night-shift wake', () => {
    expect(rateSleepFireTime({ hour: 17, minute: 0 })).toEqual({ hour: 17, minute: 15 });
  });

  it('honours a custom delay and wraps across midnight', () => {
    // 23:50 + 30 min = 00:20 next day.
    expect(rateSleepFireTime({ hour: 23, minute: 50 }, 30)).toEqual({ hour: 0, minute: 20 });
  });

  it('handles non-zero minutes on the sleep end', () => {
    expect(rateSleepFireTime({ hour: 6, minute: 50 })).toEqual({ hour: 7, minute: 5 });
  });
});
