/**
 * Derived display strings — single source of truth for values that must
 * reflect current state (greeting, relative times, trial remaining, date labels).
 *
 * All user-facing strings route through t() so the demo respects the active
 * locale. Note: month/weekday arrays are pulled at call-time, not module-load,
 * so locale switches during a screenshot batch take effect immediately.
 */

import { t } from './i18n';
import type { Translations } from './i18n/locales/en';

export function getGreeting(nowHour: number): string {
  if (nowHour < 5) return t('greetings.night');
  if (nowHour < 12) return t('greetings.morning');
  if (nowHour < 18) return t('greetings.afternoon');
  return t('greetings.evening');
}

export function formatRelativeTime(nowHour: number, targetHour: number): string {
  let diff = targetHour - nowHour;
  if (diff < 0) diff += 24;
  if (diff === 0) return t('rel.now');
  const totalMins = Math.round(diff * 60);
  if (totalMins === 0) return t('rel.now'); // sub-minute differences
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return t('rel.m_away', { m });
  if (m === 0) return t('rel.h_away', { h });
  return t('rel.hm_away', { h, m });
}

export function formatTrialRemaining(trialEndsAt: string, today: Date = new Date()): string {
  const isoLike = trialEndsAt.includes('T') ? trialEndsAt : `${trialEndsAt}T00:00:00`;
  const end = new Date(isoLike);
  if (Number.isNaN(end.getTime())) return t('trial.expired');

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return t('trial.expired');
  if (days === 0) return t('trial.ends_today');
  if (days === 1) return t('trial.one_day');
  return t('trial.n_days', { n: days });
}

function monthsFull(): readonly string[] {
  const m = (t('date.months_full') as unknown) as Translations['date']['months_full'];
  return Array.isArray(m) ? m : [];
}

function monthsShort(): readonly string[] {
  const m = (t('date.months_short') as unknown) as Translations['date']['months_short'];
  return Array.isArray(m) ? m : [];
}

export function formatMonthYear(d: Date = new Date()): string {
  const months = monthsFull();
  return `${months[d.getMonth()] ?? ''} ${d.getFullYear()}`;
}

export function formatDayMonth(d: Date = new Date()): string {
  const months = monthsShort();
  return `${d.getDate()} ${months[d.getMonth()] ?? ''}`;
}

export function formatStreak(streak: number): string {
  return `${streak} ${streak === 1 ? t('streak.suffix_one') : t('streak.suffix_other')}`;
}

export function clampDisplayName(raw: string | null | undefined, max = 24): string {
  if (!raw) return '';
  const s = raw.trim();
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.6) return `${slice.slice(0, lastSpace).trimEnd()}…`;
  return `${slice.trimEnd()}…`;
}

export function firstName(raw: string | null | undefined, max = 16): string {
  if (!raw) return '';
  const first = raw.trim().split(/\s+/)[0] ?? '';
  return clampDisplayName(first, max);
}

export function countCompleted<T extends { done: boolean }>(steps: readonly T[]): number {
  return steps.filter((s) => s.done).length;
}

export function formatHour(h: number): string {
  // Normalise rounding overflow: 23.99999 → mins=60 → would render '23:60'.
  // Recompute via total minutes to ensure mins ∈ [0, 59] and hours roll over.
  const totalMins = Math.round(h * 60);
  const whole = Math.floor(totalMins / 60) % 24;
  const mins = ((totalMins % 60) + 60) % 60;
  const safeHour = ((whole % 24) + 24) % 24;
  return `${String(safeHour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatHourRange(start: number, end: number): string {
  return `${formatHour(start)} — ${formatHour(end)}`;
}

export function hoursBetween(from: number, to: number): number {
  let diff = to - from;
  if (diff < 0) diff += 24;
  return diff;
}

/**
 * Suggested plan times derived from onboarding answers.
 *
 * Used when there's no live `generated_plan` yet (anon users, or signed-in
 * users before the OpenAI plan generator has run). Replaces the old habit
 * of falling back to `mockPlan` — which surfaced "Caffeine cutoff 14:30 /
 * Melatonin 22:00" to users who never gave us a schedule (live-test
 * 2026-05-25 hardcode complaint).
 *
 * Rules (clinically informed):
 * - Day shift (07-19): sleep 23-07, caffeine cutoff at 14:00 (~6h pre-bed),
 *   melatonin 21:30 (~90 min pre-bed).
 * - Night shift (19-07): sleep 09-17, caffeine cutoff at 02:00 (last hr of
 *   shift), melatonin 07:30 (anchor adaptation).
 * - Off (no shift today): default to day-shift defaults.
 *
 * Chronotype shifts by ±30 min: lark earlier, owl later.
 */
export interface SuggestedPlan {
  sleepStart: number;
  sleepEnd: number;
  caffeineCutoff: string;
  melatoninTime: string;
  shiftStart: number;
  shiftEnd: number;
}

const DAY_DEFAULTS: SuggestedPlan = {
  sleepStart: 23,
  sleepEnd: 7,
  caffeineCutoff: '14:00',
  melatoninTime: '21:30',
  shiftStart: 7,
  shiftEnd: 19,
};

const NIGHT_DEFAULTS: SuggestedPlan = {
  sleepStart: 9,
  sleepEnd: 17,
  caffeineCutoff: '02:00',
  melatoninTime: '07:30',
  shiftStart: 19,
  shiftEnd: 7,
};

function shiftHours(p: SuggestedPlan, deltaHours: number): SuggestedPlan {
  const wrap = (h: number) => ((h + deltaHours) % 24 + 24) % 24;
  // deltaHours can be fractional (e.g. ±0.5). For string times we have to
  // shift via total minutes — naive `wrap(h)` returns 13.5 for 14h - 0.5h
  // and renders as "13.5:00" instead of "13:30".
  const wrapStr = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    const totalMins = h * 60 + m + Math.round(deltaHours * 60);
    const norm = ((totalMins % (24 * 60)) + 24 * 60) % (24 * 60);
    const hh = Math.floor(norm / 60);
    const mm = norm % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };
  return {
    sleepStart: wrap(p.sleepStart),
    sleepEnd: wrap(p.sleepEnd),
    caffeineCutoff: wrapStr(p.caffeineCutoff),
    melatoninTime: wrapStr(p.melatoninTime),
    shiftStart: p.shiftStart,
    shiftEnd: p.shiftEnd,
  };
}

export function suggestedPlanFromOnboarding(
  shift: 'day' | 'night' | 'off',
  chronotype: 'lark' | 'intermediate' | 'owl' | null,
): SuggestedPlan {
  const base = shift === 'night' ? NIGHT_DEFAULTS : DAY_DEFAULTS;
  if (chronotype === 'lark') return shiftHours(base, -0.5);
  if (chronotype === 'owl') return shiftHours(base, 0.5);
  return base;
}

/** Light therapy recommendation for the day, by current shift type. The
 *  windows are evidence-aligned to CDC/NIOSH guidance: bright light during
 *  active hours promotes alertness, dark exposure on the commute home from
 *  a night shift prevents a circadian reset toward the wrong direction. */
export interface LightWindow {
  /** Translation key for the eyebrow ("SEEK LIGHT" / "AVOID LIGHT"). */
  eyebrowKey: 'plan.cards.light.seek' | 'plan.cards.light.avoid';
  /** Local 24h start hour. */
  startHour: number;
  /** Local 24h end hour. */
  endHour: number;
}

/** Nap recommendation for the day, by current shift type.
 *  - Day shift: optional 20 min siesta around 14:00 (post-lunch dip)
 *  - Night shift: 90-min full-cycle nap before shift at 14:00, OR power nap
 *    20 min mid-shift around 03:00 if commute is short.
 *  - Off day: optional recovery 90 min at 13:00 if user is in transition. */
export interface NapWindow {
  kind: 'power' | 'recovery' | 'full_cycle';
  /** Local 24h hour (decimal). */
  hour: number;
  durationMin: number;
}

export function napWindowForShift(
  shift: 'day' | 'night' | 'off',
): NapWindow | null {
  if (shift === 'night') {
    return { kind: 'full_cycle', hour: 14, durationMin: 90 };
  }
  if (shift === 'day') {
    return { kind: 'power', hour: 14, durationMin: 20 };
  }
  return { kind: 'recovery', hour: 13, durationMin: 90 };
}

export function lightWindowsForShift(
  shift: 'day' | 'night' | 'off',
): LightWindow[] {
  if (shift === 'night') {
    return [
      // First half of night shift — bright light to stay alert
      { eyebrowKey: 'plan.cards.light.seek', startHour: 19, endHour: 1 },
      // Commute home — dark glasses to avoid resetting the body clock
      { eyebrowKey: 'plan.cards.light.avoid', startHour: 7, endHour: 9 },
    ];
  }
  if (shift === 'day') {
    return [
      // Morning light advances rhythm earlier and reinforces day pattern
      { eyebrowKey: 'plan.cards.light.seek', startHour: 7, endHour: 9 },
      // Evening dim-down — prepare melatonin release
      { eyebrowKey: 'plan.cards.light.avoid', startHour: 21, endHour: 23 },
    ];
  }
  // Off day — anchor circadian rhythm with morning sun
  return [
    { eyebrowKey: 'plan.cards.light.seek', startHour: 8, endHour: 10 },
  ];
}
