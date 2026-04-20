/**
 * S50 — Profile Overview. Streak heatmap + 3 quick stats + settings list.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  HeroNumber,
  Text,
  Glyph,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { mockUser } from '../../mock/user';

const STREAK_LENGTH = 14;
const STREAK_DOTS = Array.from({ length: STREAK_LENGTH }).map((_, i) => {
  const ratio = (i + 1) / STREAK_LENGTH;
  return { opacity: 0.25 + ratio * 0.75 };
});

const SETTINGS = [
  { glyph: 'gear' as const, label: 'Sleep preferences', subtitle: 'Chronotype · caffeine · melatonin' },
  { glyph: 'bell' as const, label: 'Notifications', subtitle: 'Reminder timing & types' },
  { glyph: 'sparkle' as const, label: 'Subscription', subtitle: 'Trial · 6 days left' },
  { glyph: 'user' as const, label: 'About & support', subtitle: 'FAQ · contact · sources' },
];

export default function Profile() {
  return (
    <Screen orbs="subtle" variant="dim" scroll>
      <Eyebrow>PROFILE</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>{`${mockUser.name} · ${mockUser.profession}.`}</SerifHero>
      </View>

      <Eyebrow>{`${mockUser.streak}-DAY STREAK`}</Eyebrow>
      <View style={styles.streakRow}>
        {STREAK_DOTS.map((d, i) => (
          <View
            key={i}
            style={[
              styles.streakDot,
              {
                backgroundColor: colors.primary,
                opacity: d.opacity,
              },
              i === STREAK_DOTS.length - 1 && styles.streakDotActive,
            ]}
          />
        ))}
      </View>

      <View style={{ height: spacing.huge }} />

      <View style={styles.statsRow}>
        <GlassCard variant="glass" padding="xl" style={styles.stat}>
          <Eyebrow size="md">DAYS</Eyebrow>
          <HeroNumber value={mockUser.daysInApp} size="md" />
        </GlassCard>
        <View style={{ width: spacing.sm }} />
        <GlassCard variant="glass" padding="xl" style={styles.stat}>
          <Eyebrow size="md">TRANSITIONS</Eyebrow>
          <HeroNumber value={mockUser.transitionsCompleted} size="md" />
        </GlassCard>
        <View style={{ width: spacing.sm }} />
        <GlassCard variant="glass" padding="xl" style={styles.stat}>
          <Eyebrow size="md">ADHERENCE</Eyebrow>
          <HeroNumber value={mockUser.adherence} size="md" unit="%" />
        </GlassCard>
      </View>

      <View style={{ height: spacing.huge }} />

      <Eyebrow>SETTINGS</Eyebrow>
      <View style={{ height: spacing.md }} />

      {SETTINGS.map((row) => (
        <Pressable key={row.label} style={{ marginBottom: spacing.sm }}>
          <GlassCard variant="whisper" padding="xl">
            <View style={styles.settingsRow}>
              <View style={styles.settingsIcon}>
                <Glyph name={row.glyph} size={20} color="primary" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {row.label}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {row.subtitle}
                </Text>
              </View>
              <Glyph name="chevronRight" size={18} color="inkMuted" />
            </View>
          </GlassCard>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 6,
  },
  streakDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  streakDotActive: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
});
