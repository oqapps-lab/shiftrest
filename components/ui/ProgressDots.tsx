/**
 * <ProgressDots> — row of dots, active dot sage-filled and 1.4× size.
 * Used for onboarding progress, pager indicators, streak heatmaps.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../constants/tokens';

interface Props {
  count: number;
  active: number;
  variant?: 'primary' | 'sunrise' | 'dusk';
  size?: 8 | 10 | 12;
  style?: ViewStyle;
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
        const dotSize = isActive ? size * 1.4 : size;
        return (
          <View
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isActive ? activeColor : colors.inkGhost,
              marginHorizontal: 4,
              opacity: isActive ? 1 : 0.55,
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
