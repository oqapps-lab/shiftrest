/**
 * Settings → Family (drill-down). Kids toggle + pickup + commitments.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  Toggle,
  SegmentedControl,
  TextField,
  GlassCard,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import {
  useOnboarding,
  chronotypeBucket,
  computeChronotypeScore,
  type PickupTime,
} from '../../lib/onboarding/store';
import { suggestedPlanFromOnboarding, formatHour } from '../../lib/derive';
import { useGeneratedPlan, planHourAsFloat } from '../../lib/queries/plan';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

const PICKUP_OPTIONS: { value: PickupTime; label: string }[] = [
  { value: '14', label: '14:00' },
  { value: '15', label: '15:00' },
  { value: '16', label: '16:00' },
  { value: '17', label: '17:00' },
];

export default function FamilySettings() {
  const { state, update } = useOnboarding();
  const { data: livePlan } = useGeneratedPlan();
  const suggested = suggestedPlanFromOnboarding(
    state.currentShift,
    chronotypeBucket(computeChronotypeScore(state.chronotypeAnswers)),
  );
  const sleepStartHour = planHourAsFloat(livePlan?.sleep_start) ?? suggested.sleepStart;
  const sleepEndHour = planHourAsFloat(livePlan?.sleep_end) ?? suggested.sleepEnd;

  // F14 — Family Coordination teaser. iOS share sheet with a short
  // "I'm sleeping…" message + window. Recipient can save to their own
  // calendar manually. No server, no backend needed.
  const onShareWindow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const startStr = formatHour(sleepStartHour);
    const endStr = formatHour(sleepEndHour);
    const message = t('settings_sub.family.share_message', {
      start: startStr,
      end: endStr,
    });
    try {
      await Share.share({ message });
    } catch {
      // user cancelled
    }
  };

  return (
    <Screen orbs="subtle" scroll keyboardAvoiding tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/settings/sleep-preferences')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('settings_sub.family.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.family.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.family.subtitle')}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {t('sleep_prefs.kids_at_home')}
        </Text>
        <Toggle
          value={state.hasChildren}
          onChange={(v) => update({ hasChildren: v })}
          accessibilityLabel={t('a11y.have_kids_at_home')}
        />
      </View>

      {state.hasChildren && (
        <View style={{ marginTop: spacing.lg }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>
            {t('sleep_prefs.pickup_time')}
          </Eyebrow>
          <SegmentedControl<PickupTime>
            options={PICKUP_OPTIONS}
            value={state.pickupTime}
            onChange={(v) => update({ pickupTime: v })}
          />
        </View>
      )}

      <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        {t('settings_sub.family.commitments_label')}
      </Eyebrow>
      <TextField
        placeholder={t('settings_sub.family.commitments_placeholder')}
        value={state.otherCommitments}
        onChangeText={(v) => update({ otherCommitments: v })}
        autoCapitalize="sentences"
      />

      {/* F14: Family Coordination teaser — Share current sleep window */}
      <GlassCard variant="paper" padding="xxl" style={{ marginTop: spacing.huge }}>
        <View style={styles.shareIconRow}>
          <Glyph name="moon" size={22} color="primary" />
        </View>
        <View style={{ height: spacing.md }} />
        <Eyebrow>{t('settings_sub.family.share_eyebrow')}</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {t('settings_sub.family.share_title')}
        </Text>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {t('settings_sub.family.share_sub', {
            start: formatHour(sleepStartHour),
            end: formatHour(sleepEndHour),
          })}
        </Text>
        <View style={{ height: spacing.md }} />
        <PillCTA
          variant="primary"
          label={t('settings_sub.family.share_cta')}
          onPress={onShareWindow}
        />
      </GlassCard>

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  shareIconRow: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
