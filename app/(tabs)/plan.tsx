/**
 * S40 — Daily Sleep Plan. Hero timeline + 4 recommendation cards.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import {
  Screen,
  Eyebrow,
  SerifHero,
  TimelineRing,
  GlassCard,
  Text,
  Glyph,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import {
  formatDayMonth,
  formatHour,
  hoursBetween,
  suggestedPlanFromOnboarding,
} from '../../lib/derive';
import { useGeneratedPlan, planHourAsFloat, type PlanRecommendation } from '../../lib/queries/plan';
import { useOnboarding, chronotypeBucket, computeChronotypeScore } from '../../lib/onboarding/store';
import type { GlyphName } from '../../components/ui';
import { t } from '../../lib/i18n';

interface UiRec {
  glyph: GlyphName;
  eyebrow: string;
  hero: string;
  body: string;
  tintBg: string;
  tintFg: 'sunriseDim' | 'duskDim' | 'primary';
  locked?: boolean;
}

/**
 * Fallback recommendations built at render time so t() lookups resolve
 * against the CURRENT locale. Module-level const evaluation would freeze
 * the strings at load time and never update across locale switches.
 */
function buildFallbackRecs(suggested: ReturnType<typeof suggestedPlanFromOnboarding>): UiRec[] {
  const caffeineHour = Number(suggested.caffeineCutoff.split(':')[0]);
  const hoursBeforeSleep = hoursBetween(caffeineHour, suggested.sleepStart);
  return [
    {
      glyph: 'coffee',
      eyebrow: t('plan.cards.caffeine.eyebrow'),
      hero: t('plan.cards.caffeine.hero', { time: suggested.caffeineCutoff }),
      body: t('plan.cards.caffeine.body', { h: hoursBeforeSleep }),
      tintBg: colors.sunriseGlow,
      tintFg: 'sunriseDim',
    },
    {
      glyph: 'moon',
      eyebrow: `${t('plan.cards.melatonin.eyebrow')} · ${t('plan.premium_suffix')}`,
      hero: t('plan.cards.melatonin.hero', { time: suggested.melatoninTime }),
      body: t('plan.cards.melatonin.body'),
      tintBg: colors.duskGlow,
      tintFg: 'duskDim',
      locked: true,
    },
    {
      glyph: 'sun',
      eyebrow: t('plan.cards.light.eyebrow'),
      hero: t('plan.cards.light.hero'),
      body: t('plan.cards.light.body'),
      tintBg: colors.sunriseGlow,
      tintFg: 'sunriseDim',
    },
    {
      glyph: 'bed',
      eyebrow: t('plan.cards.nap.eyebrow'),
      hero: t('plan.cards.nap.hero'),
      body: t('plan.cards.nap.body'),
      tintBg: colors.primaryContainer,
      tintFg: 'primary',
    },
  ];
}

const REC_STYLE: Record<PlanRecommendation['type'], { glyph: GlyphName; tintBg: string; tintFg: 'sunriseDim' | 'duskDim' | 'primary' }> = {
  caffeine:    { glyph: 'coffee',  tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
  melatonin:   { glyph: 'moon',    tintBg: colors.duskGlow,        tintFg: 'duskDim'    },
  light:       { glyph: 'sun',     tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
  nap:         { glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  sleep_window:{ glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  wind_down:   { glyph: 'sparkle', tintBg: colors.duskGlow,        tintFg: 'duskDim'    },
};

export default function Plan() {
  const [day, setDay] = useState(1);
  const pagerLabels = [t('plan.yesterday'), `${t('plan.today')} · ${formatDayMonth()}`, t('plan.tomorrow')];
  const { data: livePlan } = useGeneratedPlan();
  const { state: onboarding } = useOnboarding();
  // J1: hide melatonin card when user opted out in onboarding
  const showMelatonin = onboarding.takesMelatonin !== false;

  // Suggested plan derived from the user's onboarding answers (current
  // shift + chronotype). Replaces the old mockPlan fallback which leaked
  // generic "Caffeine cutoff 14:30, Melatonin 22:00" to users who never
  // gave us their schedule (live-test 2026-05-25 hardcode complaint).
  const suggested = suggestedPlanFromOnboarding(
    onboarding.currentShift,
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );

  const liveRecs = livePlan?.metadata?.recommendations ?? null;
  const baseRecs: UiRec[] = liveRecs && liveRecs.length > 0
    ? liveRecs
        .filter((r) => showMelatonin || r.type !== 'melatonin')
        .map((r) => ({
          ...REC_STYLE[r.type],
          eyebrow: r.locked ? `${r.eyebrow} · ${t('plan.premium_suffix')}` : r.eyebrow,
          hero: r.hero,
          body: r.body,
          locked: r.locked,
        }))
    : buildFallbackRecs(suggested);
  // Strip melatonin card from fallback when user opted out — buildFallbackRecs
  // always includes it for the demo "looks rich" effect; honesty wins here.
  const recs: UiRec[] = showMelatonin
    ? baseRecs
    : baseRecs.filter((r) => r.glyph !== 'moon');

  const sleepStartHour =
    planHourAsFloat(livePlan?.sleep_start) ?? suggested.sleepStart;
  const sleepEndHour =
    planHourAsFloat(livePlan?.sleep_end) ?? suggested.sleepEnd;
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  const heroText = day === 0 ? t('plan.hero_yesterday') : day === 2 ? t('plan.hero_tomorrow') : t('plan.hero_today');
  const ringLabel = day === 0 ? t('plan.yesterday') : day === 2 ? t('plan.tomorrow') : t('plan.now');

  return (
    <Screen orbs="normal" scroll>
      <View style={styles.pagerRow}>
        {pagerLabels.map((label, i) => (
          <Pressable
            key={label}
            onPress={() => setDay(i)}
            style={[styles.pagerItem, day === i && styles.pagerItemActive]}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Text
              variant="labelMd"
              family="body"
              weight="medium"
              color={day === i ? 'primary' : 'inkMuted'}
              uppercase
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xxl }}>
        <SerifHero>{heroText}</SerifHero>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={sleepEndHour}
          shiftStart={suggested.shiftStart}
          shiftEnd={suggested.shiftEnd}
          size={280}
          label={ringLabel}
          centerLabel={day === 1 ? formatHour(nowHour) : formatHour(sleepStartHour)}
        />
      </View>

      {recs.map((r) => (
        <GlassCard
          key={r.hero}
          variant="glass"
          padding="xxl"
          style={[{ marginBottom: spacing.md }, r.locked && { opacity: 0.62 }]}
        >
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: r.tintBg }]}>
              <Glyph name={r.glyph} size={22} color={r.tintFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color={r.locked ? 'duskDim' : 'inkMuted'}>{r.eyebrow}</Eyebrow>
              <Text
                variant="titleLg"
                family="display"
                weight="medium"
                color="ink"
                style={{ marginTop: 2 }}
              >
                {r.hero}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
                {r.body}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))}

      <Pressable
        style={{ marginTop: spacing.xl, alignSelf: 'center' }}
        accessibilityRole="button"
        accessibilityLabel={t('plan.why_title')}
        onPress={() => {
          const explanation =
            livePlan?.explanation?.trim() || t('plan.why_default');
          Alert.alert(t('plan.why_title'), explanation);
        }}
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('plan.why_link')}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pagerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  pagerItem: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  pagerItemActive: {
    backgroundColor: colors.primaryContainer,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
});
