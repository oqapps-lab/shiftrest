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
import { colors } from '../../constants/tokens';

interface Props {
  size?: number;
  pulse?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
}

export function BreathingOrb({ size = 280, pulse = true, children, style }: Props) {
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
            {/* Outer halo — wide mint bloom */}
            <RadialGradient id="breathHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.primaryContainer} stopOpacity={1} />
              <Stop offset="30%" stopColor={colors.primaryContainer} stopOpacity={0.85} />
              <Stop offset="65%" stopColor={colors.primaryContainer} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={colors.primaryContainer} stopOpacity={0} />
            </RadialGradient>
            {/* Mid ring — sage warmth for depth */}
            <RadialGradient id="breathMid" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.primaryBright} stopOpacity={0.65} />
              <Stop offset="55%" stopColor={colors.primaryBright} stopOpacity={0.25} />
              <Stop offset="100%" stopColor={colors.primaryBright} stopOpacity={0} />
            </RadialGradient>
            {/* Inner core — deep sage dot for solid anchor */}
            <RadialGradient id="breathCore" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.55} />
              <Stop offset="60%" stopColor={colors.primary} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#breathHalo)" />
          <Circle cx={size / 2} cy={size / 2} r={size / 2.5} fill="url(#breathMid)" />
          <Circle cx={size / 2} cy={size / 2} r={size / 4} fill="url(#breathCore)" />
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
