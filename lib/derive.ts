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
  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60);
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
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return `${String(whole).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatHourRange(start: number, end: number): string {
  return `${formatHour(start)} — ${formatHour(end)}`;
}

export function hoursBetween(from: number, to: number): number {
  let diff = to - from;
  if (diff < 0) diff += 24;
  return diff;
}
