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
import { mockPlan } from '../../mock/user';
import { formatDayMonth, formatHour, hoursBetween } from '../../lib/derive';
import { useGeneratedPlan, planHourAsFloat, type PlanRecommendation } from '../../lib/queries/plan';
import type { GlyphName } from '../../components/ui';

const caffeineHour = Number(mockPlan.caffeineCutoff.split(':')[0]);
const hoursBeforeSleep = hoursBetween(caffeineHour, mockPlan.sleepStart);

interface UiRec {
  glyph: GlyphName;
  eyebrow: string;
  hero: string;
  body: string;
  tintBg: string;
  tintFg: 'sunriseDim' | 'duskDim' | 'primary';
  locked?: boolean;
}

const FALLBACK_RECS: UiRec[] = [
  {
    glyph: 'coffee',
    eyebrow: 'CAFFEINE',
    hero: `Last cup by ${mockPlan.caffeineCutoff}`,
    body: `${hoursBeforeSleep} h before sleep window. Your sensitivity is moderate.`,
    tintBg: colors.sunriseGlow,
    tintFg: 'sunriseDim',
  },
  {
    glyph: 'moon',
    eyebrow: 'MELATONIN · PREMIUM',
    hero: `0.5 mg at ${mockPlan.melatoninTime}`,
    body: 'Phase advance dose · timed for today\'s day shift.',
    tintBg: colors.duskGlow,
    tintFg: 'duskDim',
    locked: true,
  },
  {
    glyph: 'sun',
    eyebrow: 'LIGHT',
    hero: 'Seek 07:30 – 08:30',
    body: 'Bright outdoor light locks your circadian rhythm.',
    tintBg: colors.sunriseGlow,
    tintFg: 'sunriseDim',
  },
  {
    glyph: 'bed',
    eyebrow: 'OPTIONAL NAP',
    hero: '20 min at 14:00',
    body: 'Cap at 20 min to avoid sleep-inertia fog.',
    tintBg: colors.primaryContainer,
    tintFg: 'primary',
  },
];

// Map LLM recommendation type → UI tint + glyph.
const REC_STYLE: Record<PlanRecommendation['type'], { glyph: GlyphName; tintBg: string; tintFg: 'sunriseDim' | 'duskDim' | 'primary' }> = {
  caffeine:    { glyph: 'coffee',  tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
  melatonin:   { glyph: 'moon',    tintBg: colors.duskGlow,        tintFg: 'duskDim'    },
  light:       { glyph: 'sun',     tintBg: colors.sunriseGlow,     tintFg: 'sunriseDim' },
  nap:         { glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  sleep_window:{ glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  wind_down:   { glyph: 'sparkle', tintBg: colors.duskGlow,        tintFg: 'duskDim'    },
};

export default function Plan() {
  const [day, setDay] = useState(1); // 0=yesterday, 1=today, 2=tomorrow
  const pagerLabels = ['YESTERDAY', `TODAY · ${formatDayMonth()}`, 'TOMORROW'];
  const { data: livePlan } = useGeneratedPlan();

  // RECS: prefer live plan recommendations, fallback to mocks.
  const liveRecs = livePlan?.metadata?.recommendations ?? null;
  const recs: UiRec[] = liveRecs && liveRecs.length > 0
    ? liveRecs.map((r) => ({
        ...REC_STYLE[r.type],
        eyebrow: r.locked ? `${r.eyebrow} · PREMIUM` : r.eyebrow,
        hero: r.hero,
        body: r.body,
        locked: r.locked,
      }))
    : FALLBACK_RECS;

  // Timeline values: derive from live plan if present.
  const sleepStartHour =
    planHourAsFloat(livePlan?.sleep_start) ?? mockPlan.sleepStart;
  const sleepEndHour =
    planHourAsFloat(livePlan?.sleep_end) ?? mockPlan.sleepEnd;
  const nowHour = mockPlan.nowHour;

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
          nowHour={nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={sleepEndHour}
          shiftStart={mockPlan.shiftStart}
          shiftEnd={mockPlan.shiftEnd}
          size={280}
          label="NOW"
          centerLabel={formatHour(nowHour)}
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
        accessibilityLabel="Why these times"
        onPress={() => {
          const explanation =
            livePlan?.explanation?.trim() ||
            "We anchor your sleep window to your shift end so the longest unbroken block lands when you're already winding down. Caffeine cutoff is set 6 hours before bed because that's roughly half-life. Melatonin (when used) goes 1–2 hours before sleep — early enough to nudge your circadian phase, not so late that you sleep through it.";
          Alert.alert('Why these times?', explanation);
        }}
      >
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
