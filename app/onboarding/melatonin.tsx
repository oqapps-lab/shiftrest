/**
 * S09 — Melatonin usage. Step 9 / 11.
 * Toggle with conditional dose + time reveal. Time presets 20/22/00
 * plus Custom that opens a wheel time picker (USER-BUG-2).
 */

import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Modal, TouchableWithoutFeedback, Platform, Animated, Easing } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useOnboarding, type MelatoninTime } from '../../lib/onboarding/store';
import {
  Screen,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  OnboardingBack,
  Toggle,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { mockMelatoninDoses } from '../../mock/user';
import { t } from '../../lib/i18n';

const PRESETS: { value: MelatoninTime; label: string }[] = [
  { value: '20', label: '20:00' },
  { value: '22', label: '22:00' },
  { value: '00', label: '00:00' },
];

function isPreset(v: MelatoninTime): boolean {
  return v === '20' || v === '22' || v === '00';
}

function parseTime(v: MelatoninTime): Date {
  const d = new Date();
  if (isPreset(v)) {
    d.setHours(parseInt(v, 10), 0, 0, 0);
    return d;
  }
  const [h, m] = v.split(':').map((n) => parseInt(n, 10) || 0);
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Melatonin() {
  const { state, update } = useOnboarding();
  const takes = state.takesMelatonin;
  const dose = state.melatoninDoseMg ?? '0.5';
  const time = state.melatoninTime;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(parseTime(time));
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pickerOpen) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(1);
    }
  }, [pickerOpen, fade, slide]);

  const openCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft(parseTime(time));
    setPickerOpen(true);
  };

  const doneCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update({ melatoninTime: formatTime(draft) });
    setPickerOpen(false);
  };

  const customSelected = !isPreset(time);

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          onPress={() => router.push('/onboarding/family')}
        />
      }
    >
      <OnboardingBack />
      <Eyebrow>{t('onboarding.step_template', { n: 9, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={8}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding.melatonin.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding.melatonin.sub')}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {t('onboarding.melatonin.yes_toggle')}
        </Text>
        <Toggle
          value={takes}
          onChange={(v) => update({ takesMelatonin: v })}
          accessibilityLabel={t('onboarding.melatonin.toggle_a11y')}
        />
      </View>

      {takes && (
        <View style={{ marginTop: spacing.xl }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>{t('onboarding.melatonin.dose_label')}</Eyebrow>
          <View style={styles.chipRow}>
            {mockMelatoninDoses.map((d) => {
              const active = dose === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    update({ melatoninDoseMg: d });
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${d} mg`}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.primary : colors.surfaceHigh },
                  ]}
                >
                  <Text
                    variant="titleMd"
                    family="body"
                    weight="medium"
                    color={active ? 'onPrimary' : 'ink'}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            {t('onboarding.melatonin.usual_time_label')}
          </Eyebrow>
          <View style={styles.chipRow}>
            {PRESETS.map((p) => {
              const active = time === p.value;
              return (
                <Pressable
                  key={p.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    update({ melatoninTime: p.value });
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.primary : colors.surfaceHigh },
                  ]}
                >
                  <Text
                    variant="titleMd"
                    family="body"
                    weight="medium"
                    color={active ? 'onPrimary' : 'ink'}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={openCustom}
              accessibilityRole="button"
              accessibilityState={{ selected: customSelected }}
              accessibilityLabel={t('onboarding.melatonin.custom_a11y')}
              style={[
                styles.chip,
                { backgroundColor: customSelected ? colors.primary : colors.surfaceHigh },
              ]}
            >
              <Text
                variant="titleMd"
                family="body"
                weight="medium"
                color={customSelected ? 'onPrimary' : 'ink'}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {customSelected ? time : t('onboarding.melatonin.custom_label')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Modal visible={pickerOpen} transparent animationType="none" onRequestClose={() => setPickerOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setPickerOpen(false)}>
          <Animated.View style={[sheet.backdrop, { opacity: fade }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            sheet.sheet,
            {
              transform: [
                { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) },
              ],
            },
          ]}
        >
          <View style={sheet.handle} />
          <View style={sheet.headerRow}>
            <Pressable onPress={() => setPickerOpen(false)} hitSlop={12} accessibilityRole="button">
              <Text variant="labelMd" weight="medium" color="inkMuted" uppercase>
                {t('add_shift.cancel')}
              </Text>
            </Pressable>
            <Text variant="labelMd" weight="medium" color="ink" uppercase>
              {t('onboarding.melatonin.usual_time_label')}
            </Text>
            <Pressable onPress={doneCustom} hitSlop={12} accessibilityRole="button">
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    flex: 1,
    minWidth: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
