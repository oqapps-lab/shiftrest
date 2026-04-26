/**
 * Derived display strings — single source of truth for values that must
 * reflect current state (greeting, relative times, trial remaining, date labels).
 *
 * Design note: uses mockPlan.nowHour for "now" in the sleep-plan context
 * so timeline/event strings stay consistent with the demo data. Uses real
 * `new Date()` for calendar and trial math so those surfaces adapt as
 * the real date advances. Stage 6 will replace mockPlan with live state.
 */

export function getGreeting(nowHour: number): string {
  if (nowHour < 5) return 'GOOD NIGHT';
  if (nowHour < 12) return 'GOOD MORNING';
  if (nowHour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

/**
 * "2h 30m away", "45m away", "12h away", "now" — distance from nowHour
 * to targetHour, wrapping across midnight. Both inputs are 0-24 floats.
 */
export function formatRelativeTime(nowHour: number, targetHour: number): string {
  let diff = targetHour - nowHour;
  if (diff < 0) diff += 24;
  if (diff === 0) return 'now';
  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60);
  if (h === 0) return `${m}m away`;
  if (m === 0) return `${h}h away`;
  return `${h}h ${m}m away`;
}

/**
 * "6 days left", "1 day left", "today", "expired".
 * Accepts both 'YYYY-MM-DD' (legacy mock) and full ISO timestamps
 * ('2026-05-03T07:41:05.357Z' — what the DB stores).
 */
export function formatTrialRemaining(trialEndsAt: string, today: Date = new Date()): string {
  const isoLike = trialEndsAt.includes('T') ? trialEndsAt : `${trialEndsAt}T00:00:00`;
  const end = new Date(isoLike);
  if (Number.isNaN(end.getTime())) return 'expired';

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days === 0) return 'ends today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

const MONTH_FULL = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
] as const;

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

/** "APRIL 2026" */
export function formatMonthYear(d: Date = new Date()): string {
  return `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/** "22 APR" */
export function formatDayMonth(d: Date = new Date()): string {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

/** "14 DAYS" / "1 DAY" — streak label, handles plural. */
export function formatStreak(streak: number): string {
  return `${streak} DAY${streak === 1 ? '' : 'S'}`;
}

/**
 * Clamp a display name to fit comfortably in headers / greetings.
 * Defaults to 24 chars, breaking at the nearest space when possible to
 * avoid mid-word ellipsis. Returns the trimmed source if it already fits.
 */
export function clampDisplayName(raw: string | null | undefined, max = 24): string {
  if (!raw) return '';
  const s = raw.trim();
  if (s.length <= max) return s;
  // Prefer breaking at a space within the budget.
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.6) return `${slice.slice(0, lastSpace).trimEnd()}…`;
  return `${slice.trimEnd()}…`;
}

/**
 * Reduce a multi-word display name to its first word (typical: first
 * name) and optionally clamp. Useful in tight greeting eyebrows.
 *   "ALEKSANDRA KONSTANTINOPOLUVSKAYA …" → "ALEKSANDRA"
 *   "Marina"                              → "Marina"
 *   "Mary-Anne O'Connor"                  → "Mary-Anne"  (hyphen kept)
 */
export function firstName(raw: string | null | undefined, max = 16): string {
  if (!raw) return '';
  const first = raw.trim().split(/\s+/)[0] ?? '';
  return clampDisplayName(first, max);
}

/** Count `done: true` across a day's steps. */
export function countCompleted<T extends { done: boolean }>(steps: readonly T[]): number {
  return steps.filter((s) => s.done).length;
}

/** Float hour → "HH:MM" (14.5 → "14:30", 23 → "23:00"). */
export function formatHour(h: number): string {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return `${String(whole).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/** Float hour range → "HH:MM — HH:MM" with em-dash. Wraps across midnight. */
export function formatHourRange(start: number, end: number): string {
  return `${formatHour(start)} — ${formatHour(end)}`;
}

/** Hours between two 0-24 floats, wrapping across midnight. */
export function hoursBetween(from: number, to: number): number {
  let diff = to - from;
  if (diff < 0) diff += 24;
  return diff;
}
