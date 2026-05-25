/**
 * Unit tests for lib/onboarding/store.tsx pure functions.
 */

import {
  computeChronotypeScore,
  chronotypeBucket,
  mapFromProfileRow,
  mapToProfileRow,
} from '../lib/onboarding/store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

// Mock mockChronotypeQuestions so we don't depend on actual i18n
jest.mock('../mock/user', () => ({
  mockChronotypeQuestions: [
    { id: 'q1', question: 'q1', options: [
      { id: 'a', label: 'a', value: 'morning' },
      { id: 'b', label: 'b', value: 'mid' },
      { id: 'c', label: 'c', value: 'evening' },
      { id: 'd', label: 'd', value: 'strong_evening' },
    ]},
    { id: 'q2', question: 'q2', options: [
      { id: 'a', label: 'a', value: 'morning' },
      { id: 'b', label: 'b', value: 'mid' },
      { id: 'c', label: 'c', value: 'mid' },
      { id: 'd', label: 'd', value: 'evening' },
    ]},
    { id: 'q3', question: 'q3', options: [
      { id: 'a', label: 'a', value: 'morning' },
      { id: 'b', label: 'b', value: 'mid' },
      { id: 'c', label: 'c', value: 'evening' },
      { id: 'd', label: 'd', value: 'strong_evening' },
    ]},
  ],
}));

jest.mock('../lib/i18n', () => ({ t: (k: string) => `[${k}]` }));
jest.mock('../lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }));
jest.mock('../lib/auth/store', () => ({ useAuth: () => ({ user: null }) }));

describe('computeChronotypeScore', () => {
  test('all morning = 3', () => {
    expect(computeChronotypeScore({ q1: 'a', q2: 'a', q3: 'a' })).toBe(3);
  });
  test('all strong_evening (max possible Q1+Q3=4, Q2 max=3) = 11', () => {
    expect(computeChronotypeScore({ q1: 'd', q2: 'd', q3: 'd' })).toBe(11);
  });
  test('mixed scores', () => {
    // q1: morning(1) + q2: evening(3) + q3: mid(2) = 6
    expect(computeChronotypeScore({ q1: 'a', q2: 'd', q3: 'b' })).toBe(6);
  });
  test('incomplete answers return null', () => {
    expect(computeChronotypeScore({ q1: 'a', q2: 'a' })).toBeNull();
    expect(computeChronotypeScore({})).toBeNull();
  });
  test('invalid option id returns null (because answered count < total)', () => {
    expect(computeChronotypeScore({ q1: 'a', q2: 'a', q3: 'nonexistent' })).toBeNull();
  });
});

describe('chronotypeBucket', () => {
  test('null score returns null', () => {
    expect(chronotypeBucket(null)).toBeNull();
  });
  test('score ≤ 5 = lark', () => {
    expect(chronotypeBucket(3)).toBe('lark');
    expect(chronotypeBucket(5)).toBe('lark');
  });
  test('score 6-8 = intermediate', () => {
    expect(chronotypeBucket(6)).toBe('intermediate');
    expect(chronotypeBucket(8)).toBe('intermediate');
  });
  test('score ≥ 9 = owl', () => {
    expect(chronotypeBucket(9)).toBe('owl');
    expect(chronotypeBucket(11)).toBe('owl');
  });
});

describe('mapFromProfileRow', () => {
  test('empty row produces empty patch', () => {
    const patch = mapFromProfileRow({
      display_name: null,
      profession: null,
      caffeine_cups_per_day: null,
      caffeine_type: null,
      caffeine_sensitivity: null,
      uses_melatonin: null,
      melatonin_dose_mg: null,
      has_children: null,
      family_commitments: null,
      commute_minutes: null,
      main_problem: null,
      onboarding_completed: null,
    });
    expect(patch).toEqual({});
  });
  test('full row maps correctly', () => {
    const patch = mapFromProfileRow({
      display_name: 'Marina',
      profession: 'nurse',
      caffeine_cups_per_day: 3,
      caffeine_type: 'coffee',
      caffeine_sensitivity: 'normal',
      uses_melatonin: true,
      melatonin_dose_mg: 0.5,
      has_children: true,
      family_commitments: [
        { time: '15:00', description: 'School pickup' },
        { time: '', description: 'Yoga class' },
      ],
      commute_minutes: 45,
      main_problem: 'cant_sleep',
      onboarding_completed: true,
    });
    expect(patch).toMatchObject({
      displayName: 'Marina',
      profession: 'nurse',
      caffeineCupsPerDay: 3,
      caffeineType: 'coffee',
      caffeineSensitivity: 'normal',
      takesMelatonin: true,
      melatoninDoseMg: '0.5',
      hasChildren: true,
      pickupTime: '15',
      otherCommitments: 'Yoga class',
      commuteMinutes: 45,
      mainProblem: 'falling-asleep',
      completed: true,
    });
  });
  test('invalid profession value ignored', () => {
    const patch = mapFromProfileRow({
      display_name: null,
      profession: 'astronaut', // not in enum
      caffeine_cups_per_day: null, caffeine_type: null, caffeine_sensitivity: null,
      uses_melatonin: null, melatonin_dose_mg: null, has_children: null,
      family_commitments: null, commute_minutes: null, main_problem: null,
      onboarding_completed: null,
    });
    expect(patch.profession).toBeUndefined();
  });
  test('caffeine_type energy_drink maps to energy', () => {
    const patch = mapFromProfileRow({
      display_name: null, profession: null, caffeine_cups_per_day: null,
      caffeine_type: 'energy_drink',
      caffeine_sensitivity: null,
      uses_melatonin: null, melatonin_dose_mg: null, has_children: null,
      family_commitments: null, commute_minutes: null, main_problem: null,
      onboarding_completed: null,
    });
    expect(patch.caffeineType).toBe('energy');
  });
  test('pickup time outside enum ignored', () => {
    const patch = mapFromProfileRow({
      display_name: null, profession: null, caffeine_cups_per_day: null,
      caffeine_type: null, caffeine_sensitivity: null,
      uses_melatonin: null, melatonin_dose_mg: null, has_children: null,
      family_commitments: [{ time: '20:00', description: 'School pickup' }],
      commute_minutes: null, main_problem: null, onboarding_completed: null,
    });
    expect(patch.pickupTime).toBeUndefined();
  });
});

describe('mapToProfileRow', () => {
  const baseState = {
    profession: 'nurse' as const,
    scheduleId: '3x12-day-night' as const,
    currentShift: 'day' as const,
    commuteMinutes: 30,
    nextShift: null,
    mainProblem: 'falling-asleep' as const,
    chronotypeAnswers: { q1: 'a', q2: 'a', q3: 'a' },
    caffeineCupsPerDay: 2,
    caffeineType: 'coffee' as const,
    caffeineSensitivity: 'normal' as const,
    takesMelatonin: false,
    melatoninDoseMg: null,
    melatoninTime: '22' as const,
    hasChildren: false,
    pickupTime: '15' as const,
    otherCommitments: '',
    displayName: 'Marina',
    completed: false,
  };

  test('roundtrips main_problem to DB enum', () => {
    const row = mapToProfileRow(baseState, 'user-id');
    expect(row.main_problem).toBe('cant_sleep');
    expect(row.caffeine_type).toBe('coffee');
  });
  test('chronotype score and bucket computed', () => {
    const row = mapToProfileRow(baseState, 'user-id');
    expect(row.chronotype_score).toBe(3); // all morning
    expect(row.chronotype).toBe('lark');
  });
  test('family_commitments contains only filled entries', () => {
    const stateNoFamily = { ...baseState, hasChildren: false, otherCommitments: '' };
    const row = mapToProfileRow(stateNoFamily, 'user-id');
    expect(row.family_commitments).toEqual([]);
  });
  test('family_commitments has pickup when hasChildren=true', () => {
    const stateKids = { ...baseState, hasChildren: true };
    const row = mapToProfileRow(stateKids, 'user-id');
    expect(row.family_commitments).toContainEqual({ time: '15:00', description: 'School pickup' });
  });
  test('family_commitments adds other commitments when filled', () => {
    const stateOther = { ...baseState, hasChildren: true, otherCommitments: 'Yoga 18:00' };
    const row = mapToProfileRow(stateOther, 'user-id');
    expect(row.family_commitments).toContainEqual({ time: '15:00', description: 'School pickup' });
    expect(row.family_commitments).toContainEqual({ time: '', description: 'Yoga 18:00' });
  });
  test('empty displayName becomes null', () => {
    const stateEmptyName = { ...baseState, displayName: '   ' };
    const row = mapToProfileRow(stateEmptyName, 'user-id');
    expect(row.display_name).toBeNull();
  });
  test('melatonin_dose_mg string converted to number', () => {
    const stateMel = { ...baseState, takesMelatonin: true, melatoninDoseMg: '0.5' };
    const row = mapToProfileRow(stateMel, 'user-id');
    expect(row.melatonin_dose_mg).toBe(0.5);
  });
  test('null melatonin_dose_mg stays null', () => {
    const row = mapToProfileRow(baseState, 'user-id');
    expect(row.melatonin_dose_mg).toBeNull();
  });
});
