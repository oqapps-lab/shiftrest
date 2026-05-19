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
import { t } from '../../lib/i18n';

type DisplayStatus = 'free' | 'trial' | 'active' | 'cancelled' | 'expired' | 'grace';

export default function Subscription() {
  const { user } = useAuth();
  const { data: sub } = useSubscription();

  // Trial is "in progress" only while trial_end is still in the future. Once
  // it lapses, formatTrialRemaining returns "expired" — we need to switch the
  // headline to match (otherwise UI shows "TRIAL IN PROGRESS · expired").
  const trialIsExpired = (trialEnd: string | null | undefined): boolean => {
    if (!trialEnd) return false;
    return formatTrialRemaining(trialEnd) === 'expired';
  };

  // Map real DB row → display key. Anonymous demo mode → mock.
  let status: DisplayStatus;
  let subtitle: string;
  if (!user) {
    if (mockUser.subscription === 'trial' && trialIsExpired(mockUser.trialEndsAt)) {
      status = 'expired';
      subtitle = t('settings_screens.subscription.sub.expired');
    } else {
      status = mockUser.subscription === 'premium' ? 'active' : (mockUser.subscription as DisplayStatus);
      subtitle =
        mockUser.subscription === 'trial'
          ? formatTrialRemaining(mockUser.trialEndsAt)
          : mockUser.subscription === 'premium'
          ? t('settings_screens.subscription.sub.renews_auto')
          : t('settings_screens.subscription.sub.free');
    }
  } else if (sub?.status === 'trial' && sub.trial_end) {
    if (trialIsExpired(sub.trial_end)) {
      status = 'expired';
      subtitle = t('settings_screens.subscription.sub.expired');
    } else {
      status = 'trial';
      subtitle = formatTrialRemaining(sub.trial_end);
    }
  } else if (sub?.status === 'active') {
    status = 'active';
    subtitle =
      sub.plan === 'premium_annual'
        ? t('settings_screens.subscription.sub.active_annual')
        : t('settings_screens.subscription.sub.active_monthly');
  } else if (sub?.status === 'grace_period') {
    status = 'grace';
    subtitle = t('settings_screens.subscription.sub.grace');
  } else if (sub?.status === 'cancelled') {
    status = 'cancelled';
    subtitle = sub.current_period_end
      ? t('settings_screens.subscription.sub.cancelled_until', { date: new Date(sub.current_period_end).toLocaleDateString() })
      : t('settings_screens.subscription.sub.cancelled_no_date');
  } else if (sub?.status === 'expired') {
    status = 'expired';
    subtitle = t('settings_screens.subscription.sub.expired');
  } else {
    status = 'free';
    subtitle = t('settings_screens.subscription.sub.free');
  }

  const headlineByStatus: Record<DisplayStatus, string> = {
    free: t('settings_screens.subscription.headline.free'),
    trial: t('settings_screens.subscription.headline.trial'),
    active: t('settings_screens.subscription.headline.active'),
    grace: t('settings_screens.subscription.headline.grace'),
    cancelled: t('settings_screens.subscription.headline.cancelled'),
    expired: t('settings_screens.subscription.headline.expired'),
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
            label={t('settings_screens.subscription.manage_store')}
            onPress={() =>
              Linking.openURL('https://apps.apple.com/account/subscriptions').catch(
                () => Alert.alert(t('settings_screens.subscription.store_unavailable')),
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
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('settings_screens.eyebrow')}</Eyebrow>
      <HeroNumber
        value={t('settings_screens.subscription.title')}
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
        <Eyebrow>{t('settings_screens.subscription.plan_includes')}</Eyebrow>
        {[
          { glyph: 'bed' as const, text: t('settings_screens.subscription.bullets.sleep') },
          { glyph: 'coffee' as const, text: t('settings_screens.subscription.bullets.caffeine') },
          { glyph: 'moon' as const, text: t('settings_screens.subscription.bullets.melatonin') },
          { glyph: 'sparkle' as const, text: t('settings_screens.subscription.bullets.transition') },
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
              t('settings_screens.subscription.restore_title'),
              t('settings_screens.subscription.restore_placeholder'),
            )
          }
          hitSlop={12}
          style={styles.linkRow}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.restore_purchases')}
        >
          <Text variant="bodyLg" color="primary" weight="medium">
            {t('settings_screens.subscription.restore_link')}
          </Text>
        </Pressable>

        <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.lg }}>
          {t('settings_screens.subscription.auto_renew_notice')}
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
