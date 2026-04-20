/**
 * <FloatingTabBar> — custom tab bar for app/(tabs)/_layout.tsx.
 * Floating pill with blur, primary-tinted shadow, mini sage dot for active tab.
 * Pass to Tabs via tabBar={(props) => <FloatingTabBar {...props} />}.
 */

import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, shadows } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';
import { Text } from './Text';

// Loose typing so we don't depend on @react-navigation/bottom-tabs being in package.json.
// expo-router v6 passes the standard React Navigation bottom-tabs props shape.
interface TabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  navigation: {
    emit: (event: { type: string; target?: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

const TAB_ICONS: Record<string, GlyphName> = {
  index: 'home',
  schedule: 'calendar',
  plan: 'bed',
  profile: 'user',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Today',
  schedule: 'Schedule',
  plan: 'Sleep Plan',
  profile: 'Profile',
};

export function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { bottom: insets.bottom + 12 },
        shadows.tabBar,
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.pill, { borderRadius: radii.pill }]}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]} />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radii.pill,
              backgroundColor: Platform.OS === 'ios' ? 'rgba(253,250,247,0.78)' : 'rgba(253,250,247,0.95)',
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const iconName = TAB_ICONS[route.name] ?? 'sparkle';
          const label = TAB_LABELS[route.name] ?? route.name;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={focused ? { selected: true } : {}}
              style={styles.tab}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Glyph name={iconName} size={22} color={focused ? 'primary' : 'inkMuted'} />
              <Text
                variant="labelMd"
                family="body"
                weight="medium"
                color={focused ? 'primary' : 'inkMuted'}
                uppercase
                style={{ marginTop: 4 }}
              >
                {label}
              </Text>
              <View
                style={{
                  marginTop: 3,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: focused ? colors.primary : 'transparent',
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  pill: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
});

export default FloatingTabBar;
