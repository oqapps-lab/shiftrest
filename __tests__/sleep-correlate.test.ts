/**
 * TODAY-10 — unit tests for lib/sleep-correlate.ts.
 *
 * Guards the honesty contract: the correlate must return null on thin data
 * and only surface a factor when there's a clear, well-sampled association.
 * Pure module — no mocks needed.
 */

import { bestCorrelate, type RatingValue } from '../lib/sleep-correlate';

// Helper: build dated maps from arrays of {rating, factors} oldest→newest,
// using sequential 2026-06-DD keys so the window slice is exercised.
function build(
  rows: { rating: RatingValue; factors: string[] }[],
): {
  ratings: Record<string, RatingValue>;
  factors: Record<string, string[]>;
} {
  const ratings: Record<string, RatingValue> = {};
  const factors: Record<string, string[]> = {};
  rows.forEach((row, i) => {
    const day = String(i + 1).padStart(2, '0');
    const iso = `2026-06-${day}`;
    ratings[iso] = row.rating;
    if (row.factors.length > 0) factors[iso] = row.factors;
  });
  return { ratings, factors };
}

describe('sleep-correlate — bestCorrelate', () => {
  test('null when no data at all', () => {
    expect(bestCorrelate({}, {})).toBeNull();
  });

  test('null when ratings exist but no factors tagged', () => {
    const ratings: Record<string, RatingValue> = {
      '2026-06-01': 'good',
      '2026-06-02': 'bad',
      '2026-06-03': 'good',
      '2026-06-04': 'ok',
    };
    expect(bestCorrelate(ratings, {})).toBeNull();
  });

  test('null when fewer than the minimum rated-with-factor days', () => {
    // Only 3 paired days — below MIN_RATED_DAYS_WITH_FACTORS (4).
    const { ratings, factors } = build([
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'bad', factors: ['late_caffeine'] },
      { rating: 'good', factors: ['wound_down'] },
    ]);
    expect(bestCorrelate(ratings, factors)).toBeNull();
  });

  test('clear positive association → helps', () => {
    // wound_down on the good nights stands above a NEUTRAL baseline: the other
    // nights all carry `noise`, but that factor's own mean (a mix of good/ok/
    // bad) sits near the rest-mean, so wound_down is the strongest association.
    const { ratings, factors } = build([
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'good', factors: ['wound_down', 'noise'] },
      { rating: 'ok', factors: ['noise'] },
      { rating: 'bad', factors: ['noise'] },
      { rating: 'ok', factors: ['noise'] },
    ]);
    const r = bestCorrelate(ratings, factors);
    expect(r).not.toBeNull();
    expect(r!.factorId).toBe('wound_down');
    expect(r!.direction).toBe('helps');
    expect(r!.confidence).toBeGreaterThan(0);
    expect(r!.confidence).toBeLessThanOrEqual(1);
  });

  test('clear negative association → hurts', () => {
    // Mirror image: late_caffeine on the bad nights, against a neutral `noise`
    // baseline whose own mean sits near the rest, so late_caffeine wins 'hurts'.
    const { ratings, factors } = build([
      { rating: 'bad', factors: ['late_caffeine'] },
      { rating: 'bad', factors: ['late_caffeine'] },
      { rating: 'bad', factors: ['late_caffeine', 'noise'] },
      { rating: 'ok', factors: ['noise'] },
      { rating: 'good', factors: ['noise'] },
      { rating: 'ok', factors: ['noise'] },
    ]);
    const r = bestCorrelate(ratings, factors);
    expect(r).not.toBeNull();
    expect(r!.factorId).toBe('late_caffeine');
    expect(r!.direction).toBe('hurts');
  });

  test('insufficient — enough days but no clear association → null', () => {
    // Every factor appears on a mix of good and bad nights — no signal.
    const { ratings, factors } = build([
      { rating: 'good', factors: ['noise'] },
      { rating: 'bad', factors: ['noise'] },
      { rating: 'good', factors: ['noise'] },
      { rating: 'bad', factors: ['noise'] },
    ]);
    expect(bestCorrelate(ratings, factors)).toBeNull();
  });

  test('a factor present on EVERY day yields null (nothing to compare against)', () => {
    const { ratings, factors } = build([
      { rating: 'good', factors: ['blackout'] },
      { rating: 'good', factors: ['blackout'] },
      { rating: 'bad', factors: ['blackout'] },
      { rating: 'ok', factors: ['blackout'] },
    ]);
    expect(bestCorrelate(ratings, factors)).toBeNull();
  });

  test('a single-occurrence factor cannot drive an insight', () => {
    // 4 paired days, but the "lucky" factor appears once — below
    // MIN_FACTOR_OCCURRENCES (2). The dominant, repeated factor has no signal,
    // so the result is null rather than a one-night fluke.
    const { ratings, factors } = build([
      { rating: 'good', factors: ['kids'] },
      { rating: 'bad', factors: ['kids'] },
      { rating: 'good', factors: ['kids'] },
      { rating: 'bad', factors: ['kids', 'wound_down'] }, // wound_down once
    ]);
    expect(bestCorrelate(ratings, factors)).toBeNull();
  });

  test('picks the strongest factor when several qualify', () => {
    // wound_down: all-good (mean +1). late_caffeine: all-bad (mean -1).
    // Both clear; both should beat the threshold. The one with the larger
    // absolute gap vs the rest wins. Construct so late_caffeine's gap is bigger.
    const { ratings, factors } = build([
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'ok', factors: ['wound_down'] },
      { rating: 'bad', factors: ['late_caffeine'] },
      { rating: 'bad', factors: ['late_caffeine'] },
      { rating: 'bad', factors: ['late_caffeine'] },
    ]);
    const r = bestCorrelate(ratings, factors);
    expect(r).not.toBeNull();
    expect(r!.factorId).toBe('late_caffeine');
    expect(r!.direction).toBe('hurts');
  });

  test('respects the window — old clear signal outside window is ignored', () => {
    // 14-day default window. Build 14 "no-signal" recent days, then an old
    // clear-signal cluster that should fall outside the slice.
    const rows: { rating: RatingValue; factors: string[] }[] = [];
    // Oldest 4: a clean helps signal for wound_down.
    rows.push({ rating: 'good', factors: ['wound_down'] });
    rows.push({ rating: 'good', factors: ['wound_down'] });
    rows.push({ rating: 'bad', factors: ['noise'] });
    rows.push({ rating: 'bad', factors: ['noise'] });
    // Newest 14: mixed noise, no signal.
    for (let i = 0; i < 14; i++) {
      rows.push({ rating: i % 2 === 0 ? 'good' : 'bad', factors: ['kids'] });
    }
    const { ratings, factors } = build(rows);
    // With window=14 the old wound_down cluster is excluded; recent kids is
    // mixed → null.
    expect(bestCorrelate(ratings, factors, 14)).toBeNull();
  });

  test('confidence rises with cleaner, larger-sample signal', () => {
    const weak = build([
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'ok', factors: ['noise'] },
      { rating: 'bad', factors: ['noise'] },
    ]);
    const strong = build([
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'good', factors: ['wound_down'] },
      { rating: 'bad', factors: ['noise'] },
      { rating: 'bad', factors: ['noise'] },
    ]);
    const w = bestCorrelate(weak.ratings, weak.factors);
    const s = bestCorrelate(strong.ratings, strong.factors);
    expect(w).not.toBeNull();
    expect(s).not.toBeNull();
    expect(s!.confidence).toBeGreaterThanOrEqual(w!.confidence);
  });
});
