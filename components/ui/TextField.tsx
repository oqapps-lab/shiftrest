/**
 * <TextField> — styled TextInput with focus ring + soft fill.
 * No hard 1px border per DESIGN-GUIDE anti-pattern; focus state = sage glow.
 */

import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, radii, spacing, typeScale, fonts } from '../../constants/tokens';
import { Eyebrow } from './Eyebrow';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function TextField({
  label,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.root, containerStyle]}>
      {label && (
        <Eyebrow style={{ marginBottom: spacing.xs }}>{label}</Eyebrow>
      )}
      <View
        style={[
          styles.field,
          { backgroundColor: colors.surfaceLow, borderRadius: radii.lg },
          focused && {
            shadowColor: colors.primary,
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
            elevation: 6,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.inkGhost}
          selectionColor={colors.primary}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              ...typeScale.titleMd,
              fontFamily: fonts.body.regular,
              color: colors.ink,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
            },
            inputStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  field: {
    overflow: 'hidden',
  },
});

export default TextField;
