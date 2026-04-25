/**
 * S43 — Transition Plan (modal). 2-day checklist: Night → Day.
 */

import React, { useEffect, useMemo, useState } from 'react';
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
} from '../components/ui';
import { colors, spacing, radii } from '../constants/tokens';
import { mockTransition } from '../mock/user';
import { useActiveTransitionPlan } from '../lib/queries';

interface UiStep {
  id: string;
  time: string;
  action: string;
  tip: string;
  done: boolean;
}
interface UiDay {
  label: string;
  steps: UiStep[];
}

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

function formatHourMinute(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function dayLabel(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00');
  return `${WEEKDAY_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}`;
}

export default function Transition() {
  const { data: livePlan } = useActiveTransitionPlan();

  // Build UiDay[] from either the live plan or mockTransition fallback.
  const initialDays = useMemo<UiDay[]>(() => {
    if (livePlan && livePlan.steps.length > 0) {
      const byDay = new Map<number, UiStep[]>();
      for (const s of livePlan.steps) {
        const arr = byDay.get(s.day_number) ?? [];
        arr.push({
          id: s.id,
          time: formatHourMinute(s.scheduled_time),
          action: s.title,
          tip: s.description ?? '',
          done: s.is_completed,
        });
        byDay.set(s.day_number, arr);
      }
      // start_date for day 1, +1 for day 2, etc.
      const start = new Date(livePlan.start_date + 'T00:00:00');
      return Array.from(byDay.entries())
        .sort(([a], [b]) => a - b)
        .map(([n, steps]) => {
          const d = new Date(start);
          d.setDate(start.getDate() + (n - 1));
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return { label: dayLabel(iso), steps };
        });
    }
    // Fallback: hardcoded mock so the demo + signed-out UX still tells a story.
    return mockTransition.days.map((d) => ({
      label: d.label,
      steps: d.steps.map((s, i) => ({
        id: `mock-${d.label}-${i}`,
        time: s.time,
        action: s.action,
        tip: s.tip,
        done: s.done,
      })),
    }));
  }, [livePlan]);

  const [days, setDays] = useState<UiDay[]>(initialDays);

  // Re-seed when live plan arrives (e.g. opened modal before query resolved).
  useEffect(() => {
    setDays(initialDays);
  }, [initialDays]);

  const fromShift = livePlan
    ? livePlan.transition_type === 'night_to_day' ? 'Night' : 'Day'
    : mockTransition.fromShift;
  const toShift = livePlan
    ? livePlan.transition_type === 'night_to_day' ? 'Day' : 'Night'
    : mockTransition.toShift;

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
    <Screen orbs="normal" scroll tabBarClearance={false}>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => {
            if (router.canDismiss?.()) {
              router.dismiss();
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close transition plan"
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <Eyebrow>{`TRANSITION · ${fromShift.toUpperCase()} → ${toShift.toUpperCase()}`}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>Two quiet days ahead.</SerifHero>
      </View>

      {days.map((d, dayIdx) => {
        const done = d.steps.filter((s) => s.done).length;
        const total = d.steps.length;
        const status =
          done === 0 ? 'PENDING' : done === total ? 'DONE' : 'IN PROGRESS';
        const chipBg =
          status === 'DONE'
            ? colors.primaryContainer
            : status === 'IN PROGRESS'
            ? colors.surfaceHigh
            : colors.surfaceLow;
        const chipFg = status === 'DONE' ? 'onPrimaryContainer' : 'inkMuted';
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
              <View style={[styles.progressChip, { backgroundColor: chipBg }]}>
                <Text
                  variant="labelMd"
                  family="body"
                  weight="medium"
                  color={chipFg}
                  uppercase
                >
                  {status}
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
