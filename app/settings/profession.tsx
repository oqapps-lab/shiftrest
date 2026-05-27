/**
 * Settings → Profession (drill-down). Auto-save on tap.
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
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockProfessions } from '../../mock/user';
import { useOnboarding, type Profession } from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function ProfessionSettings() {
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

      <Eyebrow>{t('settings_sub.profession.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.profession.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.profession.subtitle')}
      </Text>

      {mockProfessions.map((p) => (
        <OptionCard
          key={p.id}
          title={p.title}
          subtitle={p.subtitle}
          glyph={p.glyph}
          selected={state.profession === p.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            update({ profession: p.id as Profession });
          }}
          accessibilityLabel={p.title}
        />
      ))}

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
});
