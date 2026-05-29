/**
 * USER-BUG-8 — WhyTheseTimesSheet
 *
 * Replaces the raw Alert.alert previously fired from the Plan tab's
 * "Why these times?" link. Renders a properly-styled bottom sheet
 * (Animated backdrop + sheet slide) that breaks down each anchor
 * time with a one-line rationale, plus the live plan's free-form
 * explanation (when present) and a citation footer.
 */

import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, Animated, Easing, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard, Eyebrow, Text, SerifHero, PillCTA, Glyph } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

interface Reason {
  glyphFg: 'primary' | 'sunriseDim' | 'duskDim';
  glyphBg: string;
  glyph: 'moon' | 'coffee' | 'sun' | 'sparkle';
  title: string;
  body: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Live LLM-generated explanation if available. */
  explanation?: string | null;
  /** Anchor times to render as reasons. */
  sleepStart: string;
  sleepEnd: string;
  caffeineCutoff: string;
  melatoninTime: string | null;
  chronotypeLabel: string;
  shiftLabel: string;
}

export function WhyTheseTimesSheet({
  visible,
  onClose,
  explanation,
  sleepStart,
  sleepEnd,
  caffeineCutoff,
  melatoninTime,
  chronotypeLabel,
  shiftLabel,
}: Props) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(1)).current;

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

  const dismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const reasons: Reason[] = [
    {
      glyph: 'moon',
      glyphFg: 'duskDim',
      glyphBg: colors.duskGlow,
      title: t('plan.why.sleep_title', { start: sleepStart, end: sleepEnd }),
      body: t('plan.why.sleep_body', { chrono: chronotypeLabel, shift: shiftLabel }),
    },
    {
      glyph: 'coffee',
      glyphFg: 'sunriseDim',
      glyphBg: colors.sunriseGlow,
      title: t('plan.why.caffeine_title', { time: caffeineCutoff }),
      body: t('plan.why.caffeine_body'),
    },
    ...(melatoninTime
      ? [{
          glyph: 'sparkle' as const,
          glyphFg: 'primary' as const,
          glyphBg: colors.primaryContainer,
          title: t('plan.why.melatonin_title', { time: melatoninTime }),
          body: t('plan.why.melatonin_body'),
        }]
      : []),
    {
      glyph: 'sun',
      glyphFg: 'sunriseDim',
      glyphBg: colors.sunriseGlow,
      title: t('plan.why.light_title'),
      body: t('plan.why.light_body'),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]} />
      </Pressable>
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 700] }) },
            ],
          },
        ]}
      >
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.huge * 2 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
            <Eyebrow>{t('plan.why.eyebrow')}</Eyebrow>
            <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
              <SerifHero>{t('plan.why.hero')}</SerifHero>
            </View>
            <Text variant="bodyLg" color="inkSubtle" style={{ marginBottom: spacing.xl }}>
              {t('plan.why.sub', { chrono: chronotypeLabel, shift: shiftLabel })}
            </Text>

            {reasons.map((r, idx) => (
              <GlassCard key={idx} variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
                <View style={styles.row}>
                  <View style={[styles.iconWrap, { backgroundColor: r.glyphBg }]}>
                    <Glyph name={r.glyph} size={22} color={r.glyphFg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMd" family="display" weight="medium" color="ink">
                      {r.title}
                    </Text>
                    <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                      {r.body}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}

            {explanation && explanation.trim().length > 0 && (
              <GlassCard variant="paper" padding="lg" style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
                <Eyebrow style={{ marginBottom: spacing.xs }}>{t('plan.why.tuned_label')}</Eyebrow>
                <Text variant="bodyMd" color="ink">
                  {explanation.trim()}
                </Text>
              </GlassCard>
            )}

            <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
              {t('plan.why.citation')}
            </Text>

            <PillCTA variant="primary" label={t('plan.why.close')} onPress={dismiss} />
          </View>
        </ScrollView>
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
    // QA-2: was top:'10%' which left only ~30px of tappable dim above the
    // safe-area top, so backdrop-tap to dismiss was effectively unreachable.
    // Increase to 18% so the visible dim band is large enough that users
    // hitting "outside" actually land in the Pressable.
    top: '18%',
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WhyTheseTimesSheet;
