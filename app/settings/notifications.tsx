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
import { router } from 'expo-router';
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

  const update = (patch: Partial<NotifState>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((prev) => ({ ...prev, ...patch }));
  };

  // When master is OFF, individual toggles render but disabled-looking.
  const off = !state.master;

  return (
    <Screen orbs="subtle" scroll tabBarClearance={false}>
      <Pressable
        onPress={() => router.back()}
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

      {/* TODO Stage 6.6: wire to expo-notifications.
          - Notifications.requestPermissionsAsync() once when master flips ON
          - Cancel + reschedule on every (state, mockPlan) change
          - Use Notifications.scheduleNotificationAsync({ content, trigger })
          - Persist scheduled identifiers to clear on re-open */}
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
