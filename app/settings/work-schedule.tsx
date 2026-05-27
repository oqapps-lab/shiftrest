/**
 * Settings → Work schedule (drill-down). Pick rotation pattern.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  OptionCard,
  Slider,
  GlassCard,
  PillCTA,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockScheduleTemplates } from '../../mock/user';
import { useOnboarding, type ScheduleId } from '../../lib/onboarding/store';
import { useAuth } from '../../lib/auth/store';
import { safeBack } from '../../lib/nav';
import { applyScheduleTemplate } from '../../lib/schedule/apply-template';
import { t } from '../../lib/i18n';

export default function WorkScheduleSettings() {
  const { state, update } = useOnboarding();
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);

  const canAutoFill =
    state.scheduleId && state.scheduleId !== 'custom';

  const onAutoFill = () => {
    if (!state.scheduleId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('settings_sub.schedule.autofill_alert_title', { weeks: 4 }),
      t('settings_sub.schedule.autofill_alert_body', { weeks: 4 }),
      [
        { text: t('settings_sub.schedule.autofill_cancel'), style: 'cancel' },
        {
          text: t('settings_sub.schedule.autofill_confirm'),
          onPress: async () => {
            setApplying(true);
            try {
              const result = await applyScheduleTemplate(state.scheduleId!, {
                weeks: 4,
                userId: user?.id ?? null,
              });
              Alert.alert(
                t('settings_sub.schedule.autofill_done_title'),
                t('settings_sub.schedule.autofill_done_body', {
                  inserted: result.inserted,
                  skipped: result.skippedExisting,
                }),
                [{ text: t('settings_sub.schedule.autofill_ok') }],
              );
            } finally {
              setApplying(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/settings/sleep-preferences')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('settings_sub.schedule.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.schedule.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.schedule.subtitle')}
      </Text>

      {mockScheduleTemplates.map((s) => (
        <OptionCard
          key={s.id}
          title={s.title}
          subtitle={s.subtitle}
          glyph={s.glyph}
          selected={state.scheduleId === s.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            update({ scheduleId: s.id as ScheduleId });
          }}
          accessibilityLabel={s.title}
        />
      ))}

      <View style={styles.commuteHeader}>
        <Eyebrow>{t('settings_sub.schedule.commute_label')}</Eyebrow>
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

      {/* G3: One-tap fill 4 weeks of shifts from the chosen pattern. */}
      {canAutoFill && (
        <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.huge }}>
          <Eyebrow>{t('settings_sub.schedule.autofill_eyebrow')}</Eyebrow>
          <Text
            variant="titleMd"
            family="display"
            weight="medium"
            color="ink"
            style={{ marginTop: spacing.sm }}
          >
            {t('settings_sub.schedule.autofill_title')}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm }}>
            {t('settings_sub.schedule.autofill_sub')}
          </Text>
          <View style={{ height: spacing.md }} />
          <PillCTA
            variant="primary"
            label={applying ? t('settings_sub.schedule.autofill_applying') : t('settings_sub.schedule.autofill_cta')}
            disabled={applying}
            onPress={onAutoFill}
          />
        </GlassCard>
      )}

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
});
