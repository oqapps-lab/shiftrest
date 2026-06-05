/**
 * TODAY-6 — "Today's Focus".
 *
 * A PURE, deterministic picker that distils the user's live signals into THE
 * single highest-priority move for today, returning i18n KEYS + interpolation
 * params (never hardcoded English) plus ONE exact time string. The Today tab
 * renders it as a premium card; free users see a locked teaser in the same
 * slot. It exists to answer the owner's "why pay" critique: a visibly deeper
 * surface that changes day-to-day and gives a concrete reason to open.
 *
 * Anti-bloat by design: it returns exactly ONE focus — the most useful move
 * right now — never a list. The precedence below resolves ties so the result
 * is fully deterministic for a given set of inputs.
 *
 * Precedence (highest first):
 *  1. Caffeine load is heavy today (cups ≥ the user's daily norm, OR the last
 *     logged cup lands too close to the sleep window) → "Move your last coffee
 *     to {{time}}", where {{time}} is the sensitivity-adjusted cutoff.
 *  2. A run of rough nights in the recent journal (this week trending down, or
 *     ≥2 rough nights this week) → "Protect your {{time}} recovery nap", where
 *     {{time}} is today's nap/recovery window for the current shift.
 *  3. On a night shift with the circadian nadir still ahead → "Plan a 20-min
 *     nap around {{time}}", anchored to the 03:00 nadir.
 *  4. Otherwise → the next meaningful plan action with its time, derived from
 *     the live phase: wind-down (melatonin/sleep opens), the sleep window
 *     itself, or the caffeine cutoff.
 *
 * The function never throws and always returns one focus.
 */

import type { SuggestedPlan } from './derive';

export type FocusKey =
  | 'caffeine_load'
  | 'rough_streak'
  | 'night_nap'
  | 'wind_down'
  | 'sleep_window'
  | 'caffeine_cutoff'
  | 'steady';

export type FocusGlyph = 'coffee' | 'bed' | 'moon' | 'sparkle';

export interface FocusResult {
  key: FocusKey;
  glyph: FocusGlyph;
  titleKey: string;
  bodyKey: string;
  /** Interpolation params for titleKey/bodyKey (already-formatted strings). */
  params: Record<string, string>;
}

/** The week's sleep-journal trend, mirrored from sleep-journal `weeklyTally`. */
export interface WeeklyTally {
  good: number;
  ok: number;
  bad: number;
  trend: 'up' | 'down' | 'flat' | null;
}

export interface FocusArgs {
  /** Current wall-clock as fractional hours, 0..24 (e.g. 14.5 = 14:30). */
  nowHour: number;
  /** The user's CURRENT shift kind for today. */
  shift: 'day' | 'night' | 'off';
  /** Derived plan times (sleep window + caffeine/melatonin). */
  plan: SuggestedPlan;
  /** Does the user take melatonin? Gates the wind-down phrasing. */
  takesMelatonin: boolean;
  /** Onboarding daily-norm cups (0 = opted out of caffeine). */
  caffeineCupsPerDay: number;
  /** Caffeine sensitivity — 'slow' metabolisers need an earlier cutoff. */
  caffeineSensitivity: 'normal' | 'slow' | 'unknown' | null;
  /** Cups logged TODAY (from the caffeine logger), 0 when none. */
  cupsToday: number;
  /** Fractional hour of the last logged cup today, or null when none. */
  lastCupHour: number | null;
  /** Recent journal trend (this week vs last), or null when nothing logged. */
  tally: WeeklyTally | null;
  /** Today's recovery/nap window hour for the current shift (from derive). */
  napHour: number;
  /** Pre-formatted clock renderer (formatHour); falls back to HH:MM. */
  format?: (hour: number) => string;
}

const I18N_PREFIX = 'today.focus';

function defaultFormat(hour: number): string {
  const totalMins = Math.round(hour * 60);
  const hh = Math.floor(totalMins / 60) % 24;
  const mm = ((totalMins % 60) + 60) % 60;
  return `${String(((hh % 24) + 24) % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Parse "HH:MM" → fractional hours. Tolerates a bare number string. */
function parseHourMaybe(hhmm: string): number {
  const parts = hhmm.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h)) return 0;
  return h + (Number.isNaN(m) ? 0 : m) / 60;
}

/** Hours from `now` forward to `target` on a 24h ring (always >= 0, < 24). */
function hoursUntil(nowHour: number, targetHour: number): number {
  let delta = targetHour - nowHour;
  delta = ((delta % 24) + 24) % 24;
  return delta;
}

/** Span of the sleep window in hours (handles midnight wrap). */
function sleepSpan(plan: SuggestedPlan): number {
  let span = plan.sleepEnd - plan.sleepStart;
  if (span <= 0) span += 24;
  return span;
}

/** Minutes-precision "is `now` within `start`..`start+spanH`" on a 24h ring. */
function withinWindow(nowHour: number, startHour: number, spanHours: number): boolean {
  let delta = nowHour - startHour;
  delta = ((delta % 24) + 24) % 24;
  return delta < spanHours;
}

function build(
  key: FocusKey,
  glyph: FocusGlyph,
  params: Record<string, string> = {},
): FocusResult {
  return {
    key,
    glyph,
    titleKey: `${I18N_PREFIX}.${key}_title`,
    bodyKey: `${I18N_PREFIX}.${key}_body`,
    params,
  };
}

/**
 * The circadian nadir hour — the 03:00–05:00 alertness low where night-shift
 * error risk peaks. We anchor the tactical nap to its leading edge (03:00).
 */
const NADIR_HOUR = 3;

/**
 * Compute THE single most useful move for today.
 *
 * Deterministic: same inputs → same focus. See the precedence list at the top
 * of the file. Always returns exactly one focus.
 */
export function computeTodaysFocus(args: FocusArgs): FocusResult {
  const fmt = args.format ?? defaultFormat;

  const nowHour = Number.isFinite(args.nowHour)
    ? ((args.nowHour % 24) + 24) % 24
    : 0;

  const plan = args.plan;
  const sleepStart = plan.sleepStart;
  const caffeineHour = parseHourMaybe(plan.caffeineCutoff);

  // ── 1. Heavy caffeine load today ──────────────────────────────────────
  // Only meaningful for caffeine drinkers (norm > 0). "Heavy" = they've met
  // or exceeded their daily norm, OR their last cup lands within 6h of the
  // sleep window (it won't clear in time). Slow metabolisers get an extra
  // 1.5h of clearance baked into the recommended cutoff.
  if (args.caffeineCupsPerDay > 0) {
    const norm = args.caffeineCupsPerDay;
    const overNorm = args.cupsToday >= norm;
    const slowBuffer = args.caffeineSensitivity === 'slow' ? 1.5 : 0;
    // Recommended cutoff: 6h (+slow buffer) before sleep, but never later
    // than the plan's own caffeine cutoff. This is the exact time we surface.
    const cutoffBeforeSleep = sleepStart - 6 - slowBuffer;
    const recommendedCutoff = Math.min(caffeineHour, cutoffBeforeSleep);
    // Late cup: a cup logged after the recommended cutoff (so it overlaps the
    // clearance window). Compare on the 24h ring relative to the cutoff.
    const lateCup =
      args.lastCupHour != null &&
      hoursUntil(args.lastCupHour, ((recommendedCutoff % 24) + 24) % 24) > 12;
    if (overNorm || lateCup) {
      return build('caffeine_load', 'coffee', {
        time: fmt(((recommendedCutoff % 24) + 24) % 24),
        cups: String(args.cupsToday),
      });
    }
  }

  // ── 2. Recent rough-night streak ──────────────────────────────────────
  // The journal is trending DOWN this week, or they've had ≥2 rough nights —
  // protect a recovery nap rather than push through tired.
  if (
    args.tally &&
    (args.tally.trend === 'down' || args.tally.bad >= 2)
  ) {
    return build('rough_streak', 'bed', { time: fmt(args.napHour) });
  }

  // ── 3. Night shift, nadir still ahead ─────────────────────────────────
  // On a night shift before the 03:00 nadir → pre-plan the tactical nap.
  if (args.shift === 'night') {
    const untilNadir = hoursUntil(nowHour, NADIR_HOUR);
    // Only "ahead" if the nadir is in the next ~10h AND we're not already
    // past it into the morning (nowHour < 5 means we're still in the low).
    if (untilNadir > 0 && untilNadir <= 10 && !(nowHour >= NADIR_HOUR && nowHour < 5)) {
      return build('night_nap', 'bed', { time: fmt(NADIR_HOUR) });
    }
  }

  // ── 4. Phase-default — the next meaningful plan action with its time ───
  const span = sleepSpan(plan);
  // Already in the sleep window → protect it.
  if (withinWindow(nowHour, sleepStart, span)) {
    return build('sleep_window', 'moon', { time: fmt(plan.sleepEnd) });
  }
  // Sleep opens within 90 min → wind-down (melatonin time if they take it).
  const untilSleep = hoursUntil(nowHour, sleepStart);
  if (untilSleep > 0 && untilSleep <= 1.5) {
    if (args.takesMelatonin) {
      return build('wind_down', 'moon', {
        time: fmt(parseHourMaybe(plan.melatoninTime)),
      });
    }
    return build('wind_down', 'moon', { time: fmt(sleepStart) });
  }
  // Caffeine cutoff still ahead today → name it.
  if (args.caffeineCupsPerDay > 0) {
    const untilCutoff = hoursUntil(nowHour, caffeineHour);
    if (untilCutoff > 0 && untilCutoff <= 12) {
      return build('caffeine_cutoff', 'coffee', { time: fmt(caffeineHour) });
    }
  }
  // Steady default — point at tonight's sleep window opening.
  return build('steady', 'sparkle', { time: fmt(sleepStart) });
}
