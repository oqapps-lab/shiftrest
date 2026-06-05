/**
 * TODAY-11 — "Sleep banking" + "post-block recovery".
 *
 * A PURE, deterministic detector that scans the user's shift calendar and the
 * day's resolved shift to decide whether ONE of two contextual moves is live
 * RIGHT NOW:
 *
 *  • BANK — a hard night/long (24h) shift is upcoming TOMORROW, or today's own
 *    shift is a night/24h. The body can't pre-load a full night of sleep, but
 *    it CAN bank a chunk: take the pre-shift nap window, or move tonight's sleep
 *    earlier so you start the shift less depleted.
 *
 *  • RECOVER — today is OFF and it was preceded by a RUN of ≥2 consecutive work
 *    days (a block just ended). The instinct is to crash-sleep 12h; the better
 *    move is a paced re-anchor over 2–3 days around one fixed window so the
 *    clock settles instead of swinging.
 *
 *  • NONE — neither condition holds → the Today card renders nothing. This is
 *    the anti-bloat guarantee: the card is contextual, never always-on.
 *
 * Detection reuses the SAME scan idiom as `detectTransitionOpportunity`
 * (lib/transition/generate.ts): build an ISO→kind lookup, walk the calendar by
 * local date. The window helpers come straight from lib/derive.ts
 * (`napWindowForShift`, `anchorSleepWindow`) so the times this surfaces match
 * the rest of the app exactly. The function never throws and is fully
 * deterministic for a given input.
 *
 * Collision note: this is INTENTIONALLY orthogonal to the transition card.
 * The transition detector fires on a night→day / day→night PIVOT (a kind change
 * across consecutive days) and produces a multi-step plan. Sleep-banking fires
 * on (a) an UPCOMING hard shift regardless of what precedes it, or (b) an OFF
 * day that CLOSES a work run. A night→off pivot can satisfy BOTH the transition
 * detector (night today + off tomorrow) and… no: recover needs TODAY to be off,
 * and bank needs a night TODAY/TOMORROW — see index.tsx for how the two cards
 * are kept from showing the same idea twice.
 */

import type { LocalShiftKind, LocalShiftMap } from './local-shifts/store';
import type { NextShift, ShiftKind } from './onboarding/store';
import { napWindowForShift, anchorSleepWindow, type NapWindow, type HourWindow } from './derive';

export type SleepBankingMode = 'bank' | 'recover' | 'none';

export interface BankParams {
  /** Why bank: the hard shift is TODAY's own, or TOMORROW's. */
  when: 'today' | 'tomorrow';
  /** Pre-shift nap window for a night shift (from napWindowForShift). */
  nap: NapWindow;
}

export interface RecoverParams {
  /** How many consecutive work days the run that just ended had (>= 2). */
  runLength: number;
  /** The fixed anchor/recovery window to re-anchor around (from derive). */
  anchor: HourWindow;
  /** Suggested paced re-anchor span in days (2–3). */
  paceDays: number;
}

export type SleepBankingState =
  | { mode: 'bank'; params: BankParams }
  | { mode: 'recover'; params: RecoverParams }
  | { mode: 'none' };

export interface SleepBankingArgs {
  /** Anon/local shift calendar (ISO date → 'day'|'night'|'off'). */
  localShifts: LocalShiftMap;
  /** Today as a Date (local). */
  today: Date;
  /** Onboarding "when's your next shift" answer — supplements the scan. */
  nextShift?: NextShift | null;
  /** Onboarding schedule template id (24/48 etc. count a long shift as hard). */
  scheduleId?: string | null;
  /** The manual TODAY'S SHIFT toggle — fallback when the calendar is empty. */
  currentShift: ShiftKind;
}

/** Local YYYY-MM-DD for a Date (no UTC drift), mirrors generate.ts. */
function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO for `base` shifted by `deltaDays` (can be negative). */
function isoOffset(base: Date, deltaDays: number): string {
  const d = new Date(base);
  d.setDate(base.getDate() + deltaDays);
  return localIso(d);
}

/** A "hard" shift the body should bank for: a night, or a long 24h block. We
 *  only have day/night/off in the calendar, so a 24/48-style schedule means a
 *  scheduled work day IS a 24h block — treat its work day as hard too. */
function isHardShift(kind: LocalShiftKind | undefined, scheduleId?: string | null): boolean {
  if (kind === 'night') return true;
  // 24h schedules (firefighter 24/48, 48/96): a 'day' entry is actually a
  // full 24h on-shift, so it's a hard pre-bank case just like a night.
  if (kind === 'day' && /24[-/]?48|48[-/]?96/i.test(scheduleId ?? '')) return true;
  return false;
}

/**
 * The pre-shift nap window for a night/24h shift. napWindowForShift('night')
 * is always non-null (it returns a full-cycle 90-min nap), but its signature is
 * NapWindow | null for the off-day branch; assert here so the bank params type
 * stays NapWindow without leaking null into the public state.
 */
function nightNap(): NapWindow {
  const nap = napWindowForShift('night');
  // 'night' always yields a window; fall back defensively to keep this total.
  return nap ?? { kind: 'full_cycle', hour: 14, durationMin: 90 };
}

/**
 * Decide the live sleep-banking move. Deterministic; never throws.
 *
 * Precedence: BANK is checked before RECOVER. A hard shift bearing down
 * tomorrow is the more time-critical, forward-looking nudge; recovery is a
 * slower multi-day arc that the user can act on across the whole off day, so a
 * same-day hard shift (rare overlap) wins the single card slot.
 */
export function sleepBankingState(args: SleepBankingArgs): SleepBankingState {
  const { localShifts, today, nextShift, scheduleId, currentShift } = args;

  const todayIso = localIso(today);
  const tomorrowIso = isoOffset(today, 1);

  // Resolve today's kind: the calendar entry wins; else the manual toggle.
  const todayKind: LocalShiftKind = localShifts[todayIso] ?? currentShift;
  const tomorrowKind: LocalShiftKind | undefined = localShifts[tomorrowIso];

  // ── BANK ───────────────────────────────────────────────────────────────
  // A hard shift is today's own, or scheduled for tomorrow, or the onboarding
  // "next shift" answer says it starts tonight/tomorrow and today's resolved
  // kind is a night (covers users who never filled the calendar).
  const hardToday = isHardShift(todayKind, scheduleId);
  const hardTomorrow = isHardShift(tomorrowKind, scheduleId);
  // nextShift signal only counts when the calendar doesn't already disagree
  // (no explicit OFF entry tomorrow) — it's a soft fallback, not an override.
  const nextSignalsHard =
    (nextShift === 'tonight' && todayKind === 'night') ||
    (nextShift === 'tomorrow_pm' && tomorrowKind !== 'off' && tomorrowKind !== 'day');

  if (hardTomorrow || nextSignalsHard) {
    return {
      mode: 'bank',
      params: { when: 'tomorrow', nap: nightNap() },
    };
  }
  if (hardToday) {
    return {
      mode: 'bank',
      params: { when: 'today', nap: nightNap() },
    };
  }

  // ── RECOVER ──────────────────────────────────────────────────────────────
  // Today is OFF, and the days immediately BEFORE today are a run of ≥2
  // consecutive WORK days (day or night). The run must be explicit in the
  // calendar — a missing entry breaks the run (we never invent worked days).
  if (todayKind === 'off') {
    let runLength = 0;
    for (let back = 1; back <= 7; back++) {
      const kind = localShifts[isoOffset(today, -back)];
      if (kind === 'day' || kind === 'night') {
        runLength++;
      } else {
        break; // off / unknown ends the run
      }
    }
    if (runLength >= 2) {
      return {
        mode: 'recover',
        params: {
          runLength,
          anchor: anchorSleepWindow(),
          // Longer runs need a touch more pacing; cap at 3 days.
          paceDays: runLength >= 4 ? 3 : 2,
        },
      };
    }
  }

  return { mode: 'none' };
}
