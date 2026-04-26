/**
 * S53 — Subscription screen. Trial countdown + plan summary + management
 * actions. Reads from public.subscriptions via useSubscription(); falls back
 * to mockUser only when anonymous (demo mode).
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
import { safeBack } from '../../lib/nav';
import { useAuth } from '../../lib/auth/store';
import { useSubscription } from '../../lib/queries';

type DisplayStatus = 'free' | 'trial' | 'active' | 'cancelled' | 'expired' | 'grace';

export default function Subscription() {
  const { user } = useAuth();
  const { data: sub } = useSubscription();

  // Map real DB row → display key. Anonymous demo mode → mock.
  let status: DisplayStatus;
  let subtitle: string;
  if (!user) {
    status = mockUser.subscription === 'premium' ? 'active' : (mockUser.subscription as DisplayStatus);
    subtitle =
      mockUser.subscription === 'trial'
        ? formatTrialRemaining(mockUser.trialEndsAt)
        : mockUser.subscription === 'premium'
        ? 'Renews automatically'
        : 'Unlock the full plan with a 7-day trial';
  } else if (sub?.status === 'trial' && sub.trial_end) {
    status = 'trial';
    subtitle = formatTrialRemaining(sub.trial_end);
  } else if (sub?.status === 'active') {
    status = 'active';
    subtitle =
      sub.plan === 'premium_annual'
        ? 'Premium · annual · renews automatically'
        : 'Premium · monthly · renews automatically';
  } else if (sub?.status === 'grace_period') {
    status = 'grace';
    subtitle = 'Payment retrying — keep an eye on your inbox';
  } else if (sub?.status === 'cancelled') {
    status = 'cancelled';
    subtitle = sub.current_period_end
      ? `Premium until ${new Date(sub.current_period_end).toLocaleDateString()}`
      : 'Cancelled — you keep premium until period end';
  } else if (sub?.status === 'expired') {
    status = 'expired';
    subtitle = 'Resubscribe to keep your insights';
  } else {
    status = 'free';
    subtitle = 'Unlock the full plan with a 7-day trial';
  }

  const headlineByStatus: Record<DisplayStatus, string> = {
    free: 'Free tier',
    trial: 'Trial in progress',
    active: 'Premium · active',
    grace: 'Payment retrying',
    cancelled: 'Cancelled',
    expired: 'Premium expired',
  };

  const isPremiumLike = status === 'active' || status === 'trial' || status === 'grace';

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        !isPremiumLike ? (
          <PillCTA
            variant="primary"
            label={status === 'free' ? 'Start 7-day trial' : 'Resubscribe'}
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
        onPress={() => safeBack('/(tabs)/profile')}
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
        <Eyebrow color={isPremiumLike ? 'primary' : 'inkMuted'}>
          {headlineByStatus[status].toUpperCase()}
        </Eyebrow>
        <Text
          variant="titleLg"
          family="display"
          weight="light"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {subtitle}
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
