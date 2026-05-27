/**
 * Settings → Light therapy (drill-down). Toggle ON/OFF.
 * When ON, Plan tab shows a Light exposure card with seek/avoid windows
 * computed from current shift + chronotype.
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
  GlassCard,
} from '../../components/ui';
import { spacing, colors } from '../../constants/tokens';
import { useOnboarding } from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function LightSettings() {
  const { state, update } = useOnboarding();

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

      <Eyebrow>{t('settings_sub.light.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.light.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.light.subtitle')}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {t('settings_sub.light.toggle_label')}
        </Text>
        <Toggle
          value={state.usesLightTherapy}
          onChange={(v) => update({ usesLightTherapy: v })}
          accessibilityLabel={t('settings_sub.light.toggle_label')}
        />
      </View>

      <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.xl }}>
        <Eyebrow>{t('settings_sub.light.why_eyebrow')}</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {t('settings_sub.light.why_title')}
        </Text>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {t('settings_sub.light.why_body')}
        </Text>
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
});
