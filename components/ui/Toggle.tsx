/**
 * <Toggle> — iOS-style pill switch. Sage when on, ghost when off.
 * Haptic Light on toggle.
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/tokens';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const WIDTH = 52;
const HEIGHT = 30;
const KNOB = 24;
const PAD = 3;

export function Toggle({ value, onChange, disabled, accessibilityLabel, style }: Props) {
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: 180,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.primary : colors.surfaceHigh,
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (WIDTH - KNOB - PAD * 2) }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    padding: PAD,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.surfaceLowest,
    // No shadow on light theme — rely on contrast
  },
});

export default Toggle;
