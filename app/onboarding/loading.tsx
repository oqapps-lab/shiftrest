/**
 * S13 — Loading / Analysis. Builds perceived value before Aha.
 * USER-BUG-3: was a static screen with a cycling label that felt
 * inert. Now: breathing orb (pulses) + giant 0→100% counter that
 * fills smoothly across the analysis window so the user sees
 * progress and feels work is happening before the plan reveal.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  BreathingOrb,
  Eyebrow,
  Text,
  HeroNumber,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

const getMessages = (): string[] => t('onboarding_screens.loading_steps') as unknown as string[];
const MESSAGES_LEN = 4;
const TICK_MS = 40; // 25fps counter
// A4: slower so the user can actually read what's being computed — owner
// said it felt too fast / unclear. ~6.4s across 4 steps (~1.6s each).
const TOTAL_MS = 6400;

export default function Loading() {
  const [pct, setPct] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - (startedAt.current ?? Date.now());
      const next = Math.min(100, Math.round((elapsed / TOTAL_MS) * 100));
      setPct(next);
      if (next >= 100) {
        clearInterval(id);
        setTimeout(() => router.replace('/onboarding/aha'), 350);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const messageIdx = Math.min(MESSAGES_LEN - 1, Math.floor((pct / 100) * MESSAGES_LEN));
  const currentMessage = getMessages()[messageIdx];

  return (
    <Screen scroll={false} tabBarClearance={false} orbs="strong">
      <View style={styles.body}>
        <Eyebrow>{t('onboarding_screens.loading.eyebrow')}</Eyebrow>

        <View style={styles.orbWrap}>
          <BreathingOrb size={320} pulse shimmer />
          <View style={styles.pctOverlay} pointerEvents="none">
            <HeroNumber value={`${pct}%`} size="xl" align="center" />
          </View>
        </View>

        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          align="center"
          style={{ marginTop: spacing.xxl }}
        >
          {currentMessage}
        </Text>
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
  orbWrap: {
    marginVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
