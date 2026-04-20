/**
 * <GlassCard> — primary container primitive.
 * Variants go from weightless (whisper) to full frosted glass (glass).
 * Glass variant uses BlurView + warm tint + 1px top highlight.
 * Android BlurView is noisy → falls back to semi-opaque fill.
 */

import React, { ReactNode } from 'react';
import { Platform, StyleSheet, StyleProp, View, ViewStyle, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  radii,
  spacing,
  gradients,
  asGradient,
  SpacingToken,
} from '../../constants/tokens';

type Variant =
  | 'whisper'
  | 'paper'
  | 'elevated'
  | 'glass'
  | 'mint'
  | 'dusk'
  | 'sunrise';

interface Props extends Omit<ViewProps, 'style'> {
  variant?: Variant;
  padding?: SpacingToken;
  radius?: keyof typeof radii;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const fillMap: Record<Variant, string | 'glass'> = {
  whisper: colors.surfaceLow,
  paper: colors.surface,
  elevated: colors.surfaceHigh,
  glass: 'glass',
  mint: colors.primaryContainer,
  dusk: colors.duskGlow,
  sunrise: colors.sunriseGlow,
};

export function GlassCard({
  variant = 'paper',
  padding = 'xxl',
  radius = 'xl',
  style,
  children,
  ...rest
}: Props) {
  const borderRadius = radii[radius];
  const pad = spacing[padding];
  const common: ViewStyle = {
    borderRadius,
    padding: pad,
    overflow: 'hidden',
  };

  // Glass variant: blur + tint + highlight
  if (variant === 'glass') {
    return (
      <View style={[common, style]} {...rest}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        ) : null}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                Platform.OS === 'ios'
                  ? colors.glassTintWarm
                  : colors.glassTintWarmAndroid,
            },
          ]}
        />
        <LinearGradient
          colors={asGradient(gradients.glassHighlight)}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.12 }}
          style={styles.topHighlight}
          pointerEvents="none"
        />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // Solid variants
  return (
    <View
      style={[common, { backgroundColor: fillMap[variant] as string }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  topHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
  },
  content: {
    width: '100%',
  },
});

export default GlassCard;
