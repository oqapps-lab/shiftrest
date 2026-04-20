/**
 * <PillCTA> — primary anchor button.
 * Haptic on press (Medium), reanimated press scale, a11y baked in.
 * 5 variants: primary / outlined / glass / sunrise / dusk
 *
 * DO NOT use TouchableOpacity elsewhere for CTAs. This is the anchor button.
 */

import React from 'react';
import { Platform, StyleSheet, View, ViewStyle, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  colors,
  radii,
  gradients,
  asGradient,
  shadows,
  motion,
} from '../../constants/tokens';
import { Text } from './Text';

type Variant = 'primary' | 'outlined' | 'glass' | 'sunrise' | 'dusk';
type Size = 'lg' | 'md' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const heights: Record<Size, number> = { lg: 60, md: 52, sm: 44 };
const paddings: Record<Size, number> = { lg: 28, md: 22, sm: 18 };

export function PillCTA({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  iconLeft,
  iconRight,
  loading,
  disabled,
  style,
  fullWidth = true,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, motion.press);
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, motion.pressRelease);
  };
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(
      variant === 'primary'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    );
    onPress?.();
  };

  const textColor: keyof typeof colors =
    variant === 'primary' ? 'onPrimary' :
    variant === 'outlined' ? 'primary' :
    variant === 'glass' ? 'ink' :
    'ink';

  const height = heights[size];
  const paddingHorizontal = paddings[size];

  const glow =
    variant === 'primary' ? shadows.ctaPrimaryGlow :
    variant === 'sunrise' ? shadows.ctaSunriseGlow :
    variant === 'dusk' ? shadows.ctaDuskGlow :
    undefined;

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth && { alignSelf: 'stretch' },
        glow,
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        style={[
          styles.base,
          { height, paddingHorizontal, borderRadius: radii.pill },
          variant === 'outlined' && styles.outlined,
        ]}
      >
        {/* Variant-specific background layer */}
        {variant === 'primary' && (
          <LinearGradient
            colors={asGradient(gradients.ctaPrimary)}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}
        {variant === 'sunrise' && (
          <LinearGradient
            colors={asGradient(gradients.ctaSunrise)}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}
        {variant === 'dusk' && (
          <LinearGradient
            colors={asGradient(gradients.ctaDusk)}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}
        {variant === 'glass' && (
          <>
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={30}
                tint="light"
                style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
              />
            )}
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: radii.pill,
                  backgroundColor:
                    Platform.OS === 'ios'
                      ? 'rgba(255,252,248,0.55)'
                      : 'rgba(252,249,246,0.92)',
                },
              ]}
            />
          </>
        )}

        {/* Inner 1px top highlight for primary + sunrise + dusk — subtle, not glossy */}
        {(variant === 'primary' || variant === 'sunrise' || variant === 'dusk') && (
          <View style={styles.innerHighlight} pointerEvents="none" />
        )}

        {/* Content */}
        <View style={styles.row}>
          {iconLeft && <View style={{ marginRight: 10 }}>{iconLeft}</View>}
          {loading ? (
            <ActivityIndicator color={colors[textColor]} />
          ) : (
            <Text
              variant={size === 'sm' ? 'bodyMd' : 'titleMd'}
              family="body"
              weight="medium"
              color={textColor}
            >
              {label}
            </Text>
          )}
          {iconRight && <View style={{ marginLeft: 10 }}>{iconRight}</View>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerHighlight: {
    position: 'absolute',
    top: 1,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: 0.5,
  },
});

export default PillCTA;
