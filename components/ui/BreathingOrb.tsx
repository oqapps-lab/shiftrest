/**
 * <BreathingOrb> — radial mint glow, optionally pulsing at 4s breath cycle.
 * Used as hero visual on Welcome, Loading, and meditation/focus screens.
 */

import React, { useEffect, ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  size?: number;
  pulse?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
}

export function BreathingOrb({ size = 220, pulse = true, children, style }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withTiming(1.08, {
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        true,
      );
    } else {
      scale.value = 1;
    }
  }, [pulse, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      pointerEvents="none"
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="breath" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#C7EAE1" stopOpacity={0.9} />
              <Stop offset="45%" stopColor="#C7EAE1" stopOpacity={0.45} />
              <Stop offset="70%" stopColor="#C7EAE1" stopOpacity={0.18} />
              <Stop offset="100%" stopColor="#C7EAE1" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#breath)" />
        </Svg>
      </Animated.View>
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  children: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BreathingOrb;
