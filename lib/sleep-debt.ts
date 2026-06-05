/**
 * TODAY-9 — Sleep-debt computation (pure, deterministic).
 *
 * Turns the optional "hours slept" ledger (lib/sleep-hours/store) into a real
 * tracked metric: cumulative sleep debt over a rolling window, a severity
 * band, and a rough recovery estimate ("clears in ~N days").
 *
 * Evidence anchors (why these numbers):
 *  - Sleep debt = the running shortfall vs. your sleep NEED. For shift workers
 *    a 1–2h nightly deficit compounds fast across a rotation.
 *  - Recovery is real but slow: you can pay down extra sleep on recovery days,
 *    but only ~1–2h of "catch-up" sleep is biologically useful per day (you
 *    can't bank 8h of recovery in one night). We model ~1.5h recoverable/day,
 *    so a typical accumulated debt clears over a few days, not overnight.
 *  - Default need ~7.5h (mid of the 7–9h adult range). Chronotype nudges it
 *    slightly: owls tend to need marginally more, larks marginally less — a
 *    small ±0.25h tweak, never a clinical claim.
 *
 * CRITICAL — only days WITH a logged hours value count. Unlogged days are
 * IGNORED (we never assume the user slept their need, nor zero). A user who
 * logs nothing has zero debt and an empty state, not a fake number.
 */

export type DebtSeverity = 'none' | 'mild' | 'moderate' | 'severe';

export interface SleepDebt {
  /** Cumulative hours of deficit over the window (>= 0, rounded to 0.5h). */
  debtHours: number;
  /** Severity band derived from debtHours. */
  severity: DebtSeverity;
  /** Rough number of recovery days to clear the debt (0 when no debt). */
  clearsInDays: number;
  /** How many days in the window actually had a logged hours value. */
  loggedDays: number;
}

/** Default adult sleep need (hours) — mid of the 7–9h range. */
export const DEFAULT_SLEEP_NEED = 7.5;

/**
 * Useful catch-up sleep per recovery day (hours). You cannot bank a whole
 * night of recovery at once, so debt clears over a few days. Drives
 * clearsInDays.
 */
const RECOVERABLE_PER_DAY = 1.5;

type Chronotype = 'lark' | 'intermediate' | 'owl' | null | undefined;

/**
 * Sleep need adjusted by chronotype. Owls need marginally more, larks
 * marginally less — a gentle ±0.25h nudge off the base, never clinical.
 */
export function sleepNeedForChronotype(
  chronotype: Chronotype,
  base: number = DEFAULT_SLEEP_NEED,
): number {
  if (chronotype === 'owl') return base + 0.25;
  if (chronotype === 'lark') return base - 0.25;
  return base;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function severityFor(debtHours: number, loggedDays: number): DebtSeverity {
  if (loggedDays === 0) return 'none';
  if (debtHours < 2) return debtHours <= 0 ? 'none' : 'mild';
  if (debtHours <= 5) return 'moderate';
  return 'severe';
}

/**
 * Compute cumulative sleep debt over the trailing `windowDays` ending at
 * `today` (inclusive).
 *
 *  debtHours    = Σ max(0, need − actual) over days WITH a logged hours value
 *  severity     = none (<=0 / nothing logged) · mild (<2h) · moderate (2–5h) ·
 *                 severe (>5h)
 *  clearsInDays = ceil(debtHours / RECOVERABLE_PER_DAY), 0 when no debt
 *
 * Days without a logged value are ignored entirely. Pure + deterministic:
 * the same inputs always yield the same result.
 */
export function computeSleepDebt(
  hoursByDate: Record<string, number>,
  need: number = DEFAULT_SLEEP_NEED,
  today: Date = new Date(),
  windowDays = 14,
): SleepDebt {
  let debtHours = 0;
  let loggedDays = 0;

  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const v = hoursByDate[localDateKey(d)];
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) continue;
    loggedDays++;
    const deficit = need - v;
    if (deficit > 0) debtHours += deficit;
  }

  // Round to the nearest 0.5h so the surfaced number reads clean.
  debtHours = Math.round(debtHours * 2) / 2;

  const severity = severityFor(debtHours, loggedDays);
  const clearsInDays = debtHours <= 0 ? 0 : Math.ceil(debtHours / RECOVERABLE_PER_DAY);

  return { debtHours, severity, clearsInDays, loggedDays };
}
