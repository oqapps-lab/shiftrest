/**
 * <SerifHero> — rare soft hero line, Fraunces Italic 300.
 * Cap at 5 words / 60 chars. Max once per screen.
 */

import React from 'react';
import { TextStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../../constants/tokens';

interface Props {
  children: string;
  align?: 'left' | 'center' | 'right';
  color?: keyof typeof colors;
  style?: TextStyle;
}

export function SerifHero({ children, align = 'left', color = 'ink', style }: Props) {
  if (__DEV__ && children.length > 60) {
    // eslint-disable-next-line no-console
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
