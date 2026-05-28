/**
 * USER-BUG-5 — TodayIntroSheet
 *
 * One-time explainer popup shown on first visit to the Today tab.
 * Surfaces what each visual element of the timeline ring means
 * (dusk arc = sleep window, sage arc = shift, marker dot = now),
 * plus what the cards below the ring do.
 *
 * Storage: shiftrest:today-intro:v1 (set to '1' on dismiss). Never
 * re-shown after that — users who re-open the app already know.
 */

import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { GlassCard, Eyebrow, Text, SerifHero, PillCTA } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

const STORAGE_KEY = 'shiftrest:today-intro:v1';

export function TodayIntroSheet() {
  const [visible, setVisible] = useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(STORAGE_KEY);
        if (!seen) setVisible(true);
      } catch {
        // Storage error: don't block the screen.
      }
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slide, { toValue: 0, duration: 320, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(1);
    }
  }, [visible, fade, slide]);

  const dismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore — at worst they see it once more next launch
    }
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]} />
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 600] }) },
            ],
          },
        ]}
      >
        <View style={styles.handle} />
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
          <Eyebrow>{t('today_intro.eyebrow')}</Eyebrow>
          <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
            <SerifHero>{t('today_intro.hero')}</SerifHero>
          </View>
          <Text variant="bodyLg" color="inkSubtle" style={{ marginBottom: spacing.xl }}>
            {t('today_intro.sub')}
          </Text>

          <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
            <View style={styles.row}>
              <View style={[styles.swatch, { backgroundColor: colors.duskGlow }]} />
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {t('today_intro.dusk_title')}
                </Text>
                <Text variant="bodyMd" color="inkSubtle">
                  {t('today_intro.dusk_sub')}
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
            <View style={styles.row}>
              <View style={[styles.swatch, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {t('today_intro.shift_title')}
                </Text>
                <Text variant="bodyMd" color="inkSubtle">
                  {t('today_intro.shift_sub')}
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
            <View style={styles.row}>
              <View style={[styles.swatchDot, { backgroundColor: colors.ink }]} />
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {t('today_intro.now_title')}
                </Text>
                <Text variant="bodyMd" color="inkSubtle">
                  {t('today_intro.now_sub')}
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.xl }}>
            <View style={styles.row}>
              <View style={[styles.swatch, { backgroundColor: colors.sunriseGlow }]} />
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {t('today_intro.cards_title')}
                </Text>
                <Text variant="bodyMd" color="inkSubtle">
                  {t('today_intro.cards_sub')}
                </Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ marginBottom: spacing.xxl }}>
            <PillCTA variant="primary" label={t('today_intro.got_it')} onPress={dismiss} />
          </View>
          <Pressable onPress={dismiss} hitSlop={12} style={{ alignSelf: 'center', marginBottom: spacing.huge }}>
            <Text variant="bodyMd" color="inkMuted">
              {t('today_intro.skip')}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '12%',
    bottom: 0,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkGhost,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 6,
    marginRight: 6,
  },
});

export default TodayIntroSheet;
