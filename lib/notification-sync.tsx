/**
 * AUDIT-E: root-mounted side-effect that re-schedules the daily local
 * notifications whenever the app foregrounds (and once on mount), sourcing
 * THIS day's actual shift. Without it the bed/caffeine/melatonin/nap
 * reminders were only (re)computed when the user opened Settings -->
 * Notifications, so a rotating-shift worker kept the previous shift's times
 * after rotating, and the night-nadir nap was gated on the static onboarding
 * shift rather than today's. Also flushes a paywall-stashed trial-ending
 * reminder once permission is granted. Renders nothing.
 *
 * Permission-safe: rescheduleNotifications cancels + reschedules and no-ops
 * when permission isn't granted; we NEVER call requestPermissions here (only
 * the Settings screen / onboarding priming prompt).
 */
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useOnboarding,
  computeChronotypeScore,
  chronotypeBucket,
} from './onboarding/store';
import { useGeneratedPlan, formatPlanHour } from './queries/plan';
import { useShifts } from './queries';
import { useLocalShifts } from './local-shifts/store';
import { suggestedPlanFromOnboarding, firstName } from './derive';
import {
  rescheduleNotifications,
  flushPendingTrialReminder,
  type NotifPrefs,
  type PlanTimes,
} from './notifications';

// Keep in sync with app/settings/notifications.tsx (the screen that writes it).
const NOTIF_KEY = 'shiftrest:notification-settings:v1';
const NOTIF_DEFAULTS: NotifPrefs = {
  master: true,
  bedReminder: true,
  bedReminderLead: '30',
  caffeineReminder: true,
  melatoninReminder: true,
  rateSleepReminder: true,
  napNadirReminder: true,
};

function todayIsoLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function NotificationSync(): null {
  const { state: onboarding } = useOnboarding();
  const { data: livePlan } = useGeneratedPlan();
  const localShiftsMap = useLocalShifts();
  const todayIso = todayIsoLocal();
  const { data: todayShifts } = useShifts(todayIso, todayIso);
  const lastRunRef = useRef(0);

  // Capture latest inputs without re-arming the AppState listener on each
  // data change (the listener is armed once per day-boundary).
  const inputsRef = useRef({ onboarding, livePlan, localShiftsMap, todayShifts });
  inputsRef.current = { onboarding, livePlan, localShiftsMap, todayShifts };

  useEffect(() => {
    const run = async () => {
      const { onboarding: ob, livePlan: lp, localShiftsMap: lsm, todayShifts: ts } =
        inputsRef.current;
      const iso = todayIsoLocal();
      const todayKind: 'day' | 'night' | 'off' =
        (lsm[iso] as 'day' | 'night' | 'off' | undefined)
        ?? ts[0]?.shift_type
        ?? ob.currentShift;
      const suggested = suggestedPlanFromOnboarding(
        todayKind,
        chronotypeBucket(computeChronotypeScore(ob.chronotypeAnswers)),
      );
      const fmtFromHour = (h: number): string => {
        const hi = Math.floor(h);
        const mi = Math.round((h - hi) * 60);
        return `${String(hi).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
      };
      const planTimes: PlanTimes = {
        sleep_start: formatPlanHour(lp?.sleep_start) || fmtFromHour(suggested.sleepStart),
        caffeine_cutoff: formatPlanHour(lp?.caffeine_cutoff_at) || suggested.caffeineCutoff,
        melatonin_at:
          formatPlanHour(lp?.melatonin_at) ||
          (ob.takesMelatonin ? suggested.melatoninTime : null),
        sleep_end: formatPlanHour(lp?.sleep_end) || fmtFromHour(suggested.sleepEnd),
        current_shift: todayKind,
      };
      if (!ob.takesMelatonin) planTimes.melatonin_at = null;
      if (ob.caffeineCupsPerDay === 0) planTimes.caffeine_cutoff = null;

      let prefs: NotifPrefs = NOTIF_DEFAULTS;
      try {
        const raw = await AsyncStorage.getItem(NOTIF_KEY);
        if (raw) prefs = { ...NOTIF_DEFAULTS, ...(JSON.parse(raw) as Partial<NotifPrefs>) };
      } catch {
        // corrupt blob -> defaults
      }

      await rescheduleNotifications(prefs, planTimes, {
        firstName: firstName(ob.displayName),
      }).catch(() => null);
      await flushPendingTrialReminder().catch(() => null);
    };

    run();

    const onChange = (s: AppStateStatus) => {
      if (s !== 'active') return;
      const now = Date.now();
      if (now - lastRunRef.current < 30_000) return; // debounce rapid foregrounds
      lastRunRef.current = now;
      run();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
    // Re-arm at the day boundary (todayIso changes) so a new day reschedules.
  }, [todayIso]);

  return null;
}
