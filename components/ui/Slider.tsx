/**
 * <Slider> — horizontal slider with sage filled track and primary knob.
 * Light haptic on value change.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, PanResponder, LayoutChangeEvent } from 'react-native';
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
  const [width, setWidth] = React.useState(0);
  const lastStepRef = React.useRef(value);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const fraction = (v: number) => (max === min ? 0 : (clamp(v) - min) / (max - min));

  const panResponder = React.useMemo(
    () => {
      const clampLocal = (v: number) => Math.min(max, Math.max(min, v));
      const snap = (v: number) => {
        const snapped = Math.round((v - min) / step) * step + min;
        return clampLocal(snapped);
      };
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          if (width === 0) return;
          const x = evt.nativeEvent.locationX;
          const v = snap(min + (x / width) * (max - min));
          lastStepRef.current = v;
          onChange(v);
        },
        onPanResponderMove: (evt, gesture) => {
          if (width === 0) return;
          const x = Math.min(width, Math.max(0, evt.nativeEvent.locationX + gesture.dx));
          const v = snap(min + (x / width) * (max - min));
          if (v !== lastStepRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            lastStepRef.current = v;
            onChange(v);
          }
        },
      });
    },
    [width, min, max, step, onChange],
  );

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const pct = fraction(value) * 100;

  return (
    <View
      {...panResponder.panHandlers}
      onLayout={onLayout}
      style={[styles.hit, style]}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
      hitSlop={8}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <View
        style={[
          styles.knob,
          { left: `${pct}%`, marginLeft: -KNOB / 2 },
        ]}
      />
    </View>
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
    top: 11,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.primary,
    // Subtle sage halo — not a dead grey shadow
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

export default Slider;
