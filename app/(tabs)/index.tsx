/**
 * S20 — Home (Today). Core screen: glance-and-go, <5 sec.
 * Eyebrow greeting + streak pill + Soft hero line + TimelineRing + ShiftBar + 3 next-event cards.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { mockUser, mockPlan, mockShiftBlocks } from '../../mock/user';

const EVENTS = [
  {
    glyph: 'coffee' as const,
    label: 'CAFFEINE CUTOFF',
    time: '17:00',
    away: '2h 30m away',
    tintBg: colors.sunriseGlow,
    tintFg: 'sunriseDim' as const,
  },
  {
    glyph: 'moon' as const,
    label: 'MELATONIN',
    time: '22:00',
    away: '7h 30m away',
    tintBg: colors.duskGlow,
    tintFg: 'duskDim' as const,
  },
  {
    glyph: 'bed' as const,
    label: 'SLEEP WINDOW',
    time: '23:00',
    away: '8h 30m away',
    tintBg: colors.primaryContainer,
    tintFg: 'primary' as const,
  },
];

export default function Home() {
  const insets = useSafeAreaInsets();

  return (
    <Screen orbs="normal" scroll>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{`GOOD AFTERNOON, ${mockUser.name.toUpperCase()}`}</Eyebrow>
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
            {`${mockUser.streak} DAYS`}
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
          centerLabel="14:30"
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
              <HeroNumber value={e.time} size="md" style={{ marginTop: 2 }} />
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                {e.away}
              </Text>
            </View>
            <Glyph name="chevronRight" size={20} color="inkMuted" />
          </View>
        </GlassCard>
      ))}

      <Pressable
        onPress={() => router.push('/transition')}
        style={{ marginTop: spacing.md }}
      >
        <GlassCard variant="dusk" padding="xxl">
          <View style={styles.eventRow}>
            <View style={[styles.eventIcon, { backgroundColor: '#C4AEC2' }]}>
              <Glyph name="sparkle" size={22} color="duskDim" />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color="duskDim">TRANSITION IN PROGRESS</Eyebrow>
              <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
                Night → Day, 2 of 4 steps today
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
