/**
 * TODAY-9 — "Sleep debt" card.
 *
 * Turns the optional hours ledger (lib/sleep-hours/store) into a tracked
 * metric on Today: cumulative sleep debt, a severity band, and a rough
 * recovery estimate. ONE card by design (anti-bloat).
 *
 * Three states:
 *  - PREMIUM + at least one logged-hours day → the real metric:
 *      "Sleep debt: {{h}}h · {{severity}} · clears in ~{{n}} days"
 *    tinted by severity (calm sage when none/mild → warm sunrise at moderate →
 *    coral at severe).
 *  - PREMIUM + NO hours logged yet → an HONEST empty state that explains how
 *    to start tracking. NO fake number.
 *  - FREE (incl. anonymous, subscription === null) → a screenshot-safe LOCKED
 *    teaser that routes to /paywall. It reveals NO readable number — same
 *    idiom as TodaysFocusCard (TODAY-6).
 *
 * The hours CAPTURE itself is free + lives in the Today journal block; only
 * this ANALYSIS card is premium. Premium detection mirrors plan.tsx /
 * TodaysFocusCard exactly: useSubscription() status ∈ {active, trial,
 * grace_period}.
 *
 * The debt math is the pure lib/sleep-debt.ts; this component owns only the
 * gating + presentation. The parent passes the live hours map + the
 * chronotype-adjusted need so this stays render-only and re-renders when the
 * user logs hours.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eyebrow, Text, GlassCard, Glyph, type GlyphName } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { useSleepHours } from '../../lib/sleep-hours/store';
import { computeSleepDebt, type DebtSeverity } from '../../lib/sleep-debt';
import { useSubscription } from '../../lib/queries';
import { t } from '../../lib/i18n';

/** Severity → visual treatment. Calm at the low end, warmer as debt grows. */
const SEVERITY_TINT: Record<
  DebtSeverity,
  { bg: string; fg: keyof typeof colors; glyph: GlyphName }
> = {
  none: { bg: colors.primaryContainer, fg: 'primary', glyph: 'check' },
  mild: { bg: colors.primaryContainer, fg: 'primary', glyph: 'leaf' },
  moderate: { bg: colors.sunriseGlow, fg: 'sunriseDim', glyph: 'pulse' },
  severe: { bg: colors.coralGlow, fg: 'coralDim', glyph: 'moon' },
};

export interface SleepDebtCardProps {
  /** Chronotype-adjusted sleep need (hours). Parent derives from onboarding. */
  need: number;
}

export function SleepDebtCard({ need }: SleepDebtCardProps) {
  const { data: subscription } = useSubscription();
  // Mirror plan.tsx / TodaysFocusCard exactly — same premium gate app-wide.
  const isPremium =
    subscription?.status === 'active' ||
    subscription?.status === 'trial' ||
    subscription?.status === 'grace_period';

  // Subscribe so logging hours in the journal re-renders the card live.
  const hours = useSleepHours();

  // ── FREE → locked teaser (screenshot-safe, routes to paywall) ──────────
  if (!isPremium) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('today.sleep_debt.locked_cta')}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/paywall');
        }}
      >
        <GlassCard
          variant="glass"
          padding="xxl"
          style={[{ marginBottom: spacing.md }, styles.lockedCard]}
        >
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.duskGlow }]}>
              <Glyph name="moon" size={22} color="duskDim" />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color="duskDim">
                {`${t('today.sleep_debt.eyebrow')} · ${t('plan.premium_suffix')}`}
              </Eyebrow>
              <Text
                variant="titleLg"
                family="display"
                weight="light"
                color="ink"
                style={{ marginTop: 2 }}
              >
                {t('today.sleep_debt.locked_title')}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
                {t('today.sleep_debt.locked_cta')}
              </Text>
            </View>
            <View style={{ marginLeft: spacing.xs, marginTop: 4 }}>
              <Glyph name="chevronRight" size={18} color="inkGhost" />
            </View>
          </View>
        </GlassCard>
      </Pressable>
    );
  }

  // ── PREMIUM → compute over the rolling window from the live ledger ─────
  const debt = computeSleepDebt(hours.entries, need);

  // Premium but nothing logged → honest empty state (NO fake number).
  if (debt.loggedDays === 0) {
    return (
      <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
        <View style={styles.row}>
          <View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}>
            <Glyph name="moon" size={22} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow color="primary">{t('today.sleep_debt.eyebrow')}</Eyebrow>
            <Text
              variant="titleLg"
              family="display"
              weight="light"
              color="ink"
              style={{ marginTop: 2 }}
            >
              {t('today.sleep_debt.empty_title')}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
              {t('today.sleep_debt.empty_body')}
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  }

  // Premium + at least one logged day → the real metric.
  const tint = SEVERITY_TINT[debt.severity];

  return (
    <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: tint.bg }]}>
          <Glyph name={tint.glyph} size={22} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Eyebrow color="primary">{t('today.sleep_debt.eyebrow')}</Eyebrow>
          <Text
            variant="titleLg"
            family="display"
            weight="light"
            color="ink"
            style={{ marginTop: 2 }}
          >
            {debt.debtHours <= 0
              ? t('today.sleep_debt.title_clear')
              : t('today.sleep_debt.title', {
                  hours: debt.debtHours,
                  severity: t(`today.sleep_debt.severity_${debt.severity}`),
                })}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
            {debt.debtHours <= 0
              ? t('today.sleep_debt.body_clear')
              : t('today.sleep_debt.body_clears_in', { days: debt.clearsInDays })}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default SleepDebtCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  lockedCard: {
    opacity: 0.92,
  },
});
