/**
 * S43 — Transition Plan (modal). 2-day checklist: Night → Day.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  HeroNumber,
  Text,
  Glyph,
  PillCTA,
} from '../components/ui';
import { colors, spacing, radii } from '../constants/tokens';
import { mockTransition } from '../mock/user';

export default function Transition() {
  const [days, setDays] = useState(mockTransition.days);

  const toggleStep = (dayIdx: number, stepIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              steps: d.steps.map((s, j) => (j === stepIdx ? { ...s, done: !s.done } : s)),
            }
          : d,
      ),
    );
  };

  return (
    <Screen orbs="normal" scroll>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => {
            router.canGoBack() ? router.back() : router.replace('/(tabs)');
          }}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close transition plan"
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <Eyebrow>{`TRANSITION · ${mockTransition.fromShift.toUpperCase()} → ${mockTransition.toShift.toUpperCase()}`}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>Two quiet days ahead.</SerifHero>
      </View>

      {days.map((d, dayIdx) => {
        const done = d.steps.filter((s) => s.done).length;
        const total = d.steps.length;
        return (
          <GlassCard
            key={d.label}
            variant="glass"
            padding="xxl"
            style={{ marginBottom: spacing.lg }}
          >
            <View style={styles.dayHeader}>
              <View>
                <Eyebrow>{`DAY ${dayIdx + 1} · ${d.label.toUpperCase()}`}</Eyebrow>
                <HeroNumber
                  value={`${done} of ${total}`}
                  size="md"
                  label="complete"
                  labelPosition="below"
                  style={{ marginTop: 2 }}
                />
              </View>
              <View
                style={[
                  styles.progressChip,
                  { backgroundColor: done === total ? colors.primaryContainer : colors.surfaceHigh },
                ]}
              >
                <Text
                  variant="labelMd"
                  family="body"
                  weight="medium"
                  color={done === total ? 'onPrimaryContainer' : 'inkMuted'}
                  uppercase
                >
                  {done === total ? 'DONE' : 'IN PROGRESS'}
                </Text>
              </View>
            </View>

            <View style={{ height: spacing.lg }} />

            {d.steps.map((step, stepIdx) => (
              <Pressable
                key={stepIdx}
                onPress={() => toggleStep(dayIdx, stepIdx)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: step.done }}
                accessibilityLabel={`${step.time} ${step.action}`}
                style={styles.stepRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    step.done && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {step.done && <Glyph name="check" size={14} color="onPrimary" />}
                </View>
                <View style={styles.stepBody}>
                  <View style={styles.stepHead}>
                    <Text
                      variant="mono"
                      family="mono"
                      weight="medium"
                      color={step.done ? 'inkMuted' : 'primary'}
                    >
                      {step.time}
                    </Text>
                    <View style={{ width: spacing.md }} />
                    <Text
                      variant="titleMd"
                      family="display"
                      weight="medium"
                      color={step.done ? 'inkMuted' : 'ink'}
                      style={[{ flex: 1 }, step.done && { textDecorationLine: 'line-through' }]}
                    >
                      {step.action}
                    </Text>
                  </View>
                  {step.tip ? (
                    <Text
                      variant="bodyMd"
                      color="inkSubtle"
                      style={{ marginTop: 2 }}
                    >
                      {step.tip}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </GlassCard>
        );
      })}

      <Pressable style={{ alignSelf: 'center', marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <Text variant="bodyMd" color="primary" weight="medium">
          Why this works →
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  progressChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.inkGhost,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepBody: {
    flex: 1,
  },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
