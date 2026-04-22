/**
 * S01 — Welcome. The entry point when app opens without a session.
 * Breathing orb + soft hero line + two CTAs.
 *
 * Redirect rule: if the user already completed onboarding in a previous
 * session (persisted via OnboardingProvider → AsyncStorage), skip Welcome
 * and land on /(tabs). Wait for hydration so we don't flash Welcome first.
 */

import React, { useEffect } from 'react';
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
import { useOnboarding } from '../lib/onboarding/store';

export default function Welcome() {
  const { state, hydrated } = useOnboarding();

  useEffect(() => {
    if (hydrated && state.completed) {
      router.replace('/(tabs)');
    }
  }, [hydrated, state.completed]);

  // Avoid flashing Welcome before hydration finishes.
  if (!hydrated || state.completed) {
    return <View style={{ flex: 1 }} />;
  }

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
            onPress={() => router.push('/auth/login')}
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
            {"The only sleep plan for shift workers that doesn't punish you for sleeping at noon."}
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
