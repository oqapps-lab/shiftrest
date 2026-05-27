/**
 * Settings → Caffeine (drill-down). Toggle ON/OFF + cups/day + type + sensitivity.
 * Toggle OFF sets cupsPerDay to 0; Plan/Home omit caffeine cards.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  OptionCard,
  Toggle,
  Stepper,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import {
  mockCaffeineTypes,
  mockCaffeineSensitivities,
} from '../../mock/user';
import {
  useOnboarding,
  type CaffeineType,
  type CaffeineSensitivity,
} from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function CaffeineSettings() {
  const { state, update } = useOnboarding();
  const drinks = state.caffeineCupsPerDay > 0;

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/settings/sleep-preferences')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('settings_sub.caffeine.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.caffeine.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.caffeine.subtitle')}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {t('settings_sub.caffeine.toggle_label')}
        </Text>
        <Toggle
          value={drinks}
          onChange={(v) => update({ caffeineCupsPerDay: v ? 2 : 0 })}
          accessibilityLabel={t('settings_sub.caffeine.toggle_label')}
        />
      </View>

      {drinks && (
        <View style={{ marginTop: spacing.lg }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>
            {t('settings_sub.caffeine.cups_label')}
          </Eyebrow>
          <Stepper
            value={state.caffeineCupsPerDay}
            min={1}
            max={8}
            step={1}
            unit="cups/day"
            onChange={(v) => update({ caffeineCupsPerDay: v })}
            accessibilityLabel={t('a11y.cups_per_day')}
          />

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            {t('settings_sub.caffeine.type_label')}
          </Eyebrow>
          {mockCaffeineTypes.map((c) => (
            <OptionCard
              key={c.id}
              title={c.label}
              glyph={c.glyph}
              selected={state.caffeineType === c.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                update({ caffeineType: c.id as CaffeineType });
              }}
              accessibilityLabel={c.label}
            />
          ))}

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            {t('settings_sub.caffeine.sensitivity_label')}
          </Eyebrow>
          {mockCaffeineSensitivities.map((s) => (
            <OptionCard
              key={s.id}
              title={s.label}
              subtitle={s.subtitle}
              selected={state.caffeineSensitivity === s.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                update({ caffeineSensitivity: s.id as CaffeineSensitivity });
              }}
              accessibilityLabel={s.label}
            />
          ))}
        </View>
      )}

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
