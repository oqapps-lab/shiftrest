/**
 * F11 — Sleep History full view. Drill from the Profile JOURNAL · LAST 14
 * heatmap. Shows 30-day timeline + weekly comparison + per-rating stats.
 *
 * Stays inside the existing visual language: GlassCard / Eyebrow /
 * SerifHero / streak-dot row, but stretched to 30 days and grouped by
 * week. Per the non-judgmental framing (F9), copy avoids "good/bad"
 * comparative language; surfaces "great vs rough trend" neutrally.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  HeroNumber,
  Text,
  Glyph,
} from '../components/ui';
import { colors, spacing, radii } from '../constants/tokens';
import { safeBack } from '../lib/nav';
import {
  useSleepJournal,
  recentJournalDays,
  journaledDayCount,
  type SleepRating,
} from '../lib/sleep-journal/store';
import { t } from '../lib/i18n';

const HISTORY_DAYS = 30;

type RatingTally = { good: number; ok: number; bad: number; empty: number };

function tallyRange(days: { rating: SleepRating | null }[]): RatingTally {
  return days.reduce<RatingTally>(
    (acc, d) => {
      if (d.rating === 'good') acc.good++;
      else if (d.rating === 'ok') acc.ok++;
      else if (d.rating === 'bad') acc.bad++;
      else acc.empty++;
      return acc;
    },
    { good: 0, ok: 0, bad: 0, empty: 0 },
  );
}

function ratingColor(r: SleepRating | null): string | null {
  if (r === 'good') return colors.primary;
  if (r === 'ok') return colors.sunriseDim;
  if (r === 'bad') return colors.duskDim;
  return null;
}

export default function History() {
  useSleepJournal();
  const recent = recentJournalDays(HISTORY_DAYS);
  const total = journaledDayCount();
  const hasAny = recent.some((d) => d.rating !== null);

  const overall = tallyRange(recent);
  // Split into the most recent 7 days vs the prior 7 days for the trend
  // arrow. Stretches to 14 vs 14 too if you tally everything, but week
  // comparison reads clearer for a glance.
  const last7 = recent.slice(-7);
  const prev7 = recent.slice(-14, -7);
  const last7Score = tallyRange(last7);
  const prev7Score = tallyRange(prev7);

  // Score = good*2 + ok*1 - bad*1 (max 14 per week). Direction-only
  // comparison so we don't surface raw numbers.
  const score = (s: RatingTally) => s.good * 2 + s.ok * 1 - s.bad * 1;
  const trendDiff = score(last7Score) - score(prev7Score);
  const trendKey =
    trendDiff > 0 ? 'history.trend_up' : trendDiff < 0 ? 'history.trend_down' : 'history.trend_flat';
  const trendGlyph: 'sparkle' | 'leaf' | 'moon' =
    trendDiff > 0 ? 'sparkle' : trendDiff < 0 ? 'moon' : 'leaf';

  // Group into weeks for the bar visualisation. Recent = right-most.
  const weeks: { iso: string; rating: SleepRating | null }[][] = [];
  for (let w = 0; w < HISTORY_DAYS; w += 7) {
    weeks.push(recent.slice(w, w + 7));
  }

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/(tabs)/profile')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('history.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('history.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('history.subtitle', { total })}
      </Text>

      {!hasAny ? (
        <GlassCard variant="paper" padding="xxl">
          <Text variant="titleMd" family="display" weight="medium" color="ink">
            {t('history.empty_title')}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
            {t('history.empty_sub')}
          </Text>
        </GlassCard>
      ) : (
        <>
          {/* Trend card */}
          <GlassCard variant="paper" padding="xxl" style={{ marginBottom: spacing.lg }}>
            <View style={styles.trendRow}>
              <View style={styles.trendIcon}>
                <Glyph name={trendGlyph} size={22} color="primary" />
              </View>
              <View style={{ flex: 1 }}>
                <Eyebrow>{t('history.trend_label')}</Eyebrow>
                <Text
                  variant="titleLg"
                  family="display"
                  weight="light"
                  color="ink"
                  style={{ marginTop: 2 }}
                >
                  {t(trendKey)}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {t('history.trend_sub')}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <GlassCard variant="glass" padding="lg" style={styles.stat}>
              <Eyebrow size="md">{t('history.stat_great')}</Eyebrow>
              <HeroNumber value={overall.good} size="md" />
            </GlassCard>
            <View style={{ width: spacing.sm }} />
            <GlassCard variant="glass" padding="lg" style={styles.stat}>
              <Eyebrow size="md">{t('history.stat_ok')}</Eyebrow>
              <HeroNumber value={overall.ok} size="md" />
            </GlassCard>
            <View style={{ width: spacing.sm }} />
            <GlassCard variant="glass" padding="lg" style={styles.stat}>
              <Eyebrow size="md">{t('history.stat_rough')}</Eyebrow>
              <HeroNumber value={overall.bad} size="md" />
            </GlassCard>
          </View>

          {/* 30-day calendar visualisation, grouped by week */}
          <View style={{ marginTop: spacing.huge }}>
            <Eyebrow>{t('history.calendar_label')}</Eyebrow>
            <View style={styles.weeksWrap}>
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  <Text variant="labelMd" family="mono" color="inkMuted" style={styles.weekLabel}>
                    {t('history.week_n', { n: weeks.length - wi })}
                  </Text>
                  <View style={styles.weekDots}>
                    {week.map((d, di) => {
                      const isLatest = wi === weeks.length - 1 && di === week.length - 1;
                      const color = ratingColor(d.rating);
                      return (
                        <View
                          key={d.iso}
                          style={[
                            styles.dot,
                            color
                              ? { backgroundColor: color }
                              : styles.dotEmpty,
                            color && isLatest && styles.dotLatest,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.huge, textAlign: 'center' }}>
            {t('history.footnote')}
          </Text>
        </>
      )}

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  weeksWrap: {
    marginTop: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekLabel: {
    width: 56,
  },
  weekDots: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.inkGhost,
  },
  dotLatest: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
