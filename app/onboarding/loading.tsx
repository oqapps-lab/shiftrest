/**
 * S13 — Loading / Analysis. Builds perceived value before Aha.
 * Breathing orb + cycling text + progress dots.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  BreathingOrb,
  Eyebrow,
  HeroNumber,
  ProgressDots,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';

const MESSAGES = [
  'Reading your rotation',
  'Calculating sleep window',
  'Aligning melatonin',
  'Drafting your plan',
];

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= MESSAGES.length) {
      const t = setTimeout(() => router.replace('/onboarding/aha'), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [step]);

  const currentMessage = MESSAGES[Math.min(step, MESSAGES.length - 1)];

  return (
    <Screen scroll={false} tabBarClearance={false} orbs="strong">
      <View style={styles.body}>
        <Eyebrow>ANALYSING</Eyebrow>

        <View style={styles.orb}>
          <BreathingOrb size={320} pulse />
        </View>

        <HeroNumber value={currentMessage} size="md" align="center" />

        <View style={{ height: spacing.xxxl }} />

        <ProgressDots count={MESSAGES.length} active={Math.min(step, MESSAGES.length - 1)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  orb: {
    marginVertical: 48,
  },
});
