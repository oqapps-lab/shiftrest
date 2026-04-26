/**
 * S52 — Notifications settings.
 *
 * Stage 5 scope: UI-only. Toggles persist to AsyncStorage via a small
 * NotificationSettings store. Wiring to expo-notifications scheduling
 * lands in Stage 6.6 — see TODO at bottom of file. Ships now so users
 * can express preferences during the trial window.
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
import { mockNotificationTypes, mockPlan } from '../../mock/user';
import { safeBack } from '../../lib/nav';
import {
  rescheduleNotifications,
  requestPermissions,
  type NotifPrefs,
  type PlanTimes,
} from '../../lib/notifications';
import { useGeneratedPlan, formatPlanHour } from '../../lib/queries/plan';

const STORAGE_KEY = 'shiftrest:notification-settings:v1';

type LeadMinutes = '15' | '30' | '60';

interface NotifState {
  master: boolean;
  bedReminder: boolean;
  bedReminderLead: LeadMinutes;
  caffeineReminder: boolean;
  melatoninReminder: boolean;
}

const DEFAULTS: NotifState = {
  master: true,
  bedReminder: true,
  bedReminderLead: '30',
  caffeineReminder: true,
  melatoninReminder: true,
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

  // Build PlanTimes from the live plan (when present) or mockPlan.
  // Local "HH:MM" strings — what rescheduleNotifications() expects.
  const planTimes: PlanTimes = {
    sleep_start: formatPlanHour(livePlan?.sleep_start) || mockPlan.sleepStart
      ? formatPlanHour(livePlan?.sleep_start) || `${String(mockPlan.sleepStart).padStart(2, '0')}:00`
      : null,
    caffeine_cutoff: formatPlanHour(livePlan?.caffeine_cutoff_at) || mockPlan.caffeineCutoff,
    melatonin_at: formatPlanHour(livePlan?.melatonin_at) || (mockPlan.melatoninTime ?? null),
  };

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
      }
      const res = await rescheduleNotifications(state as NotifPrefs, planTimes);
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
    planTimes.sleep_start,
    planTimes.caffeine_cutoff,
    planTimes.melatonin_at,
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
        accessibilityLabel="Back"
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>SETTINGS</Eyebrow>
      <HeroNumber
        value="Notifications"
        size="md"
        style={{ marginTop: spacing.lg }}
      />
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.md }}>
        {"Quiet, contextual nudges. Toggle anything you don't need."}
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
              All notifications
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
              {state.master
                ? 'Reminders fire on your plan'
                : 'Everything is muted'}
            </Text>
          </View>
          <Toggle
            value={state.master}
            onChange={(v) => update({ master: v })}
            accessibilityLabel="Master notifications"
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
            accessibilityLabel="Bed time reminder"
          />
        </View>
        {state.bedReminder && (
          <View style={{ marginTop: spacing.lg }}>
            <Eyebrow style={{ marginBottom: spacing.md }}>LEAD TIME</Eyebrow>
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
            accessibilityLabel="Caffeine cutoff reminder"
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
            accessibilityLabel="Melatonin reminder"
          />
        </View>
      </View>

      <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.huge }}>
        {"Reminders are scheduled locally and never leave the device."}
      </Text>

      {scheduledCount !== null && state.master && scheduledCount > 0 && (
        <Text variant="bodyMd" color="primary" weight="medium" style={{ marginTop: spacing.sm }}>
          {`${scheduledCount} reminder${scheduledCount === 1 ? '' : 's'} scheduled`}
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
