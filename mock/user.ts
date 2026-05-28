/**
 * Mock user — used by demo screens until Stage 6 wires up real Supabase auth.
 *
 * User-facing strings route through t() so the demo respects the device locale
 * AT APP LAUNCH. The 'export const mockX = getMockX()' pattern evaluates once
 * at module load, so an in-session locale switch (e.g. SCREENSHOT_OVERRIDE
 * flipped between ASO batch iterations) requires a full bundle reload via
 * npx expo start --clear to pick up new translations in the mocks. In
 * production this is a non-issue because changing the iOS system language
 * forces an app restart anyway.
 *
 * If you need per-render locale-correctness (e.g. for runtime locale
 * switcher), call the getMockX() function directly instead of the const.
 */

import type { GlyphName } from '../components/ui';
import { t } from '../lib/i18n';

export const mockUser = {
  name: 'Marina',
  profession: 'Nurse · 3×12',
  chronotype: 'mild_evening',
  streak: 14,
  daysInApp: 42,
  transitionsCompleted: 3,
  adherence: 98,
  subscription: 'trial' as 'free' | 'trial' | 'premium' | 'expired',
  get trialEndsAt() {
    // Dynamic so the demo doesn't go stale — always 14 days from today.
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  },
};

export const mockPlan = {
  nowHour: 14.5,
  sleepStart: 23,
  sleepEnd: 7,
  shiftStart: 7,
  shiftEnd: 19,
  caffeineCutoff: '17:00',
  melatoninTime: '22:00',
  windDownStart: '21:30',
};

export const mockShiftBlocks = [
  { start: 7, end: 7.75, kind: 'commute' as const, label: 'Commute' },
  { start: 7.75, end: 19, kind: 'shift' as const, label: 'Shift' },
  { start: 19, end: 19.75, kind: 'commute' as const, label: 'Commute' },
  { start: 19.75, end: 21.5, kind: 'free' as const, label: 'Free' },
  { start: 21.5, end: 23, kind: 'winddown' as const, label: 'Wind down' },
  { start: 23, end: 7, kind: 'sleep' as const, label: 'Sleep' },
];

export function getMockTransition() {
  // B27: previously hardcoded "WED 22 / THU 23" — looked like a stale plan
  // from May 22 to anyone using the app later. Derive labels from today's
  // date so the demo always reads as "today/tomorrow".
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekdays = (t('date.weekdays_short') as unknown as string[]) ?? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const fmt = (d: Date) => `${weekdays[d.getDay()] ?? ''} ${d.getDate()}`.trim();
  return {
    fromShift: t('transition.shift.night'),
    toShift: t('transition.shift.day'),
    days: [
      {
        label: fmt(today),
        steps: [
          { time: '06:00', action: t('transition.steps.bright_light'), done: true, tip: t('transition.steps.walk_outside') },
          { time: '09:00', action: t('transition.steps.melatonin_05'), done: true, tip: t('transition.steps.phase_advance') },
          { time: '13:00', action: t('transition.steps.caffeine_cutoff'), done: true, tip: t('transition.steps.last_cup_13') },
          { time: '21:00', action: t('transition.steps.wind_down'), done: false, tip: t('transition.steps.dark_glasses') },
        ],
      },
      {
        label: fmt(tomorrow),
        steps: [
          { time: '05:30', action: t('transition.steps.wake_bright_light'), done: false, tip: t('transition.steps.ten_min_window') },
          { time: '08:30', action: t('transition.steps.melatonin_05'), done: false, tip: '' },
          { time: '13:00', action: t('transition.steps.caffeine_cutoff'), done: false, tip: '' },
          { time: '21:30', action: t('transition.steps.bed'), done: false, tip: t('transition.steps.bed_tip_2230') },
        ],
      },
    ],
  };
}

export const mockTransition = getMockTransition();

export function getMockProfessions() {
  return [
    { id: 'nurse', title: t('professions.nurse'), subtitle: t('professions.nurse_sub'), glyph: 'pulse' as GlyphName },
    { id: 'fire', title: t('professions.firefighter'), subtitle: t('professions.firefighter_sub'), glyph: 'flame' as GlyphName },
    { id: 'factory', title: t('professions.factory'), subtitle: t('professions.factory_sub'), glyph: 'gear' as GlyphName },
    { id: 'other', title: t('professions.other'), subtitle: t('professions.other_sub'), glyph: 'sparkle' as GlyphName },
  ];
}

export const mockProfessions = getMockProfessions();

export function getMockScheduleTemplates() {
  return [
    {
      id: '3x12-day-night',
      title: t('schedule_templates.three_x_twelve.title'),
      subtitle: t('schedule_templates.three_x_twelve.sub'),
      glyph: 'pulse' as GlyphName,
      preview: ['day', 'day', 'day', 'off', 'off', 'night', 'night', 'night', 'off', 'off', 'day', 'day', 'day', 'off'] as const,
    },
    {
      id: '24-48',
      title: t('schedule_templates.twenty_four_forty_eight.title'),
      subtitle: t('schedule_templates.twenty_four_forty_eight.sub'),
      glyph: 'flame' as GlyphName,
      preview: ['shift24', 'off', 'off', 'shift24', 'off', 'off', 'shift24', 'off', 'off', 'shift24', 'off', 'off', 'shift24', 'off'] as const,
    },
    {
      id: '48-96',
      title: t('schedule_templates.forty_eight_ninety_six.title'),
      subtitle: t('schedule_templates.forty_eight_ninety_six.sub'),
      glyph: 'flame' as GlyphName,
      preview: ['shift48', 'shift48', 'off', 'off', 'off', 'off', 'shift48', 'shift48', 'off', 'off', 'off', 'off', 'shift48', 'shift48'] as const,
    },
    {
      id: 'continental',
      title: t('schedule_templates.continental.title'),
      subtitle: t('schedule_templates.continental.sub'),
      glyph: 'gear' as GlyphName,
      preview: ['day', 'day', 'night', 'night', 'off', 'off', 'off', 'off', 'day', 'day', 'night', 'night', 'off', 'off'] as const,
    },
    {
      id: 'custom',
      title: t('schedule_templates.custom.title'),
      subtitle: t('schedule_templates.custom.sub'),
      glyph: 'sparkle' as GlyphName,
      preview: [] as const,
    },
  ];
}

export const mockScheduleTemplates = getMockScheduleTemplates();

export function getMockMainProblems() {
  return [
    { id: 'falling-asleep', title: t('main_problems.falling_asleep.title'), subtitle: t('main_problems.falling_asleep.sub'), glyph: 'moon' as GlyphName },
    { id: 'transitions', title: t('main_problems.transitions.title'), subtitle: t('main_problems.transitions.sub'), glyph: 'sparkle' as GlyphName },
    { id: 'fatigue', title: t('main_problems.fatigue.title'), subtitle: t('main_problems.fatigue.sub'), glyph: 'leaf' as GlyphName },
    { id: 'caffeine', title: t('main_problems.caffeine.title'), subtitle: t('main_problems.caffeine.sub'), glyph: 'coffee' as GlyphName },
  ];
}

export const mockMainProblems = getMockMainProblems();

export function getMockChronotypeQuestions() {
  return [
    {
      id: 'preferred_wake',
      question: t('chronotype_q.preferred_wake'),
      options: [
        { id: 'early', label: '5:00 – 6:30', value: 'morning' },
        { id: 'mid', label: '6:30 – 8:30', value: 'mid' },
        { id: 'late', label: '8:30 – 10:30', value: 'evening' },
        { id: 'very_late', label: t('chronotype_q.options.after_1030'), value: 'strong_evening' },
      ],
    },
    {
      id: 'energy_peak',
      question: t('chronotype_q.energy_peak'),
      options: [
        { id: 'morning', label: t('chronotype_q.options.morning'), value: 'morning' },
        { id: 'noon', label: t('chronotype_q.options.late_morning'), value: 'mid' },
        { id: 'afternoon', label: t('chronotype_q.options.afternoon'), value: 'mid' },
        { id: 'night', label: t('chronotype_q.options.evening_night'), value: 'evening' },
      ],
    },
    {
      id: 'natural_sleep',
      question: t('chronotype_q.natural_sleep'),
      options: [
        { id: 'early', label: t('chronotype_q.options.before_2200'), value: 'morning' },
        { id: 'normal', label: '22:00 – 23:30', value: 'mid' },
        { id: 'late', label: '23:30 – 01:00', value: 'evening' },
        { id: 'very_late', label: t('chronotype_q.options.after_0100'), value: 'strong_evening' },
      ],
    },
  ];
}

export const mockChronotypeQuestions = getMockChronotypeQuestions();

export function getMockCaffeineTypes() {
  return [
    { id: 'coffee', label: t('caffeine_types.coffee'), glyph: 'coffee' as GlyphName },
    { id: 'tea', label: t('caffeine_types.tea'), glyph: 'leaf' as GlyphName },
    { id: 'energy', label: t('caffeine_types.energy'), glyph: 'pulse' as GlyphName },
  ];
}

export const mockCaffeineTypes = getMockCaffeineTypes();

export function getMockCaffeineSensitivities() {
  return [
    { id: 'normal', label: t('caffeine_sensitivity.normal.label'), subtitle: t('caffeine_sensitivity.normal.sub') },
    { id: 'slow', label: t('caffeine_sensitivity.slow.label'), subtitle: t('caffeine_sensitivity.slow.sub') },
    { id: 'unknown', label: t('caffeine_sensitivity.unknown.label'), subtitle: t('caffeine_sensitivity.unknown.sub') },
  ];
}

export const mockCaffeineSensitivities = getMockCaffeineSensitivities();

export const mockMelatoninDoses = ['0.5', '1', '3', '5', '10'];

export const mockSocialProofStats = {
  percentUnderslept: 93,
  appStoreRating: 4.8,
  totalUsers: 12400,
  totalReviews: 2400,
};

export function getMockTestimonials() {
  return {
    nurse: { quote: t('testimonials.nurse.quote'), author: t('testimonials.nurse.author'), rating: 5 },
    fire: { quote: t('testimonials.fire.quote'), author: t('testimonials.fire.author'), rating: 5 },
    factory: { quote: t('testimonials.factory.quote'), author: t('testimonials.factory.author'), rating: 5 },
    other: { quote: t('testimonials.other.quote'), author: t('testimonials.other.author'), rating: 5 },
  };
}

export const mockTestimonials = getMockTestimonials();

export function getMockNotificationTypes() {
  return [
    { id: 'sleep', glyph: 'bed' as GlyphName, title: t('notifications.sleep.title'), subtitle: t('notifications.sleep.sub') },
    { id: 'caffeine', glyph: 'coffee' as GlyphName, title: t('notifications.caffeine.title'), subtitle: t('notifications.caffeine.sub') },
    { id: 'melatonin', glyph: 'moon' as GlyphName, title: t('notifications.melatonin.title'), subtitle: t('notifications.melatonin.sub') },
  ];
}

export const mockNotificationTypes = getMockNotificationTypes();
