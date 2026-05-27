/**
 * Settings → Sleep preferences (drill-down menu).
 *
 * Each row navigates to a focused sub-screen for one cluster of settings:
 * profession, schedule, chronotype, caffeine, melatonin, light, family,
 * goals, name. Auto-save happens on each sub-screen, so this menu only
 * displays the current value as a one-line summary.
 *
 * "Where you are today" (currentShift) was REMOVED from settings — daily
 * state belongs on Home, not in long-lived preferences.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  Eyebrow,
  SerifHero,
  GlassCard,
  Text,
  Glyph,
  type GlyphName,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import {
  mockProfessions,
  mockScheduleTemplates,
  mockMainProblems,
  mockCaffeineTypes,
  mockCaffeineSensitivities,
} from '../../mock/user';
import {
  useOnboarding,
  computeChronotypeScore,
  chronotypeBucket,
} from '../../lib/onboarding/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

interface SettingsRow {
  glyph: GlyphName;
  label: string;
  summary: string;
  onPress: () => void;
}

function professionSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  if (!state.profession) return t('settings_sub.menu.not_set');
  return mockProfessions.find((p) => p.id === state.profession)?.title ?? t('settings_sub.menu.not_set');
}

function scheduleSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  if (!state.scheduleId) return t('settings_sub.menu.not_set');
  return mockScheduleTemplates.find((s) => s.id === state.scheduleId)?.title ?? t('settings_sub.menu.not_set');
}

function chronotypeSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  const score = computeChronotypeScore(state.chronotypeAnswers);
  const bucket = chronotypeBucket(score);
  if (!bucket) return t('settings_sub.menu.not_set');
  return t(`settings_sub.chronotype.bucket_${bucket}`);
}

function caffeineSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  if (state.caffeineCupsPerDay === 0) return t('settings_sub.menu.caffeine_none');
  const cups = `${state.caffeineCupsPerDay} ${state.caffeineCupsPerDay === 1 ? t('settings_sub.menu.cup') : t('settings_sub.menu.cups')}`;
  const type = state.caffeineType
    ? mockCaffeineTypes.find((c) => c.id === state.caffeineType)?.label ?? ''
    : '';
  return type ? `${cups} · ${type}` : cups;
}

function melatoninSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  if (!state.takesMelatonin) return t('settings_sub.menu.melatonin_none');
  const dose = state.melatoninDoseMg ? `${state.melatoninDoseMg} mg` : '';
  const time = `${state.melatoninTime}:00`;
  return dose ? `${dose} · ${time}` : time;
}

function lightSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  return state.usesLightTherapy ? t('settings_sub.menu.on') : t('settings_sub.menu.off');
}

function familySummary(state: ReturnType<typeof useOnboarding>['state']): string {
  if (!state.hasChildren) return t('settings_sub.menu.no_kids');
  return t('settings_sub.menu.kids_pickup', { time: `${state.pickupTime}:00` });
}

function goalsSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  if (!state.mainProblem) return t('settings_sub.menu.not_set');
  return mockMainProblems.find((p) => p.id === state.mainProblem)?.title ?? t('settings_sub.menu.not_set');
}

function nameSummary(state: ReturnType<typeof useOnboarding>['state']): string {
  return state.displayName?.trim() || t('settings_sub.menu.not_set');
}

export default function SleepPreferences() {
  const { state, reset } = useOnboarding();

  const onResetAlert = () => {
    Alert.alert(
      t('sleep_prefs.reset_alert.title'),
      t('sleep_prefs.reset_alert.message'),
      [
        { text: t('sleep_prefs.reset_alert.cancel'), style: 'cancel' },
        {
          text: t('sleep_prefs.reset_alert.confirm'),
          style: 'destructive',
          onPress: () => {
            reset();
            router.replace('/onboarding/profession');
          },
        },
      ],
    );
  };

  const rows: SettingsRow[] = [
    {
      glyph: 'pulse',
      label: t('settings_sub.menu.profession'),
      summary: professionSummary(state),
      onPress: () => router.push('/settings/profession'),
    },
    {
      glyph: 'gear',
      label: t('settings_sub.menu.schedule'),
      summary: scheduleSummary(state),
      onPress: () => router.push('/settings/work-schedule'),
    },
    {
      glyph: 'sparkle',
      label: t('settings_sub.menu.chronotype'),
      summary: chronotypeSummary(state),
      onPress: () => router.push('/settings/chronotype'),
    },
    {
      glyph: 'coffee',
      label: t('settings_sub.menu.caffeine'),
      summary: caffeineSummary(state),
      onPress: () => router.push('/settings/caffeine'),
    },
    {
      glyph: 'moon',
      label: t('settings_sub.menu.melatonin'),
      summary: melatoninSummary(state),
      onPress: () => router.push('/settings/melatonin'),
    },
    {
      glyph: 'sun',
      label: t('settings_sub.menu.light'),
      summary: lightSummary(state),
      onPress: () => router.push('/settings/light'),
    },
    {
      glyph: 'pulse',
      label: t('settings_sub.menu.health'),
      summary: t('settings_sub.menu.health_sub'),
      onPress: () => router.push('/settings/health'),
    },
    {
      glyph: 'user',
      label: t('settings_sub.menu.family'),
      summary: familySummary(state),
      onPress: () => router.push('/settings/family'),
    },
    {
      glyph: 'flame',
      label: t('settings_sub.menu.goals'),
      summary: goalsSummary(state),
      onPress: () => router.push('/settings/goals'),
    },
    {
      glyph: 'user',
      label: t('settings_sub.menu.name'),
      summary: nameSummary(state),
      onPress: () => router.push('/settings/name'),
    },
  ];

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => safeBack('/(tabs)/profile')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('sleep_prefs.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('sleep_prefs.title')}</SerifHero>
      </View>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.huge }}>
        {t('sleep_prefs.subtitle')}
      </Text>

      {rows.map((row) => (
        <Pressable
          key={row.label}
          onPress={row.onPress}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          style={{ marginBottom: spacing.sm }}
        >
          <GlassCard variant="whisper" padding="xl">
            <View style={styles.row}>
              <View style={styles.icon}>
                <Glyph name={row.glyph} size={20} color="primary" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMd" family="display" weight="medium" color="ink">
                  {row.label}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {row.summary}
                </Text>
              </View>
              <Glyph name="chevronRight" size={18} color="inkMuted" />
            </View>
          </GlassCard>
        </Pressable>
      ))}

      <View style={{ height: spacing.huge }} />
      <GlassCard variant="paper" padding="xl">
        <View style={styles.resetRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {t('sleep_prefs.reset_all_label')}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
              {t('sleep_prefs.restart_dev_hint')}
            </Text>
          </View>
          <Pressable
            onPress={onResetAlert}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.reset_onboarding_answers')}
            style={styles.resetButton}
          >
            <Text variant="labelMd" weight="medium" color="coralDim" uppercase>
              {t('settings_sub.menu.reset_cta')}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
