/**
 * S54 — About & support. Version, links, medical disclaimer.
 *
 * Reads version from app.json / Constants.expoConfig at runtime.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  Screen,
  Eyebrow,
  HeroNumber,
  Text,
  GlassCard,
  Glyph,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';

const SUPPORT_EMAIL = 'hello@shiftrest.app';

interface Row {
  glyph: 'sparkle' | 'bell' | 'user' | 'leaf';
  label: string;
  subtitle?: string;
  onPress: () => void;
}

function openExternal(url: string) {
  Linking.openURL(url).catch(() =>
    Alert.alert('Could not open link', `Please copy: ${url}`),
  );
}

export default function About() {
  const version =
    (Constants.expoConfig?.version as string | undefined) ?? '0.1.0';

  const rows: Row[] = [
    {
      glyph: 'leaf',
      label: 'FAQ',
      subtitle: 'Common questions about shift sleep',
      onPress: () => openExternal('https://shiftrest.app/faq'),
    },
    {
      glyph: 'user',
      label: 'Contact support',
      subtitle: SUPPORT_EMAIL,
      onPress: () => openExternal(`mailto:${SUPPORT_EMAIL}`),
    },
    {
      glyph: 'sparkle',
      label: 'Rate ShiftRest',
      subtitle: 'Tell other shift workers about us',
      onPress: () =>
        openExternal(
          'itms-apps://itunes.apple.com/app/idShiftRest?action=write-review',
        ),
    },
    {
      glyph: 'bell',
      label: 'Privacy Policy',
      onPress: () => openExternal('https://shiftrest.app/privacy'),
    },
    {
      glyph: 'bell',
      label: 'Terms of Use',
      onPress: () => openExternal('https://shiftrest.app/terms'),
    },
  ];

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>SETTINGS</Eyebrow>
      <HeroNumber
        value="About & support"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      {/* Version */}
      <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.huge }}>
        <Eyebrow size="md">VERSION</Eyebrow>
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
        <Eyebrow>MEDICAL DISCLAIMER</Eyebrow>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {"ShiftRest provides general sleep guidance for shift workers. It is not a medical device and does not diagnose, treat, or cure any condition. If you have a sleep disorder or persistent fatigue, please consult a clinician."}
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
