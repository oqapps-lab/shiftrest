/**
 * S01 — Welcome. The entry point when app opens without a session.
 * Breathing orb + soft hero line + two CTAs.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Screen,
  BreathingOrb,
  SerifHero,
  Text,
  PillCTA,
  Eyebrow,
} from '../components/ui';
import { colors, spacing } from '../constants/tokens';

export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <Screen scroll={false} tabBarClearance={false} orbs="strong">
      <View style={styles.body}>
        <Eyebrow>SHIFTREST</Eyebrow>

        <View style={styles.orbWrap}>
          <BreathingOrb size={280} pulse />
        </View>

        <View style={styles.copy}>
          <SerifHero align="center">Rest catches up, gently.</SerifHero>
          <Text
            variant="bodyLg"
            color="inkSubtle"
            align="center"
            style={{ marginTop: spacing.md }}
          >
            The only sleep plan for shift workers that doesn't punish you for sleeping at noon.
          </Text>
        </View>
      </View>

      <View style={[styles.floating, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PillCTA
          variant="primary"
          label="Create my plan"
          onPress={() => router.push('/onboarding/profession')}
        />
        <View style={{ height: spacing.sm }} />
        <PillCTA
          variant="glass"
          size="md"
          label="I already have an account"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  orbWrap: {
    marginTop: 60,
    marginBottom: 40,
  },
  copy: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  floating: {
    position: 'absolute',
    left: spacing.xxl,
    right: spacing.xxl,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});
