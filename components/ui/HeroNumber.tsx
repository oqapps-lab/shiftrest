/**
 * <HeroNumber> — big display number, the meditative anchor.
 * ExtraLight 200, 48–120pt depending on size prop. Weight lives in size, not boldness.
 */

import React from 'react';
import { StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Eyebrow } from './Eyebrow';
import { colors } from '../../constants/tokens';

type Size = 'xxl' | 'xl' | 'lg' | 'md';

interface Props {
  value: string | number;
  size?: Size;
  label?: string;
  labelPosition?: 'above' | 'below';
  align?: 'left' | 'center' | 'right';
  color?: keyof typeof colors;
  style?: StyleProp<ViewStyle>;
  unit?: string;
}

const variantMap: Record<Size, 'displayXxl' | 'displayXl' | 'displayLg' | 'displayMd'> = {
  xxl: 'displayXxl',
  xl: 'displayXl',
  lg: 'displayLg',
  md: 'displayMd',
};

export function HeroNumber({
  value,
  size = 'xl',
  label,
  labelPosition = 'above',
  align = 'left',
  color = 'ink',
  unit,
  style,
}: Props) {
  const alignItems: ViewStyle['alignItems'] =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

  return (
    <View style={[{ alignItems }, style]}>
      {label && labelPosition === 'above' && <Eyebrow>{label}</Eyebrow>}
      <View style={styles.row}>
        <Text
          variant={variantMap[size]}
          family="display"
          weight="extraLight"
          color={color}
          align={align}
          accessibilityRole="text"
          accessibilityLabel={typeof value === 'number' ? `${value}${unit ?? ''}` : String(value)}
        >
          {value}
        </Text>
        {unit && (
          <Text
            variant="labelLg"
            family="body"
            weight="medium"
            color="inkMuted"
            style={styles.unit}
            uppercase
          >
            {unit}
          </Text>
        )}
      </View>
      {label && labelPosition === 'below' && <Eyebrow>{label}</Eyebrow>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  unit: { marginLeft: 8, marginTop: 12 },
});

export default HeroNumber;
