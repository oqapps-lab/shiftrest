/**
 * Rule-based transition plan generator.
 * Phase advance (night → day) and phase delay (day → night) follow
 * CDC/NIOSH guidelines + AASM 2007 melatonin timing for SWSD.
 *
 * Returns the same shape that lives in Supabase transition_plans +
 * transition_steps tables, so the rendering layer doesn't care whether
 * the row came from the server or this client function.
 */

import type { ShiftKind } from '../onboarding/store';

export type TransitionType = 'night_to_day' | 'day_to_night';

export interface GeneratedStep {
  day_number: number;
  step_order: number;
  /** ISO local date+time string (no Z), e.g. '2026-05-28T06:00:00'. */
  scheduled_time: string;
  action_type: 'light' | 'melatonin' | 'caffeine' | 'sleep' | 'wake' | 'wind_down';
  title: string;
  description: string;
}

export interface GeneratedPlan {
  transition_type: TransitionType;
  start_date: string;       // YYYY-MM-DD local
  end_date: string;         // YYYY-MM-DD local
  total_days: number;
  total_steps: number;
  steps: GeneratedStep[];
}

function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localDateTime(date: Date, h: number, m: number): string {
  const out = new Date(date);
  out.setHours(h, m, 0, 0);
  return `${localDate(out)}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

interface UserPrefs {
  takesMelatonin?: boolean;
  caffeineCupsPerDay?: number;
  usesLightTherapy?: boolean;
  chronotype?: 'lark' | 'intermediate' | 'owl' | null;
}

/**
 * Night → Day transition (after a block of night shifts, you have 2+ off
 * days and want to anchor to a day schedule). Day 1 = last night shift;
 * Day 2 = first off day where you wake earlier, eat with family, etc.
 */
function generateNightToDay(start: Date, prefs: UserPrefs): GeneratedStep[] {
  const steps: GeneratedStep[] = [];
  const d1 = new Date(start);
  const d2 = new Date(start);
  d2.setDate(start.getDate() + 1);
  let order = 1;

  // ── Day 1 — last night shift (or first morning home) ────────────────
  if (prefs.usesLightTherapy !== false) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d1, 19, 0),
      action_type: 'light',
      title: 'Seek bright light',
      description: 'First half of shift — bright light keeps you alert and starts the phase shift.',
    });
  }
  if ((prefs.caffeineCupsPerDay ?? 2) > 0) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d1, 1, 0),
      action_type: 'caffeine',
      title: 'Caffeine cutoff',
      description: 'Last cup by 01:00 so it clears before your post-shift sleep.',
    });
  }
  if (prefs.usesLightTherapy !== false) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d1, 7, 0),
      action_type: 'light',
      title: 'Dark glasses on commute',
      description: 'Block morning light so your body clock doesn’t reset toward night.',
    });
  }
  if (prefs.takesMelatonin) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d1, 8, 30),
      action_type: 'melatonin',
      title: 'Melatonin 0.5–3 mg',
      description: 'Take just before bed. Helps you sleep through morning noise.',
    });
  }
  steps.push({
    day_number: 1,
    step_order: order++,
    scheduled_time: localDateTime(d1, 9, 0),
    action_type: 'sleep',
    title: 'Sleep window 09:00 – 15:30',
    description: 'Keep curtains drawn and phone on Do Not Disturb. Aim for 6h.',
  });

  // ── Day 2 — anchor to day schedule ──────────────────────────────────
  order = 1;
  steps.push({
    day_number: 2,
    step_order: order++,
    scheduled_time: localDateTime(d2, 6, 30),
    action_type: 'wake',
    title: 'Wake up at 06:30',
    description: 'Yes, it’s early. The next 24h are how you reset.',
  });
  if (prefs.usesLightTherapy !== false) {
    steps.push({
      day_number: 2,
      step_order: order++,
      scheduled_time: localDateTime(d2, 7, 0),
      action_type: 'light',
      title: 'Bright morning light',
      description: '30 min outside or by a window — strongest possible reset signal.',
    });
  }
  if ((prefs.caffeineCupsPerDay ?? 2) > 0) {
    steps.push({
      day_number: 2,
      step_order: order++,
      scheduled_time: localDateTime(d2, 13, 0),
      action_type: 'caffeine',
      title: 'Caffeine cutoff',
      description: 'Last coffee by 13:00 — protects tonight’s sleep.',
    });
  }
  steps.push({
    day_number: 2,
    step_order: order++,
    scheduled_time: localDateTime(d2, 21, 0),
    action_type: 'wind_down',
    title: 'Wind down — dim lights',
    description: 'Dim screens, no caffeine, light dinner. You’re almost there.',
  });
  if (prefs.takesMelatonin) {
    steps.push({
      day_number: 2,
      step_order: order++,
      scheduled_time: localDateTime(d2, 22, 0),
      action_type: 'melatonin',
      title: 'Melatonin 0.5 mg',
      description: 'Phase-advance dose 1h before bed cements the shift.',
    });
  }
  steps.push({
    day_number: 2,
    step_order: order++,
    scheduled_time: localDateTime(d2, 23, 0),
    action_type: 'sleep',
    title: 'Sleep window 23:00 – 07:00',
    description: 'Full 8h. Tomorrow you’re on a day schedule.',
  });

  return steps;
}

/**
 * Day → Night transition (anchor day worker switching to a night block).
 * The goal is phase delay: stay up later each evening, sleep later each
 * morning, so when the first night shift starts you’re running on bench-shifted
 * circadian time.
 */
function generateDayToNight(start: Date, prefs: UserPrefs): GeneratedStep[] {
  const steps: GeneratedStep[] = [];
  const d1 = new Date(start);
  const d2 = new Date(start);
  d2.setDate(start.getDate() + 1);
  let order = 1;

  // ── Day 1 — push bedtime later, prep nap mid-day ────────────────────
  if (prefs.usesLightTherapy !== false) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d1, 11, 0),
      action_type: 'light',
      title: 'Dark glasses on commute',
      description: 'Avoid morning sun — it’s pulling you back toward early sleep.',
    });
  }
  steps.push({
    day_number: 1,
    step_order: order++,
    scheduled_time: localDateTime(d1, 14, 0),
    action_type: 'sleep',
    title: 'Anchor nap · 90 min',
    description: 'Banks one full sleep cycle. Set an alarm — naps longer than 90 min give inertia.',
  });
  if (prefs.usesLightTherapy !== false) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d1, 20, 0),
      action_type: 'light',
      title: 'Seek bright light',
      description: 'Bright light in the evening pushes your body clock later.',
    });
  }
  if (prefs.takesMelatonin) {
    steps.push({
      day_number: 1,
      step_order: order++,
      scheduled_time: localDateTime(d2, 8, 0),
      action_type: 'melatonin',
      title: 'Morning melatonin',
      description: 'Phase-delay dose — take just before your post-shift sleep.',
    });
  }

  // ── Day 2 — first night shift ──────────────────────────────────────
  order = 1;
  steps.push({
    day_number: 2,
    step_order: order++,
    scheduled_time: localDateTime(d2, 19, 0),
    action_type: 'wake',
    title: 'Wake at 19:00',
    description: 'Eat a light dinner-as-breakfast. Coffee OK for the first half of shift.',
  });
  if (prefs.usesLightTherapy !== false) {
    steps.push({
      day_number: 2,
      step_order: order++,
      scheduled_time: localDateTime(d2, 22, 0),
      action_type: 'light',
      title: 'Bright light at work',
      description: 'Stay near the brightest light source during the first half of shift.',
    });
  }
  if ((prefs.caffeineCupsPerDay ?? 2) > 0) {
    steps.push({
      day_number: 2,
      step_order: order++,
      scheduled_time: localDateTime(d2, 1, 0),
      action_type: 'caffeine',
      title: 'Caffeine cutoff',
      description: 'Last coffee at 01:00 — 6h before you plan to sleep at 07:00.',
    });
  }

  return steps;
}

export function generateTransitionPlan(
  type: TransitionType,
  startDate: Date,
  prefs: UserPrefs = {},
): GeneratedPlan {
  const steps = type === 'night_to_day'
    ? generateNightToDay(startDate, prefs)
    : generateDayToNight(startDate, prefs);

  const end = new Date(startDate);
  end.setDate(startDate.getDate() + 1);

  return {
    transition_type: type,
    start_date: localDate(startDate),
    end_date: localDate(end),
    total_days: 2,
    total_steps: steps.length,
    steps,
  };
}

/** Auto-detect: scan local shifts looking for a night-block followed by
 *  2+ off days (suggesting a night→day transition is upcoming) or a
 *  day-block followed by a night (day→night). Returns the best candidate
 *  start date + type, or null if nothing convincing within the window. */
export function detectTransitionOpportunity(
  shiftByIso: Map<string, ShiftKind>,
  todayIso: string,
): { type: TransitionType; startIso: string } | null {
  const today = new Date(todayIso + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today_kind = shiftByIso.get(iso);
    const next_iso = (() => {
      const n = new Date(d);
      n.setDate(d.getDate() + 1);
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    })();
    const next_kind = shiftByIso.get(next_iso);

    // Night today followed by off/day tomorrow → night→day
    if (today_kind === 'night' && (next_kind === 'off' || next_kind === 'day')) {
      return { type: 'night_to_day', startIso: iso };
    }
    // Day today followed by night tomorrow → day→night
    if (today_kind === 'day' && next_kind === 'night') {
      return { type: 'day_to_night', startIso: iso };
    }
  }
  return null;
}
