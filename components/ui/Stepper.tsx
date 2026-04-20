/**
 * <Stepper> — minus/plus number stepper.
 * Large central display number (HeroNumber sm), tinted circle buttons.
 */

import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii } from '../../constants/tokens';
import { Text } from './Text';
import { Glyph } from './Glyph';

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Stepper({
  value,
  min = 0,
  max = 20,
  step = 1,
  onChange,
  unit,
  accessibilityLabel,
  style,
}: Props) {
  const canDec = value - step >= min;
  const canInc = value + step <= max;

  const press = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <View
      style={[styles.root, style]}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
    >
      <Pressable
        onPress={() => press(-step)}
        disabled={!canDec}
        style={[styles.btn, { opacity: canDec ? 1 : 0.4 }]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Glyph name="close" size={18} color="primary" />
      </Pressable>

      <View style={styles.valueWrap}>
        <Text variant="displayMd" family="display" weight="extraLight" color="ink">
          {value}
        </Text>
        {unit && (
          <Text
            variant="labelLg"
            family="body"
            weight="medium"
            color="inkMuted"
            uppercase
            style={{ marginTop: 6, marginLeft: 6 }}
          >
            {unit}
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => press(step)}
        disabled={!canInc}
        style={[styles.btn, { opacity: canInc ? 1 : 0.4 }]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Glyph name="plus" size={18} color="primary" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});

export default Stepper;
