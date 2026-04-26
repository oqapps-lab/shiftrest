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
import { mockUser, mockPlan } from '../../mock/user';
import { formatHour, formatHourRange, hoursBetween, firstName } from '../../lib/derive';
import { useOnboarding } from '../../lib/onboarding/store';
import { useGeneratedPlan, planHourAsFloat, formatPlanHour } from '../../lib/queries/plan';

export default function Aha() {
  const { state: onboarding } = useOnboarding();
  const { data: livePlan } = useGeneratedPlan();
  const displayName = firstName(onboarding.displayName?.trim() || mockUser.name).toUpperCase();

  // Prefer live plan times when present, fall back to mockPlan.
  const sleepStartHour = planHourAsFloat(livePlan?.sleep_start) ?? mockPlan.sleepStart;
  const sleepEndHour = planHourAsFloat(livePlan?.sleep_end) ?? mockPlan.sleepEnd;
  const caffeineCutoffStr = formatPlanHour(livePlan?.caffeine_cutoff_at) || mockPlan.caffeineCutoff;
  const caffeineHourValue = Number(caffeineCutoffStr.split(':')[0]);
  const hoursBeforeSleep = hoursBetween(caffeineHourValue, sleepStartHour);

  return (
    <Screen
      orbs="normal"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Get the full plan"
          onPress={() => router.push('/paywall')}
        />
      }
    >
      <Eyebrow>{`${displayName}, YOUR PLAN IS READY`}</Eyebrow>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>Sleep catches up tonight.</SerifHero>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={mockPlan.nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={sleepEndHour}
          shiftStart={mockPlan.shiftStart}
          shiftEnd={mockPlan.shiftEnd}
          size={280}
          label="TODAY"
          centerLabel={formatHour(mockPlan.nowHour)}
        />
      </View>

      <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
            <Glyph name="bed" size={22} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow>SLEEP WINDOW</Eyebrow>
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
            <Eyebrow>CAFFEINE CUTOFF</Eyebrow>
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
            <Eyebrow color="duskDim">TRANSITION PLAN · PREMIUM</Eyebrow>
            <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
              Night → Day, step by step
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
