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
import { View, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
  showAppDialog,
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
  getTrialEligibility,
  getIntroTrialDays,
} from '../lib/adapty';
import { scheduleTrialEndingReminder } from '../lib/notifications';
import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { logEvent } from '../lib/events';
import i18n, { t } from '../lib/i18n';

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

// G5: fallback trial length when no product is loaded (Expo Go / pre-load) or
// the loaded product carries no readable intro period. Matches the 7-day free
// trial configured in App Store Connect. The REAL length is read off the
// loaded product (getIntroTrialDays) so the copy degrades safely if ASC ever
// changes it — this constant is only the acquisition-default marketing value.
const TRIAL_DAYS = 7;

// F5: the subscription's full value, not 4 vague bullets. Lazy getter so t()
// runs at render time and respects the active locale.
const getPremiumFeatures = () => [
  { glyph: 'moon' as const,     title: t('paywall.f_window_t'),     sub: t('paywall.f_window_s') },
  { glyph: 'coffee' as const,   title: t('paywall.f_caffeine_t'),   sub: t('paywall.f_caffeine_s') },
  { glyph: 'sun' as const,      title: t('paywall.f_light_t'),      sub: t('paywall.f_light_s') },
  { glyph: 'sparkle' as const,  title: t('paywall.f_transition_t'), sub: t('paywall.f_transition_s') },
  { glyph: 'calendar' as const, title: t('paywall.f_anyday_t'),     sub: t('paywall.f_anyday_s') },
  { glyph: 'pulse' as const,    title: t('paywall.f_history_t'),    sub: t('paywall.f_history_s') },
  { glyph: 'book' as const,     title: t('paywall.f_library_t'),    sub: t('paywall.f_library_s') },
  { glyph: 'bed' as const,      title: t('paywall.f_recovery_t'),   sub: t('paywall.f_recovery_s') },
  { glyph: 'leaf' as const,     title: t('paywall.f_melatonin_t'),  sub: t('paywall.f_melatonin_s') },
  { glyph: 'bell' as const,     title: t('paywall.f_reminders_t'),  sub: t('paywall.f_reminders_s') },
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

  // Apple Guideline 3.1.2(c) — legal links required on paywall. D7: these
  // now open in-app legal screens (/legal/*) instead of an external browser.

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

  // ── G5: trial eligibility + dynamic length, driven by the SELECTED product ──
  const selectedProduct = products[plan];

  // Eligibility gate (Apple 3.1.2(c)): only HIDE the trial path when StoreKit
  // explicitly reports the user is ineligible (loaded product with no intro
  // free-trial offer). 'unknown' (Expo Go / pre-load — no StoreKit to query)
  // keeps the trial marketing copy, which is the correct acquisition default.
  const trialEligible = getTrialEligibility(selectedProduct) !== 'ineligible';

  // Real trial length from the product's intro offer when available, else the
  // ASC-configured fallback. Length-agnostic: P7D→7, P3D→3, etc.
  const trialDays = getIntroTrialDays(selectedProduct) ?? TRIAL_DAYS;

  // Exact charge date (today + trialDays), localised. Apple/funnel: show the
  // precise date money will move BEFORE the user confirms.
  const chargeDateLabel = (() => {
    const d = new Date();
    d.setDate(d.getDate() + trialDays);
    try {
      return new Intl.DateTimeFormat(i18n.locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    } catch {
      // Some Hermes/locale combos throw on unusual tags — fall back to ISO date.
      return d.toISOString().slice(0, 10);
    }
  })();

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
      showAppDialog({
        title: t('paywall.restore_title'),
        message: hasPremium ? t('paywall.restore_success') : t('paywall.restore_empty'),
        actions: [{ label: t('a11y.close'), style: 'cancel' }],
      });
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
      showAppDialog({
        title: t('paywall.restore_title'),
        message: t('paywall.restore_failed'),
        actions: [{ label: t('a11y.close'), style: 'cancel' }],
      });
    } finally {
      setRestoring(false);
    }
  };

  const { state: onboarding } = useOnboarding();
  const { user } = useAuth();

  // AUDIT-D: the paywall is reached from onboarding (aha) AND from in-app
  // teasers (Settings / Today). Only the onboarding entry should advance the
  // funnel to the notifications step on exit; in-app entries must return to
  // where they came from instead of dumping the user into onboarding.
  const { from } = useLocalSearchParams<{ from?: string }>();
  const leavePaywall = () => {
    if (from === 'onboarding') {
      router.replace('/onboarding/notifications');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };
  // Only show the user's name in the eyebrow when we have a real one — never
  // leak mockUser.name in cold-start, which felt like demo-data on App Store
  // Review screenshots.
  const userName = onboarding.displayName?.trim();
  const displayName = userName ? firstName(userName).toUpperCase() : '';

  const onStartTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const selectedProduct = products[plan];
    const planValue = PLAN_TO_DB[plan];

    // F4: on a real build, Adapty products should always load. If they did
    // not (placement/IAP misconfig or no network), do NOT silently advance —
    // that reads as a dead button. Tell the user. __DEV__ keeps the Expo Go
    // demo flow (no native StoreKit there).
    if (!selectedProduct && !__DEV__) {
      showAppDialog({
        title: t('paywall.products_unavailable_title'),
        message: t('paywall.products_unavailable_body'),
        actions: [{ label: t('a11y.close'), style: 'cancel' }],
      });
      return;
    }

    // 1) If we have a real Adapty product (TestFlight / device): hit StoreKit.
    if (selectedProduct) {
      setSubmitting(true);
      try {
        const result = await purchaseProduct(selectedProduct);
        // AdaptyPurchaseResult variants: 'success' | 'user_cancelled' | 'pending'
        if (result.type === 'success') {
          logEvent('purchase_success', { plan: planValue, vendorId: selectedProduct.vendorProductId });
          emitChange(EVENTS.subscriptionChanged);
          // G5: if this purchase actually started a free trial, schedule the
          // single "trial ends tomorrow" reminder. No-op when notifications
          // aren't yet granted (paywall precedes the permission screen) — the
          // scheduler never prompts here.
          if (trialEligible) {
            scheduleTrialEndingReminder(trialDays).catch(() => null);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          leavePaywall();
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
        showAppDialog({
          title: t('paywall.restore_title'),
          message: t('paywall.restore_failed'),
          actions: [{ label: t('a11y.close'), style: 'cancel' }],
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 2) Expo Go fallback path: no native StoreKit. Honour the existing
    //    anon-flow → skip DB write, just continue onboarding.
    if (!user) {
      leavePaywall();
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
      // G5: same trial-ending reminder for the Supabase-RPC trial path.
      if (trialEligible) {
        scheduleTrialEndingReminder(trialDays).catch(() => null);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    leavePaywall();
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

  // G4/G5: trial disclosure directly under the CTA (Apple 3.1.2(c)) — name the
  // exact price + period of the selected plan so the terms are clear before the
  // user taps. When the user is ineligible for the trial (3.1.2(c)) we MUST NOT
  // advertise "{{days}} days free" — swap to the no-trial price line. Mirrors
  // the Vitaminico/Sugar Quit pattern.
  const subKey = trialEligible
    ? (`paywall.cta_sub_${plan}` as const)
    : (`paywall.cta_sub_notrial_${plan}` as const);
  const ctaSubtext = trialEligible
    ? t(subKey, { days: trialDays, price: priceFor(plan) })
    : t(subKey, { price: priceFor(plan) });

  // CTA label: trial → "Start {{days}}-day free trial"; ineligible → a plain
  // "Subscribe — {{price}} / {{period}}" so we never promise an unavailable
  // offer. The "starting…" state is shared.
  const ctaLabel = submitting
    ? t('paywall.starting_trial')
    : trialEligible
      ? t('paywall.start_trial', { days: trialDays })
      : t(`paywall.subscribe_now_${plan}` as const, { price: priceFor(plan) });

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
            label={ctaLabel}
            disabled={submitting}
            onPress={onStartTrial}
          />
          <Text
            variant="bodyMd"
            color="inkSubtle"
            align="center"
            style={{ marginTop: spacing.sm, paddingHorizontal: spacing.md }}
          >
            {ctaSubtext}
          </Text>
          <Pressable
            onPress={() => leavePaywall()}
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
          onPress={() => leavePaywall()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.close_paywall')}
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <Eyebrow>{displayName ? t('paywall.eyebrow_with_name', { name: displayName }) : t('paywall.eyebrow_plain')}</Eyebrow>
      <View style={{ marginTop: spacing.md, marginBottom: spacing.huge }}>
        <SerifHero>{t('paywall.hero', { days: trialDays })}</SerifHero>
      </View>

      <Eyebrow>{t('paywall.unlock_header')}</Eyebrow>
      <View style={{ height: spacing.md }} />
      {getPremiumFeatures().map((f) => (
        <View key={f.title} style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Glyph name={f.glyph} size={18} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {f.title}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 1, lineHeight: 20 }}>
              {f.sub}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ height: spacing.lg }} />
      {/* Trust / authority — text-only, no fabricated reviews (Apple 2.3.7/5.2.1) */}
      <GlassCard variant="whisper" padding="lg">
        <Text variant="bodyMd" color="inkSubtle" style={{ lineHeight: 22 }}>
          {t('paywall.trust')}
        </Text>
      </GlassCard>

      <View style={{ height: spacing.xxxl }} />

      {/* Annual = visually dominant, default-selected anchor */}
      {renderPlanCard('year', true)}
      <View style={{ height: spacing.md }} />
      {renderPlanCard('month', false)}
      <View style={{ height: spacing.md }} />
      {renderPlanCard('week', false)}

      <View style={{ height: spacing.xxxl }} />

      {/* G5: trial timeline — only shown when the user is eligible for the
          trial (Apple 3.1.2(c)). A clean 3-node timeline (not N cramped dots)
          that scales to any trial length, plus the exact charge-date line. */}
      {trialEligible && (
        <>
          <Eyebrow>{t('paywall.trial_timeline', { days: trialDays })}</Eyebrow>
          <View style={{ marginTop: spacing.md }}>
            {[
              { glyph: 'sparkle' as const, text: t('paywall.timeline_today') },
              { glyph: 'bell' as const, text: t('paywall.timeline_reminder', { day: Math.max(trialDays - 1, 1) }) },
              { glyph: 'calendar' as const, text: t('paywall.timeline_charge', { days: trialDays, price: priceFor(plan) }) },
            ].map((node, i, arr) => (
              <View key={node.text} style={styles.timelineRow}>
                <View style={styles.timelineCol}>
                  <View style={styles.timelineNode}>
                    <Glyph name={node.glyph} size={14} color="primary" />
                  </View>
                  {i < arr.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <Text variant="bodyMd" color="ink" style={styles.timelineText}>
                  {node.text}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ height: spacing.md }} />
          <Text variant="bodyMd" color="inkSubtle" style={{ paddingHorizontal: spacing.xs }}>
            {t('paywall.charge_on_' + plan, { date: chargeDateLabel, price: priceFor(plan) })}
          </Text>
        </>
      )}

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
            onPress={() => router.push('/legal/terms')}
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
            onPress={() => router.push('/legal/privacy')}
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
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
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
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineCol: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: colors.inkGhost,
    marginVertical: 2,
  },
  timelineText: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: spacing.md,
  },
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
