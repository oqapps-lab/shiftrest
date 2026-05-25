/**
 * S14 — Aha-Moment. Personalised plan preview BEFORE paywall.
 * Timeline ring + 2 glass cards + locked preview + CTA.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  SerifHero,
  Eyebrow,
  HeroNumber,
  GlassCard,
  TimelineRing,
  PillCTA,
  Text,
  Glyph,
} from '../../components/ui';
import { spacing, radii, colors } from '../../constants/tokens';
import {
  formatHour,
  formatHourRange,
  hoursBetween,
  firstName,
  suggestedPlanFromOnboarding,
} from '../../lib/derive';
import {
  useOnboarding,
  chronotypeBucket,
  computeChronotypeScore,
} from '../../lib/onboarding/store';
import { useGeneratedPlan, planHourAsFloat, formatPlanHour } from '../../lib/queries/plan';
import { t } from '../../lib/i18n';

export default function Aha() {
  const { state: onboarding } = useOnboarding();
  const { data: livePlan } = useGeneratedPlan();
  // No mockUser.name fallback — eyebrow drops the name fragment in cold-start
  // rather than greeting a fake name on a fresh device.
  const userName = onboarding.displayName?.trim();
  const displayName = userName ? firstName(userName).toUpperCase() : '';

  // Suggested plan from this user's onboarding answers — never mockPlan.
  // Without a generated_plan yet we have to derive something to show on the
  // aha screen; using their currentShift + chronotype gives a personalised
  // preview instead of a generic 23:00-07:00 demo schedule.
  const suggested = suggestedPlanFromOnboarding(
    onboarding.currentShift,
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );

  const sleepStartHour = planHourAsFloat(livePlan?.sleep_start) ?? suggested.sleepStart;
  const sleepEndHour = planHourAsFloat(livePlan?.sleep_end) ?? suggested.sleepEnd;
  const caffeineCutoffStr = formatPlanHour(livePlan?.caffeine_cutoff_at) || suggested.caffeineCutoff;
  const caffeineHourValue = Number(caffeineCutoffStr.split(':')[0]);
  const hoursBeforeSleep = hoursBetween(caffeineHourValue, sleepStartHour);

  // Real wall-clock so the ring center reflects when the user is looking
  // at the screen, not the mockPlan demo's fixed 14:30.
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  return (
    <Screen
      orbs="normal"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('aha.cta')}
          onPress={() => router.push('/paywall')}
        />
      }
    >
      <Eyebrow>{displayName ? `${displayName}, ${t('aha.eyebrow')}` : t('aha.eyebrow')}</Eyebrow>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>{t('aha.hero')}</SerifHero>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={sleepEndHour}
          shiftStart={suggested.shiftStart}
          shiftEnd={suggested.shiftEnd}
          size={280}
          label={t('today.label_today')}
          centerLabel={formatHour(nowHour)}
        />
      </View>

      <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
            <Glyph name="bed" size={22} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow>{t('aha.sleep_window')}</Eyebrow>
            <HeroNumber value={formatHourRange(sleepStartHour, sleepEndHour)} size="md" style={{ marginTop: 2 }} />
          </View>
        </View>
      </GlassCard>

      <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.sunriseGlow }]}>
            <Glyph name="coffee" size={22} color="sunriseDim" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow>{t('aha.caffeine_cutoff')}</Eyebrow>
            <HeroNumber value={caffeineCutoffStr} size="md" style={{ marginTop: 2 }} />
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
              {`${hoursBeforeSleep} hours before sleep · gentle on sensitive types`}
            </Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.xxxl, opacity: 0.62 }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.duskGlow }]}>
            <Glyph name="sparkle" size={22} color="duskDim" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow color="duskDim">{t('aha.transition_premium')}</Eyebrow>
            <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
              {t('aha.night_day_step')}
            </Text>
          </View>
        </View>
      </GlassCard>

    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
