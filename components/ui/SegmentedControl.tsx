/**
 * <SegmentedControl> — 2-5 segment pill selector.
 * Active segment has sage fill + onPrimary text. Haptic Light on select.
 */

import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, spacing } from '../../constants/tokens';
import { Text } from './Text';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

interface Props<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  style,
}: Props<T>) {
  return (
    <View style={[styles.root, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(opt.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            style={[
              styles.segment,
              active && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              variant="titleMd"
              family="body"
              weight="medium"
              color={active ? 'onPrimary' : 'inkSubtle'}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
});

export default SegmentedControl;
