/**
 * F3 — Measurement consent priming.
 *
 * App Tracking Transparency was firing the raw system dialog at cold launch
 * with zero context (Apple 5.1.1 reject risk). This screen primes the user
 * LATE in onboarding — after they've invested and seen the value — explaining
 * WHY we measure before the system prompt. The system ATT dialog is requested
 * only when the user taps Continue here.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Screen, Eyebrow, SerifHero, Text, PillCTA, Glyph } from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

export default function Measurement() {
  const [busy, setBusy] = useState(false);

  const onContinue = async () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
      // The system ATT sheet now appears with the priming context above it.
      try {
        await requestTrackingPermissionsAsync();
      } catch {
        // denied / unavailable — fine, attribution falls back to IDFV.
      }
    }
    router.replace('/(tabs)');
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA variant="primary" label={t('onboarding_screens.measurement.cta')} onPress={onContinue} disabled={busy} />
      }
    >
      <View style={styles.iconWrap}>
        <Glyph name="pulse" size={24} color="primary" />
      </View>
      <Eyebrow>{t('onboarding_screens.measurement.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
        <SerifHero>{t('onboarding_screens.measurement.hero')}</SerifHero>
      </View>
      <Text variant="bodyLg" color="inkSubtle" style={{ lineHeight: 26 }}>
        {t('onboarding_screens.measurement.body')}
      </Text>
      <View style={{ height: spacing.xl }} />
      <Text variant="bodyMd" color="inkMuted" style={{ lineHeight: 22 }}>
        {t('onboarding_screens.measurement.note')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
