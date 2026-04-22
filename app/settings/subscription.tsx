/**
 * S53 — Subscription screen. Trial countdown + plan summary + management
 * actions. Adapty wiring lands in Stage 7; for now we read from
 * mockUser.subscription + mockUser.trialEndsAt.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  Eyebrow,
  HeroNumber,
  Text,
  GlassCard,
  Glyph,
  PillCTA,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { mockUser } from '../../mock/user';
import { formatTrialRemaining } from '../../lib/derive';

export default function Subscription() {
  const status = mockUser.subscription;
  const trialLine = formatTrialRemaining(mockUser.trialEndsAt);

  const headlineByStatus: Record<typeof mockUser.subscription, string> = {
    free: 'Free tier',
    trial: 'Trial in progress',
    premium: 'Premium · active',
  } as const;

  const subtitleByStatus: Record<typeof mockUser.subscription, string> = {
    free: 'Unlock the full plan with a 7-day trial',
    trial: trialLine,
    premium: 'Renews automatically',
  } as const;

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        status === 'free' ? (
          <PillCTA
            variant="primary"
            label="Start 7-day trial"
            onPress={() => router.push('/paywall')}
          />
        ) : (
          <PillCTA
            variant="glass"
            size="md"
            label="Manage in App Store"
            onPress={() =>
              Linking.openURL('https://apps.apple.com/account/subscriptions').catch(
                () => Alert.alert('Could not open App Store'),
              )
            }
          />
        )
      }
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>SETTINGS</Eyebrow>
      <HeroNumber
        value="Subscription"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <GlassCard
        variant="glass"
        padding="xxl"
        style={{ marginTop: spacing.huge }}
      >
        <Eyebrow color={status === 'premium' ? 'primary' : 'inkMuted'}>
          {headlineByStatus[status].toUpperCase()}
        </Eyebrow>
        <Text
          variant="titleLg"
          family="display"
          weight="light"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {subtitleByStatus[status]}
        </Text>
      </GlassCard>

      {/* Plan benefits */}
      <View style={{ marginTop: spacing.huge }}>
        <Eyebrow>YOUR PLAN INCLUDES</Eyebrow>
        {[
          { glyph: 'bed' as const, text: 'Personalised sleep window' },
          { glyph: 'coffee' as const, text: 'Caffeine cutoff by sensitivity' },
          { glyph: 'moon' as const, text: 'Melatonin timing for your chronotype' },
          { glyph: 'sparkle' as const, text: 'Multi-day transition plans' },
        ].map((b) => (
          <View key={b.text} style={styles.bulletRow}>
            <View style={styles.bulletIcon}>
              <Glyph name={b.glyph} size={18} color="primary" />
            </View>
            <Text variant="bodyLg" color="ink" style={{ flex: 1 }}>
              {b.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Restore + legal */}
      <View style={{ marginTop: spacing.huge }}>
        <Pressable
          onPress={() =>
            Alert.alert(
              'Restore purchases',
              'Adapty wiring lands in Stage 7. For now, this is a placeholder.',
            )
          }
          hitSlop={12}
          style={styles.linkRow}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          <Text variant="bodyLg" color="primary" weight="medium">
            Restore purchases
          </Text>
        </Pressable>

        <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.lg }}>
          {"Subscriptions auto-renew until cancelled. Cancel any time from your App Store account."}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  linkRow: {
    alignSelf: 'flex-start',
  },
});
