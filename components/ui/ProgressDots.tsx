/**
 * <ProgressDots> — row of dots for progress / pager indicators.
 * Past dots: primaryContainer (mint trail). Active: primary (or accent) filled, 1.4× size.
 * Future: inkGhost faint.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing } from '../../constants/tokens';

interface Props {
  count: number;
  active: number;
  variant?: 'primary' | 'sunrise' | 'dusk';
  size?: 8 | 10 | 12;
  style?: StyleProp<ViewStyle>;
}

const activeColorMap = {
  primary: colors.primary,
  sunrise: colors.sunrise,
  dusk: colors.dusk,
};

export function ProgressDots({
  count,
  active,
  variant = 'primary',
  size = 10,
  style,
}: Props) {
  const activeColor = activeColorMap[variant];
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        const isPast = i < active;
        const dotSize = isActive ? size * 1.4 : size;
        const bg = isActive
          ? activeColor
          : isPast
          ? colors.primaryContainer
          : colors.inkGhost;
        return (
          <View
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: bg,
              marginHorizontal: 4,
              opacity: isActive ? 1 : isPast ? 1 : 0.75,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
});

export default ProgressDots;
