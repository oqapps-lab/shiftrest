/**
 * TODAY-7 — Adaptive caffeine "last-call".
 *
 * A PURE, deterministic helper that turns the user's ACTUAL last logged cup
 * (from lib/caffeine-log) + their caffeine sensitivity + tonight's sleep
 * window into a personalised last-call read, REPLACING the static
 * schedule-derived cutoff on the Today tab for premium users who have logged.
 *
 * Half-life model (deliberately simple, glance-and-go):
 *  • Caffeine's alerting effect fades ~6h after a cup for a normal metaboliser
 *    and ~8h for a slow one (a slow metaboliser clears it noticeably slower —
 *    the "I had one coffee at lunch and couldn't sleep" person). These are the
 *    `fadeHours` below. `fadesAt = lastCup + fadeHours`.
 *  • A cup is "clear for sleep" when it fades AT OR BEFORE the sleep window
 *    opens — i.e. `fadesAt <= sleepStart`. Equivalently the cup was had at or
 *    before the recommended cutoff (`sleepStart - fadeHours`).
 *  • `recommendedCutoff` is therefore `sleepStart - 6` (normal) or
 *    `sleepStart - 8` (slow): the latest you could have had that cup and still
 *    be clear. It's the exact "stop by" time we surface in the clear variant.
 *
 * The model is intentionally NOT the schedule cutoff (lib/derive's sleep−6h
 * baseline shown to free users) — it is recomputed from the real cup so the
 * premium read reacts to what the user actually did. This is the QA-BUG-1
 * decoupling resolved in the premium direction, by design (see task TODAY-7).
 *
 * All hour values are fractional local hours on a 24h ring (e.g. 14.5 = 14:30).
 * Midnight-crossing is handled by normalising deltas onto the ring, so a cup at
 * 23:00 fading "into tomorrow" still compares correctly against an early-morning
 * sleep window.
 */

import { getCaffeineLog } from './caffeine-log/store';

/** Sensitivity buckets we care about. 'unknown'/null behave like 'normal'. */
export type CaffeineSensitivity = 'normal' | 'slow' | 'unknown' | null;

/** Hours after a cup at which the alerting effect has substantially faded. */
const FADE_HOURS_NORMAL = 6;
const FADE_HOURS_SLOW = 8;

export interface AdaptiveCaffeine {
  /** Fractional local hour the last cup's effect fades (lastCup + fadeHours). */
  fadesAt: number;
  /** True when the last cup fades at/before the sleep window opens. */
  clearForSleep: boolean;
  /**
   * The latest fractional hour the user could have had that cup and still be
   * clear by sleep: `sleepStart - fadeHours`. The "stop caffeine by" time.
   */
  recommendedCutoff: number;
  /** Fractional hour of the last logged cup (echoed for convenience). */
  lastCupHour: number;
}

/** fadeHours for a sensitivity bucket. 'slow' clears ~2h later. */
export function fadeHoursFor(sensitivity: CaffeineSensitivity): number {
  return sensitivity === 'slow' ? FADE_HOURS_SLOW : FADE_HOURS_NORMAL;
}

/** Normalise any real number onto the [0, 24) ring. */
function onRing(hour: number): number {
  return ((hour % 24) + 24) % 24;
}

/**
 * Compute the adaptive last-call from the last cup time + sensitivity + the
 * sleep-window start. Pure — caller supplies all inputs.
 *
 * @param lastCupHour fractional local hour of the most recent logged cup
 * @param sensitivity caffeine sensitivity bucket ('slow' clears slower)
 * @param sleepStart  fractional local hour tonight's sleep window opens
 */
export function computeAdaptiveCaffeine(
  lastCupHour: number,
  sensitivity: CaffeineSensitivity,
  sleepStart: number,
): AdaptiveCaffeine {
  const fadeHours = fadeHoursFor(sensitivity);
  const last = onRing(lastCupHour);
  const fadesAt = onRing(last + fadeHours);
  const recommendedCutoff = onRing(sleepStart - fadeHours);

  // "Clear for sleep" = the fade completes at or before sleep opens. Measure
  // the forward arc from the cup to sleep on the 24h ring: if that arc is at
  // least fadeHours long, the caffeine has had time to fade before sleep.
  // (Using the arc instead of raw subtraction keeps a 23:00 cup vs a 07:00
  //  sleep window correct across midnight.)
  let arcCupToSleep = sleepStart - last;
  arcCupToSleep = ((arcCupToSleep % 24) + 24) % 24;
  const clearForSleep = arcCupToSleep >= fadeHours;

  return { fadesAt, clearForSleep, recommendedCutoff, lastCupHour: last };
}

/**
 * Convenience wrapper that reads the live caffeine log directly. Returns null
 * when there is no cup logged today (the caller should then fall back to the
 * static schedule cutoff). The Today screen passes lastCupHour explicitly via
 * computeAdaptiveCaffeine; this exists for non-React callers/tests.
 *
 * @returns the adaptive read, or null when no cup is logged today.
 */
export function adaptiveCaffeineFromLog(
  sensitivity: CaffeineSensitivity,
  sleepStart: number,
): AdaptiveCaffeine | null {
  const log = getCaffeineLog();
  if (!log) return null;
  const d = new Date(log.lastCupAt);
  if (Number.isNaN(d.getTime())) return null;
  const lastCupHour = d.getHours() + d.getMinutes() / 60;
  return computeAdaptiveCaffeine(lastCupHour, sensitivity, sleepStart);
}
