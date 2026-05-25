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
import { t } from '../../lib/i18n';

const getMessages = (): string[] => t('onboarding_screens.loading_steps') as unknown as string[];
const MESSAGES_LEN = 4;

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= MESSAGES_LEN) {
      const t = setTimeout(() => router.replace('/onboarding/aha'), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [step]);

  const currentMessage = getMessages()[Math.min(step, MESSAGES_LEN - 1)];

  return (
    <Screen scroll={false} tabBarClearance={false} orbs="strong">
      <View style={styles.body}>
        <Eyebrow>{t('onboarding_screens.loading.eyebrow')}</Eyebrow>

        <View style={styles.orb}>
          <BreathingOrb size={320} pulse />
        </View>

        <HeroNumber value={currentMessage} size="md" align="center" />

        <View style={{ height: spacing.xxxl }} />

        <ProgressDots count={MESSAGES_LEN} active={Math.min(step, MESSAGES_LEN - 1)} />
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
