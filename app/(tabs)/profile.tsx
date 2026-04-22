/**
 * S50 — Profile Overview. Streak heatmap + 3 quick stats + settings list.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
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
import { mockUser, mockProfessions } from '../../mock/user';
import { formatTrialRemaining } from '../../lib/derive';
import { useAuth } from '../../lib/auth/store';
import { useOnboarding } from '../../lib/onboarding/store';

const STREAK_LENGTH = 14;
const STREAK_DOTS = Array.from({ length: STREAK_LENGTH }).map((_, i) => {
  const ratio = (i + 1) / STREAK_LENGTH;
  return { opacity: 0.25 + ratio * 0.75 };
});

export default function Profile() {
  const { user, signOut } = useAuth();
  const { state: onboarding, reset: resetOnboarding } = useOnboarding();

  // Display name preference:
  //   onboarding.displayName (set in S11) →
  //   real auth user_metadata.display_name →
  //   email local part →
  //   mockUser.name (fallback so Stage-5 demo data still shows)
  const displayName =
    (onboarding.displayName?.trim() ||
      (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
      user?.email?.split('@')[0] ||
      mockUser.name);

  // Profession label preference: pick from mockProfessions catalogue when
  // user picked one in S02, else fall back to mockUser.profession label.
  const professionLabel =
    mockProfessions.find((p) => p.id === onboarding.profession)?.title ??
    mockUser.profession;

  const subscriptionSubtitle =
    mockUser.subscription === 'trial'
      ? `Trial · ${formatTrialRemaining(mockUser.trialEndsAt)}`
      : mockUser.subscription === 'premium'
      ? 'Premium · active'
      : 'Free tier';

  const accountRow = user
    ? {
        glyph: 'user' as const,
        label: 'Account',
        subtitle: user.email ?? 'Signed in',
        onPress: () => {
          Alert.alert('Sign out?', 'You can sign back in any time.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign out',
              style: 'destructive',
              onPress: async () => {
                await signOut();
              },
            },
          ]);
        },
      }
    : {
        glyph: 'sparkle' as const,
        label: 'Save your account',
        subtitle: 'Sync your plan, never lose your streak',
        onPress: () => router.push('/auth/signup'),
      };

  const restartOnboardingRow = {
    glyph: 'sparkle' as const,
    label: 'Restart onboarding (dev)',
    subtitle: 'Wipe quiz answers and replay from S02',
    onPress: () => {
      Alert.alert(
        'Restart onboarding?',
        'Wipes saved quiz answers. Useful for demo / QA.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restart',
            style: 'destructive',
            onPress: () => {
              resetOnboarding();
              router.replace('/onboarding/profession');
            },
          },
        ],
      );
    },
  };

  const SETTINGS: Array<{
    glyph: 'gear' | 'bell' | 'sparkle' | 'user';
    label: string;
    subtitle: string;
    onPress: (() => void) | undefined;
  }> = [
    accountRow,
    { glyph: 'gear', label: 'Sleep preferences', subtitle: 'Chronotype · caffeine · melatonin', onPress: undefined },
    { glyph: 'bell', label: 'Notifications', subtitle: 'Reminder timing & types', onPress: undefined },
    { glyph: 'sparkle', label: 'Subscription', subtitle: subscriptionSubtitle, onPress: undefined },
    { glyph: 'user', label: 'About & support', subtitle: 'FAQ · contact · sources', onPress: undefined },
    restartOnboardingRow,
  ];
  return (
    <Screen orbs="subtle" variant="dim" scroll>
      <Eyebrow>PROFILE</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>{`${displayName} · ${professionLabel}.`}</SerifHero>
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
        <GlassCard variant="glass" padding="lg" style={styles.stat}>
          <Eyebrow size="md">DAYS</Eyebrow>
          <HeroNumber value={mockUser.daysInApp} size="md" />
        </GlassCard>
        <View style={{ width: spacing.sm }} />
        <GlassCard variant="glass" padding="lg" style={styles.stat}>
          <Eyebrow size="md">PLANS</Eyebrow>
          <HeroNumber value={mockUser.transitionsCompleted} size="md" />
        </GlassCard>
        <View style={{ width: spacing.sm }} />
        <GlassCard variant="glass" padding="lg" style={styles.stat}>
          <Eyebrow size="md">ON PLAN</Eyebrow>
          <HeroNumber value={mockUser.adherence} size="md" unit="%" />
        </GlassCard>
      </View>

      <View style={{ height: spacing.huge }} />

      <Eyebrow>SETTINGS</Eyebrow>
      <View style={{ height: spacing.md }} />

      {SETTINGS.map((row) => (
        <Pressable
          key={row.label}
          onPress={row.onPress}
          disabled={!row.onPress}
          style={{ marginBottom: spacing.sm }}
        >
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
              {row.onPress && <Glyph name="chevronRight" size={18} color="inkMuted" />}
            </View>
          </GlassCard>
        </Pressable>
      ))}

      {/* Hint when in demo mode (no Supabase keys) */}
      {!user && (
        <View style={{ marginTop: spacing.md }}>
          <Text variant="bodyMd" color="inkMuted" align="center">
            {"Anonymous mode — your data lives only on this device until you save an account."}
          </Text>
        </View>
      )}
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
