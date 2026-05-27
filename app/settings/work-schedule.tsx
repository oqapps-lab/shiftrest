/**
 * Settings → Work schedule (drill-down). Pick rotation pattern.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  Text,
  Glyph,
  OptionCard,
  Slider,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockScheduleTemplates } from '../../mock/user';
import { useOnboarding, type ScheduleId } from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function WorkScheduleSettings() {
  const { state, update } = useOnboarding();

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
