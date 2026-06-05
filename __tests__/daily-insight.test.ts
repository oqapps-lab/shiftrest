/**
 * Unit tests for lib/daily-insight.ts — the Today-tab Daily Insight engine.
 *
 * Pure + deterministic, so we assert exact behaviour:
 *   - same-day stability (deterministic seed)
 *   - day-to-day rotation
 *   - never-repeat until exhausted, then reset
 *   - phase bias, rating bias, profession bias
 *   - empty-seen + all-seen-reset
 *   - graceful fallback (always returns something)
 */

import {
  pickDailyInsight,
  INSIGHT_POOL,
  INSIGHT_POOL_SIZE,
  type PickArgs,
  type InsightItem,
} from '../lib/daily-insight';
import type { PhaseKey } from '../lib/today-phase';

function pick(partial: Partial<PickArgs> = {}) {
  const base: PickArgs = {
    phaseKey: 'on_track',
    profession: null,
    rating: null,
    date: new Date(2026, 5, 1), // 2026-06-01 (month is 0-indexed)
    seen: [],
  };
  return pickDailyInsight({ ...base, ...partial });
}

function itemById(id: string): InsightItem | undefined {
  return INSIGHT_POOL.find((it) => it.id === id);
}

describe('INSIGHT_POOL', () => {
  test('unifies 16 articles + 28 tips = 44 items', () => {
    const articles = INSIGHT_POOL.filter((it) => it.kind === 'article');
    const tips = INSIGHT_POOL.filter((it) => it.kind === 'tip');
    expect(articles.length).toBe(16);
    expect(tips.length).toBe(28);
    expect(INSIGHT_POOL_SIZE).toBe(44);
  });

  test('article items carry articleId + verbatim text; tips carry an i18n key', () => {
    const article = INSIGHT_POOL.find((it) => it.kind === 'article');
    const tip = INSIGHT_POOL.find((it) => it.kind === 'tip');
    expect(article?.articleId).toBeTruthy();
    expect(article?.textIsTipKey).toBe(false);
    expect(article?.text.length).toBeGreaterThan(10);
    expect(tip?.articleId).toBeUndefined();
    expect(tip?.textIsTipKey).toBe(true);
  });

  test('every item has a category label key + at least one profession tag', () => {
    for (const it of INSIGHT_POOL) {
      expect(it.category).toMatch(/\./); // dotted i18n key
      expect(it.tags.some((t) => t.startsWith('prof:'))).toBe(true);
    }
  });
});

describe('determinism', () => {
  test('same day + same inputs → same pick (stable all day)', () => {
    const a = pick({ date: new Date(2026, 5, 1) });
    const b = pick({ date: new Date(2026, 5, 1) });
    expect(a.id).toBe(b.id);
  });

  test('time-of-day within the same calendar day does not change the pick', () => {
    const morning = pick({ date: new Date(2026, 5, 1, 7, 30) });
    const evening = pick({ date: new Date(2026, 5, 1, 22, 15) });
    expect(morning.id).toBe(evening.id);
  });

  test('different days rotate (not all identical across a month)', () => {
    const ids = new Set<string>();
    for (let day = 1; day <= 28; day++) {
      ids.add(pick({ date: new Date(2026, 5, day) }).id);
    }
    // With on_track bias the top tier is small, but the seed still rotates;
    // expect meaningful variety across a month.
    expect(ids.size).toBeGreaterThan(3);
  });

  test('always returns something (never blank)', () => {
    const r = pick();
    expect(r.id).toBeTruthy();
    expect(r.text).toBeTruthy();
    expect(['article', 'tip']).toContain(r.kind);
  });
});

describe('never-repeat until exhausted, then reset', () => {
  test('a seen id is excluded from the next pick', () => {
    const first = pick({ date: new Date(2026, 5, 1) });
    const second = pick({ date: new Date(2026, 5, 1), seen: [first.id] });
    expect(second.id).not.toBe(first.id);
  });

  test('walking the pool day by day never repeats until it is exhausted', () => {
    const seen: string[] = [];
    const seenOrder: string[] = [];
    // Use a neutral phase/rating so the eligible pool is the whole pool.
    for (let i = 0; i < INSIGHT_POOL_SIZE; i++) {
      const r = pickDailyInsight({
        phaseKey: 'on_track',
        profession: null,
        rating: null,
        date: new Date(2026, 5, 1 + i),
        seen,
      });
      // Must be fresh until the pool is used up.
      expect(seen).not.toContain(r.id);
      seen.push(r.id);
      seenOrder.push(r.id);
    }
    // Collected the entire pool with no repeats.
    expect(new Set(seenOrder).size).toBe(INSIGHT_POOL_SIZE);
  });

  test('all-seen → reset: still returns a valid pool item (does not blank)', () => {
    const allIds = INSIGHT_POOL.map((it) => it.id);
    const r = pick({ seen: allIds });
    expect(r.id).toBeTruthy();
    expect(itemById(r.id)).toBeDefined();
  });

  test('empty seen behaves like a fresh start', () => {
    const r = pick({ seen: [] });
    expect(itemById(r.id)).toBeDefined();
  });
});

describe('phase bias', () => {
  function pickFor(phaseKey: PhaseKey) {
    return pick({ phaseKey });
  }

  test('caffeine_cutoff_soon surfaces caffeine/nutrition content', () => {
    // Sweep dates so we sample the biased top tier broadly.
    const cats = new Set<string>();
    for (let d = 1; d <= 28; d++) {
      const r = pickDailyInsight({
        phaseKey: 'caffeine_cutoff_soon',
        profession: null,
        rating: null,
        date: new Date(2026, 5, d),
        seen: [],
      });
      cats.add(r.category);
    }
    // The phase maps to caffeine (articles) + nutrition (tips); top tier should
    // be dominated by those category labels.
    const allowed = new Set(['library.cat_caffeine', 'tips.category_nutrition']);
    for (const c of cats) expect(allowed.has(c)).toBe(true);
  });

  test('wind_down picks an item tagged for the wind_down phase', () => {
    const r = pickFor('wind_down');
    const item = itemById(r.id);
    expect(item?.tags).toContain('phase:wind_down');
  });

  test('changing phase on the same day can change the pick', () => {
    const windDown = pick({ phaseKey: 'wind_down' });
    const nadir = pick({ phaseKey: 'night_nadir' });
    // Different phase biases → different top tiers → generally different item.
    expect(windDown.id).not.toBe(nadir.id);
  });
});

describe('rating bias', () => {
  test('rough night biases toward recovery/wind-down content', () => {
    const r = pick({ rating: 'bad', phaseKey: 'on_track' });
    const item = itemById(r.id);
    expect(item?.tags).toContain('rating:bad');
    expect(r.ratingLead).toBe('rough');
  });

  test('good night reinforces (rating:good tagged) + good lead', () => {
    const r = pick({ rating: 'good', phaseKey: 'on_track' });
    const item = itemById(r.id);
    expect(item?.tags).toContain('rating:good');
    expect(r.ratingLead).toBe('good');
  });

  test('ok night → ok lead', () => {
    const r = pick({ rating: 'ok' });
    expect(r.ratingLead).toBe('ok');
  });

  test('no rating → no lead line', () => {
    const r = pick({ rating: null });
    expect(r.ratingLead).toBeNull();
  });
});

describe('profession bias', () => {
  test('a profession only sees universal or that-profession content', () => {
    const seen: string[] = [];
    for (let d = 1; d <= 44; d++) {
      const r = pickDailyInsight({
        phaseKey: 'on_track',
        profession: 'firefighter',
        rating: null,
        date: new Date(2026, 5, d),
        seen,
      });
      const item = itemById(r.id);
      const ok =
        item?.tags.includes('prof:all') || item?.tags.includes('prof:firefighter');
      expect(ok).toBe(true);
      if (!seen.includes(r.id)) seen.push(r.id);
    }
  });

  test('a firefighter never receives a nurse-only article', () => {
    // 'drive_home_sabotage' is nurse+firefighter+all → allowed; pick a strictly
    // nurse-only one for the assertion: 'post_night_recovery' is nurse+factory.
    const seen: string[] = [];
    for (let d = 1; d <= 60; d++) {
      const r = pickDailyInsight({
        phaseKey: 'rest_day',
        profession: 'firefighter',
        rating: null,
        date: new Date(2026, 5, d),
        seen,
      });
      expect(r.id).not.toBe('article:post_night_recovery');
      if (!seen.includes(r.id)) seen.push(r.id);
    }
  });

  test('null profession sees the whole pool', () => {
    // Over a long sweep with reset, a null-profession user should be able to
    // surface a profession-tagged-only item (e.g. a firefighter tip).
    const seen: string[] = [];
    const surfaced = new Set<string>();
    for (let d = 1; d <= 80; d++) {
      const r = pickDailyInsight({
        phaseKey: 'on_track',
        profession: null,
        rating: null,
        date: new Date(2026, 5, d),
        seen,
      });
      surfaced.add(r.id);
      if (!seen.includes(r.id)) seen.push(r.id);
    }
    expect(surfaced.size).toBeGreaterThan(10);
  });
});

describe('combined bias does not crash and stays deterministic', () => {
  test('phase + profession + rating together → stable same-day pick', () => {
    const a = pickDailyInsight({
      phaseKey: 'wind_down',
      profession: 'nurse',
      rating: 'bad',
      date: new Date(2026, 5, 1),
      seen: [],
    });
    const b = pickDailyInsight({
      phaseKey: 'wind_down',
      profession: 'nurse',
      rating: 'bad',
      date: new Date(2026, 5, 1),
      seen: [],
    });
    expect(a.id).toBe(b.id);
    expect(a.ratingLead).toBe('rough');
  });
});
