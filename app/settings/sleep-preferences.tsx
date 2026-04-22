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

const SHIFT_OPTIONS: SegmentOption<ShiftKind>[] = [
  { value: 'day', label: 'Day shift' },
  { value: 'night', label: 'Night shift' },
  { value: 'off', label: 'Off day' },
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
      'Reset all answers?',
      'Wipes the quiz state and replays onboarding from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
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
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>SETTINGS</Eyebrow>
      <HeroNumber
        value="Sleep preferences"
        size="md"
        style={{ marginTop: spacing.lg }}
      />
      <Text
        variant="bodyMd"
        color="inkSubtle"
        style={{ marginTop: spacing.md }}
      >
        {"Tweak any answer — your plan updates instantly."}
      </Text>

      {/* Profession */}
      <SectionHeader label="PROFESSION" />
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
      <SectionHeader label="SCHEDULE PATTERN" />
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
        label="WHERE YOU ARE TODAY"
        subtitle="So we can anchor your plan."
      />
      <SegmentedControl<ShiftKind>
        options={SHIFT_OPTIONS}
        value={state.currentShift}
        onChange={(v) => update({ currentShift: v })}
      />
      <View style={styles.commuteHeader}>
        <Eyebrow>Commute time</Eyebrow>
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
        accessibilityLabel="Commute time in minutes"
        style={{ marginTop: spacing.sm }}
      />

      {/* Main problem */}
      <SectionHeader label="WHAT BOTHERS YOU MOST" />
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
        label="CHRONOTYPE"
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
      <SectionHeader label="CAFFEINE" />
      <View style={{ marginBottom: spacing.lg }}>
        <Stepper
          value={state.caffeineCupsPerDay}
          min={0}
          max={8}
          step={1}
          unit="cups/day"
          onChange={(v) => update({ caffeineCupsPerDay: v })}
          accessibilityLabel="Cups per day"
        />
      </View>
      <Eyebrow style={{ marginBottom: spacing.md }}>USUAL TYPE</Eyebrow>
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
      <SectionHeader label="MELATONIN" />
      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          I take it
        </Text>
        <Toggle
          value={state.takesMelatonin}
          onChange={(v) => update({ takesMelatonin: v })}
          accessibilityLabel="Take melatonin"
        />
      </View>
      {state.takesMelatonin && (
        <View style={{ marginTop: spacing.md }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>DOSE (MG)</Eyebrow>
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
      <SectionHeader label="FAMILY" />
      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          Kids at home
        </Text>
        <Toggle
          value={state.hasChildren}
          onChange={(v) => update({ hasChildren: v })}
          accessibilityLabel="Have kids at home"
        />
      </View>
      {state.hasChildren && (
        <View style={{ marginTop: spacing.md }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>PICKUP TIME</Eyebrow>
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
      <SectionHeader label="NAME" />
      <TextField
        placeholder="Marina"
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
              {"Wipes the quiz and walks you through onboarding again."}
            </Text>
          </View>
          <Pressable
            onPress={onResetAlert}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Reset onboarding answers"
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
