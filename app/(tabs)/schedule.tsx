/**
 * S30 — Calendar View. Month grid as dots (not squares).
 * Color-coded: sage = day shift, dusk = night, mint = off.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  Text,
  Glyph,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';

// 6 weeks of mock days
type Kind = 'day' | 'night' | 'off' | 'past' | 'empty';
const MONTH: { label: number | ''; kind: Kind }[] = [
  ...Array.from({ length: 2 }).map(() => ({ label: '' as const, kind: 'empty' as Kind })),
  ...Array.from({ length: 30 }).map((_, i): { label: number; kind: Kind } => {
    const day = i + 1;
    if (day < 20) return { label: day, kind: 'past' };
    const cycle = ['day', 'day', 'day', 'off', 'off', 'night', 'night', 'night', 'off', 'off', 'day', 'day'] as Kind[];
    return { label: day, kind: cycle[(day - 20) % cycle.length] };
  }),
];

const dotColor: Record<Kind, string> = {
  day: colors.primary,
  night: colors.dusk,
  off: colors.primaryContainer,
  past: colors.inkGhost,
  empty: 'transparent',
};

export default function Schedule() {
  return (
    <Screen
      orbs="subtle"
      scroll
      floatingFooter={
        <PillCTA
          variant="primary"
          label="+ Add shift"
          onPress={() => {
            /* TODO: S31 */
          }}
          iconLeft={<Glyph name="plus" size={18} color="onPrimary" />}
        />
      }
    >
      <View style={styles.headerRow}>
        <Pressable hitSlop={12}>
          <Glyph name="chevronLeft" size={24} color="inkMuted" />
        </Pressable>
        <Eyebrow>APRIL 2026</Eyebrow>
        <Pressable hitSlop={12}>
          <Glyph name="chevronRight" size={24} color="inkMuted" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxxl }}>
        <SerifHero>Your next four weeks.</SerifHero>
      </View>

      {/* Weekday header */}
      <View style={styles.weekdayRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} style={styles.weekdayCell}>
            <Text variant="labelMd" family="body" color="inkMuted" uppercase>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Month grid */}
      <View style={styles.grid}>
        {MONTH.map((d, i) => (
          <View key={i} style={styles.cell}>
            {d.kind !== 'empty' && (
              <>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: dotColor[d.kind], opacity: d.kind === 'past' ? 0.3 : 1 },
                  ]}
                />
                <Text
                  variant="mono"
                  family="mono"
                  color={d.kind === 'past' ? 'inkGhost' : 'inkMuted'}
                  style={{ marginTop: 4 }}
                >
                  {String(d.label).padStart(2, '0')}
                </Text>
              </>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: spacing.huge }} />

      <GlassCard variant="paper" padding="xxl">
        <Eyebrow>LEGEND</Eyebrow>
        <View style={{ height: spacing.md }} />
        {[
          { color: colors.primary, label: 'Day shift', subtitle: '07:00 – 19:00' },
          { color: colors.dusk, label: 'Night shift', subtitle: '19:00 – 07:00' },
          { color: colors.primaryContainer, label: 'Off', subtitle: 'Recovery window' },
        ].map((row) => (
          <View key={row.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: row.color }]} />
            <View style={{ flex: 1 }}>
              <Text variant="titleMd" family="display" weight="medium" color="ink">
                {row.label}
              </Text>
              <Text variant="bodyMd" color="inkSubtle">
                {row.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </GlassCard>

    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
});
