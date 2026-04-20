/**
 * <Eyebrow> — uppercase tracked micro-label.
 * Sits above hero numbers, section groups, CTAs.
 */

import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../../constants/tokens';

interface Props {
  children: React.ReactNode;
  color?: keyof typeof colors;
  size?: 'lg' | 'md';
  style?: StyleProp<TextStyle>;
}

export function Eyebrow({ children, color = 'inkMuted', size = 'lg', style }: Props) {
  return (
    <Text
      variant={size === 'lg' ? 'labelLg' : 'labelMd'}
      family="body"
      weight="medium"
      color={color}
      uppercase
      style={style}
    >
      {children}
    </Text>
  );
}

export default Eyebrow;
