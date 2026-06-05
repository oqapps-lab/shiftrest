/**
 * TODAY-10 — "Your week in sleep" summary card.
 *
 * ONE high-class card that consolidates the week's at-a-glance feedback on the
 * Today tab. It CONSOLIDATES the previous inline weekly-tally line (which lived
 * loose under the journal chips) so we don't duplicate the tally — this card
 * now owns it. Replaces nothing else; net cards added to Today = 0 because the
 * old loose tally row is removed in index.tsx.
 *
 * Shows, in order:
 *   • The weekly tally — "{good} great · {ok} ok · {bad} rough" + a trend
 *     arrow (from weeklyTally()).
 *   • The weeklyAdaptScore (0–100), PROMOTED from Profile, with a small label
 *     describing the direction of the week (never "bad sleep" framing).
 *   • ONLY when bestCorrelate() returns non-null: one honest insight line
 *     ("Your better nights tend to have: wound-down" / "Rougher nights often
 *     had: late caffeine"). Never fabricated — the correlate guards thin data.
 *
 * If there's too little logged data (no tally at all), it shows a calm
 * "log a few nights" empty state instead of fake numbers. The whole card is a
 * tap-target into the 30-day history (same destination as the old tally line).
 *
 * Pure presentation: all stats are read from the live stores by the parent and
 * the pure helpers here; no writes, no side effects.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Eyebrow, Text, GlassCard, Glyph, HeroNumber } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';
import { weeklyTally, weeklyAdaptScore } from '../../lib/sleep-journal/store';
import { factorLabelKey } from '../../lib/sleep-factors/store';
import { bestCorrelate } from '../../lib/sleep-correlate';
import type { RatingValue } from '../../lib/sleep-correlate';

interface Props {
  /** Live rating journal entries (YYYY-MM-DD → rating) for the correlate. */
  ratings: Record<string, RatingValue>;
  /** Live factor tags (YYYY-MM-DD → factor ids) for the correlate. */
  factors: Record<string, string[]>;
}

/** Map adapt score → the same positive directional copy Profile uses. */
function adaptLabelKey(score: number): string {
  if (score >= 75) return 'profile.adapt_well';
  if (score >= 50) return 'profile.adapt_steady';
  if (score >= 25) return 'profile.adapt_rough';
  return 'profile.adapt_tough';
}

export function WeekInSleepCard({ ratings, factors }: Props) {
  const tally = weeklyTally();
  const adapt = weeklyAdaptScore();
  const correlation = bestCorrelate(ratings, factors);

  // Empty state: nothing logged this week → a calm nudge, never fake numbers.
  if (!tally) {
    return (
      <GlassCard variant="whisper" padding="lg" style={styles.card}>
        <Eyebrow style={{ marginBottom: spacing.xs }}>{t('today.week.eyebrow')}</Eyebrow>
        <Text variant="bodyMd" color="inkSubtle">
          {t('today.week.empty')}
        </Text>
      </GlassCard>
    );
  }

  const trendArrow =
    tally.trend === 'up' ? '↑' : tally.trend === 'down' ? '↓' : tally.trend === 'flat' ? '→' : '';
  const trendKey = `today.journal_trend_${tally.trend ?? 'flat'}`;

  // Honest insight line — only present when the correlate cleared its guards.
  const corrLabelKey = correlation ? factorLabelKey(correlation.factorId) : null;
  const insightText =
    correlation && corrLabelKey
      ? correlation.direction === 'helps'
        ? t('today.week.insight_helps', { factor: t(corrLabelKey) })
        : t('today.week.insight_hurts', { factor: t(corrLabelKey) })
      : null;

  const a11y = `${t('today.week.eyebrow')}. ${t('today.journal_tally_inline', {
    good: tally.good,
    ok: tally.ok,
    bad: tally.bad,
  })}${adapt != null ? `. ${t('today.week.score_label')} ${adapt}` : ''}${insightText ? `. ${insightText}` : ''}`;

  return (
    <Pressable
      onPress={() => router.push('/history')}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <GlassCard variant="whisper" padding="lg" style={styles.card}>
        <Eyebrow style={{ marginBottom: spacing.sm }}>{t('today.week.eyebrow')}</Eyebrow>

        <View style={styles.row}>
          {/* Adapt score, promoted from Profile. Only when we have ≥3 days. */}
          {adapt != null && (
            <View style={styles.scoreWrap}>
              <HeroNumber value={adapt} size="md" />
              <Text variant="labelMd" color="inkMuted" uppercase align="center" style={styles.scoreLabel}>
                {t('today.week.score_label')}
              </Text>
            </View>
          )}

          <View style={styles.body}>
            {/* The weekly tally — this card now owns it (consolidated). */}
            <Text variant="bodyMd" color="ink" weight="medium">
              {t('today.journal_tally_inline', { good: tally.good, ok: tally.ok, bad: tally.bad })}
            </Text>

            {/* Trend arrow + directional copy. */}
            {tally.trend && (
              <Text variant="bodyMd" color="primary" style={{ marginTop: 2 }}>
                {`${trendArrow} ${t(trendKey)}`}
              </Text>
            )}

            {/* Adapt-score direction line (mirrors Profile's positive framing). */}
            {adapt != null && (
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                {t(adaptLabelKey(adapt))}
              </Text>
            )}
          </View>

          <Glyph name="chevronRight" size={18} color="inkMuted" />
        </View>

        {/* Honest correlate insight — only when bestCorrelate cleared its guards. */}
        {insightText && correlation && (
          <View style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Glyph
                name={correlation.direction === 'helps' ? 'sparkle' : 'moon'}
                size={14}
                color={correlation.direction === 'helps' ? 'primary' : 'duskDim'}
              />
            </View>
            <Text variant="bodyMd" color="ink" weight="medium" style={styles.insightText}>
              {insightText}
            </Text>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}

export default WeekInSleepCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.huge,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreWrap: {
    alignItems: 'center',
    marginRight: spacing.lg,
    minWidth: 56,
  },
  scoreLabel: {
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceHigh,
  },
  insightIcon: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
  },
});
