/**
 * OnboardingBack — top-left chevron that pops one step back in the
 * onboarding funnel. Student feedback (2026-05-22): "нет возможности
 * вернуться на прошлый шаг при неправильном выборе ответа".
 *
 * Onboarding state lives in the persisted Zustand store (useOnboarding),
 * so popping the screen keeps every previously-entered answer — the prior
 * step re-mounts and reads its value back from the store, showing the
 * selection still active. Swipe-back stays disabled (gestureEnabled:false
 * in _layout) so the funnel can't be dismissed by accident; this is the
 * one deliberate way back.
 *
 * Renders nothing when there is no screen to pop to (e.g. deep-linked
 * straight into a step), so it never dead-ends.
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Glyph } from './Glyph';
import { spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

export function OnboardingBack() {
  if (!router.canGoBack()) return null;
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
      }}
      hitSlop={14}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.back')}
      style={styles.back}
    >
      <Glyph name="chevronLeft" size={24} color="inkMuted" />
    </Pressable>
  );
}

export default OnboardingBack;

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
});
