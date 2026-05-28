/**
 * S40 — Daily Sleep Plan. Hero timeline + 4 recommendation cards.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
  lightWindowsForShift,
  formatHourRange,
  napWindowForShift,
  mealTimingForShift,
} from '../../lib/derive';
import { useGeneratedPlan, planHourAsFloat, type PlanRecommendation } from '../../lib/queries/plan';
import { useOnboarding, chronotypeBucket, computeChronotypeScore } from '../../lib/onboarding/store';
import { useLocalShifts } from '../../lib/local-shifts/store';
import type { GlyphName } from '../../components/ui';
import { t } from '../../lib/i18n';
import { WhyTheseTimesSheet } from '../../components/plan/WhyTheseTimesSheet';

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
function buildFallbackRecs(
  suggested: ReturnType<typeof suggestedPlanFromOnboarding>,
  shift: 'day' | 'night' | 'off',
): UiRec[] {
  const caffeineHour = Number(suggested.caffeineCutoff.split(':')[0]);
  const hoursBeforeSleep = hoursBetween(caffeineHour, suggested.sleepStart);

  // E1: light therapy fallback — pick the FIRST window of the day as the
  // hero. If the shift is night, that's evening bright light. If day, it's
  // the morning sun. Tip in body summarises the secondary window when
  // present (e.g. dark glasses on commute home).
  const lightWindows = lightWindowsForShift(shift);
  const primary = lightWindows[0];
  const secondary = lightWindows[1];
  const lightHero = primary
    ? primary.eyebrowKey === 'plan.cards.light.seek'
      ? t('plan.cards.light.seek_template', { range: formatHourRange(primary.startHour, primary.endHour) })
      : t('plan.cards.light.avoid_template', { range: formatHourRange(primary.startHour, primary.endHour) })
    : t('plan.cards.light.hero');
  const lightBody = secondary
    ? secondary.eyebrowKey === 'plan.cards.light.seek'
      ? t('plan.cards.light.body_seek', { range: formatHourRange(secondary.startHour, secondary.endHour) })
      : t('plan.cards.light.body_avoid', { range: formatHourRange(secondary.startHour, secondary.endHour) })
    : t('plan.cards.light.body');

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
      hero: lightHero,
      body: lightBody,
      tintBg: colors.sunriseGlow,
      tintFg: 'sunriseDim',
    },
    // G2: shift-aware nap recommendation
    (() => {
      const nap = napWindowForShift(shift);
      if (!nap) {
        return {
          glyph: 'bed' as const,
          eyebrow: t('plan.cards.nap.eyebrow'),
          hero: t('plan.cards.nap.hero'),
          body: t('plan.cards.nap.body'),
          tintBg: colors.primaryContainer,
          tintFg: 'primary' as const,
        };
      }
      return {
        glyph: 'bed' as const,
        eyebrow: t(`plan.cards.nap.eyebrow_${nap.kind}`),
        hero: t('plan.cards.nap.hero_template', {
          duration: nap.durationMin,
          time: formatHour(nap.hour),
        }),
        body: t(`plan.cards.nap.body_${nap.kind}`),
        tintBg: colors.primaryContainer,
        tintFg: 'primary' as const,
      };
    })(),
    // F15 — Meal Timing card
    (() => {
      const meal = mealTimingForShift(shift, suggested.sleepStart);
      return {
        glyph: 'fork' as const,
        eyebrow: t(meal.eyebrowKey),
        hero: t('plan.cards.meal.hero_template', {
          main: formatHour(meal.mainMealHour),
          cutoff: formatHour(meal.cutoffHour),
        }),
        body: t(meal.bodyKey),
        tintBg: colors.sunriseGlow,
        tintFg: 'sunriseDim' as const,
      };
    })(),
  ];
}

const REC_STYLE: Record<PlanRecommendation['type'], { glyph: GlyphName; tintBg: string; tintFg: 'sunriseDim' | 'duskDim' | 'primary' }> = {
  caffeine:    { glyph: 'coffee',  tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
  melatonin:   { glyph: 'moon',    tintBg: colors.duskGlow,        tintFg: 'duskDim'    },
  light:       { glyph: 'sun',     tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
  nap:         { glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  sleep_window:{ glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  wind_down:   { glyph: 'sparkle', tintBg: colors.duskGlow,        tintFg: 'duskDim'    },
  meal:        { glyph: 'fork',    tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
};

export default function Plan() {
  const [day, setDay] = useState(1);
  const [whyOpen, setWhyOpen] = useState(false);
  const pagerLabels = [t('plan.yesterday'), `${t('plan.today')} · ${formatDayMonth()}`, t('plan.tomorrow')];
  const { data: livePlan } = useGeneratedPlan();
  const { state: onboarding } = useOnboarding();

  // K2: per-day shift kind. Read shifts for the date offset by (day-1),
  // so Yesterday/Today/Tomorrow all surface their own timings instead of
  // just relabelling the same numbers. Falls back to currentShift if no
  // real shift recorded for that date.
  const offsetDays = day - 1; // -1, 0, +1
  const localShiftsMap = useLocalShifts();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + offsetDays);
  const targetIso = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  const dayShiftKind: 'day' | 'night' | 'off' =
    (localShiftsMap[targetIso] as 'day' | 'night' | 'off' | undefined)
    ?? (day === 1 ? onboarding.currentShift : 'off');
  // J1: hide melatonin card when user opted out in onboarding
  const showMelatonin = onboarding.takesMelatonin !== false;
  // C2: hide caffeine card when user doesn't drink caffeine
  const showCaffeine = onboarding.caffeineCupsPerDay > 0;
  // E1: show light therapy card when user enabled it in settings
  const showLight = onboarding.usesLightTherapy === true;

  // Suggested plan derived from THIS day's shift kind + chronotype. So
  // Yesterday/Today/Tomorrow each render their own honest timings.
  const suggested = suggestedPlanFromOnboarding(
    dayShiftKind,
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );

  const liveRecs = livePlan?.metadata?.recommendations ?? null;
  const baseRecs: UiRec[] = liveRecs && liveRecs.length > 0
    ? liveRecs
        .filter((r) => showMelatonin || r.type !== 'melatonin')
        .filter((r) => showCaffeine || r.type !== 'caffeine')
        .filter((r) => showLight || r.type !== 'light')
        .map((r) => ({
          ...REC_STYLE[r.type],
          eyebrow: r.locked ? `${r.eyebrow} · ${t('plan.premium_suffix')}` : r.eyebrow,
          hero: r.hero,
          body: r.body,
          locked: r.locked,
        }))
    : buildFallbackRecs(suggested, dayShiftKind);
  // Strip cards from fallback list when user opted out of that substance —
  // buildFallbackRecs always returns the full 4 for the demo "looks rich"
  // effect; honesty wins once user has set their prefs.
  const recs: UiRec[] = baseRecs
    .filter((r) => showMelatonin || r.glyph !== 'moon')
    .filter((r) => showCaffeine || r.glyph !== 'coffee')
    .filter((r) => showLight || r.glyph !== 'sun');

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
        onPress={() => setWhyOpen(true)}
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('plan.why_link')}
        </Text>
      </Pressable>

      <WhyTheseTimesSheet
        visible={whyOpen}
        onClose={() => setWhyOpen(false)}
        explanation={livePlan?.explanation ?? null}
        sleepStart={formatHour(sleepStartHour)}
        sleepEnd={formatHour(sleepEndHour)}
        caffeineCutoff={suggested.caffeineCutoff}
        melatoninTime={showMelatonin ? suggested.melatoninTime : null}
        chronotypeLabel={t(`chronotype.${chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers))}`)}
        shiftLabel={t(`shift_kind.${dayShiftKind}_long`)}
      />
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
