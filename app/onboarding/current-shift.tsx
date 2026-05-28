/**
 * S04 — Current Shift anchor. Step 3 / 11.
 * Segmented control (day/night/off) + two TAPPABLE time cards (wheel
 * picker) + commute slider. Switching to 'off' hides times + slider.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Modal, TouchableWithoutFeedback, Platform, Animated, Easing } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useOnboarding } from '../../lib/onboarding/store';
import {
  Screen,
  GlassCard,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  SegmentedControl,
  Slider,
  type SegmentOption,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

type ShiftKind = 'day' | 'night' | 'off';

const getSegmentOptions = (): SegmentOption<ShiftKind>[] => [
  { value: 'day', label: t('onboarding_screens.current_shift.day_shift') },
  { value: 'night', label: t('onboarding_screens.current_shift.night_shift') },
  { value: 'off', label: t('onboarding_screens.current_shift.off_day') },
];

function parseHHMM(s: string): Date {
  const [h, m] = s.split(':').map((n) => parseInt(n, 10) || 0);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function TimeCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(parseHHMM(value));
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(1);
    }
  }, [open, fade, slide]);

  const openSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft(parseHHMM(value));
    setOpen(true);
  };

  const done = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(formatHHMM(draft));
    setOpen(false);
  };

  return (
    <>
      <Pressable onPress={openSheet} style={{ flex: 1 }} accessibilityRole="button">
        <GlassCard variant="paper" padding="lg" style={styles.timeCard}>
          <Eyebrow size="md">{label}</Eyebrow>
          <Text
            variant="headlineLg"
            family="display"
            weight="extraLight"
            color="ink"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ marginTop: spacing.xs }}
          >
            {value}
          </Text>
        </GlassCard>
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <Animated.View style={[sheet.backdrop, { opacity: fade }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            sheet.sheet,
            {
              transform: [
                {
                  translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }),
                },
              ],
            },
          ]}
        >
          <View style={sheet.handle} />
          <View style={sheet.headerRow}>
            <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityRole="button">
              <Text variant="labelMd" weight="medium" color="inkMuted" uppercase>
                {t('add_shift.cancel')}
              </Text>
            </Pressable>
            <Text variant="labelMd" weight="medium" color="ink" uppercase>
              {label}
            </Text>
            <Pressable onPress={done} hitSlop={12} accessibilityRole="button">
              <Text variant="labelMd" weight="medium" color="primary" uppercase>
                {t('add_shift.done')}
              </Text>
            </Pressable>
          </View>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={draft}
              mode="time"
              display="spinner"
              minuteInterval={5}
              onChange={(_: DateTimePickerEvent, picked?: Date) => picked && setDraft(picked)}
              style={{ height: 220 }}
              themeVariant="light"
            />
          ) : (
            <DateTimePicker
              value={draft}
              mode="time"
              display="default"
              onChange={(_: DateTimePickerEvent, picked?: Date) => picked && setDraft(picked)}
            />
          )}
        </Animated.View>
      </Modal>
    </>
  );
}

export default function CurrentShift() {
  const { state, update } = useOnboarding();
  const shift = state.currentShift;
  const isOff = shift === 'off';

  return (
    <Screen
      orbs="subtle"
      scroll={false}
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          onPress={() => router.push('/onboarding/next-shift')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 3, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={2}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.current_shift.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding_screens.current_shift.sub')}
      </Text>

      <SegmentedControl<ShiftKind>
        options={getSegmentOptions()}
        value={shift}
        onChange={(v) => update({ currentShift: v })}
      />

      {!isOff && (
        <>
          <View style={styles.timeRow}>
            <TimeCard
              label={t('onboarding_screens.current_shift.start')}
              value={state.currentShiftStart}
              onChange={(v) => update({ currentShiftStart: v })}
            />
            <TimeCard
              label={t('onboarding_screens.current_shift.end')}
              value={state.currentShiftEnd}
              onChange={(v) => update({ currentShiftEnd: v })}
            />
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <View style={styles.commuteHeader}>
              <Eyebrow>{t('onboarding_screens.current_shift.commute_label')}</Eyebrow>
              <Text variant="titleMd" family="display" weight="medium" color="ink">
                {state.commuteMinutes} min
              </Text>
            </View>
            <Slider
              min={0}
              max={90}
              step={5}
              value={state.commuteMinutes}
              onChange={(v) => update({ commuteMinutes: v })}
              accessibilityLabel={t('onboarding_screens.current_shift.commute_a11y')}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  timeCard: {
    flex: 1,
  },
  commuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const sheet = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingBottom: spacing.huge,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkGhost,
  },
});
