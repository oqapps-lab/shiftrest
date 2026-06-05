/**
 * Transition Plan wizard (modal). Pick type → start date → generate.
 * On Save: inserts into transition_plans + transition_steps for signed
 * users; for anonymous, falls back to a local in-memory store so the
 * Home transition card still appears for demo.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  PillCTA,
  GlassCard,
  SegmentedControl,
  DateTimePickerField,
  type SegmentOption,
  showAppDialog,
} from '../components/ui';
import { spacing, colors, radii } from '../constants/tokens';
import { safeDismiss } from '../lib/nav';
import { useAuth } from '../lib/auth/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  useOnboarding,
  computeChronotypeScore,
  chronotypeBucket,
} from '../lib/onboarding/store';
import {
  generateTransitionPlan,
  type TransitionType,
} from '../lib/transition/generate';
import { setLocalTransitionPlan } from '../lib/local-transition/store';
import { emitChange, EVENTS } from '../lib/queries';
import { formatDayMonth } from '../lib/derive';
import { t } from '../lib/i18n';

// F2: never let a Supabase call hang forever — a stuck await left the
// "Generate" button spinning indefinitely, which reads as a frozen app.
// Reject after `ms` so the catch can surface a friendly retry dialog and
// the finally{} re-enables the button.
function withTimeout<T>(work: PromiseLike<T>, ms = 12000): Promise<T> {
  return Promise.race([
    Promise.resolve(work),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

// AUDIT-I: transition_steps.action_type has a DB CHECK constraint that only
// allows this enum. Our generator uses richer semantic types (light/caffeine/
// wind_down) for the UI + tests; map them onto the allowed set ONLY here at
// the Supabase write boundary (the UI renders title/description, not
// action_type, so this is purely to satisfy the constraint).
const DB_ACTION_TYPE: Record<string, string> = {
  light: 'light_seek',
  caffeine: 'custom',
  wind_down: 'custom',
  melatonin: 'melatonin',
  sleep: 'sleep',
  wake: 'wake',
};
const toDbActionType = (a: string): string => DB_ACTION_TYPE[a] ?? 'custom';

const getTypeOptions = (): SegmentOption<TransitionType>[] => [
  { value: 'night_to_day', label: t('transition_create.night_to_day') },
  { value: 'day_to_night', label: t('transition_create.day_to_night') },
];

export default function TransitionCreate() {
  const { user } = useAuth();
  const { state: onboarding } = useOnboarding();
  const [type, setType] = useState<TransitionType>('night_to_day');
  const [startsAt, setStartsAt] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [submitting, setSubmitting] = useState(false);

  // D2: live start→end window so the user sees the transition has a finish,
  // not just a start. The protocol spans 2 days (end = start + 1).
  const windowText = useMemo(() => {
    const end = new Date(startsAt);
    end.setDate(startsAt.getDate() + 1);
    return `${formatDayMonth(startsAt)} → ${formatDayMonth(end)}`;
  }, [startsAt]);

  const onSave = async () => {
    // F2: guard against the double/triple tap that happens when a slow save
    // makes it look like "nothing happened" — re-entrancy could fire multiple
    // inserts + navigations and wedge the app.
    if (submitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const plan = generateTransitionPlan(type, startsAt, {
      takesMelatonin: onboarding.takesMelatonin,
      caffeineCupsPerDay: onboarding.caffeineCupsPerDay,
      usesLightTherapy: onboarding.usesLightTherapy,
      chronotype: chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
    });

    if (!isSupabaseConfigured || !supabase || !user?.id) {
      // Anon: write into local store so Home picks it up
      setLocalTransitionPlan({
        id: `local-${Date.now()}`,
        transition_type: plan.transition_type,
        start_date: plan.start_date,
        end_date: plan.end_date,
        total_days: plan.total_days,
        total_steps: plan.total_steps,
        completed_steps: 0,
        status: 'active',
        steps: plan.steps.map((s, i) => ({
          id: `local-step-${i}`,
          day_number: s.day_number,
          step_order: s.step_order,
          scheduled_time: s.scheduled_time,
          action_type: s.action_type,
          title: s.title,
          description: s.description,
          is_completed: false,
        })),
      });
      emitChange(EVENTS.plansChanged);
      showAppDialog({
        title: t('transition_create.saved_title'),
        message: t('transition_create.saved_body'),
        actions: [
          { label: t('transition_create.ok'), onPress: () => {
            safeDismiss('/(tabs)');
            setTimeout(() => router.push('/transition'), 200);
          }},
        ],
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: planRow, error: planErr } = await withTimeout(
        supabase
          .from('transition_plans')
          .insert({
            user_id: user.id,
            transition_type: plan.transition_type,
            start_date: plan.start_date,
            end_date: plan.end_date,
            total_days: plan.total_days,
            total_steps: plan.total_steps,
            completed_steps: 0,
            status: 'active',
          })
          .select('id')
          .single(),
      );

      if (planErr || !planRow) {
        throw planErr ?? new Error('No plan id returned');
      }
      const planId = planRow.id as string;

      const stepRows = plan.steps.map((s) => ({
        plan_id: planId,
        user_id: user.id,
        day_number: s.day_number,
        step_order: s.step_order,
        scheduled_time: s.scheduled_time,
        action_type: toDbActionType(s.action_type),
        title: s.title,
        description: s.description,
        is_completed: false,
      }));
      const { error: stepErr } = await withTimeout(
        supabase.from('transition_steps').insert(stepRows),
      );
      if (stepErr) throw stepErr;

      emitChange(EVENTS.plansChanged);
      showAppDialog({
        title: t('transition_create.saved_title'),
        message: t('transition_create.saved_body'),
        actions: [
          { label: t('transition_create.ok'), onPress: () => {
            safeDismiss('/(tabs)');
            setTimeout(() => router.push('/transition'), 200);
          }},
        ],
      });
    } catch (e: unknown) {
      // R12-2: was showing raw e.message (often English Supabase code) —
      // localise by error-shape. Network failures get a friendly retry
      // message; everything else falls back to "unknown" generic.
      const msg = e instanceof Error ? e.message : String(e);
      const isNetwork = /network request failed|fetch|TypeError|timeout/i.test(msg);
      const body = isNetwork
        ? t('transition_create.failed_offline')
        : t('transition_create.failed_unknown');
      showAppDialog({
        title: t('transition_create.failed_title'),
        message: body,
        actions: [{ label: t('transition_create.ok') }],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      floatingFooter={
        <PillCTA
          variant="primary"
          label={submitting ? t('transition_create.generating') : t('transition_create.generate')}
          disabled={submitting}
          onPress={onSave}
        />
      }
    >
      <View style={styles.headerRow}>
        <View style={{ width: 22 }} />
        <Eyebrow>{t('transition_create.eyebrow')}</Eyebrow>
        <Pressable
          onPress={() => safeDismiss('/(tabs)')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.close')}
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('transition_create.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('transition_create.subtitle')}
      </Text>

      <Eyebrow style={{ marginBottom: spacing.md }}>{t('transition_create.type_label')}</Eyebrow>
      <SegmentedControl<TransitionType>
        options={getTypeOptions()}
        value={type}
        onChange={setType}
      />

      <View style={{ marginTop: spacing.xl }}>
        <DateTimePickerField
          label={t('transition_create.start_label')}
          value={startsAt}
          onChange={setStartsAt}
        />
      </View>

      <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.xl }}>
        <Eyebrow>{t('transition_create.preview_label')}</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {t('transition_create.preview_template', { days: 2 })}
        </Text>
        {/* D2: explicit start → end window */}
        <View style={styles.windowPill}>
          <Glyph name="calendar" size={14} color="primary" />
          <Text variant="labelMd" weight="medium" color="primary" style={{ marginLeft: spacing.xs }}>
            {windowText}
          </Text>
        </View>
        <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
          {t('transition_create.preview_body')}
        </Text>
      </GlassCard>

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  windowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.pill,
  },
});
