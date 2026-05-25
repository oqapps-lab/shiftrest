/**
 * S15 — Paywall (primary). Modal presentation.
 * Hero + 4 value bullets + 2 pricing cards + trial dots + CTA.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  SerifHero,
  Eyebrow,
  GlassCard,
  HeroNumber,
  PillCTA,
  Text,
  Glyph,
  ProgressDots,
} from '../components/ui';
import { colors, spacing, radii } from '../constants/tokens';
import { firstName } from '../lib/derive';
import { useOnboarding } from '../lib/onboarding/store';
import { useAuth } from '../lib/auth/store';
import { startTrial, emitChange, EVENTS } from '../lib/queries';
import { restorePurchases } from '../lib/adapty';
import { logEvent } from '../lib/events';
import { t } from '../lib/i18n';

// Lazy getter so t() runs at render time and respects current locale.
const getValueBullets = () => [
  { glyph: 'bed' as const, text: t('paywall.bullet_sleep') },
  { glyph: 'coffee' as const, text: t('paywall.bullet_caffeine') },
  { glyph: 'moon' as const, text: t('paywall.bullet_melatonin') },
  { glyph: 'sparkle' as const, text: t('paywall.bullet_transition') },
];

export default function Paywall() {
  const [plan, setPlan] = useState<'month' | 'year'>('year');
  const [submitting, setSubmitting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Apple Guideline 3.1.2(c) — legal links required on paywall.
  const TERMS_URL = 'https://oqapps.pro/legal/shiftsleep/terms';
  const PRIVACY_URL = 'https://oqapps.pro/legal/shiftsleep/privacy';

  const onRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestoring(true);
    try {
      const profile = await restorePurchases();
      const hasPremium = !!profile?.accessLevels?.premium?.isActive;
      Alert.alert(
        t('paywall.restore_title'),
        hasPremium ? t('paywall.restore_success') : t('paywall.restore_empty'),
      );
      if (hasPremium) {
        emitChange(EVENTS.subscriptionChanged);
        router.back();
      }
    } catch (e) {
      Alert.alert(t('paywall.restore_title'), t('paywall.restore_failed'));
    } finally {
      setRestoring(false);
    }
  };
  const { state: onboarding } = useOnboarding();
  const { user } = useAuth();
  // Only show the user's name in the eyebrow when we have a real one — never
  // leak mockUser.name ("Marina") in cold-start, which felt like demo-data on
  // App Store Review screenshots.
  const userName = onboarding.displayName?.trim();
  const displayName = userName ? firstName(userName).toUpperCase() : '';

  const onStartTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Anonymous user: skip the DB write. Onboarding flow gates the trial
    // upgrade behind a future signup; for now keep them moving.
    if (!user) {
      router.replace('/onboarding/notifications');
      return;
    }
    setSubmitting(true);
    const planValue = plan === 'year' ? 'premium_annual' : 'premium_monthly';
    const { error } = await startTrial(planValue);
    setSubmitting(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Don't block — still send them onward; subscription state will catch up.
      logEvent('trial_start_failed', { reason: error.message, plan: planValue });
    } else {
      logEvent('trial_started', { plan: planValue });
      emitChange(EVENTS.subscriptionChanged);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.replace('/onboarding/notifications');
  };

  return (
    <Screen
      orbs="normal"
      scroll
      tabBarClearance={false}
      footerClearance={180}
      floatingFooter={
        <>
          <PillCTA
            variant="primary"
            label={submitting ? t('paywall.starting_trial') : t('paywall.start_trial')}
            disabled={submitting}
            onPress={onStartTrial}
          />
          <Pressable
            onPress={() => router.replace('/onboarding/notifications')}
            hitSlop={12}
            style={{ alignSelf: 'center', marginTop: spacing.md }}
          >
            <Text variant="bodyMd" color="inkMuted">
              {t('paywall.maybe_later')}
            </Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => {
            // modals: prefer dismiss(); fall back to canGoBack/replace for deep-link entries
            if (router.canDismiss?.()) {
              router.dismiss();
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.close_paywall')}
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <Eyebrow>{displayName ? t('paywall.eyebrow_with_name', { name: displayName }) : t('paywall.eyebrow_plain')}</Eyebrow>
      <View style={{ marginTop: spacing.md, marginBottom: spacing.huge }}>
        <SerifHero>{t('paywall.hero')}</SerifHero>
      </View>

      {getValueBullets().map((b) => (
        <View key={b.text} style={styles.bulletRow}>
          <View style={styles.bulletIcon}>
            <Glyph name={b.glyph} size={20} color="primary" />
          </View>
          <Text variant="bodyLg" color="ink" style={{ flex: 1 }}>
            {b.text}
          </Text>
        </View>
      ))}

      <View style={{ height: spacing.xxxl }} />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPlan('year');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.year_plan', { price: '$49.99' })}
      >
        <GlassCard
          variant={plan === 'year' ? 'glass' : 'paper'}
          padding="xxl"
          style={[
            styles.planCard,
            plan === 'year' && {
              shadowColor: colors.primary,
              shadowOpacity: 0.22,
              shadowRadius: 28,
              shadowOffset: { width: 0, height: 12 },
              elevation: 10,
            },
          ]}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
                <Text variant="labelMd" color="onPrimaryContainer" uppercase weight="medium">
                  {t('paywall.best_value_save', { percent: '35' })}
                </Text>
              </View>
              <HeroNumber value="$49.99" size="md" label={t('paywall.year_label', { weekPrice: '$0.96' })} labelPosition="below" />
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: plan === 'year' ? colors.primary : colors.inkGhost },
              ]}
            >
              {plan === 'year' && <View style={styles.radioInner} />}
            </View>
          </View>
        </GlassCard>
      </Pressable>

      <View style={{ height: spacing.md }} />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPlan('month');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.month_plan', { price: '$5.99' })}
      >
        <GlassCard
          variant={plan === 'month' ? 'glass' : 'paper'}
          padding="xxl"
          style={styles.planCard}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <HeroNumber value="$5.99" size="md" label={t('paywall.monthly_label')} labelPosition="below" />
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: plan === 'month' ? colors.primary : colors.inkGhost },
              ]}
            >
              {plan === 'month' && <View style={styles.radioInner} />}
            </View>
          </View>
        </GlassCard>
      </Pressable>

      <View style={{ height: spacing.xxxl }} />

      <Eyebrow>{t('paywall.trial_timeline')}</Eyebrow>
      <View style={{ marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'flex-start' }}>
        <ProgressDots count={7} active={0} size={8} />
      </View>

      {/* Apple-required paywall footer: Restore + ToS + Privacy + auto-renewal disclosure */}
      <View style={{ marginTop: spacing.xxxl, alignItems: 'center' }}>
        <Pressable
          onPress={onRestore}
          disabled={restoring}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.restore_purchases')}
          hitSlop={12}
        >
          <Text variant="labelLg" color="primary" weight="medium" style={{ textDecorationLine: 'underline' }}>
            {restoring ? t('paywall.restore_loading') : t('paywall.restore_link')}
          </Text>
        </Pressable>

        <View style={{ height: spacing.md }} />

        <Text variant="bodyMd" color="inkSubtle" align="center" style={{ paddingHorizontal: spacing.md }}>
          {t('paywall.auto_renew_disclosure')}
        </Text>

        <View style={{ height: spacing.md }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => Linking.openURL(TERMS_URL).catch(() => null)}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.terms_link')}
            hitSlop={8}
          >
            <Text variant="labelMd" color="primary" style={{ textDecorationLine: 'underline' }}>
              {t('paywall.terms_link')}
            </Text>
          </Pressable>
          <Text variant="labelMd" color="inkSubtle" style={{ marginHorizontal: spacing.sm }}>
            ·
          </Text>
          <Pressable
            onPress={() => Linking.openURL(PRIVACY_URL).catch(() => null)}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.privacy_link')}
            hitSlop={8}
          >
            <Text variant="labelMd" color="primary" style={{ textDecorationLine: 'underline' }}>
              {t('paywall.privacy_link')}
            </Text>
          </Pressable>
        </View>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bulletIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  planCard: {},
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
