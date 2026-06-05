/**
 * S13 — Loading / Analysis. Builds perceived value before Aha.
 * F7: multi-stage "creating your plan" sequence (5 stages, each with a
 * headline + detail line) like the Vitaminico flow, so it reads as real,
 * staged work — not one inert label. Keeps the breathing gradient orb +
 * 0→100% counter (owner liked those) and adds step dots that fill per stage.
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
  ProgressDots,
} from '../../components/ui';
import * as Haptics from 'expo-haptics';
import { spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

const STAGES = 5;
const TICK_MS = 40; // ~25fps counter
// ~9s across 5 stages (~1.8s each) — substantial without dragging.
const TOTAL_MS = 9000;

const stageText = (i: number): string => t(`onboarding_screens.loading.s${i + 1}_t`);
const stageDetail = (i: number): string => t(`onboarding_screens.loading.s${i + 1}_d`);

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

  const stageIdx = Math.min(STAGES - 1, Math.floor((pct / 100) * STAGES));

  // R26-4: tactile pulse as each new analysis stage appears.
  const prevStage = useRef(0);
  useEffect(() => {
    if (stageIdx !== prevStage.current) {
      prevStage.current = stageIdx;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [stageIdx]);

  return (
    <Screen scroll={false} tabBarClearance={false} orbs="strong">
      <View style={styles.body}>
        <Eyebrow>{t('onboarding_screens.loading.eyebrow')}</Eyebrow>

        <View style={styles.orbWrap}>
          <BreathingOrb size={300} pulse shimmer />
          <View style={styles.pctOverlay} pointerEvents="none">
            <HeroNumber value={`${pct}%`} size="xl" align="center" />
          </View>
        </View>

        {/* stage caption — re-keyed per stage so it cross-fades on change */}
        <Text
          key={`t${stageIdx}`}
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          align="center"
          style={{ marginTop: spacing.xl }}
        >
          {stageText(stageIdx)}
        </Text>
        <Text
          key={`d${stageIdx}`}
          variant="bodyMd"
          color="inkSubtle"
          align="center"
          style={{ marginTop: spacing.xs, paddingHorizontal: spacing.xl }}
        >
          {stageDetail(stageIdx)}
        </Text>

        <View style={{ marginTop: spacing.xxl }}>
          <ProgressDots count={STAGES} active={stageIdx} />
        </View>
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
    marginVertical: 40,
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
