/**
 * TODAY-11 — "Sleep banking" + "post-block recovery" card.
 *
 * The final Today surface. It renders ONE card, and ONLY when a real banking or
 * recovery condition is live (the parent gates on `state.mode !== 'none'`), so
 * it is contextual rather than always-on — the anti-bloat guarantee.
 *
 * Two live modes (decided by the pure lib/sleep-banking.ts):
 *  • BANK    — a hard night/24h shift is today's own or bears down tomorrow.
 *              PREMIUM copy names the pre-shift nap window + a "move tonight's
 *              sleep earlier" hint.
 *  • RECOVER — today is OFF after a run of ≥2 work days just ended. PREMIUM copy
 *              names the fixed anchor/recovery window + a 1–2 line paced
 *              re-anchor plan over 2–3 days.
 *
 * Gating mirrors plan.tsx / TodaysFocusCard / SleepDebtCard exactly:
 * useSubscription() status ∈ {active, trial, grace_period}. FREE users (incl.
 * anonymous, subscription === null) get a screenshot-safe LOCKED teaser that
 * routes to /paywall — but, because the parent only mounts this when a
 * condition is active, even the teaser is contextual (it appears only when the
 * user actually has a shift to bank for / a block to recover from).
 *
 * The card is render-only: the parent passes the already-computed
 * SleepBankingState so the window times agree with the rest of Today and this
 * stays unit-testable via the pure module.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eyebrow, Text, GlassCard, Glyph, type GlyphName } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { useSubscription } from '../../lib/queries';
import { formatHour, formatHourRange } from '../../lib/derive';
import type { SleepBankingState } from '../../lib/sleep-banking';
import { t } from '../../lib/i18n';

export interface SleepBankingCardProps {
  /** Pre-computed banking state from lib/sleep-banking.ts. */
  state: SleepBankingState;
}

/** Per-mode visual treatment. Bank = forward-looking sunrise warmth; recover =
 *  calm restorative sage. */
const MODE_TINT: Record<
  'bank' | 'recover',
  { bg: string; fg: 'sunriseDim' | 'primary'; glyph: GlyphName; variant: 'paper' | 'glass' }
> = {
  bank: { bg: colors.sunriseGlow, fg: 'sunriseDim', glyph: 'pulse', variant: 'paper' },
  recover: { bg: colors.primaryContainer, fg: 'primary', glyph: 'leaf', variant: 'glass' },
};

export function SleepBankingCard({ state }: SleepBankingCardProps) {
  const { data: subscription } = useSubscription();
  // Mirror plan.tsx exactly — same premium gate across the app.
  const isPremium =
    subscription?.status === 'active' ||
    subscription?.status === 'trial' ||
    subscription?.status === 'grace_period';

  // Anti-bloat hard stop: render nothing when no condition is active. The
  // parent already gates on this, but guarding here keeps the component honest
  // if it's ever mounted directly.
  if (state.mode === 'none') return null;

  // ── FREE → locked teaser (screenshot-safe, routes to paywall) ────────────
  if (!isPremium) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('today.sleep_banking.locked_cta')}
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
                {`${t('today.sleep_banking.eyebrow')} · ${t('plan.premium_suffix')}`}
              </Eyebrow>
              <Text
                variant="titleLg"
                family="display"
                weight="light"
                color="ink"
                style={{ marginTop: 2 }}
              >
                {state.mode === 'bank'
                  ? t('today.sleep_banking.locked_title_bank')
                  : t('today.sleep_banking.locked_title_recover')}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
                {t('today.sleep_banking.locked_cta')}
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

  // ── PREMIUM ──────────────────────────────────────────────────────────────
  const mode = state.mode;
  const tint = MODE_TINT[mode];

  let title: string;
  let body: string;
  if (state.mode === 'bank') {
    const napTime = formatHour(state.params.nap.hour);
    title =
      state.params.when === 'today'
        ? t('today.sleep_banking.bank_title_today')
        : t('today.sleep_banking.bank_title_tomorrow');
    body = t('today.sleep_banking.bank_body', {
      nap: napTime,
      min: String(state.params.nap.durationMin),
    });
  } else {
    const window = formatHourRange(
      state.params.anchor.startHour,
      state.params.anchor.endHour,
    );
    title = t('today.sleep_banking.recover_title', { days: String(state.params.paceDays) });
    body = t('today.sleep_banking.recover_body', {
      window,
      days: String(state.params.paceDays),
    });
  }

  return (
    <GlassCard variant={tint.variant} padding="xxl" style={{ marginBottom: spacing.md }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: tint.bg }]}>
          <Glyph name={tint.glyph} size={22} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Eyebrow color={mode === 'bank' ? 'sunriseDim' : 'primary'}>
            {t('today.sleep_banking.eyebrow')}
          </Eyebrow>
          <Text
            variant="titleLg"
            family="display"
            weight="light"
            color="ink"
            style={{ marginTop: 2 }}
          >
            {title}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
            {body}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default SleepBankingCard;

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
