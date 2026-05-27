/**
 * Settings → Melatonin (drill-down). Toggle ON/OFF + dose chips + preferred time.
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
  Toggle,
  SegmentedControl,
} from '../../components/ui';
import { spacing, colors, radii } from '../../constants/tokens';
import { mockMelatoninDoses } from '../../mock/user';
import {
  useOnboarding,
  type MelatoninTime,
} from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

const MELATONIN_TIME_OPTIONS: { value: MelatoninTime; label: string }[] = [
  { value: '20', label: '20:00' },
  { value: '22', label: '22:00' },
  { value: '00', label: '00:00' },
];

export default function MelatoninSettings() {
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

      <Eyebrow>{t('settings_sub.melatonin.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('settings_sub.melatonin.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('settings_sub.melatonin.subtitle')}
      </Text>

      <View style={styles.toggleRow}>
        <Text variant="titleMd" family="display" weight="medium" color="ink">
          {t('settings_sub.melatonin.toggle_label')}
        </Text>
        <Toggle
          value={state.takesMelatonin}
          onChange={(v) => update({ takesMelatonin: v })}
          accessibilityLabel={t('a11y.take_melatonin')}
        />
      </View>

      {state.takesMelatonin && (
        <View style={{ marginTop: spacing.lg }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>
            {t('settings_sub.melatonin.dose_label')}
          </Eyebrow>
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

          <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            {t('settings_sub.melatonin.time_label')}
          </Eyebrow>
          <SegmentedControl<MelatoninTime>
            options={MELATONIN_TIME_OPTIONS}
            value={state.melatoninTime}
            onChange={(v) => update({ melatoninTime: v })}
          />

          <Text
            variant="bodyMd"
            color="inkMuted"
            style={{ marginTop: spacing.xl }}
          >
            {t('settings_sub.melatonin.disclaimer')}
          </Text>
        </View>
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
