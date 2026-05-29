/**
 * <PlanUpdatedBanner> — F19 Shift Swap helper UI.
 *
 * Tracks a module-level timestamp of the latest EVENTS.shiftsChanged so
 * the banner can fire even when Home wasn't mounted at the moment of the
 * change (e.g. user saves shift on Schedule tab → navigates to Today,
 * Home mounts AFTER the event already fired). On mount + on subsequent
 * events, banner slides down + fades in, auto-hides after 3s.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, DeviceEventEmitter } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { Glyph } from './Glyph';
import { Eyebrow } from './Eyebrow';
import { Text } from './Text';
import { colors, spacing, radii } from '../../constants/tokens';
import { EVENTS } from '../../lib/queries';
import { t } from '../../lib/i18n';

const VISIBLE_MS = 3000;
const FADE_MS = 220;
const SLIDE_FROM = -16;
// Module-level so the latest shifts change is remembered across mount
// cycles. _lastChangeAt updates on EVERY event; _lastShownAt tracks the
// last fire so we don't re-show on every Home re-mount.
let _lastChangeAt = 0;
let _lastShownAt = 0;
DeviceEventEmitter.addListener(EVENTS.shiftsChanged, () => {
  _lastChangeAt = Date.now();
});
const STALE_MS = 10000; // 10s — generous window for navigation latency

export function PlanUpdatedBanner() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(SLIDE_FROM);

  const trigger = () => {
    _lastShownAt = Date.now();
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_MS, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      withDelay(VISIBLE_MS, withTiming(0, { duration: FADE_MS })),
    );
    translateY.value = withSequence(
      withTiming(0, { duration: FADE_MS, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      withDelay(VISIBLE_MS, withTiming(SLIDE_FROM, { duration: FADE_MS })),
    );
  };

  useEffect(() => {
    // On mount, if there's an un-shown recent change, fire it.
    if (
      _lastChangeAt > _lastShownAt &&
      Date.now() - _lastChangeAt < STALE_MS
    ) {
      trigger();
    }
    const sub = DeviceEventEmitter.addListener(EVENTS.shiftsChanged, trigger);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]} pointerEvents="none">
      <GlassCard variant="paper" padding="md" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Glyph name="sparkle" size={16} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow>{t('today.plan_updated_eyebrow')}</Eyebrow>
            <Text variant="bodyMd" color="ink" style={{ marginTop: 2 }}>
              {t('today.plan_updated_body')}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
});
