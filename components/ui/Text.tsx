/**
 * <Text> — typography wrapper.
 * Use this instead of RN's Text for any styled text.
 * Ensures family + weight + tracking come from tokens.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { colors, fonts, typeScale, TypeScaleToken } from '../../constants/tokens';

type Family = 'display' | 'body' | 'mono' | 'serif';
type Weight = 'extraLight' | 'light' | 'regular' | 'medium' | 'semiBold' | 'lightItalic';

interface Props extends RNTextProps {
  variant?: TypeScaleToken;
  family?: Family;
  weight?: Weight;
  color?: keyof typeof colors;
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
}

function resolveFont(family: Family, weight: Weight | undefined): string | undefined {
  const group = fonts[family] as Record<string, string>;
  if (weight && group[weight]) return group[weight];
  // Sensible defaults per family
  if (family === 'display') return group.light;
  if (family === 'body') return group.light;
  if (family === 'mono') return group.regular;
  if (family === 'serif') return group.lightItalic;
  return undefined;
}

export function Text({
  variant = 'bodyLg',
  family = 'body',
  weight,
  color = 'ink',
  align,
  uppercase,
  style,
  children,
  ...rest
}: Props) {
  const scale = typeScale[variant];
  const fontFamily = resolveFont(family, weight);

  const composed: TextStyle = {
    fontFamily,
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    color: colors[color],
    textAlign: align,
    textTransform: uppercase ? 'uppercase' : undefined,
  };

  return (
    <RNText style={[composed, style]} allowFontScaling {...rest}>
      {children}
    </RNText>
  );
}

export default Text;
