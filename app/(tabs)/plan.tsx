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
import { mockPlan } from '../../mock/user';
import { formatDayMonth, formatHour, hoursBetween } from '../../lib/derive';

const caffeineHour = Number(mockPlan.caffeineCutoff.split(':')[0]);
const hoursBeforeSleep = hoursBetween(caffeineHour, mockPlan.sleepStart);

const RECS = [
  {
    glyph: 'coffee' as const,
    eyebrow: 'CAFFEINE',
    hero: `Last cup by ${mockPlan.caffeineCutoff}`,
    body: `${hoursBeforeSleep} h before sleep window. Your sensitivity is moderate.`,
    tintBg: colors.sunriseGlow,
    tintFg: 'sunriseDim' as const,
  },
  {
    glyph: 'moon' as const,
    eyebrow: 'MELATONIN · PREMIUM',
    hero: `0.5 mg at ${mockPlan.melatoninTime}`,
    body: 'Phase advance dose · timed for today\'s day shift.',
    tintBg: colors.duskGlow,
    tintFg: 'duskDim' as const,
    locked: true,
  },
  {
    glyph: 'sun' as const,
    eyebrow: 'LIGHT',
    hero: 'Seek 07:30 – 08:30',
    body: 'Bright outdoor light locks your circadian rhythm.',
    tintBg: colors.sunriseGlow,
    tintFg: 'sunriseDim' as const,
  },
  {
    glyph: 'bed' as const,
    eyebrow: 'OPTIONAL NAP',
    hero: '20 min at 14:00',
    body: 'Cap at 20 min to avoid sleep-inertia fog.',
    tintBg: colors.primaryContainer,
    tintFg: 'primary' as const,
  },
];

export default function Plan() {
  const [day, setDay] = useState(1); // 0=yesterday, 1=today, 2=tomorrow
  const pagerLabels = ['YESTERDAY', `TODAY · ${formatDayMonth()}`, 'TOMORROW'];

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
        <SerifHero>A gentle plan for today.</SerifHero>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={mockPlan.nowHour}
          sleepStart={mockPlan.sleepStart}
          sleepEnd={mockPlan.sleepEnd}
          shiftStart={mockPlan.shiftStart}
          shiftEnd={mockPlan.shiftEnd}
          size={280}
          label="NOW"
          centerLabel={formatHour(mockPlan.nowHour)}
        />
      </View>

      {RECS.map((r) => (
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

      <Pressable style={{ marginTop: spacing.xl, alignSelf: 'center' }}>
        <Text variant="bodyMd" color="primary" weight="medium">
          Why these times?  →
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
