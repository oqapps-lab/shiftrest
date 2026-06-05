/**
 * S54 — About & support. Version, links, medical disclaimer.
 *
 * Reads version from app.json / Constants.expoConfig at runtime.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import Constants from 'expo-constants';
import {
  Screen,
  Eyebrow,
  HeroNumber,
  Text,
  GlassCard,
  Glyph,
  showAppDialog,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { router } from 'expo-router';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

const SUPPORT_EMAIL = 'support@oqapps.pro';

interface Row {
  glyph: 'sparkle' | 'bell' | 'user' | 'leaf';
  label: string;
  subtitle?: string;
  onPress: () => void;
}

function openExternal(url: string) {
  Linking.openURL(url).catch(() =>
    showAppDialog({
      title: t('settings_screens.about.link_open_error'),
      message: t('settings_screens.about.link_copy_hint', { url }),
      actions: [{ label: t('a11y.close'), style: 'cancel' }],
    }),
  );
}

export default function About() {
  const version =
    (Constants.expoConfig?.version as string | undefined) ?? '0.1.0';

  const rows: Row[] = [
    {
      glyph: 'leaf',
      label: t('settings_screens.about.faq'),
      subtitle: t('settings_screens.about.faq_sub'),
      onPress: () => openExternal('https://oqapps.pro/legal/shiftsleep/support#faq'),
    },
    {
      glyph: 'user',
      label: t('settings_screens.about.contact'),
      subtitle: SUPPORT_EMAIL,
      onPress: () => openExternal(`mailto:${SUPPORT_EMAIL}`),
    },
    {
      glyph: 'sparkle',
      label: t('settings_screens.about.rate'),
      subtitle: t('settings_screens.about.rate_sub'),
      onPress: () =>
        openExternal(
          'itms-apps://itunes.apple.com/app/idShiftRest?action=write-review',
        ),
    },
    {
      glyph: 'bell',
      label: t('settings_screens.about.privacy'),
      onPress: () => router.push('/legal/privacy'),
    },
    {
      glyph: 'bell',
      label: t('settings_screens.about.terms'),
      onPress: () => router.push('/legal/terms'),
    },
  ];

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/(tabs)/profile')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('auth.back_a11y')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('settings_screens.eyebrow')}</Eyebrow>
      <HeroNumber
        value={t('settings_screens.about.title')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      {/* Version */}
      <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.huge }}>
        <Eyebrow size="md">{t('settings_screens.about.version')}</Eyebrow>
        <Text
          variant="titleLg"
          family="display"
          weight="light"
          color="ink"
          style={{ marginTop: 4 }}
        >
          {version}
        </Text>
      </GlassCard>

      {/* Rows */}
      <View style={{ marginTop: spacing.lg }}>
        {rows.map((row) => (
          <Pressable
            key={row.label}
            onPress={row.onPress}
            style={{ marginBottom: spacing.sm }}
            accessibilityRole="button"
            accessibilityLabel={row.label}
          >
            <GlassCard variant="whisper" padding="xl">
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Glyph name={row.glyph} size={18} color="primary" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMd" family="display" weight="medium" color="ink">
                    {row.label}
                  </Text>
                  {row.subtitle ? (
                    <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                      {row.subtitle}
                    </Text>
                  ) : null}
                </View>
                <Glyph name="chevronRight" size={18} color="inkMuted" />
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      {/* Medical disclaimer */}
      <View style={{ marginTop: spacing.huge }}>
        <Eyebrow>{t('settings_screens.about.medical_disclaimer')}</Eyebrow>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {t('settings_screens.about.medical_body')}
        </Text>
      </View>

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
});
