/**
 * Local notification scheduling layer.
 *
 * Reads the user's current sleep_plan + NotifState (preferences from
 * Settings → Notifications) and schedules local pushes via
 * expo-notifications. Idempotent: every call cancels OUR previously
 * scheduled identifiers (tracked via AsyncStorage) before re-scheduling
 * — so calling on every state change is safe.
 *
 * iOS: Expo Go SDK 55 supports local notifications; remote push needs
 * a dev client. We only schedule LOCAL notifications, so Expo Go works.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from './events';

const TRACKED_IDS_KEY = 'shiftrest:notif-scheduled-ids:v1';

export type LeadMinutes = '15' | '30' | '60';

export interface NotifPrefs {
  master: boolean;
  bedReminder: boolean;
  bedReminderLead: LeadMinutes;
  caffeineReminder: boolean;
  melatoninReminder: boolean;
}

export interface PlanTimes {
  /** "HH:MM" 24-hour. Local time. */
  sleep_start: string | null;
  caffeine_cutoff: string | null;
  melatonin_at: string | null;
}

// ─── Permission ─────────────────────────────────────────────────────────────

let _handlerSet = false;
function ensureHandler() {
  if (_handlerSet) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  _handlerSet = true;
}

export async function requestPermissions(): Promise<boolean> {
  ensureHandler();

  if (!Device.isDevice && Platform.OS !== 'ios') {
    // iOS simulator DOES support local notifications + permission prompts.
    // Android emulator typically does too, but bail safely if running on
    // unsupported environments (web, snack).
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  if (status === 'granted') {
    logEvent('notif_permission_granted');
  } else {
    logEvent('notif_permission_denied', { status });
  }
  return status === 'granted';
}

// ─── Tracking ───────────────────────────────────────────────────────────────

async function loadTrackedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(TRACKED_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

async function saveTrackedIds(ids: string[]) {
  await AsyncStorage.setItem(TRACKED_IDS_KEY, JSON.stringify(ids));
}

async function cancelTracked() {
  const ids = await loadTrackedIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => null)));
  await saveTrackedIds([]);
}

// ─── Time helpers ──────────────────────────────────────────────────────────

function parseHourMinute(hhmm: string): { hour: number; minute: number } | null {
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}

function shiftMinutes(time: { hour: number; minute: number }, deltaMin: number): { hour: number; minute: number } {
  const total = time.hour * 60 + time.minute - deltaMin;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
}

// ─── Schedule ──────────────────────────────────────────────────────────────

export interface ScheduleResult {
  granted: boolean;
  scheduledCount: number;
  reason?: string;
}

/**
 * Cancel previously-tracked notifications, then re-schedule a fresh set
 * based on (prefs, plan). Returns count of newly-scheduled notifications.
 */
export async function rescheduleNotifications(
  prefs: NotifPrefs,
  plan: PlanTimes,
): Promise<ScheduleResult> {
  ensureHandler();

  // Always cancel our previous set first — even if master is off this
  // ensures stale notifications don't fire after the user disables them.
  await cancelTracked();

  if (!prefs.master) {
    return { granted: true, scheduledCount: 0, reason: 'master_off' };
  }

  // Permission must be granted before scheduling. We do NOT prompt here;
  // the caller is responsible for `requestPermissions()` first when the
  // master toggle flips on for the first time.
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return { granted: false, scheduledCount: 0, reason: 'permission_denied' };
  }

  const newIds: string[] = [];

  // Bed time reminder — fires `bedReminderLead` minutes before sleep_start.
  if (prefs.bedReminder && plan.sleep_start) {
    const sleepTime = parseHourMinute(plan.sleep_start);
    if (sleepTime) {
      const lead = Number(prefs.bedReminderLead);
      const fireTime = shiftMinutes(sleepTime, lead);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Wind down soon',
          body: `Sleep window opens in ${prefs.bedReminderLead} minutes — start dimming lights.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: fireTime.hour,
          minute: fireTime.minute,
        },
      });
      newIds.push(id);
    }
  }

  // Caffeine cutoff — fires AT cutoff time.
  if (prefs.caffeineReminder && plan.caffeine_cutoff) {
    const t = parseHourMinute(plan.caffeine_cutoff);
    if (t) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Last cup',
          body: 'Caffeine cutoff is now. Switch to herbal tea or water.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: t.hour,
          minute: t.minute,
        },
      });
      newIds.push(id);
    }
  }

  // Melatonin — fires AT melatonin_at time. Only when plan has it set.
  if (prefs.melatoninReminder && plan.melatonin_at) {
    const t = parseHourMinute(plan.melatonin_at);
    if (t) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Melatonin',
          body: 'Time for your melatonin dose.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: t.hour,
          minute: t.minute,
        },
      });
      newIds.push(id);
    }
  }

  await saveTrackedIds(newIds);
  logEvent('notifs_scheduled', { count: newIds.length });
  return { granted: true, scheduledCount: newIds.length };
}

/** Convenience for tests — list everything we've scheduled. */
export async function listOurScheduled(): Promise<Notifications.NotificationRequest[]> {
  const ids = await loadTrackedIds();
  if (ids.length === 0) return [];
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((r) => ids.includes(r.identifier));
}
