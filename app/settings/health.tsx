/**
 * F12 — HealthKit sleep read (scaffold).
 *
 * Full HealthKit integration requires native modules (react-native-health
 * or expo-modules HealthKit bridge), HealthKit capability, and the
 * NSHealthShareUsageDescription Info.plist key — all of which need a
 * custom dev client (not Expo Go). To keep v1 shippable while v1.1
 * lands the native bridge, this screen surfaces the planned feature as
 * a roadmap card so users see it on the horizon.
 *
 * When the bridge is wired (next build), the Status row swaps to
 * Connect Apple Health and the Permission flow takes over.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  Text,
  Glyph,
  showAppDialog,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function HealthSettings() {
  const onConnectStub = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showAppDialog({
      title: t('settings_sub.health.coming_title'),
      message: t('settings_sub.health.coming_body'),
      actions: [{ label: t('settings_sub.health.ok') }],
    });
  };

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

      <Eyebrow>{t('settings_sub.health.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.health.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.health.subtitle')}
      </Text>

      <GlassCard variant="paper" padding="xxl" style={{ marginBottom: spacing.lg }}>
        <View style={styles.iconWrap}>
          <Glyph name="pulse" size={28} color="primary" />
        </View>
        <View style={{ height: spacing.md }} />
        <Eyebrow>{t('settings_sub.health.status_eyebrow')}</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {t('settings_sub.health.status_not_connected')}
        </Text>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {Platform.OS === 'ios'
            ? t('settings_sub.health.platform_ios')
            : t('settings_sub.health.platform_other')}
        </Text>
      </GlassCard>

      <Pressable
        onPress={onConnectStub}
        accessibilityRole="button"
        accessibilityLabel={t('settings_sub.health.connect_cta')}
      >
        <GlassCard variant="whisper" padding="lg">
          <View style={styles.ctaRow}>
            <Glyph name="sparkle" size={20} color="primary" />
            <Text
              variant="titleMd"
              family="display"
              weight="medium"
              color="primary"
              style={{ marginLeft: spacing.md, flex: 1 }}
            >
              {t('settings_sub.health.connect_cta')}
            </Text>
            <Glyph name="chevronRight" size={18} color="primary" />
          </View>
        </GlassCard>
      </Pressable>

      <GlassCard variant="paper" padding="xxl" style={{ marginTop: spacing.xl }}>
        <Eyebrow>{t('settings_sub.health.why_eyebrow')}</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {t('settings_sub.health.why_title')}
        </Text>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {t('settings_sub.health.why_body')}
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
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
