/**
 * S51 — Sleep preferences (edit). Compound form of every quiz answer.
 *
 * Reads + writes via the shared OnboardingProvider, so changes here are
 * the same source-of-truth as Profile, Home greeting, and (eventually)
 * the Supabase profiles row. Auto-save on every interaction — no
 * "Save" button required since we're updating a live store.
 *
 * Sections mirror the onboarding step order so users coming from the
 * funnel recognise the layout. Each block is a labelled card with the
 * primitive that the original step used (segmented / chips / option /
 * stepper / textfield).
 */

import React from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  HeroNumber,
  Text,
  GlassCard,
  Glyph,
  OptionCard,
  Toggle,
  SegmentedControl,
  Slider,
  Stepper,
  TextField,
  type SegmentOption,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import {
  mockProfessions,
  mockScheduleTemplates,
  mockMainProblems,
  mockChronotypeQuestions,
  mockCaffeineTypes,
  mockCaffeineSensitivities,
  mockMelatoninDoses,
} from '../../mock/user';
import {
  useOnboarding,
  type Profession,
  type ScheduleId,
  type ShiftKind,
  type MainProblem,
  type CaffeineType,
  type CaffeineSensitivity,
  type MelatoninTime,
  type PickupTime,
} from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

const getShiftOptions = (): SegmentOption<ShiftKind>[] => [
  { value: 'day', label: t('shift_kind.day_long') },
  { value: 'night', label: t('shift_kind.night_long') },
  { value: 'off', label: t('shift_kind.off_long') },
];

const MELATONIN_TIME_OPTIONS: { value: MelatoninTime; label: string }[] = [
  { value: '20', label: '20:00' },
  { value: '22', label: '22:00' },
  { value: '00', label: '00:00' },
];

const PICKUP_OPTIONS: { value: PickupTime; label: string }[] = [
  { value: '14', label: '14:00' },
  { value: '15', label: '15:00' },
  { value: '16', label: '16:00' },
  { value: '17', label: '17:00' },
];

function SectionHeader({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <View style={{ marginTop: spacing.huge, marginBottom: spacing.md }}>
      <Eyebrow>{label}</Eyebrow>
      {subtitle ? (
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export default function SleepPreferences() {
  const { state, update, reset } = useOnboarding();

  const onResetAlert = () => {
    Alert.alert(
      t('sleep_prefs.reset_alert.title'),
      t('sleep_prefs.reset_alert.message'),
      [
        { text: t('sleep_prefs.reset_alert.cancel'), style: 'cancel' },
        {
          text: t('sleep_prefs.reset_alert.confirm'),
          style: 'destructive',
          onPress: () => {
            reset();
            router.replace('/onboarding/profession');
          },
        },
      ],
    );
  };

  return (
    <Screen orbs="subtle" scroll keyboardAvoiding tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/(tabs)/profile')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('sleep_prefs.eyebrow')}</Eyebrow>
      <HeroNumber
        value={t('sleep_prefs.title')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />
      <Text
        variant="bodyMd"
        color="inkSubtle"
        style={{ marginTop: spacing.md }}
      >
        {t('sleep_prefs.subtitle')}
      </Text>

      {/* Profession */}
      <SectionHeader label={t('sleep_prefs.section_profession')} />
      {mockProfessions.map((p) => (
        <OptionCard
          key={p.id}
          title={p.title}
          subtitle={p.subtitle}
          glyph={p.glyph}
          selected={state.profession === p.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            update({ profession: p.id as Profession });
          }}
          accessibilityLabel={p.title}
        />
      ))}

      {/* Schedule template */}
      <SectionHeader label={t('sleep_prefs.section_schedule')} />
      {mockScheduleTemplates.map((s) => (
        <OptionCard
          key={s.id}
          title={s.title}
          subtitle={s.subtitle}
          glyph={s.glyph}
          selected={state.scheduleId === s.id}
          onPress={() => update({ scheduleId: s.id as ScheduleId })}
          accessibilityLabel={s.title}
        />
      ))}

      {/* Current shift */}
      <SectionHeader
        label={t('sleep_prefs.section_today')}
        subtitle="So we can anchor your plan."
      />
      <SegmentedControl<ShiftKind>
        options={getShiftOptions()}
        value={state.currentShift}
        onChange={(v) => update({ currentShift: v })}
      />
      <View style={styles.commuteHeader}>
        <Eyebrow>{t('sleep_prefs.commute')}</Eyebrow>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {`${state.commuteMinutes} min`}
        </Text>
      </View>
      <Slider
        min={0}
        max={90}
        step={5}
        value={state.commuteMinutes}
        onChange={(v) => update({ commuteMinutes: v })}
        accessibilityLabel={t('a11y.commute_time_minutes')}
        style={{ marginTop: spacing.sm }}
      />

      {/* Main problem */}
      <SectionHeader label={t('sleep_prefs.section_problem')} />
      {mockMainProblems.map((p) => (
        <OptionCard
          key={p.id}
          title={p.title}
          subtitle={p.subtitle}
          glyph={p.glyph}
          selected={state.mainProblem === p.id}
          onPress={() => update({ mainProblem: p.id as MainProblem })}
          accessibilityLabel={p.title}
        />
      ))}

      {/* Chronotype quiz */}
      <SectionHeader
        label={t('sleep_prefs.section_chronotype')}
        subtitle="Tap any answer to update."
      />
      {mockChronotypeQuestions.map((q, qIdx) => (
        <View key={q.id} style={{ marginBottom: spacing.lg }}>
          <Text
            variant="titleMd"
            family="display"
            weight="medium"
            color="ink"
            style={{ marginBottom: spacing.sm }}
          >
            {`Q${qIdx + 1}. ${q.question}`}
          </Text>
          {q.options.map((opt) => (
            <OptionCard
              key={opt.id}
              title={opt.label}
              selected={state.chronotypeAnswers[q.id] === opt.id}
              onPress={() =>
                update({
                  chronotypeAnswers: {
                    ...state.chronotypeAnswers,
                    [q.id]: opt.id,
                  },
                })
              }
              accessibilityLabel={`${q.question} — ${opt.label}`}
            />
          ))}
        </View>
      ))}

      {/* Caffeine */}
      <SectionHeader label={t('sleep_prefs.section_caffeine')} />
      <View style={{ marginBottom: spacing.lg }}>
        <Stepper
          value={state.caffeineCupsPerDay}
          min={0}
          max={8}
          step={1}
          unit="cups/day"
          onChange={(v) => update({ caffeineCupsPerDay: v })}
          accessibilityLabel={t('a11y.cups_per_day')}
        />
      </View>
      <Eyebrow style={{ marginBottom: spacing.md }}>{t('sleep_prefs.usual_type')}</Eyebrow>
      {mockCaffeineTypes.map((t) => (
        <OptionCard
          key={t.id}
          title={t.label}
          glyph={t.glyph}
          selected={state.caffeineType === t.id}
          onPress={() => update({ caffeineType: t.id as CaffeineType })}
          accessibilityLabel={t.label}
        />
      ))}
      <Eyebrow style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        SENSITIVITY
      </Eyebrow>
      {mockCaffeineSensitivities.map((s) => (
        <OptionCard
          key={s.id}
          title={s.label}
          subtitle={s.subtitle}
          selected={state.caffeineSensitivity === s.id}
          onPress={() =>
            update({ caffeineSensitivity: s.id as CaffeineSensitivity })
          }
          accessibilityLabel={s.label}
        />
      ))}

      {/* Melatonin */}
      <SectionHeader label={t('sleep_prefs.section_melatonin')} />
      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          I take it
        </Text>
        <Toggle
          value={state.takesMelatonin}
          onChange={(v) => update({ takesMelatonin: v })}
          accessibilityLabel={t('a11y.take_melatonin')}
        />
      </View>
      {state.takesMelatonin && (
        <View style={{ marginTop: spacing.md }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>{t('sleep_prefs.dose_mg')}</Eyebrow>
          <View style={styles.chipRow}>
            {mockMelatoninDoses.map((d) => {
              const active = state.melatoninDoseMg === d;
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
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceHigh,
                    },
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
          <Eyebrow style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
            USUAL TIME
          </Eyebrow>
          <SegmentedControl<MelatoninTime>
            options={MELATONIN_TIME_OPTIONS}
            value={state.melatoninTime}
            onChange={(v) => update({ melatoninTime: v })}
          />
        </View>
      )}

      {/* Family */}
      <SectionHeader label={t('sleep_prefs.section_family')} />
      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          Kids at home
        </Text>
        <Toggle
          value={state.hasChildren}
          onChange={(v) => update({ hasChildren: v })}
          accessibilityLabel={t('a11y.have_kids_at_home')}
        />
      </View>
      {state.hasChildren && (
        <View style={{ marginTop: spacing.md }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>{t('sleep_prefs.pickup_time')}</Eyebrow>
          <SegmentedControl<PickupTime>
            options={PICKUP_OPTIONS}
            value={state.pickupTime}
            onChange={(v) => update({ pickupTime: v })}
          />
        </View>
      )}
      <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        OTHER COMMITMENTS
      </Eyebrow>
      <TextField
        placeholder="e.g. yoga Tue/Thu 18:00"
        value={state.otherCommitments}
        onChangeText={(v) => update({ otherCommitments: v })}
        autoCapitalize="sentences"
      />

      {/* Display name */}
      <SectionHeader label={t('sleep_prefs.section_name')} />
      <TextField
        placeholder={t('sleep_prefs.name_placeholder')}
        value={state.displayName}
        onChangeText={(v) => update({ displayName: v })}
        autoCapitalize="words"
      />

      {/* Reset */}
      <View style={{ height: spacing.huge }} />
      <GlassCard variant="paper" padding="xl">
        <View style={styles.resetRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              Reset all answers
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
              {t('sleep_prefs.restart_dev_hint')}
            </Text>
          </View>
          <Pressable
            onPress={onResetAlert}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.reset_onboarding_answers')}
            style={styles.resetButton}
          >
            <Text variant="labelMd" weight="medium" color="coralDim" uppercase>
              Reset
            </Text>
          </Pressable>
        </View>
      </GlassCard>

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  commuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minWidth: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    marginLeft: spacing.md,
  },
});
