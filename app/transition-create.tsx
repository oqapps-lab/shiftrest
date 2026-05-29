/**
 * Transition Plan wizard (modal). Pick type → start date → generate.
 * On Save: inserts into transition_plans + transition_steps for signed
 * users; for anonymous, falls back to a local in-memory store so the
 * Home transition card still appears for demo.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
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
} from '../components/ui';
import { spacing, colors } from '../constants/tokens';
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
import { t } from '../lib/i18n';

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

  const onSave = async () => {
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
      Alert.alert(t('transition_create.saved_title'), t('transition_create.saved_body'), [
        { text: t('transition_create.ok'), onPress: () => {
          safeDismiss('/(tabs)');
          setTimeout(() => router.push('/transition'), 200);
        }},
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const { data: planRow, error: planErr } = await supabase
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
        .single();

      if (planErr || !planRow) {
        throw planErr ?? new Error('No plan id returned');
      }
      const planId = planRow.id as string;

      const stepRows = plan.steps.map((s) => ({
        plan_id: planId,
        day_number: s.day_number,
        step_order: s.step_order,
        scheduled_time: s.scheduled_time,
        action_type: s.action_type,
        title: s.title,
        description: s.description,
        is_completed: false,
      }));
      const { error: stepErr } = await supabase.from('transition_steps').insert(stepRows);
      if (stepErr) throw stepErr;

      emitChange(EVENTS.plansChanged);
      Alert.alert(t('transition_create.saved_title'), t('transition_create.saved_body'), [
        { text: t('transition_create.ok'), onPress: () => {
          safeDismiss('/(tabs)');
          setTimeout(() => router.push('/transition'), 200);
        }},
      ]);
    } catch (e: unknown) {
      // R12-2: was showing raw e.message (often English Supabase code) —
      // localise by error-shape. Network failures get a friendly retry
      // message; everything else falls back to "unknown" generic.
      const msg = e instanceof Error ? e.message : String(e);
      const isNetwork = /network request failed|fetch|TypeError/i.test(msg);
      const body = isNetwork
        ? t('transition_create.failed_offline')
        : t('transition_create.failed_unknown');
      Alert.alert(t('transition_create.failed_title'), body, [{ text: t('transition_create.ok') }]);
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
});
