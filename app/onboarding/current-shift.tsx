/**
 * S04 — Current Shift anchor. Step 3 / 10.
 * Segmented control (day/night/off) + two time cards + commute slider.
 * Time values are static mocks — a real TimePicker primitive is not yet in the design system,
 * so we render read-only display cards. Replace with picker when primitive lands.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
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
import { spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

type ShiftKind = 'day' | 'night' | 'off';

const SEGMENT_OPTIONS: SegmentOption<ShiftKind>[] = [
  { value: 'day', label: t('onboarding_screens.current_shift.day_shift') },
  { value: 'night', label: t('onboarding_screens.current_shift.night_shift') },
  { value: 'off', label: t('onboarding_screens.current_shift.off_day') },
];

const SHIFT_TIMES: Record<ShiftKind, { start: string; end: string }> = {
  day: { start: '07:00', end: '19:00' },
  night: { start: '19:00', end: '07:00' },
  off: { start: '—', end: '—' },
};

export default function CurrentShift() {
  const { state, update } = useOnboarding();
  const shift = state.currentShift;
  const commute = state.commuteMinutes;
  const times = SHIFT_TIMES[shift];

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          onPress={() => router.push('/onboarding/problem')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 3, total: 10 })}</Eyebrow>
      <ProgressDots
        count={10}
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
        options={SEGMENT_OPTIONS}
        value={shift}
        onChange={(v) => update({ currentShift: v })}
      />

      <View style={styles.timeRow}>
        <GlassCard variant="paper" padding="lg" style={styles.timeCard}>
          <Eyebrow size="md">{t('onboarding_screens.current_shift.start')}</Eyebrow>
          <Text
            variant="headlineLg"
            family="display"
            weight="extraLight"
            color="ink"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ marginTop: spacing.xs }}
          >
            {times.start}
          </Text>
        </GlassCard>
        <GlassCard variant="paper" padding="lg" style={styles.timeCard}>
          <Eyebrow size="md">{t('onboarding_screens.current_shift.end')}</Eyebrow>
          <Text
            variant="headlineLg"
            family="display"
            weight="extraLight"
            color="ink"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ marginTop: spacing.xs }}
          >
            {times.end}
          </Text>
        </GlassCard>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <View style={styles.commuteHeader}>
          <Eyebrow>{t('onboarding_screens.current_shift.commute_label')}</Eyebrow>
          <Text variant="titleMd" family="display" weight="medium" color="ink">
            {commute} min
          </Text>
        </View>
        <Slider
          min={0}
          max={90}
          step={5}
          value={commute}
          onChange={(v) => update({ commuteMinutes: v })}
          accessibilityLabel={t('onboarding_screens.current_shift.commute_a11y')}
          style={{ marginTop: spacing.sm }}
        />
      </View>
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
