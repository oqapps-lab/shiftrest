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
  /** Adds a second gradient layer that oscillates opacity + scale on a
   *  different period than the breath, producing a living "shimmer"
   *  (owner ask on the plan-generating screen). */
  shimmer?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
}

export function BreathingOrb({ size = 280, pulse = true, shimmer = false, children, style }: Props) {
  const scale = useSharedValue(1);
  const shimmerV = useSharedValue(0);

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

  useEffect(() => {
    if (shimmer) {
      // 2.6s period (offset from the 4s breath) → the two cycles drift in
      // and out of phase, giving a slow "перелив" rather than a metronome.
      shimmerV.value = withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      shimmerV.value = 0;
    }
  }, [shimmer, shimmerV]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + shimmerV.value * 0.65,
    transform: [{ scale: 0.82 + shimmerV.value * 0.3 }],
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
      {shimmer && (
        <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]} pointerEvents="none">
          <Svg width={size} height={size}>
            <Defs>
              {/* Own scope — SVG gradient ids don't cross <Svg> boundaries. */}
              <RadialGradient id="shimMid" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.primaryBright} stopOpacity={0.7} />
                <Stop offset="55%" stopColor={colors.primaryBright} stopOpacity={0.25} />
                <Stop offset="100%" stopColor={colors.primaryBright} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="shimCore" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.6} />
                <Stop offset="60%" stopColor={colors.primary} stopOpacity={0.2} />
                <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2.5} fill="url(#shimMid)" />
            <Circle cx={size / 2} cy={size / 2} r={size / 4} fill="url(#shimCore)" />
          </Svg>
        </Animated.View>
      )}
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
