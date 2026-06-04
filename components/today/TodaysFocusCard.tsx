/**
 * TODAY-6 — "Today's Focus" card.
 *
 * A PREMIUM surface on the Today tab that states THE single most useful move
 * today, with an exact time. It is the visibly-deeper paid surface that
 * answers the owner's "why pay" critique: it changes day-to-day from the
 * user's live signals (caffeine load, rough-night streak, night-shift nadir)
 * and always gives a concrete reason to open.
 *
 * - PREMIUM users → the computed focus: a prominent GlassCard with the eyebrow
 *   "TODAY'S FOCUS", a glyph, the title, and the one action carrying its exact
 *   time. ONE focused card by design (anti-bloat).
 * - FREE users → a LOCKED teaser in the same slot: a lock affordance + a
 *   single "Unlock your daily focus with Premium" line that routes to
 *   /paywall on tap. It is screenshot-safe — it reveals NO readable premium
 *   specifics (no times, no titles), matching the plan.tsx premium-teaser
 *   idiom (dimmed card + PREMIUM suffix).
 *
 * Premium detection mirrors app/(tabs)/plan.tsx exactly: useSubscription()
 * status ∈ {active, trial, grace_period}. For signed-out/anonymous users the
 * subscription is null, so they correctly fall to the locked teaser.
 *
 * The focus itself is computed by the pure lib/today-focus.ts; this component
 * owns only the gating + presentation. The parent passes already-derived
 * signals via `args` so this stays render-only.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eyebrow, Text, GlassCard, Glyph } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { computeTodaysFocus, type FocusArgs, type FocusGlyph } from '../../lib/today-focus';
import { useSubscription } from '../../lib/queries';
import { t } from '../../lib/i18n';

/** Glyph → tint pair so each focus reads with the right warmth. */
const GLYPH_TINT: Record<FocusGlyph, { bg: string; fg: 'primary' | 'duskDim' | 'sunriseDim' }> = {
  coffee: { bg: colors.sunriseGlow, fg: 'sunriseDim' },
  bed: { bg: colors.primaryContainer, fg: 'primary' },
  moon: { bg: colors.duskGlow, fg: 'duskDim' },
  sparkle: { bg: colors.primaryContainer, fg: 'primary' },
};

export interface TodaysFocusCardProps {
  /** All signals needed to compute the focus (see lib/today-focus.ts). */
  args: FocusArgs;
}

export function TodaysFocusCard({ args }: TodaysFocusCardProps) {
  const { data: subscription } = useSubscription();
  // Mirror plan.tsx exactly — same premium gate across the app.
  const isPremium =
    subscription?.status === 'active' ||
    subscription?.status === 'trial' ||
    subscription?.status === 'grace_period';

  // ── FREE → locked teaser (screenshot-safe, routes to paywall) ──────────
  if (!isPremium) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('today.focus.locked_cta')}
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
              <Glyph name="sparkle" size={22} color="duskDim" />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color="duskDim">
                {`${t('today.focus.eyebrow')} · ${t('plan.premium_suffix')}`}
              </Eyebrow>
              <Text
                variant="titleLg"
                family="display"
                weight="light"
                color="ink"
                style={{ marginTop: 2 }}
              >
                {t('today.focus.locked_title')}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
                {t('today.focus.locked_cta')}
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

  // ── PREMIUM → the one computed focus ──────────────────────────────────
  const focus = computeTodaysFocus(args);
  const tint = GLYPH_TINT[focus.glyph];

  return (
    <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: tint.bg }]}>
          <Glyph name={focus.glyph} size={22} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Eyebrow color="primary">{t('today.focus.eyebrow')}</Eyebrow>
          <Text
            variant="titleLg"
            family="display"
            weight="light"
            color="ink"
            style={{ marginTop: 2 }}
          >
            {t(focus.titleKey, focus.params)}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
            {t(focus.bodyKey, focus.params)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default TodaysFocusCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  lockedCard: {
    opacity: 0.62,
  },
});
