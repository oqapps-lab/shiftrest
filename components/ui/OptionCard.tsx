/**
 * <OptionCard> — picker row card. Extracted from S02 Profession pattern for reuse.
 * Shows a glyph + title + subtitle + right-side radio. Active state switches to glass + mint tint.
 */

import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, spacing } from '../../constants/tokens';
import { GlassCard } from './GlassCard';
import { Glyph, GlyphName } from './Glyph';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  glyph?: GlyphName;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function OptionCard({
  title,
  subtitle,
  glyph,
  selected,
  onPress,
  accessibilityLabel,
  right,
  style,
}: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[{ marginBottom: spacing.md }, style]}
    >
      <GlassCard
        variant={selected ? 'glass' : 'paper'}
        padding="xxl"
        style={[
          styles.row,
          selected && {
            shadowColor: colors.primary,
            shadowOpacity: 0.18,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          },
        ]}
      >
        {glyph && (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: selected ? colors.primaryContainer : colors.surfaceHigh },
            ]}
          >
            <Glyph name={glyph} size={22} color={selected ? 'primary' : 'inkMuted'} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text variant="titleLg" family="display" weight="medium" color="ink">
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
        {right ?? (
          <View
            style={[
              styles.radio,
              { borderColor: selected ? colors.primary : colors.inkGhost },
            ]}
          >
            {selected && <View style={styles.radioInner} />}
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

export default OptionCard;
