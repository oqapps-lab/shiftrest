/**
 * USER-BUG-5 — TodayIntroSheet
 *
 * On-demand legend opened from the "?" beside the timeline ring. Explains what
 * each visual element of the timeline ring means (dusk arc = sleep window,
 * sage arc = shift, marker dot = now), plus what the cards below the ring do,
 * and how to set today's shift / mark an off-day.
 *
 * G6: this is now a REAL draggable bottom sheet — grab the grey handle and
 * swipe down to dismiss (or tap the backdrop). Built on react-native-gesture-
 * handler + reanimated (both already in the app); no new dependency.
 *
 * Note: gestures inside a RN <Modal> need their OWN GestureHandlerRootView —
 * the app-root one (app/_layout.tsx) does not reach the modal's separate
 * native view hierarchy, so the handle wouldn't drag without this wrapper.
 */

import React, { useEffect } from 'react';
import { Modal, View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard, Eyebrow, Text, SerifHero, PillCTA } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

const SPRING = { damping: 18, stiffness: 160 };

export function TodayIntroSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height: screenH } = useWindowDimensions();
  // Sheet sits 12% from the top, so its travel to fully off-screen ≈ 88% of
  // the screen height. Refined precisely once the sheet lays out.
  const sheetH = useSharedValue(screenH * 0.88);
  const translateY = useSharedValue(screenH); // start fully closed (off-screen)

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING);
    } else {
      translateY.value = sheetH.value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Animated close: slide down, then flip the parent's `visible` on the JS
  // thread once the animation lands.
  const close = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateY.value = withTiming(sheetH.value, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  // Drag handle gesture — lives on the handle zone only so it never fights the
  // inner ScrollView. Drag past 25% of the sheet (or fling) to dismiss.
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > sheetH.value * 0.25 || e.velocityY > 800) {
        translateY.value = withTiming(sheetH.value, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  // Tap the dimmed backdrop to dismiss (previously impossible).
  const backdropTap = Gesture.Tap().onEnd(() => {
    runOnJS(close)();
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetH.value], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={backdropTap}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </GestureDetector>
        <Animated.View
          style={[styles.sheet, sheetStyle]}
          onLayout={(ev) => {
            const h = ev.nativeEvent.layout.height;
            if (h > 0) sheetH.value = h;
          }}
        >
          {/* Drag-to-dismiss handle zone */}
          <GestureDetector gesture={pan}>
            <View style={styles.handleZone}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.huge }}
            showsVerticalScrollIndicator={false}
          >
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

            <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
              <View style={styles.row}>
                <View style={[styles.swatch, { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMd" family="display" weight="medium" color="ink">
                    {t('today_intro.set_shift_title')}
                  </Text>
                  <Text variant="bodyMd" color="inkSubtle">
                    {t('today_intro.set_shift_sub')}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.xl }}>
              <View style={styles.row}>
                <View style={[styles.swatch, { backgroundColor: colors.duskGlow }]} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMd" family="display" weight="medium" color="ink">
                    {t('today_intro.offday_title')}
                  </Text>
                  <Text variant="bodyMd" color="inkSubtle">
                    {t('today_intro.offday_sub')}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <View style={{ marginBottom: spacing.xxl }}>
              <PillCTA variant="primary" label={t('today_intro.got_it')} onPress={close} />
            </View>
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
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
  handleZone: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.inkGhost,
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
