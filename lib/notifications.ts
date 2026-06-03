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
import { t } from './i18n';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from './events';

const TRACKED_IDS_KEY = 'shiftrest:notif-scheduled-ids:v1';
// G5: the trial-ending reminder is tracked separately from the recurring
// bed/caffeine/melatonin set so rescheduleNotifications() (which cancels and
// rebuilds the recurring set on every prefs/plan change) never wipes it.
const TRIAL_REMINDER_ID_KEY = 'shiftrest:notif-trial-reminder-id:v1';
// G5: when a trial starts BEFORE notifications are granted (the paywall
// precedes the permission screen in onboarding), stash the intended reminder
// here and flush it once permission is granted — see flushPendingTrialReminder.
const PENDING_TRIAL_KEY = 'shiftrest:notif-pending-trial:v1';

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
          title: t('push_notif.bed_title'),
          body: t('push_notif.bed_body', { lead: String(prefs.bedReminderLead) }),
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
    const tm = parseHourMinute(plan.caffeine_cutoff);
    if (tm) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: t('push_notif.caffeine_title'),
          body: t('push_notif.caffeine_body'),
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: tm.hour,
          minute: tm.minute,
        },
      });
      newIds.push(id);
    }
  }

  // Melatonin — fires AT melatonin_at time. Only when plan has it set.
  if (prefs.melatoninReminder && plan.melatonin_at) {
    const tm = parseHourMinute(plan.melatonin_at);
    if (tm) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: t('push_notif.melatonin_title'),
          body: t('push_notif.melatonin_body'),
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: tm.hour,
          minute: tm.minute,
        },
      });
      newIds.push(id);
    }
  }

  await saveTrackedIds(newIds);
  logEvent('notifs_scheduled', { count: newIds.length });
  return { granted: true, scheduledCount: newIds.length };
}

// ─── Trial-ending reminder (G5) ──────────────────────────────────────────────

export interface TrialReminderResult {
  scheduled: boolean;
  reason?: 'permission_denied' | 'invalid_days' | 'fire_in_past';
  fireAt?: string;
}

/**
 * Schedule a SINGLE local notification reminding the user their free trial
 * ends tomorrow, fired at (trial start + (trialDays - 1) days). Call this from
 * the paywall on a successful trial start.
 *
 * Does NOT request permission — only schedules when notifications are ALREADY
 * granted (the paywall happens before the notification-permission onboarding
 * screen, so a silent no-op is correct there; the reminder will simply not be
 * scheduled if the user hasn't granted yet). Idempotent: cancels any previously
 * scheduled trial reminder before scheduling a fresh one, so re-entering the
 * trial-start path never stacks duplicates.
 */
export async function scheduleTrialEndingReminder(
  trialDays: number,
  startAt: Date = new Date(),
): Promise<TrialReminderResult> {
  ensureHandler();

  // Always clear any prior trial reminder first (idempotent).
  try {
    const prev = await AsyncStorage.getItem(TRIAL_REMINDER_ID_KEY);
    if (prev) {
      await Notifications.cancelScheduledNotificationAsync(prev).catch(() => null);
      await AsyncStorage.removeItem(TRIAL_REMINDER_ID_KEY);
    }
  } catch {
    // ignore — best-effort cleanup
  }

  if (!Number.isFinite(trialDays) || trialDays < 1) {
    await AsyncStorage.removeItem(PENDING_TRIAL_KEY).catch(() => null);
    return { scheduled: false, reason: 'invalid_days' };
  }

  // Permission must already be granted — we never prompt here. If it isn't yet
  // (the paywall precedes the onboarding permission screen), stash the intended
  // reminder so flushPendingTrialReminder() can schedule it once granted.
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await AsyncStorage.setItem(
      PENDING_TRIAL_KEY,
      JSON.stringify({ trialDays, startAt: startAt.toISOString() }),
    ).catch(() => null);
    return { scheduled: false, reason: 'permission_denied' };
  }

  // Fire one day before the trial ends: start + (trialDays - 1) days.
  const fireAt = new Date(startAt.getTime());
  fireAt.setDate(fireAt.getDate() + (trialDays - 1));

  // A 1-day trial would fire "yesterday" — skip rather than schedule a past
  // date (iOS would drop it anyway).
  if (fireAt.getTime() <= Date.now()) {
    await AsyncStorage.removeItem(PENDING_TRIAL_KEY).catch(() => null);
    return { scheduled: false, reason: 'fire_in_past' };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifications.trial_ending_title'),
      body: t('notifications.trial_ending_body'),
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });
  await AsyncStorage.setItem(TRIAL_REMINDER_ID_KEY, id);
  await AsyncStorage.removeItem(PENDING_TRIAL_KEY).catch(() => null);
  logEvent('trial_reminder_scheduled', { trialDays, fireAt: fireAt.toISOString() });
  return { scheduled: true, fireAt: fireAt.toISOString() };
}

/**
 * Flush a trial reminder that was stashed by scheduleTrialEndingReminder when
 * notifications weren't yet granted (trial started on the paywall, which comes
 * before the onboarding permission screen). Call right after the user grants
 * notification permission. No-op when nothing is pending. Re-scheduling reuses
 * the ORIGINAL trial start, so a now-past fire date is correctly dropped.
 */
export async function flushPendingTrialReminder(): Promise<TrialReminderResult> {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(PENDING_TRIAL_KEY);
  } catch {
    return { scheduled: false };
  }
  if (!raw) return { scheduled: false };
  try {
    const { trialDays, startAt } = JSON.parse(raw) as { trialDays: number; startAt: string };
    return await scheduleTrialEndingReminder(trialDays, new Date(startAt));
  } catch {
    await AsyncStorage.removeItem(PENDING_TRIAL_KEY).catch(() => null);
    return { scheduled: false };
  }
}

/** Convenience for tests — list everything we've scheduled. */
export async function listOurScheduled(): Promise<Notifications.NotificationRequest[]> {
  const ids = await loadTrackedIds();
  if (ids.length === 0) return [];
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((r) => ids.includes(r.identifier));
}
