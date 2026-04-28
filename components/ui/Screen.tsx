/**
 * <Screen> — 3-layer wrapper.
 * A: AtmosphericBackground + OrbField (absolute, behind everything)
 * B: content (flex or scroll)
 * C: floatingFooter — absolute bottom, OUTSIDE the scroll container. Use for
 *    CTAs that must always be visible ("Continue", "Start trial", "+ Add shift").
 *    In tab screens (tabBarClearance=true) the footer is lifted above the tab bar
 *    and a soft canvas-to-transparent gradient fade separates it from content.
 *
 * NEVER wrap Screen inside a ScrollView; ScrollView goes inside Screen.
 */

import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AtmosphericBackground } from './AtmosphericBackground';
import { OrbField } from './OrbField';
import { spacing, colors, asGradient } from '../../constants/tokens';

// Floating tab bar occupies roughly this much at the bottom (height + margin).
const TAB_BAR_HEIGHT = 86;

interface Props extends Omit<ScrollViewProps, 'style'> {
  variant?: 'default' | 'dim';
  orbs?: 'subtle' | 'normal' | 'strong' | 'off';
  scroll?: boolean;
  tabBarClearance?: boolean;
  paddingHorizontal?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Rendered absolute at bottom, above scroll content. Use for primary CTAs. */
  floatingFooter?: ReactNode;
  /** Height reserved for floatingFooter content (default 140). */
  footerClearance?: number;
  /** Disable the soft canvas-to-transparent fade gradient under the footer. */
  footerFade?: boolean;
  /**
   * Wrap content in KeyboardAvoidingView so the floating footer (and content)
   * lifts above the keyboard. Enable on any screen with a TextField.
   */
  keyboardAvoiding?: boolean;
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
  floatingFooter,
  footerClearance = 140,
  footerFade = true,
  keyboardAvoiding = false,
  ...scrollProps
}: Props) {
  const insets = useSafeAreaInsets();

  // Where the floating footer sits from the bottom of the Screen.
  // In tab screens, the footer must clear the floating tab bar.
  const footerBottomOffset = tabBarClearance ? insets.bottom + TAB_BAR_HEIGHT + spacing.sm : 0;
  const footerTotalReserve = floatingFooter
    ? footerClearance + footerBottomOffset
    : tabBarClearance
    ? TAB_BAR_HEIGHT + insets.bottom + spacing.md
    : insets.bottom + spacing.md;

  const contentContainer: ViewStyle = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: footerTotalReserve,
    paddingHorizontal,
    flexGrow: 1,
  };

  // Canvas-tint for fade. Use canvasDim when variant=dim, canvas otherwise.
  const fadeColor = variant === 'dim' ? colors.canvasDim : colors.canvas;

  const body = (
    <>
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

      {floatingFooter && footerFade && (
        <LinearGradient
          colors={asGradient([`${fadeColor}00`, `${fadeColor}F2`, `${fadeColor}FF`])}
          locations={[0, 0.55, 1]}
          pointerEvents="none"
          style={[
            styles.footerFade,
            {
              bottom: footerBottomOffset,
              height: footerClearance + spacing.xxl,
            },
          ]}
        />
      )}

      {/* When the screen has the floating tab bar but no floatingFooter, a soft
          fade still helps signal that content scrolls *under* the tab bar
          (rather than being clipped). Without it, settings rows tucked
          behind the tab bar look broken instead of scrollable. */}
      {!floatingFooter && tabBarClearance && footerFade && (
        <LinearGradient
          colors={asGradient([`${fadeColor}00`, `${fadeColor}E6`, `${fadeColor}FF`])}
          locations={[0, 0.6, 1]}
          pointerEvents="none"
          style={[
            styles.footerFade,
            {
              bottom: 0,
              height: TAB_BAR_HEIGHT + insets.bottom + spacing.lg,
            },
          ]}
        />
      )}

      {floatingFooter && (
        <View
          style={[
            styles.floatingFooter,
            {
              bottom: footerBottomOffset,
              paddingHorizontal,
              paddingBottom: tabBarClearance ? 0 : insets.bottom + spacing.md,
              paddingTop: spacing.sm,
            },
          ]}
          pointerEvents="box-none"
        >
          {floatingFooter}
        </View>
      )}
    </>
  );

  if (keyboardAvoiding) {
    // `height` behavior shrinks the KAV when the keyboard opens so
    // absolute-positioned floatingFooter (bottom:0) lifts above the keyboard.
    // `padding` only shifts in-flow content and leaves the footer hidden.
    return (
      <KeyboardAvoidingView
        style={[styles.root, style]}
        behavior="height"
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return <View style={[styles.root, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  nonScroll: { flex: 1 },
  floatingFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

export default Screen;
