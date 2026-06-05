/**
 * S04 — Current Shift anchor. Step 3 / 11.
 * Segmented control (day/night/off) + two tappable wheel time pickers
 * (DateTimePickerField, mode='time') + commute slider.
 *
 * History: earlier attempts wrapped a custom TimeCard inside GlassCard
 * variants — paper/glass/elevated all rendered as invisible against the
 * orbs gradient. Switched to the SAME DateTimePickerField that
 * add-shift.tsx uses (whisper variant with chevron + a known-good label
 * + value layout). One source of truth for the picker UI, predictable
 * render across screens.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../../lib/onboarding/store';
import {
  Screen,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  OnboardingBack,
  SegmentedControl,
  Slider,
  DateTimePickerField,
  type SegmentOption,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
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

export default function CurrentShift() {
  const { state, update } = useOnboarding();
  const shift = state.currentShift;
  const isOff = shift === 'off';
  // R26-2: a night shift whose end time-of-day is <= start crosses midnight
  // (e.g. 19:00 -> 07:00). The time wheels are time-of-day only, so make the
  // overnight span explicit instead of showing bare same-looking times.
  const crossMidnight =
    !isOff && parseHHMM(state.currentShiftEnd) <= parseHHMM(state.currentShiftStart);

  return (
    <Screen
      orbs="subtle"
      // R26-1: scroll={false} ON PURPOSE — a ScrollView intermittently captures
      // the tap gesture on the day/night SegmentedControl + time pickers, so the
      // toggle "breaks every other tap". Reliable touch beats theoretical overflow.
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
      <OnboardingBack />
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
        onChange={(v) => {
          // R4-1: flip START/END defaults when shift kind changes so the
          // picker doesnt show 07:00 — 19:00 for Night shift. We only
          // reset the times if they still match the canonical defaults
          // for the OUTGOING kind, so user edits arent silently wiped.
          const patch: { currentShift: ShiftKind; currentShiftStart?: string; currentShiftEnd?: string } = {
            currentShift: v,
          };
          if (v === 'night' && state.currentShiftStart === '07:00' && state.currentShiftEnd === '19:00') {
            patch.currentShiftStart = '19:00';
            patch.currentShiftEnd = '07:00';
          } else if (v === 'day' && state.currentShiftStart === '19:00' && state.currentShiftEnd === '07:00') {
            patch.currentShiftStart = '07:00';
            patch.currentShiftEnd = '19:00';
          }
          update(patch);
        }}
      />

      {!isOff && (
        <>
          <View style={{ marginTop: spacing.xl }}>
            <DateTimePickerField
              label={t('onboarding_screens.current_shift.start')}
              mode="time"
              value={parseHHMM(state.currentShiftStart)}
              onChange={(d) => update({ currentShiftStart: formatHHMM(d) })}
              accessibilityLabel={t('onboarding_screens.current_shift.start')}
            />
            <DateTimePickerField
              label={t('onboarding_screens.current_shift.end')}
              mode="time"
              value={parseHHMM(state.currentShiftEnd)}
              onChange={(d) => update({ currentShiftEnd: formatHHMM(d) })}
              accessibilityLabel={t('onboarding_screens.current_shift.end')}
            />
            {crossMidnight && (
              <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.sm }}>
                {t('onboarding_screens.current_shift.ends_next_day')}
              </Text>
            )}
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
  commuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
