/**
 * AppDialog — branded replacement for the stock iOS `Alert.alert`.
 *
 * Owner feedback 2026-05-31: native Alert popups look generic ("уродство").
 * This renders a styled bottom sheet (Animated backdrop + slide) with
 * GlassCard surface + PillCTA actions, matching the app's design language.
 *
 * Usage — drop-in for Alert.alert:
 *   showAppDialog({
 *     title: 'Log a cup of coffee?',
 *     message: 'Cup #2 today…',
 *     actions: [
 *       { label: 'Cancel', style: 'cancel' },
 *       { label: 'Log it', onPress: () => logCaffeine() },
 *     ],
 *   });
 *
 * Mount <AppDialogHost/> ONCE at the app root (app/_layout.tsx). Backdrop
 * tap = dismiss (runs the cancel action's onPress if present). One dialog
 * at a time; a second call replaces the first.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from './GlassCard';
import { PillCTA } from './PillCTA';
import { Text } from './Text';
import { SerifHero } from './SerifHero';
import { colors, spacing } from '../../constants/tokens';

export type DialogActionStyle = 'default' | 'cancel' | 'destructive';

export interface DialogAction {
  label: string;
  style?: DialogActionStyle;
  onPress?: () => void;
}

export interface DialogOptions {
  title?: string;
  message?: string;
  actions: DialogAction[];
}

// ─── imperative bridge ──────────────────────────────────────────────────────
type Emit = (opts: DialogOptions) => void;
let hostEmit: Emit | null = null;

export function showAppDialog(opts: DialogOptions): void {
  if (hostEmit) {
    hostEmit(opts);
  } else if (__DEV__) {
    console.warn('[AppDialog] host not mounted; dialog dropped:', opts.title);
  }
}

// ─── host ───────────────────────────────────────────────────────────────────
export function AppDialogHost() {
  const [opts, setOpts] = useState<DialogOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    hostEmit = (o: DialogOptions) => {
      setOpts(o);
      setVisible(true);
    };
    return () => {
      hostEmit = null;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(1);
    }
  }, [visible, fade, slide]);

  const close = (action?: DialogAction) => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
    ]).start(() => {
      setVisible(false);
      setOpts(null);
      action?.onPress?.();
    });
  };

  const onBackdrop = () => {
    const cancel = opts?.actions.find((a) => a.style === 'cancel');
    close(cancel);
  };

  if (!opts) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onBackdrop}>
      <Pressable style={styles.backdropPress} onPress={onBackdrop} accessibilityRole="button">
        <Animated.View style={[styles.backdrop, { opacity: fade }]} />
      </Pressable>
      <Animated.View
        style={[
          styles.sheetWrap,
          { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 360] }) }] },
        ]}
        pointerEvents="box-none"
      >
        <GlassCard variant="elevated" padding="xxl" style={styles.card}>
          {opts.title ? <SerifHero align="left">{opts.title}</SerifHero> : null}
          {opts.message ? (
            <Text variant="bodyLg" color="inkSubtle" style={{ marginTop: spacing.sm }}>
              {opts.message}
            </Text>
          ) : null}
          <View style={{ marginTop: spacing.xl }}>
            {opts.actions.map((a, i) => (
              <View key={a.label} style={i > 0 ? { marginTop: spacing.sm } : undefined}>
                <PillCTA
                  label={a.label}
                  variant={a.style === 'destructive' ? 'dusk' : a.style === 'cancel' ? 'glass' : 'primary'}
                  size={a.style === 'cancel' ? 'md' : undefined}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    close(a);
                  }}
                />
              </View>
            ))}
          </View>
        </GlassCard>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropPress: { ...StyleSheet.absoluteFillObject },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,22,20,0.42)' },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
  },
});

export default AppDialogHost;
