/**
 * Settings → Family (drill-down). Kids toggle + pickup + commitments.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  Toggle,
  SegmentedControl,
  TextField,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import {
  useOnboarding,
  type PickupTime,
} from '../../lib/onboarding/store';
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
});
