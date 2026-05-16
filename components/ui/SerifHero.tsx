/**
 * <SerifHero> — rare soft hero line, Fraunces Italic 300.
 * Cap at 5 words / 60 chars. Max once per screen.
 */

import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../../constants/tokens';

interface Props {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  color?: keyof typeof colors;
  style?: StyleProp<TextStyle>;
}

export function SerifHero({ children, align = 'left', color = 'ink', style }: Props) {
  if (__DEV__ && typeof children === 'string' && children.length > 60) {
     
    console.warn(`<SerifHero> content is ${children.length} chars — keep under 60. "${children}"`);
  }
  return (
    <Text
      variant="serifHero"
      family="serif"
      weight="lightItalic"
      color={color}
      align={align}
      style={style}
    >
      {children}
    </Text>
  );
}

export default SerifHero;
