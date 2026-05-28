/**
 * S15 — Paywall (primary). Modal presentation.
 *
 * Hero + 4 value bullets + 3 pricing tiers (Weekly / Monthly / Yearly)
 * + 3-day trial dots + CTA + Apple-required legal footer.
 *
 * Pricing strategy per docs/01-research/2026-05-25/funnel-and-paywall-brief.md:
 *   - Annual auto-selected, "Save 81%" badge (vs weekly equivalent)
 *   - 3-day trial (RevenueCat 2026: 1.5x LTV vs 7-day)
 *   - Localized prices via Adapty.getPaywallProducts; hardcoded fallback
 *     for Expo Go / pre-activation / cold-start
 *   - Refund clarity line ("Cancel anytime. We never email asking you back.")
 */

import React, { useEffect, useState } from 'react';
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
import {
  restorePurchases,
  loadPaywallProducts,
  purchaseProduct,
} from '../lib/adapty';
import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { logEvent } from '../lib/events';
import { t } from '../lib/i18n';

type Plan = 'week' | 'month' | 'year';

// Hardcoded fallbacks — used in Expo Go (no native Adapty) and as the
// pre-load skeleton state. Real prices come from Adapty.getPaywallProducts.
const FALLBACK_PRICES: Record<Plan, string> = {
  week: '$4.99',
  month: '$9.99',
  year: '$49.99',
};

// Vendor IDs must match ASC IAPs.
const VENDOR_ID: Record<Plan, string> = {
  week: 'shiftrest.premium.weekly',
  month: 'shiftrest.premium.monthly',
  year: 'shiftrest.premium.yearly',
};

const PLAN_TO_DB: Record<Plan, 'premium_weekly' | 'premium_monthly' | 'premium_annual'> = {
  week: 'premium_weekly',
  month: 'premium_monthly',
  year: 'premium_annual',
};

// Lazy getter so t() runs at render time and respects current locale.
const getValueBullets = () => [
  { glyph: 'bed' as const, text: t('paywall.bullet_sleep') },
  { glyph: 'coffee' as const, text: t('paywall.bullet_caffeine') },
  { glyph: 'moon' as const, text: t('paywall.bullet_melatonin') },
  { glyph: 'sparkle' as const, text: t('paywall.bullet_transition') },
];

export default function Paywall() {
  const [plan, setPlan] = useState<Plan>('year');
  const [submitting, setSubmitting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [products, setProducts] = useState<Record<Plan, AdaptyPaywallProduct | null>>({
    week: null,
    month: null,
    year: null,
  });

  // Apple Guideline 3.1.2(c) — legal links required on paywall.
  const TERMS_URL = 'https://oqapps.pro/legal/shiftsleep/terms';
  const PRIVACY_URL = 'https://oqapps.pro/legal/shiftsleep/privacy';

  // Load Adapty products on mount. On Expo Go or pre-activation this returns
  // null and we fall back to hardcoded USD prices — the UI is unchanged.
  useEffect(() => {
    let alive = true;
    loadPaywallProducts().then((res) => {
      if (!alive || !res) return;
      const map: Record<Plan, AdaptyPaywallProduct | null> = { week: null, month: null, year: null };
      for (const p of res.products) {
        const planKey = (Object.keys(VENDOR_ID) as Plan[]).find(
          (k) => VENDOR_ID[k] === p.vendorProductId,
        );
        if (planKey) map[planKey] = p;
      }
      setProducts(map);
    });
    return () => {
      alive = false;
    };
  }, []);

  const priceFor = (p: Plan): string => {
    return products[p]?.price?.localizedString ?? FALLBACK_PRICES[p];
  };

  // For the "save 81%" badge: $4.99/wk × 52 = $259.48; $49.99/yr ⇒ 81% off.
  // Computed from the actual loaded annual + weekly when available; otherwise
  // the static value from the funnel brief.
  const annualSavingsPct = (() => {
    const week = products.week?.price?.amount;
    const year = products.year?.price?.amount;
    if (week && year) {
      const weeklyEquivalent = week * 52;
      const pct = Math.round(((weeklyEquivalent - year) / weeklyEquivalent) * 100);
      return pct > 0 ? String(pct) : '81';
    }
    return '81';
  })();

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
        // BN3: paywall may be the root screen (onboarding deeplink, push
        // notification entry). After successful restore, router.back() is
        // a silent no-op in that case — fall back to /(tabs) so the user
        // actually leaves the paywall.
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch {
      Alert.alert(t('paywall.restore_title'), t('paywall.restore_failed'));
    } finally {
      setRestoring(false);
    }
  };

  const { state: onboarding } = useOnboarding();
  const { user } = useAuth();
  // Only show the user's name in the eyebrow when we have a real one — never
  // leak mockUser.name in cold-start, which felt like demo-data on App Store
  // Review screenshots.
  const userName = onboarding.displayName?.trim();
  const displayName = userName ? firstName(userName).toUpperCase() : '';

  const onStartTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const selectedProduct = products[plan];
    const planValue = PLAN_TO_DB[plan];

    // 1) If we have a real Adapty product (TestFlight / device): hit StoreKit.
    if (selectedProduct) {
      setSubmitting(true);
      try {
        const result = await purchaseProduct(selectedProduct);
        // AdaptyPurchaseResult variants: 'success' | 'user_cancelled' | 'pending'
        if (result.type === 'success') {
          logEvent('purchase_success', { plan: planValue, vendorId: selectedProduct.vendorProductId });
          emitChange(EVENTS.subscriptionChanged);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/onboarding/notifications');
          return;
        }
        if (result.type === 'user_cancelled') {
          // Silent — user actively chose to dismiss the sheet.
          setSubmitting(false);
          return;
        }
        // 'pending' or other: treat as soft success (Apple sometimes delays)
        logEvent('purchase_pending', { plan: planValue });
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        logEvent('purchase_failed', { plan: planValue, reason: String(err) });
        Alert.alert(t('paywall.restore_title'), t('paywall.restore_failed'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 2) Expo Go fallback path: no native StoreKit. Honour the existing
    //    anon-flow → skip DB write, just continue onboarding.
    if (!user) {
      router.replace('/onboarding/notifications');
      return;
    }

    // 3) Signed-in user without Adapty product (very rare — placement not
    //    configured?): preserve the old Supabase-RPC trial path so we never
    //    block the funnel.
    setSubmitting(true);
    const { error } = await startTrial(planValue);
    setSubmitting(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      logEvent('trial_start_failed', { reason: error.message, plan: planValue });
    } else {
      logEvent('trial_started', { plan: planValue });
      emitChange(EVENTS.subscriptionChanged);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.replace('/onboarding/notifications');
  };

  const renderPlanCard = (p: Plan, isAnnual: boolean) => {
    const isActive = plan === p;
    const labelKey = isAnnual
      ? t('paywall.year_label', { weekPrice: weekEquivalentForYear() })
      : p === 'month'
        ? t('paywall.monthly_label')
        : t('paywall.weekly_label');
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPlan(p);
        }}
        accessibilityRole="button"
        accessibilityLabel={t(`a11y.${p}_plan`, { price: priceFor(p) })}
      >
        <GlassCard
          variant={isActive ? 'glass' : 'paper'}
          padding="xxl"
          style={[
            styles.planCard,
            isActive && isAnnual && {
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
              {isAnnual && (
                <View style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="labelMd" color="onPrimaryContainer" uppercase weight="medium">
                    {t('paywall.best_value_save', { percent: annualSavingsPct })}
                  </Text>
                </View>
              )}
              <HeroNumber value={priceFor(p)} size="md" label={labelKey} labelPosition="below" />
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: isActive ? colors.primary : colors.inkGhost },
              ]}
            >
              {isActive && <View style={styles.radioInner} />}
            </View>
          </View>
        </GlassCard>
      </Pressable>
    );
  };

  // Per-week equivalent for the annual tier ($49.99 / 52 ≈ $0.96).
  const weekEquivalentForYear = (): string => {
    const yearAmount = products.year?.price?.amount;
    const sym = products.year?.price?.currencySymbol ?? '$';
    if (yearAmount) {
      const w = (yearAmount / 52).toFixed(2);
      return `${sym}${w}`;
    }
    return '$0.96';
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
          onPress={() => router.replace('/onboarding/notifications')}
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

      {/* Annual = visually dominant, default-selected anchor */}
      {renderPlanCard('year', true)}
      <View style={{ height: spacing.md }} />
      {renderPlanCard('month', false)}
      <View style={{ height: spacing.md }} />
      {renderPlanCard('week', false)}

      <View style={{ height: spacing.xxxl }} />

      <Eyebrow>{t('paywall.trial_timeline')}</Eyebrow>
      <View style={{ marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'flex-start' }}>
        <ProgressDots count={3} active={0} size={8} />
      </View>

      {/* Apple-required paywall footer: Restore + ToS + Privacy + auto-renew disclosure */}
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

        {/* Anti-dark-pattern clarity — addresses the #1 complaint about RISE
            (per 2026-05-25 funnel research). Differentiator copy. */}
        <Text variant="bodyMd" color="inkSubtle" align="center" style={{ paddingHorizontal: spacing.md }}>
          {t('paywall.cancel_clarity')}
        </Text>

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
