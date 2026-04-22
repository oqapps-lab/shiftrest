/**
 * S09 — Melatonin usage. Step 8 / 10.
 * Toggle with conditional dose + time reveal.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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
  Toggle,
  SegmentedControl,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { mockMelatoninDoses } from '../../mock/user';

const TIME_OPTIONS: { value: MelatoninTime; label: string }[] = [
  { value: '20', label: '20:00' },
  { value: '22', label: '22:00' },
  { value: '00', label: '00:00' },
];

export default function Melatonin() {
  const { state, update } = useOnboarding();
  const takes = state.takesMelatonin;
  const dose = state.melatoninDoseMg;
  const time = state.melatoninTime;

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Continue"
          onPress={() => router.push('/onboarding/family')}
        />
      }
    >
      <Eyebrow>STEP 8 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={7}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="Do you take melatonin?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {"If yes, we'll tune the timing to your rotation."}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          Yes, I take it
        </Text>
        <Toggle
          value={takes}
          onChange={(v) => update({ takesMelatonin: v })}
          accessibilityLabel="Take melatonin"
        />
      </View>

      {takes && (
        <View style={{ marginTop: spacing.xl }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>DOSE (MG)</Eyebrow>
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
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.surfaceHigh,
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

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            USUAL TIME TAKEN
          </Eyebrow>
          <SegmentedControl<MelatoninTime>
            options={TIME_OPTIONS}
            value={time}
            onChange={(v) => update({ melatoninTime: v })}
          />
        </View>
      )}
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
});
