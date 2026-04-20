/**
 * Mock user — used by demo screens until Stage 6 wires up real Supabase auth.
 */

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
  { id: 'nurse', title: 'Nurse · 3×12', subtitle: 'Rotating day/night twelves', glyph: 'pulse' as const },
  { id: 'fire', title: 'Firefighter / EMT', subtitle: '24 on, 48 off', glyph: 'flame' as const },
  { id: 'factory', title: 'Factory worker', subtitle: 'Continental 2/2/4 shifts', glyph: 'gear' as const },
  { id: 'other', title: 'Something else', subtitle: "Tell us your rotation", glyph: 'sparkle' as const },
];
