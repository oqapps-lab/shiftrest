/**
 * S15 — Paywall (primary). Modal presentation.
 * Hero + 4 value bullets + 2 pricing cards + trial dots + CTA.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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
import { mockUser } from '../mock/user';
import { firstName } from '../lib/derive';
import { useOnboarding } from '../lib/onboarding/store';
import { useAuth } from '../lib/auth/store';
import { startTrial, emitChange, EVENTS } from '../lib/queries';
import { logEvent } from '../lib/events';

const VALUE_BULLETS = [
  { glyph: 'bed' as const, text: 'Sleep window tuned to your rotation' },
  { glyph: 'coffee' as const, text: 'Caffeine cutoff by sensitivity, not a generic rule' },
  { glyph: 'moon' as const, text: 'Melatonin timing that works with your chronotype' },
  { glyph: 'sparkle' as const, text: 'Transition plans for rotating shifts' },
];

export default function Paywall() {
  const [plan, setPlan] = useState<'month' | 'year'>('year');
  const [submitting, setSubmitting] = useState(false);
  const { state: onboarding } = useOnboarding();
  const { user } = useAuth();
  const displayName = firstName(onboarding.displayName?.trim() || mockUser.name).toUpperCase();

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
            label={submitting ? 'Starting trial…' : 'Start 7-day trial'}
            disabled={submitting}
            onPress={onStartTrial}
          />
          <Pressable
            onPress={() => router.replace('/onboarding/notifications')}
            hitSlop={12}
            style={{ alignSelf: 'center', marginTop: spacing.md }}
          >
            <Text variant="bodyMd" color="inkMuted">
              Maybe later
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
          accessibilityLabel="Close paywall"
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <Eyebrow>{`${displayName}, YOUR PLAN IS READY`}</Eyebrow>
      <View style={{ marginTop: spacing.md, marginBottom: spacing.huge }}>
        <SerifHero>7 days. Then you decide.</SerifHero>
      </View>

      {VALUE_BULLETS.map((b) => (
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
        accessibilityLabel="Year plan $49.99"
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
                  Best value · save 35%
                </Text>
              </View>
              <HeroNumber value="$49.99" size="md" label="YEAR · $0.96 / week" labelPosition="below" />
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
        accessibilityLabel="Month plan $5.99"
      >
        <GlassCard
          variant={plan === 'month' ? 'glass' : 'paper'}
          padding="xxl"
          style={styles.planCard}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <HeroNumber value="$5.99" size="md" label="MONTHLY" labelPosition="below" />
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

      <Eyebrow>7-DAY TRIAL TIMELINE</Eyebrow>
      <View style={{ marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'flex-start' }}>
        <ProgressDots count={7} active={0} size={8} />
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
