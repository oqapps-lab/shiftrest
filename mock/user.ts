/**
 * Mock user — used by demo screens until Stage 6 wires up real Supabase auth.
 */

import type { GlyphName } from '../components/ui';

export const mockUser = {
  name: 'Marina',
  profession: 'Nurse · 3×12',
  chronotype: 'mild_evening',
  streak: 14,
  daysInApp: 42,
  transitionsCompleted: 3,
  adherence: 98,
  subscription: 'trial', // 'free' | 'trial' | 'premium'
  trialEndsAt: '2026-04-27',
};

export const mockPlan = {
  nowHour: 14.5, // 14:30
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

export const mockTransition = {
  fromShift: 'Night',
  toShift: 'Day',
  days: [
    {
      label: 'Wed 22',
      steps: [
        { time: '06:00', action: 'Seek bright light for 30 min', done: true, tip: 'Walk outside if possible' },
        { time: '09:00', action: 'Melatonin 0.5mg', done: true, tip: 'Phase advance dose' },
        { time: '13:00', action: 'Caffeine cutoff', done: true, tip: 'Last cup by 13:00 today' },
        { time: '21:00', action: 'Wind down, dim lights', done: false, tip: 'Dark glasses on' },
      ],
    },
    {
      label: 'Thu 23',
      steps: [
        { time: '05:30', action: 'Wake + bright light', done: false, tip: '10 min at window' },
        { time: '08:30', action: 'Melatonin 0.5mg', done: false, tip: '' },
        { time: '13:00', action: 'Caffeine cutoff', done: false, tip: '' },
        { time: '21:30', action: 'Bed', done: false, tip: 'Target: 22:30 asleep' },
      ],
    },
  ],
};

export const mockProfessions = [
  { id: 'nurse', title: 'Nurse · 3×12', subtitle: 'Rotating day/night twelves', glyph: 'pulse' as GlyphName },
  { id: 'fire', title: 'Firefighter / EMT', subtitle: '24 on, 48 off', glyph: 'flame' as GlyphName },
  { id: 'factory', title: 'Factory worker', subtitle: 'Continental 2/2/4 shifts', glyph: 'gear' as GlyphName },
  { id: 'other', title: 'Something else', subtitle: 'Tell us your rotation', glyph: 'sparkle' as GlyphName },
];

// ─── S03 Schedule templates ─────────────────────────────────────────────────

export const mockScheduleTemplates = [
  {
    id: '3x12-day-night',
    title: '3×12 rotating',
    subtitle: '3 day-shifts, 3 night-shifts, 4 off',
    glyph: 'pulse' as GlyphName,
    // 14-day mini-preview as array of kind: 'day' | 'night' | 'off'
    preview: ['day', 'day', 'day', 'off', 'off', 'night', 'night', 'night', 'off', 'off', 'day', 'day', 'day', 'off'] as const,
  },
  {
    id: '24-48',
    title: '24 / 48',
    subtitle: '24h on, 48h off (firefighter pattern)',
    glyph: 'flame' as GlyphName,
    preview: ['shift24', 'off', 'off', 'shift24', 'off', 'off', 'shift24', 'off', 'off', 'shift24', 'off', 'off', 'shift24', 'off'] as const,
  },
  {
    id: '48-96',
    title: '48 / 96',
    subtitle: '48h on, 96h off (EMS, some fire depts)',
    glyph: 'flame' as GlyphName,
    preview: ['shift48', 'shift48', 'off', 'off', 'off', 'off', 'shift48', 'shift48', 'off', 'off', 'off', 'off', 'shift48', 'shift48'] as const,
  },
  {
    id: 'continental',
    title: 'Continental 2/2/4',
    subtitle: '2 days, 2 nights, 4 off (factory)',
    glyph: 'gear' as GlyphName,
    preview: ['day', 'day', 'night', 'night', 'off', 'off', 'off', 'off', 'day', 'day', 'night', 'night', 'off', 'off'] as const,
  },
  {
    id: 'custom',
    title: 'Custom schedule',
    subtitle: 'Build your own rotation',
    glyph: 'sparkle' as GlyphName,
    preview: [] as const,
  },
];

// ─── S05 Main problems ──────────────────────────────────────────────────────

export const mockMainProblems = [
  { id: 'falling-asleep', title: "I can't fall asleep after nights", subtitle: 'Body clock says day, bed says night', glyph: 'moon' as GlyphName },
  { id: 'transitions', title: 'Night → day transitions are brutal', subtitle: 'I feel like a zombie on my day off', glyph: 'sparkle' as GlyphName },
  { id: 'fatigue', title: 'Chronic fatigue', subtitle: 'I never feel rested, no matter the hours', glyph: 'leaf' as GlyphName },
  { id: 'caffeine', title: 'Caffeine keeps me up', subtitle: "I rely on it but it ruins my sleep", glyph: 'coffee' as GlyphName },
];

// ─── S07 Chronotype (simplified 3-question MEQ) ─────────────────────────────

export const mockChronotypeQuestions = [
  {
    id: 'preferred_wake',
    question: "If you had no obligations, when would you wake up?",
    options: [
      { id: 'early', label: '5:00 – 6:30', value: 'morning' },
      { id: 'mid', label: '6:30 – 8:30', value: 'mid' },
      { id: 'late', label: '8:30 – 10:30', value: 'evening' },
      { id: 'very_late', label: 'After 10:30', value: 'strong_evening' },
    ],
  },
  {
    id: 'energy_peak',
    question: "When do you feel most sharp and focused?",
    options: [
      { id: 'morning', label: 'Morning', value: 'morning' },
      { id: 'noon', label: 'Late morning / noon', value: 'mid' },
      { id: 'afternoon', label: 'Afternoon', value: 'mid' },
      { id: 'night', label: 'Evening / night', value: 'evening' },
    ],
  },
  {
    id: 'natural_sleep',
    question: "If completely free, when would you naturally fall asleep?",
    options: [
      { id: 'early', label: 'Before 22:00', value: 'morning' },
      { id: 'normal', label: '22:00 – 23:30', value: 'mid' },
      { id: 'late', label: '23:30 – 01:00', value: 'evening' },
      { id: 'very_late', label: 'After 01:00', value: 'strong_evening' },
    ],
  },
];

// ─── S08 Caffeine ───────────────────────────────────────────────────────────

export const mockCaffeineTypes = [
  { id: 'coffee', label: 'Coffee', glyph: 'coffee' as GlyphName },
  { id: 'tea', label: 'Tea', glyph: 'leaf' as GlyphName },
  { id: 'energy', label: 'Energy drinks', glyph: 'pulse' as GlyphName },
];

export const mockCaffeineSensitivities = [
  { id: 'normal', label: 'Normal', subtitle: "Doesn't affect my sleep much" },
  { id: 'slow', label: 'Slow metaboliser', subtitle: "Even afternoon coffee keeps me up" },
  { id: 'unknown', label: "Not sure", subtitle: "We'll start with a safe default" },
];

// ─── S09 Melatonin ──────────────────────────────────────────────────────────

export const mockMelatoninDoses = ['0.5', '1', '3', '5', '10'];

// ─── S06 / S12 Social proof ─────────────────────────────────────────────────

export const mockSocialProofStats = {
  percentUnderslept: 93,
  appStoreRating: 4.8,
  totalUsers: 12400,
  totalReviews: 2400,
};

export const mockTestimonials = {
  nurse: {
    quote: "After 3 night shifts I was a zombie. Now I have a transition plan — and my first day off is actually mine.",
    author: 'Sara · ICU nurse',
    rating: 5,
  },
  fire: {
    quote: "The caffeine cutoff alone saved me. I stopped waking up three times a night on my first shift back.",
    author: 'Marcus · firefighter / EMT',
    rating: 5,
  },
  factory: {
    quote: "Continental is rough. ShiftRest treats the 4-off like recovery, not vacation. Changed my whole week.",
    author: 'Elena · line supervisor',
    rating: 5,
  },
  other: {
    quote: "Finally a sleep app that doesn't shame me for sleeping at noon. Feels like it was built for me.",
    author: 'Jordan · shift worker',
    rating: 5,
  },
};

// ─── S16 Notification types ─────────────────────────────────────────────────

export const mockNotificationTypes = [
  { id: 'sleep', glyph: 'bed' as GlyphName, title: 'Bed time reminder', subtitle: '30 min before your sleep window' },
  { id: 'caffeine', glyph: 'coffee' as GlyphName, title: 'Caffeine cutoff', subtitle: 'Your last cup of coffee, timed for tonight' },
  { id: 'melatonin', glyph: 'moon' as GlyphName, title: 'Melatonin timing', subtitle: 'Gentle nudge at the right hour' },
];
