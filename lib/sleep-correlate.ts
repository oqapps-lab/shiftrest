/**
 * TODAY-10 — honest sleep-factor correlation.
 *
 * Given the rating journal (YYYY-MM-DD → 'good'|'ok'|'bad') and the optional
 * factor tags (YYYY-MM-DD → string[]), find the single factor most associated
 * with BETTER nights ('helps') or WORSE nights ('hurts') over a recent window.
 *
 * This is deliberately conservative. We are NOT a clinical tool and we must
 * NEVER fabricate a correlation from thin data — a fake "your better nights
 * have wound-down" would erode trust faster than showing nothing. So we only
 * return a result when ALL of these hold:
 *
 *   1. ≥ MIN_RATED_DAYS_WITH_FACTORS rated days also carry ≥1 factor tag
 *      (enough signal to compare at all).
 *   2. The candidate factor appears on ≥ MIN_FACTOR_OCCURRENCES rated days
 *      (so one lucky night can't drive an "insight").
 *   3. The factor's mean night-score differs from the baseline (all other
 *      rated-with-factor days) by ≥ MIN_SCORE_GAP (a clear, not marginal,
 *      association).
 *
 * Night score: good = +1, ok = 0, bad = -1. A factor "helps" when its days
 * average ABOVE the rest, "hurts" when BELOW. We pick the factor with the
 * LARGEST absolute gap; ties broken deterministically by factor id (lexical)
 * so the UI is stable across renders.
 *
 * Confidence (0..1) scales with the gap magnitude and the sample size, capped
 * at 1. It's a soft UI signal (could pick wording / an icon), never a claim of
 * statistical significance.
 *
 * Pure + deterministic — no Date.now(), no I/O. The caller passes the maps and
 * a window in days; the window is applied by the caller (it already slices to
 * recent days), but we also accept full maps and derive the window from the
 * keys present, so the same function works for tests with arbitrary dates.
 */

export type RatingValue = 'good' | 'ok' | 'bad';

export interface Correlation {
  factorId: string;
  direction: 'helps' | 'hurts';
  /** 0..1 soft confidence — never a significance claim. */
  confidence: number;
}

/** Need at least this many rated days that ALSO carry a factor tag. */
const MIN_RATED_DAYS_WITH_FACTORS = 4;
/** A candidate factor must appear on at least this many rated days. */
const MIN_FACTOR_OCCURRENCES = 2;
/** The factor-vs-rest mean-score gap must reach this to count as "clear". */
const MIN_SCORE_GAP = 0.5;

function scoreOf(rating: RatingValue): number {
  if (rating === 'good') return 1;
  if (rating === 'bad') return -1;
  return 0; // ok
}

/**
 * Return the most strongly associated factor, or null when there isn't enough
 * data for an honest claim.
 *
 * @param ratingsByDate YYYY-MM-DD → 'good'|'ok'|'bad'
 * @param factorsByDate YYYY-MM-DD → factor ids
 * @param windowDays    only consider the most recent N distinct rated-with-
 *                      factor dates (default 14). Applied on the date keys.
 */
export function bestCorrelate(
  ratingsByDate: Record<string, RatingValue>,
  factorsByDate: Record<string, string[]>,
  windowDays = 14,
): Correlation | null {
  // Build the set of days that have BOTH a rating and ≥1 factor — those are
  // the only days that carry comparable signal.
  const paired: { date: string; score: number; factors: string[] }[] = [];
  for (const [date, factors] of Object.entries(factorsByDate)) {
    const rating = ratingsByDate[date];
    if (!rating) continue;
    if (!Array.isArray(factors) || factors.length === 0) continue;
    paired.push({ date, score: scoreOf(rating), factors });
  }

  // Keep only the most recent `windowDays` such days (ISO date strings sort
  // chronologically, so a lexical sort is a date sort).
  paired.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const recent = paired.slice(0, Math.max(0, windowDays));

  if (recent.length < MIN_RATED_DAYS_WITH_FACTORS) return null;

  // Tally each factor's occurrences + score sum across the windowed days.
  const tally = new Map<string, { count: number; sum: number }>();
  let totalSum = 0;
  for (const day of recent) {
    totalSum += day.score;
    for (const f of new Set(day.factors)) {
      const cur = tally.get(f) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += day.score;
      tally.set(f, cur);
    }
  }

  let best: { factorId: string; gap: number; count: number } | null = null;
  for (const [factorId, { count, sum }] of [...tally.entries()].sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0,
  )) {
    if (count < MIN_FACTOR_OCCURRENCES) continue;
    // Baseline = mean score of the days WITHOUT this factor. Comparing the
    // factor's mean to the rest (not to the global mean) isolates its effect.
    const restCount = recent.length - count;
    if (restCount === 0) continue; // factor present every day → nothing to compare against
    const restSum = totalSum - sum;
    const factorMean = sum / count;
    const restMean = restSum / restCount;
    const gap = factorMean - restMean;
    if (Math.abs(gap) < MIN_SCORE_GAP) continue;
    // Largest absolute gap wins; ties already broken by the lexical sort above
    // (first-seen sticks because we only replace on a strictly larger gap).
    if (best === null || Math.abs(gap) > Math.abs(best.gap)) {
      best = { factorId, gap, count };
    }
  }

  if (best === null) return null;

  // Soft confidence: blend the gap magnitude (capped at the full -2..2 range →
  // /2) with how much of the window the factor covers. Never a p-value.
  const gapPart = Math.min(1, Math.abs(best.gap) / 2);
  const samplePart = Math.min(1, best.count / recent.length);
  const confidence = Math.round(((gapPart + samplePart) / 2) * 100) / 100;

  return {
    factorId: best.factorId,
    direction: best.gap > 0 ? 'helps' : 'hurts',
    confidence,
  };
}
