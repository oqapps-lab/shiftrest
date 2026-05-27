/**
 * Settings → Display name (drill-down).
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  TextField,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { useOnboarding } from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function NameSettings() {
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

      <Eyebrow>{t('settings_sub.name.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.name.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.name.subtitle')}
      </Text>

      <TextField
        placeholder={t('sleep_prefs.name_placeholder')}
        value={state.displayName}
        onChangeText={(v) => update({ displayName: v })}
        autoCapitalize="words"
        autoCorrect={false}
        spellCheck={false}
        textContentType="name"
        maxLength={50}
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
});
