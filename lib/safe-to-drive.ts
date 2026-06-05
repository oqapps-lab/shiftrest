/**
 * TODAY-3 — "Safe-to-Drive" post-shift drowsy-driving self-check.
 *
 * A PURE, deterministic classifier that maps a 2-tap self-assessment
 * (perceived alertness + pre-shift sleep) to a drowsy-driving RISK level
 * and the set of wellness-framed recommendation keys to surface.
 *
 * Evidence anchors (why this matters for shift workers):
 *  - Drowsy driving on the post-night commute is the #1 daily SAFETY
 *    touchpoint for this audience: ~67% of nurses (79.5% of night nurses)
 *    report drowsy driving home; crash risk roughly DOUBLES at 6–7h sleep,
 *    and the 04:00–06:00 circadian window is the danger peak.
 *  - The intervention isn't a lecture — it's a 20-min nap, a strategic
 *    caffeine dose ~30 min before driving, or deferring the drive entirely
 *    (ride-share / wait it out). Each option is advice, never a block.
 *
 * This module is i18n-free: it returns recommendation KEY suffixes and a
 * tone, so the card localises and tints without re-deriving. It NEVER
 * throws and always returns a usable result, even for partial answers.
 */

/** Q1 — perceived alertness right now. */
export type Alertness = 'awake' | 'foggy' | 'empty';

/** Q2 — sleep before this shift. Optional second tap; `null` = not answered. */
export type PreShiftSleep = '7plus' | 'under6' | null;

/** Resulting risk tier. Drives copy + tone + which recommendations show. */
export type DriveRisk = 'low' | 'elevated' | 'high';

/** Recommendation key suffixes (resolved by the card under `safe_to_drive.rec_*`). */
export type DriveRecKey = 'good' | 'nap' | 'caffeine' | 'rideshare';

export interface DriveAssessment {
  risk: DriveRisk;
  /** Ordered recommendation keys to render (most → least preferred). */
  recs: DriveRecKey[];
}

/**
 * Classify drowsy-driving risk from the self-check answers.
 *
 * Logic (deterministic):
 *  - "Running on empty" → HIGH regardless of sleep (acute sleepiness now
 *    is the strongest single predictor — don't drive on it).
 *  - "A bit foggy"      → ELEVATED, escalates to HIGH if sleep was under 6h.
 *  - "Wide awake"       → LOW, unless sleep was under 6h (micro-sleep risk
 *    persists even when you feel fine) → ELEVATED.
 *
 * When Q2 is unanswered we use the conservative branch implied by Q1 alone
 * (foggy → elevated, empty → high, awake → low) — never under-warns.
 *
 * Recommendation sets:
 *  - low      → reassurance ("good — keep light low, drive safe").
 *  - elevated → nap + strategic caffeine (concrete, time-boxed).
 *  - high     → nap + caffeine + defer-the-drive (ride-share / wait it out).
 */
export function classifyDriveRisk(
  alertness: Alertness,
  sleep: PreShiftSleep,
): DriveAssessment {
  let risk: DriveRisk;

  if (alertness === 'empty') {
    risk = 'high';
  } else if (alertness === 'foggy') {
    risk = sleep === 'under6' ? 'high' : 'elevated';
  } else {
    // 'awake'
    risk = sleep === 'under6' ? 'elevated' : 'low';
  }

  return { risk, recs: recsForRisk(risk) };
}

/** The ordered recommendation set for a risk tier. */
export function recsForRisk(risk: DriveRisk): DriveRecKey[] {
  switch (risk) {
    case 'low':
      return ['good'];
    case 'elevated':
      return ['nap', 'caffeine'];
    case 'high':
    default:
      return ['nap', 'caffeine', 'rideshare'];
  }
}
