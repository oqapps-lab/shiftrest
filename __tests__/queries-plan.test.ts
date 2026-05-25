import { formatPlanHour, planHourAsFloat } from '../lib/queries/plan';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));
jest.mock('../lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }));
jest.mock('../lib/auth/store', () => ({ useAuth: () => ({ user: null }) }));
jest.mock('../lib/i18n', () => ({ t: (k: string) => `[${k}]` }));

describe('formatPlanHour', () => {
  test('null/undefined → empty', () => {
    expect(formatPlanHour(null)).toBe('');
    expect(formatPlanHour(undefined)).toBe('');
    expect(formatPlanHour('')).toBe('');
  });
  test('extracts HH:MM from ISO', () => {
    expect(formatPlanHour('2026-05-20T17:30:00')).toBe('17:30');
    expect(formatPlanHour('2026-01-01T07:00:00Z')).toBe('07:00');
  });
  test('extracts from ISO with offset', () => {
    expect(formatPlanHour('2026-05-20T23:45:00+05:00')).toBe('23:45');
  });
  test('returns empty for invalid', () => {
    expect(formatPlanHour('not-iso')).toBe('');
    expect(formatPlanHour('2026-05-20')).toBe('');
  });
});

describe('planHourAsFloat', () => {
  test('null/undefined → null', () => {
    expect(planHourAsFloat(null)).toBeNull();
    expect(planHourAsFloat(undefined)).toBeNull();
  });
  test('07:00 → 7', () => {
    expect(planHourAsFloat('2026-05-20T07:00:00')).toBe(7);
  });
  test('17:30 → 17.5', () => {
    expect(planHourAsFloat('2026-05-20T17:30:00')).toBe(17.5);
  });
  test('00:00 → 0', () => {
    expect(planHourAsFloat('2026-05-20T00:00:00')).toBe(0);
  });
  test('23:59 → 23.9833...', () => {
    expect(planHourAsFloat('2026-05-20T23:59:00')).toBeCloseTo(23.9833, 3);
  });
  test('invalid returns null', () => {
    expect(planHourAsFloat('not-iso')).toBeNull();
  });
});
