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
import { getMockTransition } from '../mock/user';
import { useActiveTransitionPlan, EVENTS, emitChange } from '../lib/queries';
import { toggleLocalTransitionStep } from '../lib/local-transition/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth/store';
import { t } from '../lib/i18n';
import type { Translations } from '../lib/i18n/locales/en';

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

/**
 * Headline copy that adapts to plan progress. Reads how many steps are
 * left across all days and picks a phrase that matches state — avoids
 * a stale "Two quiet days ahead." after the plan is half done.
 */
function transitionHeadline(days: UiDay[]): string {
  const allSteps = days.flatMap((d) => d.steps);
  const total = allSteps.length;
  const done = allSteps.filter((s) => s.done).length;
  const remaining = total - done;

  if (total === 0) return t('transition.plan_being_prepared');
  if (done === total) return t('transition.plan_complete');
  if (done === 0) {
    const numberWords = (t('number_words') as unknown) as Translations['number_words'];
    const dayWord = Array.isArray(numberWords)
      ? numberWords[Math.min(days.length, 7)] ?? `${days.length}`
      : `${days.length}`;
    return days.length === 1
      ? t('transition.quiet_day_ahead', { word: dayWord })
      : t('transition.quiet_days_ahead', { word: dayWord });
  }
  if (remaining === 1) return t('transition.one_step_to_go');
  return t('transition.steps_to_go', { n: remaining });
}

function formatHourMinute(iso: string): string {
  // AUDIT-I(tz): scheduled_time is stored as a local wall-clock string
  // ('2026-05-28T06:00:00'); read back from the timestamptz column it gains a
  // +00:00 offset, so new Date(...).getHours() would shift it by the device
  // UTC offset. Read the HH:MM straight from the ISO string instead.
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (m) return `${m[1]}:${m[2]}`;
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function dayLabel(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00');
  const weekdays = (t('date.weekdays_short') as unknown) as Translations['date']['weekdays_short'];
  const abbr = Array.isArray(weekdays) ? weekdays[d.getDay()] : '';
  return `${abbr} ${String(d.getDate()).padStart(2, '0')}`;
}

export default function Transition() {
  const { data: livePlan } = useActiveTransitionPlan();
  const { user } = useAuth();
  // B22: getMockTransition() returns a fresh object literal every call.
  // Calling it on every render made `mockTransition.days` a new reference
  // each render → the initialDays useMemo below recomputes every render →
  // the useEffect that re-seeds `days` fires every render → infinite
  // setState loop ("Maximum update depth exceeded"). Memoise per mount so
  // the ref is stable; the modal re-mounts on each open anyway, so we
  // don't need locale-on-change re-eval here.
  const mockTransition = useMemo(() => getMockTransition(), []);

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
    // B23: fallback now uses TODAY and TOMORROW for the day labels instead
    // of the static "WED 22 / THU 23" baked into the mock. The mock's
    // step content (action, time, tip) is still demo copy, but the dates
    // surface as reality so they don't read as bugs to reviewers.
    const today = new Date();
    return mockTransition.days.map((d, dayIdx) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayIdx);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return {
        label: dayLabel(iso),
        steps: d.steps.map((s, i) => ({
          id: `mock-${dayIdx}-${i}`,
          time: s.time,
          action: s.action,
          tip: s.tip,
          done: false,
        })),
      };
    });
  }, [livePlan, mockTransition.days]);

  const [days, setDays] = useState<UiDay[]>(initialDays);

  // Re-seed when live plan arrives (e.g. opened modal before query resolved).
  useEffect(() => {
    setDays(initialDays);
  }, [initialDays]);

  const fromShift = livePlan
    ? livePlan.transition_type === 'night_to_day' ? t('transition.shift.night') : t('transition.shift.day')
    : mockTransition.fromShift;
  const toShift = livePlan
    ? livePlan.transition_type === 'night_to_day' ? t('transition.shift.day') : t('transition.shift.night')
    : mockTransition.toShift;

  const toggleStep = (dayIdx: number, stepIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const stepRef = days[dayIdx]?.steps[stepIdx];
    if (!stepRef) return;
    const nextDone = !stepRef.done;

    // QA-BUG-7: optimistic local toggle for instant feedback…
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              steps: d.steps.map((s, j) => (j === stepIdx ? { ...s, done: nextDone } : s)),
            }
          : d,
      ),
    );

    // AUDIT-I: mock fallback steps (id 'mock-*') are demo-only — never
    // persist them; a signed-in user would otherwise fire an invalid-UUID
    // update against transition_steps.
    if (stepRef.id.startsWith('mock-')) return;

    // …then persist to whichever backend the live plan came from. Without
    // this, the next time the modal mounts useActiveTransitionPlan re-reads
    // unchanged data and the checkmark vanishes.
    const isAnon = !isSupabaseConfigured || !supabase || !user?.id;
    if (isAnon) {
      // Anon plan: id is a local-step-* string. The store keeps the
      // canonical state and emits its own change event for re-render.
      toggleLocalTransitionStep(stepRef.id);
      return;
    }
    // Signed-in plan: writes to transition_steps so re-fetches see the
    // updated row. Fire-and-forget — local optimistic state covers the
    // UI; a failure leaves the persisted state stale, but we surface no
    // error toast here (consistent with the rest of this modal).
    void supabase!
      .from('transition_steps')
      .update({ is_completed: nextDone })
      .eq('id', stepRef.id)
      .then(() => emitChange(EVENTS.transitionChanged));
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
          accessibilityLabel={t('transition.close_label')}
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <Eyebrow>{t('transition.eyebrow_template', { from: fromShift.toUpperCase(), to: toShift.toUpperCase() })}</Eyebrow>
      <View style={{ marginTop: spacing.lg }}>
        <SerifHero>{transitionHeadline(days)}</SerifHero>
      </View>
      {/* D2: explicit start → end window so the plan reads as bounded, not open-ended. */}
      {days.length >= 2 ? (
        <View style={styles.windowPill}>
          <Glyph name="calendar" size={14} color="primary" />
          <Text variant="labelMd" weight="medium" color="primary" style={{ marginLeft: spacing.xs }}>
            {`${days[0].label} → ${days[days.length - 1].label}`}
          </Text>
        </View>
      ) : null}
      <View style={{ height: spacing.huge }} />

      {days.map((d, dayIdx) => {
        const done = d.steps.filter((s) => s.done).length;
        const total = d.steps.length;
        const statusKind: 'pending' | 'in_progress' | 'done' =
          done === 0 ? 'pending' : done === total ? 'done' : 'in_progress';
        const status = t(`transition.status_${statusKind}`);
        const chipBg =
          statusKind === 'done'
            ? colors.primaryContainer
            : statusKind === 'in_progress'
            ? colors.surfaceHigh
            : colors.surfaceLow;
        const chipFg = statusKind === 'done' ? 'onPrimaryContainer' : 'inkMuted';
        return (
          <GlassCard
            key={d.label}
            variant="glass"
            padding="xxl"
            style={{ marginBottom: spacing.lg }}
          >
            <View style={styles.dayHeader}>
              <View>
                <Eyebrow>{t('transition.day_label', { n: dayIdx + 1, date: d.label.toUpperCase() })}</Eyebrow>
                <HeroNumber
                  value={`${done} ${t('transition.of')} ${total}`}
                  size="md"
                  label={t('transition.complete')}
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
          {t('transition.why_this_works')}
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
  windowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.pill,
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
