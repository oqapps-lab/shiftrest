/**
 * G8-P0 — "Right now in your body" circadian phase.
 *
 * A PURE, deterministic function that maps the live clock + the user's
 * current shift + their derived plan times to a single circadian "phase"
 * and a one-sentence next-move. It returns i18n KEYS + interpolation params
 * (never hardcoded English) so the Today card localises.
 *
 * Evidence anchors baked into the ordering:
 * - The 03:00–05:00 circadian nadir is the peak error-risk window for
 *   night-shift nurses/EMS — when alertness and core temperature bottom out.
 *   A timed 20-min nap or a last caffeine dose there beats sipping all night.
 * - On the post-night commute home, morning sunlight drags the body clock
 *   the WRONG way; keeping light low protects the day-sleep that follows.
 * - A 30–40 min wind-down before the sleep window is the single biggest
 *   lever for falling asleep, so we surface the melatonin/wind-down window
 *   as it opens.
 *
 * The function takes a concrete `GlassCard` `tone` so the renderer can tint
 * without re-deriving, and degrades to a calm `on_track` / `rest_day`
 * default when data is missing or the user is off — it never throws and
 * never returns a blank phase.
 */

import {
  suggestedPlanFromOnboarding,
  napWindowForShift,
  type SuggestedPlan,
} from './derive';

export type PhaseKey =
  | 'sleep_window'
  | 'wind_down'
  | 'night_nadir'
  | 'post_shift_commute'
  | 'caffeine_cutoff_soon'
  | 'rest_day'
  | 'on_track';

export type PhaseTone = 'dusk' | 'primary' | 'sunrise' | 'calm';

export type PhaseGlyph =
  | 'moon'
  | 'bed'
  | 'coffee'
  | 'sun'
  | 'sparkle'
  | 'pulse';

export interface PhaseResult {
  key: PhaseKey;
  glyph: PhaseGlyph;
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  tone: PhaseTone;
  /** Interpolation params for titleKey/bodyKey (already-formatted strings). */
  params: Record<string, string>;
}

export interface PhaseArgs {
  /** Current wall-clock as fractional hours, e.g. 14.5 = 14:30. 0..24. */
  nowHour: number;
  /** The user's CURRENT shift kind for today. */
  shift: 'day' | 'night' | 'off';
  /** Derived plan times (sleep window + caffeine/melatonin). */
  plan: SuggestedPlan;
  /** Does the user take melatonin? Gates the wind-down phrasing. */
  takesMelatonin: boolean;
  /**
   * Optional pre-formatted clock strings, supplied by the caller via
   * formatHour() so this module stays free of i18n/format coupling.
   * When omitted we fall back to a plain HH:MM render of the plan hour.
   */
  format?: (hour: number) => string;
}

/** Minutes-precision "is `now` within `start`..`start+spanH`" on a 24h ring. */
function withinWindow(nowHour: number, startHour: number, spanHours: number): boolean {
  // Distance forward from start to now, wrapped into [0, 24).
  let delta = nowHour - startHour;
  delta = ((delta % 24) + 24) % 24;
  return delta < spanHours;
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

function defaultFormat(hour: number): string {
  const totalMins = Math.round(hour * 60);
  const hh = Math.floor(totalMins / 60) % 24;
  const mm = ((totalMins % 60) + 60) % 60;
  return `${String(((hh % 24) + 24) % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

const I18N_PREFIX = 'today.now_phase';

function result(
  key: PhaseKey,
  glyph: PhaseGlyph,
  tone: PhaseTone,
  params: Record<string, string> = {},
): PhaseResult {
  return {
    key,
    glyph,
    tone,
    eyebrowKey: `${I18N_PREFIX}.eyebrow`,
    titleKey: `${I18N_PREFIX}.${key}_title`,
    bodyKey: `${I18N_PREFIX}.${key}_body`,
    params,
  };
}

/**
 * Decide the user's current circadian phase + next move.
 *
 * Precedence (highest first):
 *  1. In the sleep window           → protect it.
 *  2. Night shift, 02:30–05:00      → nadir; nap or last coffee now.
 *  3. Wind-down (sleep opens <90m)  → melatonin/wind-down window.
 *  4. Night shift, post-shift AM    → commute home, keep light low.
 *  5. Caffeine cutoff approaching   → "last coffee by HH:MM".
 *  6. Off day                       → calm rest-day default.
 *  7. Otherwise                     → on-track default.
 */
export function phaseForNow(args: PhaseArgs): PhaseResult {
  const fmt = args.format ?? defaultFormat;

  // Guard: a malformed nowHour must never crash the card. Normalise into
  // [0, 24); fall back to on_track if it's not finite.
  const nowHour = Number.isFinite(args.nowHour)
    ? ((args.nowHour % 24) + 24) % 24
    : NaN;
  if (Number.isNaN(nowHour)) {
    return result('on_track', 'sparkle', 'calm');
  }

  const plan = args.plan;
  const sleepStart = plan.sleepStart;
  const span = sleepSpan(plan);

  // ── 1. In the sleep window ────────────────────────────────────────────
  if (withinWindow(nowHour, sleepStart, span)) {
    return result('sleep_window', 'bed', 'dusk');
  }

  // ── 2. Night-shift circadian nadir (02:30–05:00) ──────────────────────
  // Only meaningful while actually on a night shift. This is the peak
  // error-risk window — surface a tactical nap / last caffeine prompt.
  if (args.shift === 'night' && nowHour >= 2.5 && nowHour < 5) {
    const nap = napWindowForShift('night');
    const napMin = nap ? String(nap.durationMin) : '20';
    return result('night_nadir', 'coffee', 'sunrise', { napMin });
  }

  // ── 3. Wind-down: sleep window opens within the next 90 minutes ───────
  const untilSleep = hoursUntil(nowHour, sleepStart);
  if (untilSleep > 0 && untilSleep <= 1.5) {
    const mins = Math.round(untilSleep * 60);
    if (args.takesMelatonin) {
      const melatonin = fmt(parseHourMaybe(plan.melatoninTime));
      const r = result('wind_down', 'moon', 'dusk', {
        mins: String(mins),
        melatonin,
      });
      // Melatonin users get a body that names the dose time.
      r.bodyKey = `${I18N_PREFIX}.wind_down_body_melatonin`;
      return r;
    }
    return result('wind_down', 'moon', 'dusk', { mins: String(mins) });
  }

  // ── 4. Night shift, post-shift morning commute (sleep window NOT yet) ─
  // After a night, the morning sun pushes the clock the wrong way. We treat
  // the 2h before the (daytime) sleep window as the commute window, but only
  // if it falls in the morning (05:00–11:00) so it never collides with a
  // normal evening wind-down.
  if (
    args.shift === 'night' &&
    nowHour >= 5 &&
    nowHour < 11 &&
    untilSleep > 1.5
  ) {
    return result('post_shift_commute', 'sun', 'sunrise');
  }

  // ── 5. Caffeine cutoff approaching (within next 3h, still in future) ──
  const caffeineHour = parseHourMaybe(plan.caffeineCutoff);
  const untilCaffeine = hoursUntil(nowHour, caffeineHour);
  if (untilCaffeine > 0 && untilCaffeine <= 3) {
    return result('caffeine_cutoff_soon', 'coffee', 'calm', {
      caffeine: fmt(caffeineHour),
    });
  }

  // ── 6. Off day → calm recovery default ────────────────────────────────
  if (args.shift === 'off') {
    return result('rest_day', 'sparkle', 'calm');
  }

  // ── 7. On-track default — surface the next anchor (caffeine cutoff) ───
  return result('on_track', 'sparkle', 'calm', {
    caffeine: fmt(caffeineHour),
  });
}

/** Parse "HH:MM" → fractional hours. Tolerates a bare number string. */
function parseHourMaybe(hhmm: string): number {
  const parts = hhmm.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h)) return 0;
  return h + (Number.isNaN(m) ? 0 : m) / 60;
}

/**
 * Convenience builder used by the Today screen: derive the plan from
 * onboarding-equivalent inputs, then pick the phase. Kept thin so the
 * screen passes already-resolved plan hours when it has a live plan.
 */
export function phaseFromShift(
  nowHour: number,
  shift: 'day' | 'night' | 'off',
  chronotype: 'lark' | 'intermediate' | 'owl' | null,
  takesMelatonin: boolean,
  overrides?: Partial<Pick<SuggestedPlan, 'sleepStart' | 'sleepEnd' | 'caffeineCutoff' | 'melatoninTime'>>,
  format?: (hour: number) => string,
): PhaseResult {
  const base = suggestedPlanFromOnboarding(shift, chronotype);
  const plan: SuggestedPlan = { ...base, ...overrides };
  return phaseForNow({ nowHour, shift, plan, takesMelatonin, format });
}
