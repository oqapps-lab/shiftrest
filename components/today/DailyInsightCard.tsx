/**
 * TODAY-1 — Daily Insight card.
 *
 * The flagship Today-tab content card. REPLACES the old static "Tonight's
 * read" (one article picked by `date % length`). It surfaces a single,
 * high-class insight per day from the unified pool (16 Sleep Library
 * articles + 28 Sleep Tips), biased by:
 *   • the user's live circadian phase,
 *   • their profession, and
 *   • how they rated last night's sleep (journal-reactive).
 *
 * Design: a `paper` GlassCard matching the existing Today aesthetic —
 * an INSIGHT-OF-THE-DAY eyebrow, the insight one-liner as a display/serif
 * hero, a small category source pill, and (for articles) a chevron that
 * opens the full library article via the SAME route the old card used
 * (`/library/<id>`).
 *
 * Journal-reactive:
 *   • Rated → a tailored lead line with an icon at the top
 *     (rough → recovery, ok → adjustment, good → reinforce), then the insight.
 *   • Not rated → a subtle one-line hint to rate last night (NOT a 2nd button).
 *
 * Persistence: the shown insight id is appended to an AsyncStorage seen-set
 * (`shiftrest:insight-seen:v1`) keyed to a day marker
 * (`shiftrest:insight-day:v1`) so never-repeat works across days. When the
 * pool is exhausted the seen-set resets so rotation starts over.
 *
 * Net cards added to Today = 0 (this replaces Tonight's read).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eyebrow, Text, GlassCard, Glyph } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import {
  pickDailyInsight,
  INSIGHT_POOL_SIZE,
  type Profession,
  type InsightRating,
} from '../../lib/daily-insight';
import type { PhaseKey } from '../../lib/today-phase';
import { t } from '../../lib/i18n';

const SEEN_KEY = 'shiftrest:insight-seen:v1';
const DAY_KEY = 'shiftrest:insight-day:v1';

interface Props {
  phaseKey: PhaseKey;
  profession: Profession;
  /** Today's journal rating, or null when not yet logged. */
  rating: InsightRating;
}

/** Lead-line icon per rating bucket. */
const LEAD_GLYPH: Record<'rough' | 'ok' | 'good', React.ComponentProps<typeof Glyph>['name']> = {
  rough: 'moon',
  ok: 'leaf',
  good: 'sparkle',
};

function localDayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DailyInsightCard({ phaseKey, profession, rating }: Props) {
  // The seen-set hydrates async; until it lands we pick with an empty set
  // (still deterministic + correct, just not yet dedup-aware). Once loaded,
  // we re-pick with the real set.
  const [seen, setSeen] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate the persisted seen-set once on mount.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        const parsed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
        if (alive) setSeen(Array.isArray(parsed) ? parsed : []);
      } catch {
        // corrupt blob → start fresh
        if (alive) setSeen([]);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Deterministic per-day pick. Recomputes when phase / profession / rating
  // change (owner wants the card to react live) or when the seen-set hydrates.
  const insight = useMemo(
    () =>
      pickDailyInsight({
        phaseKey,
        profession,
        rating,
        date: new Date(),
        seen,
      }),
    [phaseKey, profession, rating, seen],
  );

  // Persist the shown id into the seen-set, once per day, after hydration.
  // Resets the set when the pool is exhausted so never-repeat starts over.
  useEffect(() => {
    if (!hydrated) return;
    let alive = true;
    (async () => {
      try {
        const today = localDayKey();
        const lastDay = await AsyncStorage.getItem(DAY_KEY);
        // Only record once per calendar day (the pick is stable within a day).
        if (lastDay === today && seen.includes(insight.id)) return;

        let next = seen.includes(insight.id) ? seen : [...seen, insight.id];
        // Pool exhausted → reset to just today's id so rotation restarts.
        if (next.length >= INSIGHT_POOL_SIZE) next = [insight.id];

        await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next));
        await AsyncStorage.setItem(DAY_KEY, today);
        if (alive && next !== seen) setSeen(next);
      } catch {
        // best-effort; a failed write just means the id may show again later
      }
    })();
    return () => {
      alive = false;
    };
    // We intentionally key this on the picked id + day-readiness only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, insight.id]);

  const isArticle = insight.kind === 'article';

  // Resolve the hero one-liner. Tips carry an i18n key suffix; articles carry
  // inline-English key-takeaway text (matches existing library behaviour).
  const heroText = insight.textIsTipKey ? t(`tips.${insight.text}.title`) : insight.text;
  const categoryLabel = t(insight.category);

  const open = () => {
    if (!isArticle || !insight.articleId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/library/${insight.articleId}`);
  };

  const Body = (
    <GlassCard variant="paper" padding="xxl">
      {/* Journal-reactive lead line — only when the user rated last night. */}
      {insight.ratingLead && (
        <View style={styles.leadRow}>
          <View style={styles.leadIcon}>
            <Glyph name={LEAD_GLYPH[insight.ratingLead]} size={15} color="primary" />
          </View>
          <Text
            variant="bodyMd"
            color="primary"
            weight="medium"
            style={styles.leadText}
            numberOfLines={2}
          >
            {t(`today.insight.lead_${insight.ratingLead}`)}
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Eyebrow color="primary">{t('today.insight.eyebrow')}</Eyebrow>

          {/* The insight one-liner — display/serif hero line. */}
          <Text
            variant="titleLg"
            family="display"
            weight="light"
            color="ink"
            style={styles.hero}
          >
            {heroText}
          </Text>

          {/* Small category / source pill. */}
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text variant="labelMd" color="inkMuted" uppercase>
                {categoryLabel}
              </Text>
            </View>
          </View>
        </View>

        {isArticle && <Glyph name="chevronRight" size={20} color="inkMuted" />}
      </View>

      {/* Not-rated → subtle one-line hint to tune today's insight. */}
      {!insight.ratingLead && (
        <Text variant="bodyMd" color="inkSubtle" style={styles.hint}>
          {t('today.insight.tune_hint')}
        </Text>
      )}
    </GlassCard>
  );

  if (isArticle) {
    return (
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${t('today.insight.eyebrow')}. ${heroText}`}
      >
        {Body}
      </Pressable>
    );
  }
  // Tips have no detail route → render the card non-pressable.
  return Body;
}

export default DailyInsightCard;

const styles = StyleSheet.create({
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  leadIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadText: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hero: {
    marginTop: spacing.xs,
    lineHeight: 28,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
  },
  hint: {
    marginTop: spacing.lg,
  },
});
