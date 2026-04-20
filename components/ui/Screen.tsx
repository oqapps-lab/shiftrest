/**
 * <Screen> — 3-layer wrapper.
 * A: AtmosphericBackground + OrbField (absolute, behind everything)
 * B: content (flex or scroll)
 * C: floating UI (rendered by parent layout — e.g. FloatingTabBar)
 *
 * NEVER wrap Screen inside a ScrollView; ScrollView goes inside Screen.
 */

import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from './AtmosphericBackground';
import { OrbField } from './OrbField';
import { spacing } from '../../constants/tokens';

interface Props extends ScrollViewProps {
  variant?: 'default' | 'dim';
  orbs?: 'subtle' | 'normal' | 'strong' | 'off';
  scroll?: boolean;
  tabBarClearance?: boolean;
  paddingHorizontal?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  children?: ReactNode;
}

export function Screen({
  variant = 'default',
  orbs = 'normal',
  scroll = true,
  tabBarClearance = true,
  paddingHorizontal = spacing.xxl,
  style,
  contentStyle,
  children,
  ...scrollProps
}: Props) {
  const insets = useSafeAreaInsets();

  const contentContainer: ViewStyle = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: (tabBarClearance ? 160 : spacing.huge) + insets.bottom,
    paddingHorizontal,
    flexGrow: 1,
  };

  return (
    <View style={[styles.root, style]}>
      <AtmosphericBackground variant={variant === 'dim' ? 'dim' : 'warm'} />
      {orbs !== 'off' && <OrbField intensity={orbs} />}

      {scroll ? (
        <ScrollView
          contentContainerStyle={[contentContainer, contentStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.nonScroll, contentContainer, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  nonScroll: { flex: 1 },
});

export default Screen;
