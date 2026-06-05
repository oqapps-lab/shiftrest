/**
 * S52 — Notifications settings.
 *
 * Persists toggles to AsyncStorage, requests iOS notification permissions,
 * and schedules daily local notifications via expo-notifications. Uses the
 * generated Supabase plan when available, falls back to suggestedPlanFromOnboarding
 * so anonymous and freshly-onboarded users still get honest, schedule-aware
 * reminders without a backend round-trip.
 */

import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Screen,
  Eyebrow,
  HeroNumber,
  Text,
  Toggle,
  GlassCard,
  Glyph,
  SegmentedControl,
  type SegmentOption,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { mockNotificationTypes } from '../../mock/user';
import { safeBack } from '../../lib/nav';
import {
  rescheduleNotifications,
  requestPermissions,
  flushPendingTrialReminder,
  type NotifPrefs,
  type PlanTimes,
} from '../../lib/notifications';
import { useGeneratedPlan, formatPlanHour } from '../../lib/queries/plan';
import {
  useOnboarding,
  computeChronotypeScore,
  chronotypeBucket,
} from '../../lib/onboarding/store';
import { suggestedPlanFromOnboarding, firstName } from '../../lib/derive';
import { t } from '../../lib/i18n';

const STORAGE_KEY = 'shiftrest:notification-settings:v1';

type LeadMinutes = '15' | '30' | '60';

interface NotifState {
  master: boolean;
  bedReminder: boolean;
  bedReminderLead: LeadMinutes;
  caffeineReminder: boolean;
  melatoninReminder: boolean;
  // TODAY-5
  rateSleepReminder: boolean;
  napNadirReminder: boolean;
}

const DEFAULTS: NotifState = {
  master: true,
  bedReminder: true,
  bedReminderLead: '30',
  caffeineReminder: true,
  melatoninReminder: true,
  // TODAY-5 — on by default; both ride the live/suggested plan times and the
  // nap one self-gates to night-shift days inside rescheduleNotifications.
  rateSleepReminder: true,
  napNadirReminder: true,
};

const LEAD_OPTIONS: SegmentOption<LeadMinutes>[] = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '60 min' },
];

export default function NotificationsSettings() {
  const [state, setState] = useState<NotifState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);
  const { data: livePlan } = useGeneratedPlan();
  const { state: onboarding } = useOnboarding();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setState({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<NotifState>) });
          } catch {
            // ignore
          }
        }
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => null);
  }, [state, hydrated]);

  // Build PlanTimes from the live plan when available, fall back to a
  // schedule-aware estimate from the user's onboarding answers. That keeps
  // anonymous + freshly-onboarded users on a real timing rhythm without
  // needing a backend round-trip. We still gate per-substance toggles by
  // user preference (no melatonin push for someone who doesn't take it,
  // no caffeine push for someone who's caffeine-free).
  const suggested = suggestedPlanFromOnboarding(
    onboarding.currentShift,
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );
  // The suggested helper returns numeric/string mix; format consistently
  // as HH:MM for the notifications layer.
  const fmtFromHour = (h: number): string => {
    const hi = Math.floor(h);
    const mi = Math.round((h - hi) * 60);
    return `${String(hi).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
  };
  const planTimes: PlanTimes = {
    sleep_start: formatPlanHour(livePlan?.sleep_start) || fmtFromHour(suggested.sleepStart),
    caffeine_cutoff: formatPlanHour(livePlan?.caffeine_cutoff_at) || suggested.caffeineCutoff,
    melatonin_at:
      formatPlanHour(livePlan?.melatonin_at) ||
      (onboarding.takesMelatonin ? suggested.melatoninTime : null),
    // TODAY-5: end of the sleep window drives the rate-sleep morning nudge;
    // current shift gates the night-nadir nap. Both come from the SAME
    // live/suggested plan the Today cards read.
    sleep_end: formatPlanHour(livePlan?.sleep_end) || fmtFromHour(suggested.sleepEnd),
    current_shift: onboarding.currentShift,
  };
  // Respect substance opt-out: a melatonin notif would be nonsense if the
  // user toggled melatonin off in Settings → Melatonin.
  if (!onboarding.takesMelatonin) planTimes.melatonin_at = null;
  if (onboarding.caffeineCupsPerDay === 0) planTimes.caffeine_cutoff = null;

  // After hydration, re-schedule whenever (state, planTimes) changes.
  // If master is ON but permission hasn't been granted yet, request it
  // proactively — handles both "first flip" and "first visit with master
  // already on (default state)".
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      if (state.master) {
        await requestPermissions().catch(() => null);
        // AUDIT-E: flush a paywall-stashed trial reminder now that
        // permission may have just been granted from Settings.
        await flushPendingTrialReminder().catch(() => null);
      }
      const res = await rescheduleNotifications(state as NotifPrefs, planTimes, {
        firstName: firstName(onboarding.displayName),
      });
      if (cancelled) return;
      setScheduledCount(res.scheduledCount);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hydrated,
    state.master,
    state.bedReminder,
    state.bedReminderLead,
    state.caffeineReminder,
    state.melatoninReminder,
    state.rateSleepReminder,
    state.napNadirReminder,
    planTimes.sleep_start,
    planTimes.caffeine_cutoff,
    planTimes.melatonin_at,
    planTimes.sleep_end,
    planTimes.current_shift,
    onboarding.displayName,
  ]);

  const update = (patch: Partial<NotifState>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((prev) => ({ ...prev, ...patch }));

    // First time master flips ON — prompt for permission.
    if (patch.master === true && !state.master) {
      requestPermissions().catch(() => null);
    }
  };

  // When master is OFF, individual toggles render but disabled-looking.
  const off = !state.master;

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

      <Eyebrow>{t('settings_screens.eyebrow')}</Eyebrow>
      <HeroNumber
        value={t('settings_screens.notifications.title')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.md }}>
        {t('settings_screens.notifications.sub')}
      </Text>

      {/* Master switch */}
      <GlassCard
        variant="glass"
        padding="xl"
        style={{ marginTop: spacing.huge }}
      >
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {t('settings_screens.notifications.master.title')}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {state.master
                ? t('settings_screens.notifications.master.active')
                : t('settings_screens.notifications.master.muted')}
            </Text>
          </View>
          <Toggle
            value={state.master}
            onChange={(v) => update({ master: v })}
            accessibilityLabel={t('settings_screens.notifications.master.a11y')}
          />
        </View>
      </GlassCard>

      {/* Bed time reminder */}
      <View style={[styles.section, off && styles.sectionDimmed]} pointerEvents={off ? 'none' : 'auto'}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
            <Glyph name={mockNotificationTypes[0].glyph} size={20} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {mockNotificationTypes[0].title}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {mockNotificationTypes[0].subtitle}
            </Text>
          </View>
          <Toggle
            value={state.bedReminder}
            onChange={(v) => update({ bedReminder: v })}
            accessibilityLabel={t('a11y.bed_time_reminder')}
          />
        </View>
        {state.bedReminder && (
          <View style={{ marginTop: spacing.lg }}>
            <Eyebrow style={{ marginBottom: spacing.md }}>{t('settings_screens.notifications.lead_time')}</Eyebrow>
            <SegmentedControl<LeadMinutes>
              options={LEAD_OPTIONS}
              value={state.bedReminderLead}
              onChange={(v) => update({ bedReminderLead: v })}
            />
          </View>
        )}
      </View>

      {/* Caffeine cutoff */}
      <View style={[styles.section, off && styles.sectionDimmed]} pointerEvents={off ? 'none' : 'auto'}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.sunriseGlow }]}>
            <Glyph name={mockNotificationTypes[1].glyph} size={20} color="sunriseDim" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {mockNotificationTypes[1].title}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {mockNotificationTypes[1].subtitle}
            </Text>
          </View>
          <Toggle
            value={state.caffeineReminder}
            onChange={(v) => update({ caffeineReminder: v })}
            accessibilityLabel={t('a11y.caffeine_cutoff_reminder')}
          />
        </View>
      </View>

      {/* Melatonin */}
      <View style={[styles.section, off && styles.sectionDimmed]} pointerEvents={off ? 'none' : 'auto'}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.duskGlow }]}>
            <Glyph name={mockNotificationTypes[2].glyph} size={20} color="duskDim" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {mockNotificationTypes[2].title}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {mockNotificationTypes[2].subtitle}
            </Text>
          </View>
          <Toggle
            value={state.melatoninReminder}
            onChange={(v) => update({ melatoninReminder: v })}
            accessibilityLabel={t('a11y.melatonin_reminder')}
          />
        </View>
      </View>

      {/* TODAY-5: Rate last night's sleep — morning nudge → streak */}
      <View style={[styles.section, off && styles.sectionDimmed]} pointerEvents={off ? 'none' : 'auto'}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
            <Glyph name="sparkle" size={20} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {t('settings_screens.notifications.rate_sleep.title')}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {t('settings_screens.notifications.rate_sleep.sub')}
            </Text>
          </View>
          <Toggle
            value={state.rateSleepReminder}
            onChange={(v) => update({ rateSleepReminder: v })}
            accessibilityLabel={t('a11y.rate_sleep_reminder')}
          />
        </View>
      </View>

      {/* TODAY-5: Night-nadir nap — only fires on night-shift days */}
      <View style={[styles.section, off && styles.sectionDimmed]} pointerEvents={off ? 'none' : 'auto'}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.duskGlow }]}>
            <Glyph name="moon" size={20} color="duskDim" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleMd" family="display" weight="medium" color="ink">
              {t('settings_screens.notifications.nap_nadir.title')}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {t('settings_screens.notifications.nap_nadir.sub')}
            </Text>
          </View>
          <Toggle
            value={state.napNadirReminder}
            onChange={(v) => update({ napNadirReminder: v })}
            accessibilityLabel={t('a11y.nap_nadir_reminder')}
          />
        </View>
      </View>

      <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.huge }}>
        {t('settings_screens.notifications.local_only')}
      </Text>

      {scheduledCount !== null && state.master && scheduledCount > 0 && (
        <Text variant="bodyMd" color="primary" weight="medium" style={{ marginTop: spacing.sm }}>
          {t('settings_screens.notifications.scheduled_count', { count: scheduledCount })}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceLow,
  },
  sectionDimmed: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
});
