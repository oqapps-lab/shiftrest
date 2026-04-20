/**
 * S01 — Welcome. The entry point when app opens without a session.
 * Breathing orb + soft hero line + two CTAs.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  BreathingOrb,
  SerifHero,
  Text,
  PillCTA,
  Eyebrow,
} from '../components/ui';
import { spacing } from '../constants/tokens';

export default function Welcome() {
  return (
    <Screen
      scroll={false}
      tabBarClearance={false}
      orbs="strong"
      floatingFooter={
        <>
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
        </>
      }
    >
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
});
