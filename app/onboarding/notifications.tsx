/**
 * S16 — Notification permission. Hero-centered, no step dots (onboarding done).
 * Two CTAs: Allow / Maybe later — both land in the main tabs for demo.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../../lib/onboarding/store';
import {
  Screen,
  SerifHero,
  Eyebrow,
  GlassCard,
  Glyph,
  PillCTA,
  Text,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { mockNotificationTypes } from '../../mock/user';

export default function Notifications() {
  const { markCompleted } = useOnboarding();

  const finish = () => {
    markCompleted();
    router.replace('/(tabs)');
  };

  return (
    <Screen
      orbs="normal"
      scroll={false}
      tabBarClearance={false}
      floatingFooter={
        <View style={{ gap: spacing.sm }}>
          <PillCTA
            variant="primary"
            label="Allow notifications"
            onPress={finish}
          />
          <PillCTA
            variant="glass"
            size="md"
            label="Maybe later"
            onPress={finish}
          />
        </View>
      }
    >
      <View style={styles.headWrap}>
        <Eyebrow>ALMOST DONE</Eyebrow>
        <View style={{ marginTop: spacing.md }}>
          <SerifHero align="center">Never miss your window.</SerifHero>
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        {mockNotificationTypes.map((t) => (
          <GlassCard
            key={t.id}
            variant="whisper"
            padding="lg"
            style={[styles.row, { marginBottom: spacing.md }]}
          >
            <View style={styles.iconWrap}>
              <Glyph name={t.glyph} size={22} color="primary" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleMd" family="display" weight="medium" color="ink">
                {t.title}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                {t.subtitle}
              </Text>
            </View>
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headWrap: {
    alignItems: 'center',
    marginTop: spacing.huge,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
});
