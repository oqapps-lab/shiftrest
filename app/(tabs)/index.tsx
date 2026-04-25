/**
 * S20 — Home (Today). Core screen: glance-and-go, <5 sec.
 * Eyebrow greeting + streak pill + Soft hero line + TimelineRing + ShiftBar + 3 next-event cards.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  Eyebrow,
  SerifHero,
  TimelineRing,
  ShiftBar,
  GlassCard,
  Text,
  Glyph,
  HeroNumber,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { mockUser, mockPlan, mockShiftBlocks, mockTransition } from '../../mock/user';
import { countCompleted, formatHour, formatRelativeTime, formatStreak, getGreeting } from '../../lib/derive';
import { useOnboarding } from '../../lib/onboarding/store';
import { useStreak, useActiveTransitionPlan } from '../../lib/queries';

// Event times come from mockPlan as floats → formatted once, distance
// computed from the same source so they can never drift apart.
const EVENTS = [
  {
    glyph: 'coffee' as const,
    label: 'CAFFEINE CUTOFF',
    hour: Number(mockPlan.caffeineCutoff.split(':')[0]),
    tintBg: colors.sunriseGlow,
    tintFg: 'sunriseDim' as const,
  },
  {
    glyph: 'moon' as const,
    label: 'MELATONIN',
    hour: Number(mockPlan.melatoninTime.split(':')[0]),
    tintBg: colors.duskGlow,
    tintFg: 'duskDim' as const,
  },
  {
    glyph: 'bed' as const,
    label: 'SLEEP WINDOW',
    hour: mockPlan.sleepStart,
    tintBg: colors.primaryContainer,
    tintFg: 'primary' as const,
  },
];

export default function Home() {
  const { state: onboarding } = useOnboarding();
  const { data: streak } = useStreak();
  const { data: livePlan } = useActiveTransitionPlan();

  // Streak: real DB row when signed-in user has one, else mockUser.streak.
  const streakValue = streak?.current_streak ?? mockUser.streak;

  // Transition teaser: when a live plan exists pull its day-1 step counts;
  // else fall back to the mockTransition fixture so the demo still reads.
  const todayMock = mockTransition.days[0];
  const liveDay1Steps = livePlan?.steps.filter((s) => s.day_number === 1) ?? [];
  const liveDoneToday = liveDay1Steps.filter((s) => s.is_completed).length;
  const fromLabel = livePlan
    ? livePlan.transition_type === 'night_to_day' ? 'Night' : 'Day'
    : mockTransition.fromShift;
  const toLabel = livePlan
    ? livePlan.transition_type === 'night_to_day' ? 'Day' : 'Night'
    : mockTransition.toShift;
  const doneToday = livePlan ? liveDoneToday : countCompleted(todayMock.steps);
  const totalToday = livePlan ? liveDay1Steps.length : todayMock.steps.length;

  const displayName = (onboarding.displayName?.trim() || mockUser.name).toUpperCase();

  return (
    <Screen orbs="normal" scroll>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{`${getGreeting(mockPlan.nowHour)}, ${displayName}`}</Eyebrow>
        </View>
        <View style={styles.streak}>
          <Glyph name="flame" size={16} color="sunriseDim" />
          <Text
            variant="labelMd"
            family="body"
            weight="medium"
            color="ink"
            uppercase
            style={{ marginLeft: 6 }}
          >
            {formatStreak(streakValue)}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>Rest is gathering.</SerifHero>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={mockPlan.nowHour}
          sleepStart={mockPlan.sleepStart}
          sleepEnd={mockPlan.sleepEnd}
          shiftStart={mockPlan.shiftStart}
          shiftEnd={mockPlan.shiftEnd}
          size={260}
          label="TODAY"
          centerLabel={formatHour(mockPlan.nowHour)}
        />
      </View>

      <Eyebrow>YOUR 24 HOURS</Eyebrow>
      <View style={{ height: spacing.md }} />
      <ShiftBar blocks={mockShiftBlocks} height={16} />

      <View style={{ height: spacing.huge }} />

      <Eyebrow>NEXT</Eyebrow>
      <View style={{ height: spacing.md }} />

      {EVENTS.map((e) => (
        <GlassCard key={e.label} variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
          <View style={styles.eventRow}>
            <View style={[styles.eventIcon, { backgroundColor: e.tintBg }]}>
              <Glyph name={e.glyph} size={22} color={e.tintFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>{e.label}</Eyebrow>
              <HeroNumber value={formatHour(e.hour)} size="md" style={{ marginTop: 2 }} />
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                {formatRelativeTime(mockPlan.nowHour, e.hour)}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))}

      <Pressable
        onPress={() => router.push('/transition')}
        style={{ marginTop: spacing.md }}
      >
        <GlassCard variant="dusk" padding="xxl">
          <View style={styles.eventRow}>
            <View style={[styles.eventIcon, { backgroundColor: colors.duskGlow }]}>
              <Glyph name="sparkle" size={22} color="duskDim" />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color="duskDim">TRANSITION IN PROGRESS</Eyebrow>
              <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
                {`${fromLabel} → ${toLabel}, ${doneToday} of ${totalToday} steps today`}
              </Text>
            </View>
            <Glyph name="chevronRight" size={20} color="duskDim" />
          </View>
        </GlassCard>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.sunriseGlow,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
});
