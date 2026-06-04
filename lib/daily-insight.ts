/**
 * TODAY-1 — Daily Insight engine.
 *
 * The flagship Today-tab content feature. Replaces the old static
 * "Tonight's read" (which picked one Sleep Library article by
 * `date % length` — same article every Nth day, ignoring everything the
 * app knows about the user).
 *
 * This module unifies the 16 Sleep Library articles + the 28 Sleep Tips
 * into ONE pool and picks a single insight per calendar day that is:
 *
 *   • DETERMINISTIC per day — seeded from the date, so the card is stable
 *     all day and rotates fresh at midnight.
 *   • PHASE-AWARE — biased toward content relevant to the user's current
 *     circadian phase (wind-down → pre-sleep ritual, night nadir → caffeine
 *     /light, post-shift commute → light & recovery, …).
 *   • PROFESSION-AWARE — biased toward content tagged for the user's job
 *     (nurse / firefighter / factory).
 *   • JOURNAL-REACTIVE — when the user has logged how they slept, the pick
 *     leans toward recovery/wind-down (rough), adjustment (ok) or
 *     reinforcement (good), and a tailored lead line is surfaced.
 *   • NEVER-REPEAT — items already shown (the `seen` set, persisted by the
 *     card) are excluded until the eligible pool is exhausted, then the set
 *     resets and rotation starts over.
 *
 * PURE + side-effect free: persistence (the AsyncStorage seen-set) lives in
 * the component. This file is fully unit-testable and never imports React,
 * i18n, or storage.
 *
 * Content localisation: tips carry i18n keys (`tips.<id>.title`) so their
 * text is already localised; article key-takeaways are inline English (v1),
 * matching the existing library behaviour. The card resolves tip text via
 * i18n at render time using `i18nKey`.
 */

import { LIBRARY, type LibraryArticle, type LibraryCategory } from './sleep-tips/library';
import { TIPS, type SleepTip, type TipCategory } from './sleep-tips/seed';
import type { PhaseKey } from './today-phase';

export type InsightKind = 'article' | 'tip';
export type Profession = 'nurse' | 'firefighter' | 'factory' | null;
export type InsightRating = 'good' | 'ok' | 'bad' | null;

/** Unified pool item. */
export interface InsightItem {
  id: string;
  kind: InsightKind;
  /**
   * For tips this is the i18n key SUFFIX (`tips.<i18nKey>.title`); the card
   * localises it. For articles this is the inline-English key-takeaway, used
   * verbatim (matches existing library content behaviour).
   */
  text: string;
  /** True when `text` is an i18n key suffix that the card must resolve. */
  textIsTipKey: boolean;
  /** Present only for kind==='article' — opens /library/<articleId>. */
  articleId?: string;
  /** Profession + phase-relevance tags used for biasing. */
  tags: string[];
  /** Coarse category label key (i18n) for the small source pill. */
  category: string;
}

export interface PickArgs {
  phaseKey: PhaseKey;
  profession: Profession;
  rating: InsightRating;
  /** A Date (or anything Date-like); only the local calendar day is used. */
  date: Date;
  /** Ids already shown — excluded until the eligible pool is exhausted. */
  seen: string[];
}

export interface PickedInsight {
  id: string;
  kind: InsightKind;
  text: string;
  textIsTipKey: boolean;
  articleId?: string;
  category: string;
  /**
   * i18n key suffix for the tailored rating lead line, or null when the user
   * has not logged a rating today. Resolved by the card as
   * `today.insight.lead_<ratingLead>`.
   */
  ratingLead: 'rough' | 'ok' | 'good' | null;
}

/* ────────────────────────────────────────────────────────────────────────
 * Phase ↔ category relevance.
 *
 * Each circadian phase maps to the content categories that matter most in
 * that moment. A pool item earns a phase-relevance tag (`phase:<key>`) when
 * its category appears here, and selection biases toward items carrying the
 * tag for the user's CURRENT phase.
 * ──────────────────────────────────────────────────────────────────────── */

const PHASE_ARTICLE_CATEGORIES: Record<PhaseKey, LibraryCategory[]> = {
  // About to sleep / winding down → ritual, architecture, recovery.
  wind_down: ['sleep_architecture', 'recovery_social', 'light_clock'],
  sleep_window: ['sleep_architecture', 'recovery_social'],
  // 3 a.m. trough on a night shift → light + caffeine countermeasures.
  night_nadir: ['light_clock', 'caffeine_stimulants', 'night_shift'],
  // Driving home after nights → protect day-sleep with light + recovery.
  post_shift_commute: ['light_clock', 'recovery_social', 'night_shift'],
  // Caffeine cutoff approaching → stimulant timing.
  caffeine_cutoff_soon: ['caffeine_stimulants'],
  // Day off → recovery + social-life, gentle.
  rest_day: ['recovery_social', 'sleep_architecture'],
  // Generic → night-shift survival fundamentals.
  on_track: ['night_shift', 'light_clock'],
};

const PHASE_TIP_CATEGORIES: Record<PhaseKey, TipCategory[]> = {
  wind_down: ['pre_sleep', 'environment', 'mental'],
  sleep_window: ['environment', 'mental'],
  night_nadir: ['nutrition', 'post_shift'],
  post_shift_commute: ['post_shift', 'environment'],
  caffeine_cutoff_soon: ['nutrition'],
  rest_day: ['pre_sleep', 'mental', 'environment'],
  on_track: ['pre_sleep', 'nutrition', 'environment'],
};

/* ────────────────────────────────────────────────────────────────────────
 * Rating ↔ category relevance.
 *
 *   rough → recovery + wind-down (be gentle, fix tonight)
 *   ok    → adjustment / fundamentals (small tweaks)
 *   good  → reinforce + light (lock the win in)
 * ──────────────────────────────────────────────────────────────────────── */

const RATING_ARTICLE_CATEGORIES: Record<'good' | 'ok' | 'bad', LibraryCategory[]> = {
  bad: ['recovery_social', 'sleep_architecture', 'night_shift'],
  ok: ['night_shift', 'sleep_architecture', 'caffeine_stimulants'],
  good: ['light_clock', 'recovery_social'],
};

const RATING_TIP_CATEGORIES: Record<'good' | 'ok' | 'bad', TipCategory[]> = {
  bad: ['pre_sleep', 'post_shift', 'mental'],
  ok: ['nutrition', 'environment', 'pre_sleep'],
  good: ['post_shift', 'environment'],
};

const CATEGORY_LABEL_KEY: Record<LibraryCategory | TipCategory, string> = {
  // Article categories
  light_clock: 'library.cat_light_clock',
  caffeine_stimulants: 'library.cat_caffeine',
  sleep_architecture: 'library.cat_architecture',
  night_shift: 'library.cat_night_shift',
  recovery_social: 'library.cat_recovery',
  // Tip categories
  environment: 'tips.category_environment',
  nutrition: 'tips.category_nutrition',
  pre_sleep: 'tips.category_pre_sleep',
  mental: 'tips.category_mental',
  post_shift: 'tips.category_post_shift',
};

/* ────────────────────────────────────────────────────────────────────────
 * Pool construction.
 * ──────────────────────────────────────────────────────────────────────── */

function articleToItem(a: LibraryArticle): InsightItem {
  const tags: string[] = [`cat:${a.category}`];
  for (const r of a.relevantTo) tags.push(`prof:${r}`);
  for (const phase of Object.keys(PHASE_ARTICLE_CATEGORIES) as PhaseKey[]) {
    if (PHASE_ARTICLE_CATEGORIES[phase].includes(a.category)) tags.push(`phase:${phase}`);
  }
  for (const rating of ['good', 'ok', 'bad'] as const) {
    if (RATING_ARTICLE_CATEGORIES[rating].includes(a.category)) tags.push(`rating:${rating}`);
  }
  return {
    id: `article:${a.id}`,
    kind: 'article',
    text: a.keyTakeaway,
    textIsTipKey: false,
    articleId: a.id,
    tags,
    category: CATEGORY_LABEL_KEY[a.category],
  };
}

function tipToItem(tip: SleepTip): InsightItem {
  const tags: string[] = [`cat:${tip.category}`];
  // Tips with no profession are universal → tag as 'all' so they're eligible
  // for every profession; profession-tagged tips also get an 'all'-less tag.
  if (tip.profession) tags.push(`prof:${tip.profession}`);
  else tags.push('prof:all');
  for (const phase of Object.keys(PHASE_TIP_CATEGORIES) as PhaseKey[]) {
    if (PHASE_TIP_CATEGORIES[phase].includes(tip.category)) tags.push(`phase:${phase}`);
  }
  for (const rating of ['good', 'ok', 'bad'] as const) {
    if (RATING_TIP_CATEGORIES[rating].includes(tip.category)) tags.push(`rating:${rating}`);
  }
  return {
    id: `tip:${tip.id}`,
    kind: 'tip',
    text: `${tip.i18nKey}`, // i18n key suffix → card resolves tips.<key>.title
    textIsTipKey: true,
    tags,
    category: CATEGORY_LABEL_KEY[tip.category],
  };
}

/**
 * The full unified pool. Built once at module load; never mutated.
 * 16 articles + 28 tips = 44 items.
 */
export const INSIGHT_POOL: InsightItem[] = [
  ...LIBRARY.map(articleToItem),
  ...TIPS.map(tipToItem),
];

/* ────────────────────────────────────────────────────────────────────────
 * Eligibility.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Items a given profession may see. A null profession (not yet onboarded)
 * sees everything. Otherwise: universal items (`prof:all`) + items tagged for
 * that profession. This NEVER returns empty (universal pool is always non-
 * empty), which keeps selection graceful.
 */
function eligibleForProfession(pool: InsightItem[], profession: Profession): InsightItem[] {
  if (!profession) return pool;
  const filtered = pool.filter(
    (it) => it.tags.includes('prof:all') || it.tags.includes(`prof:${profession}`),
  );
  return filtered.length > 0 ? filtered : pool;
}

/* ────────────────────────────────────────────────────────────────────────
 * Deterministic per-day seed.
 *
 * A 32-bit hash of the local calendar date (YYYY-MM-DD) + an optional salt.
 * Same day → same number → same pick. Next day → different. Mulberry32-style
 * mixing keeps consecutive days well spread (not adjacent indices).
 * ──────────────────────────────────────────────────────────────────────── */

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hashString(str: string): number {
  let h = 2166136261 >>> 0; // FNV-1a basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Extra avalanche so single-char date diffs (one day apart) spread well.
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

/* ────────────────────────────────────────────────────────────────────────
 * Scoring.
 *
 * Each eligible item gets a relevance weight. The day-seed then deterministic-
 * ally picks WITHIN the highest-relevance tier so the bias is honoured but the
 * exact item still rotates day to day.
 * ──────────────────────────────────────────────────────────────────────── */

function relevanceScore(
  item: InsightItem,
  phaseKey: PhaseKey,
  profession: Profession,
  rating: InsightRating,
): number {
  let score = 0;
  if (item.tags.includes(`phase:${phaseKey}`)) score += 3;
  if (profession && item.tags.includes(`prof:${profession}`)) score += 2;
  if (rating && rating !== null && item.tags.includes(`rating:${rating}`)) score += 4;
  return score;
}

/**
 * Pick the day's insight.
 *
 * 1. Restrict to the profession-eligible pool.
 * 2. Remove `seen` ids. If that empties the set, RESET (start the pool over)
 *    — the caller is expected to clear its persisted seen-set in the same
 *    breath; we still pick from the full eligible pool so the card never
 *    blanks.
 * 3. Score every candidate by phase + profession + rating bias.
 * 4. Take the highest-scoring tier; if multiple items tie, the day-seed picks
 *    one deterministically. This guarantees same-day stability + day-to-day
 *    rotation while honouring the bias.
 * 5. Absolute fallback: if the pool is somehow empty, return a synthetic safe
 *    item so the card always renders.
 */
export function pickDailyInsight(args: PickArgs): PickedInsight {
  const { phaseKey, profession, rating, date, seen } = args;

  const eligible = eligibleForProfession(INSIGHT_POOL, profession);

  // Graceful fallback — should never happen (pool is static + non-empty), but
  // protects the card from a corrupt build.
  if (eligible.length === 0) {
    return {
      id: 'fallback',
      kind: 'tip',
      text: 'breathing_478',
      textIsTipKey: true,
      category: CATEGORY_LABEL_KEY.pre_sleep,
      ratingLead: ratingLeadFor(rating),
    };
  }

  const seenSet = new Set(seen);
  let candidates = eligible.filter((it) => !seenSet.has(it.id));
  // Never-repeat exhausted → reset: pick from the full eligible pool again.
  if (candidates.length === 0) candidates = eligible;

  // Score + find the top tier.
  let bestScore = -1;
  for (const it of candidates) {
    const s = relevanceScore(it, phaseKey, profession, rating);
    if (s > bestScore) bestScore = s;
  }
  const topTier = candidates.filter(
    (it) => relevanceScore(it, phaseKey, profession, rating) === bestScore,
  );

  // Deterministic pick within the tier. Salt the seed with phase + rating so
  // changing phase/rating during the day re-points selection (the owner wants
  // the card to react), while a fixed phase+rating stays stable all day.
  const seed = hashString(`${dayKey(date)}|${phaseKey}|${rating ?? 'none'}`);
  const chosen = topTier[seed % topTier.length];

  return {
    id: chosen.id,
    kind: chosen.kind,
    text: chosen.text,
    textIsTipKey: chosen.textIsTipKey,
    articleId: chosen.articleId,
    category: chosen.category,
    ratingLead: ratingLeadFor(rating),
  };
}

/** Map the journal rating to the tailored lead-line key, or null. */
function ratingLeadFor(rating: InsightRating): 'rough' | 'ok' | 'good' | null {
  if (rating === 'bad') return 'rough';
  if (rating === 'ok') return 'ok';
  if (rating === 'good') return 'good';
  return null;
}

/** Exposed for the card's persistence layer + tests. */
export const INSIGHT_POOL_SIZE = INSIGHT_POOL.length;
