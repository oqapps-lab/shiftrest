/**
 * <Slider> — horizontal slider with sage filled track + primary knob.
 *
 * Rebuilt (2026-06-05) on the SAME proven pattern as DeskCare's SeveritySlider
 * (react-native-gesture-handler Gesture.Pan + react-native-reanimated shared
 * values), because the old PanResponder version lagged "every other touch":
 *   - onChange is an inline arrow at the call site → the panResponder useMemo
 *     was recreated on the re-render that the drag's OWN onChange triggered →
 *     the active touch's responder went stale mid-gesture → that drag dropped.
 *   - children received the touch so evt.locationX was relative to the wrong
 *     view → erratic jumps.
 * Here the knob position lives on the UI thread (shared value `x`); only a
 * throttled, step-SNAPPED value crosses to JS via onChange — so a JS re-render
 * can never tear down the live drag. See docs/INTENSITY_SLIDER.md (DeskCare)
 * for the full rationale; the non-obvious bits are mirrored below.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/tokens';

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const TRACK_HEIGHT = 6;
const KNOB = 22;

export function Slider({
  value,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  accessibilityLabel,
  style,
}: Props) {
  const trackW = useSharedValue(0);
  const x = useSharedValue(0); // knob translateX, px (UI thread)
  const lastReported = useSharedValue(NaN); // last SNAPPED value emitted (dedup)
  const dragging = useSharedValue(false); // true while a drag is live

  const fracOf = (v: number) =>
    max === min ? 0 : Math.min(1, Math.max(0, (v - min) / (max - min)));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackW.value = w;
    x.value = fracOf(value) * (w - KNOB);
  };

  // External value prop → knob position. GATED on `dragging`: never sync while
  // a gesture is live, or the controlled value echo (onChange → parent state →
  // value prop) tugs the knob back to the snapped grid pixel mid-drag = stutter.
  useAnimatedReaction(
    () => ({ v: value, w: trackW.value, d: dragging.value }),
    ({ v, w, d }) => {
      if (d) return;
      if (w <= KNOB) return;
      const f = max === min ? 0 : Math.min(1, Math.max(0, (v - min) / (max - min)));
      const target = f * (w - KNOB);
      if (Math.abs(target - x.value) > 0.5) {
        x.value = target;
      }
    },
    [value],
  );

  const emit = (v: number) => {
    onChange(v);
    void Haptics.selectionAsync();
  };

  // Worklet: px → step-snapped value, emit only when the step changes.
  const report = (px: number) => {
    'worklet';
    const w = trackW.value;
    if (w <= KNOB) return;
    const f = Math.min(1, Math.max(0, px / (w - KNOB)));
    const raw = min + f * (max - min);
    const snapped = Math.min(max, Math.max(min, Math.round((raw - min) / step) * step + min));
    if (snapped !== lastReported.value) {
      lastReported.value = snapped;
      runOnJS(emit)(snapped);
    }
  };

  const pan = Gesture.Pan()
    .minDistance(0) // activate on touch — tap-to-snap, no swipe threshold
    .failOffsetY([-12, 12]) // let a vertical parent ScrollView win
    .onBegin((e) => {
      dragging.value = true;
      const next = Math.min(Math.max(0, e.x - KNOB / 2), trackW.value - KNOB);
      x.value = next;
      report(next);
    })
    .onUpdate((e) => {
      const next = Math.min(Math.max(0, e.x - KNOB / 2), trackW.value - KNOB);
      x.value = next;
      report(next);
    })
    // onFinalize fires on end AND on fail/cancel (vertical scroll) — clear here
    // so `dragging` can never stick true and freeze the prop→position sync.
    .onFinalize(() => {
      dragging.value = false;
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value + KNOB / 2 }));

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        style={[styles.hit, style]}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        hitSlop={8}
      >
        <View style={styles.track} pointerEvents="none">
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Animated.View style={[styles.knob, knobStyle]} pointerEvents="none" />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: {
    height: 44,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.surfaceHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: TRACK_HEIGHT / 2,
  },
  knob: {
    position: 'absolute',
    top: 11, // (44 - 22) / 2
    left: 0,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

export default Slider;
