/**
 * S04 — Current Shift anchor. Step 3 / 10.
 * Segmented control (day/night/off) + two time cards + commute slider.
 * Time values are static mocks — a real TimePicker primitive is not yet in the design system,
 * so we render read-only display cards. Replace with picker when primitive lands.
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  GlassCard,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  SegmentedControl,
  Slider,
  type SegmentOption,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';

type ShiftKind = 'day' | 'night' | 'off';

const SEGMENT_OPTIONS: SegmentOption<ShiftKind>[] = [
  { value: 'day', label: 'Day shift' },
  { value: 'night', label: 'Night shift' },
  { value: 'off', label: 'Off day' },
];

const SHIFT_TIMES: Record<ShiftKind, { start: string; end: string }> = {
  day: { start: '07:00', end: '19:00' },
  night: { start: '19:00', end: '07:00' },
  off: { start: '—', end: '—' },
};

export default function CurrentShift() {
  const [shift, setShift] = useState<ShiftKind>('day');
  const [commute, setCommute] = useState<number>(30);
  const times = SHIFT_TIMES[shift];

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Continue"
          onPress={() => router.push('/onboarding/problem')}
        />
      }
    >
      <Eyebrow>STEP 3 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={2}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="Where are you right now?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        So we can anchor your first plan.
      </Text>

      <SegmentedControl<ShiftKind>
        options={SEGMENT_OPTIONS}
        value={shift}
        onChange={setShift}
      />

      <View style={styles.timeRow}>
        <GlassCard variant="paper" padding="lg" style={styles.timeCard}>
          <Eyebrow size="md">START</Eyebrow>
          <Text
            variant="headlineLg"
            family="display"
            weight="extraLight"
            color="ink"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ marginTop: spacing.xs }}
          >
            {times.start}
          </Text>
        </GlassCard>
        <GlassCard variant="paper" padding="lg" style={styles.timeCard}>
          <Eyebrow size="md">END</Eyebrow>
          <Text
            variant="headlineLg"
            family="display"
            weight="extraLight"
            color="ink"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ marginTop: spacing.xs }}
          >
            {times.end}
          </Text>
        </GlassCard>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <View style={styles.commuteHeader}>
          <Eyebrow>Commute time</Eyebrow>
          <Text variant="titleMd" family="display" weight="medium" color="ink">
            {commute} min
          </Text>
        </View>
        <Slider
          min={0}
          max={90}
          step={5}
          value={commute}
          onChange={setCommute}
          accessibilityLabel="Commute time in minutes"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  timeCard: {
    flex: 1,
  },
  commuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
