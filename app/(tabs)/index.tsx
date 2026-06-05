/**
 * S20 — Home (Today). Core screen: glance-and-go, <5 sec.
 * Eyebrow greeting + streak pill + Soft hero line + TimelineRing + ShiftBar + 3 next-event cards.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import {
  Screen,
  Eyebrow,
  SerifHero,
  TimelineRing,
  ShiftBar,
  GlassCard,
  Text,
  Glyph,
  HeroNumber,
  SegmentedControl,
  PlanUpdatedBanner,
  showAppDialog,
  type SegmentOption,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { getMockTransition } from '../../mock/user';
import type { ShiftBlock } from '../../components/ui/ShiftBar';
import {
  countCompleted,
  formatHour,
  formatDayMonth,
  formatRelativeTime,
  formatStreak,
  getGreeting,
  firstName,
  suggestedPlanFromOnboarding,
  napWindowForShift,
} from '../../lib/derive';
import { phaseForNow } from '../../lib/today-phase';
import {
  useOnboarding,
  chronotypeBucket,
  computeChronotypeScore,
  type ShiftKind,
} from '../../lib/onboarding/store';
import { useStreak, useActiveTransitionPlan, useSubscription } from '../../lib/queries';
import { computeAdaptiveCaffeine } from '../../lib/caffeine-adaptive';
import { useGeneratedPlan, planHourAsFloat } from '../../lib/queries/plan';
import { useAuth } from '../../lib/auth/store';
import {
  useCaffeineLog,
  logCaffeine,
} from '../../lib/caffeine-log/store';
import {
  useSleepJournal,
  setSleepRating,
  ratingForToday,
  weeklyTally,
  recentJournalDays,
  localCurrentStreak,
  lastLoggedIso,
  type SleepRating,
} from '../../lib/sleep-journal/store';
import {
  useSleepHours,
  setSleepHours,
  hoursForToday,
} from '../../lib/sleep-hours/store';
import {
  useSleepFactors,
  toggleSleepFactor,
  factorsForToday,
  SLEEP_FACTORS,
} from '../../lib/sleep-factors/store';
import { sleepNeedForChronotype } from '../../lib/sleep-debt';
import { resolveStreak, getAvailableFreezes, consumeFreeze } from '../../lib/streak';
import { useLocalShifts } from '../../lib/local-shifts/store';
import { TodayIntroSheet } from '../../components/today/TodayIntroSheet';
import { TipsCarousel } from '../../components/library/TipsCarousel';
import { DailyInsightCard } from '../../components/today/DailyInsightCard';
import { SafeToDriveCard } from '../../components/today/SafeToDriveCard';
import { TodaysFocusCard } from '../../components/today/TodaysFocusCard';
import { AnchorSleepCard } from '../../components/today/AnchorSleepCard';
import { SleepDebtCard } from '../../components/today/SleepDebtCard';
import { WeekInSleepCard } from '../../components/today/WeekInSleepCard';
import { SleepBankingCard } from '../../components/today/SleepBankingCard';
import type { FocusArgs } from '../../lib/today-focus';
import { detectTransitionOpportunity } from '../../lib/transition/generate';
import { sleepBankingState } from '../../lib/sleep-banking';
import * as Haptics from 'expo-haptics';
import { t } from '../../lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodayCoachmark, type CoachStep } from '../../components/today/TodayCoachmark';

// TODAY-9: optional "how long did you sleep?" buckets. Each chip stores its
// MIDPOINT into the parallel hours ledger (free, skippable). Low-friction by
// design — ignoring it leaves the 1-tap rating fully functional.
const HOURS_BUCKETS: { value: number; labelKey: string }[] = [
  { value: 4, labelKey: 'today.journal_hours_lt5' }, // <5h → 4h
  { value: 5.5, labelKey: 'today.journal_hours_5_6' }, // 5–6h → 5.5h
  { value: 6.5, labelKey: 'today.journal_hours_6_7' }, // 6–7h → 6.5h
  { value: 7.5, labelKey: 'today.journal_hours_7_8' }, // 7–8h → 7.5h
  { value: 8.5, labelKey: 'today.journal_hours_8plus' }, // 8h+ → 8.5h
];

// Event styles per slot. The "hour" for each slot comes from the live
// plan when available, else mockPlan. Computed inside the component so
// it tracks plan changes.
const EVENT_STYLES = {
  caffeine: { glyph: 'coffee' as const, labelKey: 'today.event_caffeine' as const, tintBg: colors.sunriseGlow,    tintFg: 'sunriseDim' as const },
  melatonin:{ glyph: 'moon'   as const, labelKey: 'today.event_melatonin' as const,       tintBg: colors.duskGlow,       tintFg: 'duskDim'    as const },
  sleep:    { glyph: 'bed'    as const, labelKey: 'today.event_sleep' as const,    tintBg: colors.primaryContainer, tintFg: 'primary'  as const },
};

export default function Home() {
  const { state: onboarding, update } = useOnboarding();

  // G5: subtle breathing on the Transition CTA so it draws gentle attention
  // without being aggressive. 4s in / 4s out, opacity 1 → 0.6 on the icon
  // container only — keeps the rest of the card stable.
  const transitionPulse = useSharedValue(1);
  useEffect(() => {
    transitionPulse.value = withRepeat(
      withTiming(0.55, { duration: 2400, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      -1,
      true,
    );
  }, [transitionPulse]);
  const transitionPulseStyle = useAnimatedStyle(() => ({
    opacity: transitionPulse.value,
  }));

  const shiftOptions: SegmentOption<ShiftKind>[] = [
    { value: 'day', label: t('shift_kind.day_long') },
    { value: 'night', label: t('shift_kind.night_long') },
    { value: 'off', label: t('shift_kind.off_long') },
  ];
  const { user } = useAuth();
  const { data: streak } = useStreak();
  const { data: livePlan } = useActiveTransitionPlan();
  const { data: generatedPlan } = useGeneratedPlan();

  // Event hours: prefer live plan, fall back to a plan derived from
  // onboarding answers (currentShift + chronotype). Never mockPlan —
  // that surfaced generic 14:30/22:00/23:00 times to users who never
  // gave us their schedule (live-test 2026-05-25 hardcode complaint).
  const suggested = suggestedPlanFromOnboarding(
    onboarding.currentShift,
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );
  const parseFloatHour = (hhmm: string): number => {
    const [h, m] = hhmm.split(':').map(Number);
    return (h || 0) + (m || 0) / 60;
  };
  // G4: sleep journal — one-tap rating after sleep. Subscribed for live
  // re-render when user taps an emoji button.
  const journal = useSleepJournal();
  const todayRating = ratingForToday();

  // TODAY-9: optional hours ledger (separate, free, backward-compatible).
  // Subscribed so logging hours re-renders both the journal chips and the
  // premium debt card. `null` = not logged today.
  useSleepHours();
  const todayHours = hoursForToday();

  // TODAY-10: optional reflective "what affected it?" factor tags. Separate,
  // free, backward-compatible store — multi-select, never touches the rating
  // journal. Subscribed so toggling a chip re-renders the row + the week card.
  const factorsMap = useSleepFactors();
  const todayFactors = factorsForToday();

  // Chronotype-adjusted sleep need (hours) — feeds the debt math; defaults to
  // 7.5h when chronotype is unknown.
  const sleepNeed = sleepNeedForChronotype(
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );

  // QA-BUG-1: caffeine logger no longer overrides the cutoff hero time
  // — that's the suggested 'don't drink after' time (sleep − 6h), a
  // schedule recommendation, not a per-cup recalculation. Logger now only
  // contributes a "cups today" counter shown in the card body. Avoids the
  // confusing 22:00 cap collision with a 22:30 sleep window.
  const caffLog = useCaffeineLog();
  const sleepStartHour = planHourAsFloat(generatedPlan?.sleep_start) ?? suggested.sleepStart;
  const caffeineHour =
    planHourAsFloat(generatedPlan?.caffeine_cutoff_at)
    ?? parseFloatHour(suggested.caffeineCutoff);
  const melatoninHour = planHourAsFloat(generatedPlan?.melatonin_at)
    ?? parseFloatHour(suggested.melatoninTime);

  // J1/F1 — exclude melatonin event when user opted out in onboarding
  const showMelatonin = onboarding.takesMelatonin !== false;
  // C2 — exclude caffeine event when user doesn't drink caffeine (cups=0)
  const showCaffeine = onboarding.caffeineCupsPerDay > 0;
  // R22/H3: memoise events array so unchanged hours don't churn 3 fresh
  // children every render of the parent.
  const events = useMemo(() => [
    ...(showCaffeine ? [{ ...EVENT_STYLES.caffeine, hour: caffeineHour }] : []),
    ...(showMelatonin ? [{ ...EVENT_STYLES.melatonin, hour: melatoninHour }] : []),
    { ...EVENT_STYLES.sleep, hour: sleepStartHour },
  ], [showCaffeine, caffeineHour, showMelatonin, melatoninHour, sleepStartHour]);

  // Persona fix (P1): a one-line "what's my move right now" anchor at the
  // top of Today, built from the same plan data shown lower. A half-asleep
  // shift worker home from a night sees their sleep window + caffeine
  // cutoff immediately, instead of scrolling past the selector + journal.
  const nowHeroText = showCaffeine
    ? t('today.now_hero_full', {
        sleep: formatHour(sleepStartHour),
        caffeine: formatHour(caffeineHour),
      })
    : t('today.now_hero_sleep', { sleep: formatHour(sleepStartHour) });

  // Streak source: server-authoritative `sleep_streaks` row for signed-in
  // users, else the local journal-derived streak for anon/demo users. We
  // also need the LAST logged day to drive the freeze-aware resolver.
  const rawStreak = streak?.current_streak ?? localCurrentStreak();
  const streakLastIso = streak?.last_streak_date ?? lastLoggedIso();
  // The freeze-aware DISPLAY resolution happens below once `now` is known.

  // Transition teaser: when a live plan exists pull its day-1 step counts;
  // else fall back to the mockTransition fixture so the demo still reads.
  // R22/H2: memoise — 12 t() lookups + 2 `new Date()` + weekday array fetch
  // per render unless livePlan presence flips.
  const mockTransition = useMemo(() => getMockTransition(), [livePlan]);
  const todayMock = mockTransition.days[0];
  const liveDay1Steps = livePlan?.steps.filter((s) => s.day_number === 1) ?? [];
  const liveDoneToday = liveDay1Steps.filter((s) => s.is_completed).length;
  const fromLabel = livePlan
    ? livePlan.transition_type === 'night_to_day' ? t('transition.shift.night') : t('transition.shift.day')
    : mockTransition.fromShift;
  const toLabel = livePlan
    ? livePlan.transition_type === 'night_to_day' ? t('transition.shift.day') : t('transition.shift.night')
    : mockTransition.toShift;
  const doneToday = livePlan ? liveDoneToday : countCompleted(todayMock.steps);
  const totalToday = livePlan ? liveDay1Steps.length : todayMock.steps.length;
  // D2: explicit start → end window so the user sees the transition has a
  // defined finish straight from the Home card — not just a start date.
  const transitionWindow = livePlan
    ? `${formatDayMonth(new Date(livePlan.start_date + 'T00:00:00'))} → ${formatDayMonth(new Date(livePlan.end_date + 'T00:00:00'))}`
    : null;

  // HIGH-bug fix (G8): the clock used to be a bare `new Date()` at render
  // time, so the TimelineRing center, the greeting, and every "in N hours"
  // label FROZE at mount and only moved when some unrelated state changed.
  // `nowTick` is refreshed every 60s AND on tab focus, and `now`/`nowHour`
  // derive from it — so the whole screen tracks real wall-clock time.
  // R26-7: declared above the clock ticker so the ticker can pause while the
  // coachmark is open (a mid-tour tick shifts layout under the scroll loop).
  const [coachVisible, setCoachVisible] = useState(false);
  const [nowTick, setNowTick] = useState<Date>(() => new Date());
  // 60s ticker. EMPTY deps + functional update — never depends on the value
  // it mutates (the render-loop trap fixed in store.tsx G1). Cleared on unmount.
  useEffect(() => {
    // R26-7: pause the 60s clock tick while the coachmark is open — a tick
    // mid-tour re-renders + shifts layout, which the coachmark's scroll-to-
    // target loop then chases (the violent up/down jitter the owner saw).
    if (coachVisible) return;
    const id = setInterval(() => setNowTick(new Date()), 60_000);
    return () => clearInterval(id);
  }, [coachVisible]);
  // Re-sync the clock when the user returns to this tab (a 60s tick could be
  // mid-cycle when they switch back from Plan/Profile).
  useFocusEffect(
    useCallback(() => {
      setNowTick(new Date());
    }, []),
  );
  const now = nowTick;
  const nowHour = now.getHours() + now.getMinutes() / 60;

  // TODAY-4 — Streak Freeze + loss-aversion. A shift worker's unavoidable
  // rough/missed day shouldn't reset the streak to zero. We read how many
  // freezes are available this month (2/month, AsyncStorage-persisted),
  // then resolve the DISPLAYED streak with freeze awareness.
  //
  // NOTE: for signed-in users the streak is server-authoritative (a Supabase
  // insert-time RPC/trigger maintains `sleep_streaks`). That RPC is NOT yet
  // freeze-aware, so on a 1-day gap it may have already reset current_streak
  // to 0 server-side; this client adjustment covers the case where the server
  // still holds the pre-gap value at read time. Full correctness needs the
  // RPC to become freeze-aware too — a DB migration, intentionally out of
  // scope for this task.
  const [freezesAvailable, setFreezesAvailable] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getAvailableFreezes().then((n) => {
        if (alive) setFreezesAvailable(n);
      });
      return () => {
        alive = false;
      };
    }, []),
  );
  const resolvedStreak = useMemo(
    () =>
      resolveStreak({
        lastDateIso: streakLastIso,
        currentStreak: rawStreak,
        today: now,
        freezes: freezesAvailable,
      }),
    [streakLastIso, rawStreak, now, freezesAvailable],
  );
  // Latch the kept streak when a freeze is spent. Without this, consuming the
  // LAST freeze would drop freezesAvailable→0, the memo would re-resolve the
  // same gap with freezes:0, and the streak would snap back to 0 — undoing
  // the save. The latch (keyed by the gap's lastDate) freezes the display at
  // the kept value for this gap regardless of the now-decremented count.
  const [latched, setLatched] = useState<{ key: string; streak: number } | null>(null);
  const latchKey = streakLastIso ?? '';
  useEffect(() => {
    if (!resolvedStreak.freezeConsumed) return;
    if (latched?.key === latchKey) return; // already spent for this gap
    setLatched({ key: latchKey, streak: resolvedStreak.streak });
    let alive = true;
    void consumeFreeze().then((remaining) => {
      if (alive) setFreezesAvailable(remaining);
    });
    return () => {
      alive = false;
    };
  }, [resolvedStreak.freezeConsumed, resolvedStreak.streak, latchKey, latched]);

  // Display value: the latched (freeze-kept) streak if this gap was covered,
  // else the freshly resolved value.
  const streakValue =
    latched?.key === latchKey ? latched.streak : resolvedStreak.streak;
  const loggedToday = todayRating !== null;
  // Streak alive but TODAY is still unlogged → the day's log is outstanding.
  // Use streakValue (covers the latched freeze case) rather than the memo's
  // transient atRisk so a freeze-covered gap still nudges the user to log.
  const streakUnloggedToday = streakValue > 0 && !loggedToday;
  // At-risk = unlogged AND late in the day (after the threshold below) — the
  // loss-aversion nudge only escalates when the day is genuinely running out
  // so we don't cry wolf at 9am.
  const STREAK_AT_RISK_HOUR = 20; // local hour after which an unlogged day reads "at risk"
  const lateInDay = nowHour >= STREAK_AT_RISK_HOUR;
  const streakAtRisk = streakUnloggedToday && lateInDay;
  // Loss-framed "keep it" copy fires earlier: streak alive but today unlogged.
  const streakNeedsLog = streakUnloggedToday;
  const freezeAvailable = freezesAvailable > 0;

  // G8-P0: "Right now in your body" — the live circadian phase + next move.
  // Pure pick from lib/today-phase using the SAME plan times shown lower, so
  // the hero answer ("wind-down — melatonin in 40 min", "alertness dip ahead",
  // …) always agrees with the cards. Recomputes when the minute ticks or any
  // input changes. FREE feature, no gate.
  const phase = useMemo(
    () =>
      phaseForNow({
        nowHour,
        shift: onboarding.currentShift,
        plan: {
          sleepStart: sleepStartHour,
          sleepEnd: planHourAsFloat(generatedPlan?.sleep_end) ?? suggested.sleepEnd,
          caffeineCutoff: formatHour(caffeineHour),
          melatoninTime: formatHour(melatoninHour),
          shiftStart: suggested.shiftStart,
          shiftEnd: suggested.shiftEnd,
        },
        takesMelatonin: onboarding.takesMelatonin !== false,
        format: formatHour,
      }),
    [
      nowHour,
      onboarding.currentShift,
      onboarding.takesMelatonin,
      sleepStartHour,
      generatedPlan?.sleep_end,
      suggested.sleepEnd,
      caffeineHour,
      melatoninHour,
      suggested.shiftStart,
      suggested.shiftEnd,
    ],
  );

  // TODAY-6: "Today's Focus" inputs. Pure signals derived from the SAME plan
  // times + live caffeine/journal stores already on this screen, so the
  // premium card's single move always agrees with the phase hero above it.
  // The card itself gates on premium and computes the focus; we only assemble
  // its args here (cheap, memoised so it doesn't re-derive on unrelated ticks).
  const lastCupHour = caffLog
    ? (() => {
        const d = new Date(caffLog.lastCupAt);
        return Number.isNaN(d.getTime()) ? null : d.getHours() + d.getMinutes() / 60;
      })()
    : null;
  const focusArgs = useMemo<FocusArgs>(
    () => ({
      nowHour,
      shift: onboarding.currentShift,
      plan: {
        sleepStart: sleepStartHour,
        sleepEnd: planHourAsFloat(generatedPlan?.sleep_end) ?? suggested.sleepEnd,
        caffeineCutoff: formatHour(caffeineHour),
        melatoninTime: formatHour(melatoninHour),
        shiftStart: suggested.shiftStart,
        shiftEnd: suggested.shiftEnd,
      },
      takesMelatonin: onboarding.takesMelatonin !== false,
      caffeineCupsPerDay: onboarding.caffeineCupsPerDay ?? 0,
      caffeineSensitivity: onboarding.caffeineSensitivity,
      cupsToday: caffLog?.cups ?? 0,
      lastCupHour,
      tally: weeklyTally(),
      napHour: napWindowForShift(onboarding.currentShift)?.hour ?? 14,
      format: formatHour,
    }),
    [
      nowHour,
      onboarding.currentShift,
      onboarding.takesMelatonin,
      onboarding.caffeineCupsPerDay,
      onboarding.caffeineSensitivity,
      sleepStartHour,
      generatedPlan?.sleep_end,
      suggested.sleepEnd,
      suggested.shiftStart,
      suggested.shiftEnd,
      caffeineHour,
      melatoninHour,
      caffLog?.cups,
      lastCupHour,
    ],
  );

  // TODAY-7: adaptive caffeine "last-call". For PREMIUM users who have LOGGED
  // ≥1 cup today, the caffeine cutoff card stops showing the static schedule
  // value and instead recomputes from their REAL last cup + sensitivity:
  // when the caffeine fades, and whether it's clear before tonight's sleep.
  // This REPLACES the static line (no second caffeine number) — see the
  // caffeine card body below. Free users, and premium users who haven't logged
  // yet, keep the unchanged static cutoff. Premium gate mirrors plan.tsx /
  // TodaysFocusCard exactly.
  const { data: subscription } = useSubscription();
  const isPremium =
    subscription?.status === 'active' ||
    subscription?.status === 'trial' ||
    subscription?.status === 'grace_period';
  // Show the adaptive read only when premium AND a cup is logged today AND we
  // could derive a valid last-cup hour. Otherwise the static card stays.
  const adaptiveCaffeine = useMemo(
    () =>
      isPremium && (caffLog?.cups ?? 0) > 0 && lastCupHour != null
        ? computeAdaptiveCaffeine(
            lastCupHour,
            onboarding.caffeineSensitivity,
            sleepStartHour,
          )
        : null,
    [isPremium, caffLog?.cups, lastCupHour, onboarding.caffeineSensitivity, sleepStartHour],
  );

  // Map the phase tone → GlassCard variant + glyph color. Tones are
  // semantic (dusk = sleep/wind-down, sunrise = alert/light, calm = neutral).
  const PHASE_TONE: Record<
    typeof phase.tone,
    { variant: 'dusk' | 'paper' | 'glass'; glyphColor: 'duskDim' | 'sunriseDim' | 'primary'; eyebrowColor?: 'duskDim'; iconBg: string }
  > = {
    dusk: { variant: 'dusk', glyphColor: 'duskDim', eyebrowColor: 'duskDim', iconBg: colors.duskGlow },
    sunrise: { variant: 'paper', glyphColor: 'sunriseDim', iconBg: colors.sunriseGlow },
    primary: { variant: 'glass', glyphColor: 'primary', iconBg: colors.primaryContainer },
    calm: { variant: 'glass', glyphColor: 'primary', iconBg: colors.primaryContainer },
  };
  const phaseStyle = PHASE_TONE[phase.tone];

  // D (a11y): screen-reader summaries for the two core visuals. The ring and
  // the 24h bar render to nothing for VoiceOver otherwise.
  const sleepEndHour = planHourAsFloat(generatedPlan?.sleep_end) ?? suggested.sleepEnd;
  const ringA11yLabel = t('a11y.timeline_ring', {
    sleepStart: formatHour(sleepStartHour),
    sleepEnd: formatHour(sleepEndHour),
    shiftStart: formatHour(suggested.shiftStart),
    shiftEnd: formatHour(suggested.shiftEnd),
    now: formatHour(nowHour),
  });
  // D1 + QA-BUG-2: scan the next 7 days of shifts for a night→day or
  // day→night pivot. When detected, the CTA card hero becomes a SMART
  // suggestion ("Upcoming: night → day") rather than a generic prompt.
  const localShiftsMap = useLocalShifts();
  // R22/H4: memoise the Map construction + 7-day scan so a journal
  // emit or caffeine tap doesn't re-rebuild + re-scan when nothing
  // shift-relevant changed.
  const todayIsoForDetect = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const detected = useMemo(() => {
    if (livePlan?.transition_type) return null;
    const shiftByIsoForDetect = new Map<string, ShiftKind>();
    for (const [iso, kind] of Object.entries(localShiftsMap)) {
      if (kind === 'day' || kind === 'night' || kind === 'off') {
        shiftByIsoForDetect.set(iso, kind);
      }
    }
    return detectTransitionOpportunity(shiftByIsoForDetect, todayIsoForDetect);
  }, [localShiftsMap, todayIsoForDetect, livePlan?.transition_type]);

  // TODAY-11: sleep-banking (pre-hard-shift) + post-block recovery. Reuses the
  // SAME local-shifts calendar the transition scan above reads, plus the
  // onboarding nextShift/scheduleId/currentShift signals. Returns 'none' unless
  // a real condition is live, so the card stays contextual (anti-bloat). Kept
  // ORTHOGONAL to the transition card: that one fires on a day↔night PIVOT and
  // produces a multi-step plan; this fires on an upcoming HARD shift to bank
  // for, or an OFF day that closes a work RUN to recover from. Memoised on the
  // same inputs so an unrelated tick (journal/caffeine) doesn't re-scan.
  const bankingState = useMemo(
    () =>
      sleepBankingState({
        localShifts: localShiftsMap,
        today: now,
        nextShift: onboarding.nextShift,
        scheduleId: onboarding.scheduleId,
        currentShift: onboarding.currentShift,
      }),
    [localShiftsMap, now, onboarding.nextShift, onboarding.scheduleId, onboarding.currentShift],
  );

  // today-2: the 24h "YOUR 24 HOURS" bar is built from the user's REAL data,
  // never the mockShiftBlocks demo fixture (which showed a 07:45–19:00 nurse
  // day-shift to everyone). Two real blocks:
  //   • WORK — kind resolved from today's schedule entry (local-shifts) when
  //     present, else the manual TODAY'S SHIFT toggle. Times come from the
  //     user's own currentShiftStart/End when that resolved kind matches the
  //     toggle; otherwise the same suggested.shiftStart/End the ring uses, so
  //     bar + ring tell the same story. OFF days get NO work block.
  //   • SLEEP — the plan sleep window (generatedPlan ?? suggestedPlanFromOnboarding),
  //     the exact source the ring's sleep arc reads.
  // ShiftBar's normaliseBlocks() already splits a midnight-crossing block
  // (end <= start) into [start..24] + [0..end], so a night shift / wrapped
  // sleep window needs no special-casing here.
  const todayShiftKind: ShiftKind =
    localShiftsMap[todayIsoForDetect] ?? onboarding.currentShift;
  const realBlocks = useMemo<ShiftBlock[]>(() => {
    const blocks: ShiftBlock[] = [];
    if (todayShiftKind === 'day' || todayShiftKind === 'night') {
      // Use the user's hand-entered times only when they describe TODAY's
      // resolved shift kind; the currentShiftStart/End fields belong to the
      // manual toggle, so they're meaningful only when that toggle matches.
      // When today's schedule entry disagrees with the toggle, derive defaults
      // for the RESOLVED kind (suggested is keyed to the toggle, so it can't
      // be reused for the opposite kind without showing day-times on a night).
      const useUserTimes = todayShiftKind === onboarding.currentShift;
      const kindDefaults = useUserTimes
        ? suggested
        : suggestedPlanFromOnboarding(
            todayShiftKind,
            chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
          );
      const workStart = useUserTimes
        ? parseFloatHour(onboarding.currentShiftStart)
        : kindDefaults.shiftStart;
      const workEnd = useUserTimes
        ? parseFloatHour(onboarding.currentShiftEnd)
        : kindDefaults.shiftEnd;
      blocks.push({ start: workStart, end: workEnd, kind: 'shift' });
    }
    // Always show the real sleep window (even on an OFF day — that's the one
    // honest thing we can show without inventing a shift).
    blocks.push({ start: sleepStartHour, end: sleepEndHour, kind: 'sleep' });
    return blocks;
  }, [
    todayShiftKind,
    onboarding.currentShift,
    onboarding.currentShiftStart,
    onboarding.currentShiftEnd,
    onboarding.chronotypeAnswers,
    suggested,
    sleepStartHour,
    sleepEndHour,
  ]);

  // D (a11y): screen-reader summary of the 24h bar, built from the SAME real
  // blocks the bar renders (was reading the mockShiftBlocks fixture before).
  const barSummaryParts: string[] = [];
  const realShiftBlock = realBlocks.find((b) => b.kind === 'shift');
  const realSleepBlock = realBlocks.find((b) => b.kind === 'sleep');
  if (realShiftBlock) {
    const shiftLabel =
      todayShiftKind === 'night' ? t('shift_kind.night_long') : t('shift_kind.day_long');
    barSummaryParts.push(
      `${shiftLabel} ${formatHour(realShiftBlock.start)}–${formatHour(realShiftBlock.end)}`,
    );
  }
  if (realSleepBlock) {
    barSummaryParts.push(
      `${t('today.event_sleep')} ${formatHour(realSleepBlock.start)}–${formatHour(realSleepBlock.end)}`,
    );
  }
  const shiftBarA11yLabel = t('a11y.shift_bar', { summary: barSummaryParts.join(', ') });

  // NOTE: a P3 "auto-sync today's shift from the schedule" effect used to live
  // here. It fought the manual TODAY'S SHIFT toggle — tapping Night snapped
  // back to the scheduled Day — so it was removed. The toggle is purely
  // manual; the schedule and the toggle are independent on purpose.

  // Mirror Profile's fallback chain so the greeting never says "MARINA"
  // when the real signed-in user has a different display_name. Use just
  // the first name in the greeting eyebrow so it doesn't push the streak
  // chip behind the decorative orb when display name is long (H3).
  // No mockUser.name fallback — drop the name fragment in cold-start rather
  // than greeting "Good afternoon, MARINA" on a fresh device with no profile.
  const rawName =
    onboarding.displayName?.trim() ||
    (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
    user?.email?.split('@')[0] ||
    '';
  const displayName = rawName ? firstName(rawName).toUpperCase() : '';

  // F8: the timeline-legend sheet is now opened on demand from the "?" beside
  // the ring, instead of auto-popping before the user has seen the screen.
  const [introVisible, setIntroVisible] = useState(false);

  // ── G7: Today coachmark tour ──────────────────────────────────────────
  // A sequential spotlight walkthrough that dims the screen and highlights
  // each key widget in scroll order. Auto-shows ONCE on first Today visit
  // (after onboarding), then never again.
  const scrollRef = useRef<ScrollView>(null);
  const shiftRef = useRef<View>(null);
  const journalRef = useRef<View>(null);
  const ringRef = useRef<View>(null);
  const nextRef = useRef<View>(null);
  const coachArmedRef = useRef(false);

  const COACH_KEY = 'shiftrest:today-coach:v1';
  const coachSteps: CoachStep[] = useMemo(
    () => [
      { ref: shiftRef, titleKey: 'today_coach.s1_title', bodyKey: 'today_coach.s1_body' },
      { ref: journalRef, titleKey: 'today_coach.s2_title', bodyKey: 'today_coach.s2_body' },
      { ref: ringRef, titleKey: 'today_coach.s3_title', bodyKey: 'today_coach.s3_body' },
      { ref: nextRef, titleKey: 'today_coach.s4_title', bodyKey: 'today_coach.s4_body' },
    ],
    [],
  );

  // Auto-show once. EMPTY dep array + once-guard ref — DELIBERATELY does NOT
  // depend on the onboarding state object (an effect depending on a mutated
  // value caused an app-wide render loop before — see store.tsx G1 note).
  // We read completed via a value captured at mount (snapshot), not a dep.
  // current value; if onboarding isn't done yet we just skip (the user is
  // still in the funnel and won't be on this tab anyway).
  const onboardingCompletedAtMount = onboarding.completed;
  useEffect(() => {
    if (coachArmedRef.current) return;
    coachArmedRef.current = true;
    if (!onboardingCompletedAtMount) return;
    let alive = true;
    AsyncStorage.getItem(COACH_KEY)
      .then((seen) => {
        if (!alive) return;
        if (!seen) setCoachVisible(true);
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishCoach = useCallback(() => {
    setCoachVisible(false);
    AsyncStorage.setItem(COACH_KEY, '1').catch(() => null);
  }, []);

  // Scroll the inner ScrollView by a window-space delta (positive = scroll the
  // target up toward the top). The coachmark passes (currentTop - desiredTop).
  const scrollOffsetRef = useRef(0);
  const handleScrollToY = useCallback((delta: number) => {
    const next = Math.max(0, scrollOffsetRef.current + delta);
    scrollOffsetRef.current = next;
    scrollRef.current?.scrollTo({ y: next, animated: true });
  }, []);

  return (
    <Screen
      orbs="normal"
      scroll
      scrollRef={scrollRef}
      scrollEventThrottle={16}
      onScroll={(e) => {
        scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
      }}
    >
      <PlanUpdatedBanner />
      <TodayIntroSheet visible={introVisible} onClose={() => setIntroVisible(false)} />
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{displayName ? `${getGreeting(nowHour, onboarding.currentShift)}, ${displayName}` : getGreeting(nowHour, onboarding.currentShift)}</Eyebrow>
        </View>
        {streakValue > 0 && !streakNeedsLog && !streakAtRisk && (
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.view_streak')}
            hitSlop={8}
            style={styles.streak}
          >
            <Glyph name="flame" size={16} color="sunriseDim" />
            <Text
              variant="labelMd"
              family="body"
              weight="medium"
              color="ink"
              uppercase
              style={styles.streakText}
            >
              {formatStreak(streakValue)}
            </Text>
            {freezeAvailable && (
              <Glyph name="snowflake" size={14} color="primaryBright" />
            )}
          </Pressable>
        )}
      </View>

      {/* TODAY-4: the loss-aversion / at-risk streak nudge gets its OWN
          full-width row — the long "keep your N-day streak" copy didn't fit
          the compact inline pill (it truncated and hid the freeze snowflake). */}
      {streakValue > 0 && (streakNeedsLog || streakAtRisk) && (
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel={
            streakAtRisk
              ? t('streak.at_risk', { n: streakValue })
              : t('streak.keep', { n: streakValue })
          }
          hitSlop={8}
          style={[styles.streakNudge, streakAtRisk && styles.streakAtRisk]}
        >
          <Glyph name="flame" size={16} color={streakAtRisk ? 'coralDim' : 'sunriseDim'} />
          <Text
            variant="labelMd"
            family="body"
            weight="medium"
            color={streakAtRisk ? 'coralDim' : 'ink'}
            uppercase
            numberOfLines={2}
            style={styles.streakNudgeText}
          >
            {streakAtRisk
              ? t('streak.at_risk', { n: streakValue })
              : t('streak.keep', { n: streakValue })}
          </Text>
          {freezeAvailable && (
            <Glyph name="snowflake" size={14} color={streakAtRisk ? 'coralDim' : 'primaryBright'} />
          )}
        </Pressable>
      )}

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('today.hero')}</SerifHero>
      </View>

      {/* G8-P0: "Right now in your body" — the live circadian phase hero.
          First card the eye hits: names the current phase + the single next
          move, derived from the live clock + shift + plan. FREE. */}
      <GlassCard variant={phaseStyle.variant} padding="xxl" style={{ marginBottom: spacing.md }}>
        <View style={styles.eventRow}>
          <View style={[styles.eventIcon, { backgroundColor: phaseStyle.iconBg }]}>
            <Glyph name={phase.glyph} size={22} color={phaseStyle.glyphColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow color={phaseStyle.eyebrowColor ?? 'inkMuted'}>{t(phase.eyebrowKey)}</Eyebrow>
            <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
              {t(phase.titleKey, phase.params)}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
              {t(phase.bodyKey, phase.params)}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* TODAY-6: "Today's Focus" — the single highest-priority move today with
          its exact time. PREMIUM surface (free users get a locked teaser →
          paywall, same slot). Mounts right after the RIGHT NOW phase card so
          the day's one move sits directly under the live phase. */}
      <TodaysFocusCard args={focusArgs} />

      {/* TODAY-3: Safe-to-Drive — post-shift drowsy-driving self-check. Mounts
          ONLY in the post-shift commute window (just finished a night/long
          shift, about to drive home — the drowsy-driving danger peak). The
          card self-suppresses for the rest of the day once engaged/dismissed.
          Wellness-framed advice — NEVER blocks the app, never shows for day
          workers or outside the commute window. */}
      {phase.key === 'post_shift_commute' && <SafeToDriveCard />}

      {/* P1: "right now" anchor — sleep window + caffeine cutoff at a glance,
          so the actionable answer is the first thing seen post-shift. */}
      <View style={styles.nowHeroRow}>
        <Glyph name="moon" size={15} color="primary" />
        <Text variant="bodyMd" weight="medium" color="ink" style={styles.nowHeroText}>
          {nowHeroText}
        </Text>
      </View>

      {/* TODAY-8: Anchor Sleep — surfaces the existing fast-rotation anchor
          block (Plan tab's anchorSleepWindow) on Today. Self-gates: renders
          ONLY for fast-rotating schedules (3x12/24-48/48-96/continental/custom),
          nothing for a steady day/night worker. Grouped with the sleep-window
          glance above so the one fixed block to protect sits with sleep. */}
      <AnchorSleepCard scheduleId={onboarding.scheduleId} />

      {/* TODAY-11: Sleep-banking (a hard night/24h shift is today or tomorrow →
          bank a nap / move sleep earlier) + post-block recovery (today is OFF
          after a ≥2-day work run → paced re-anchor). PREMIUM, condition-gated:
          renders ONE card ONLY when bankingState.mode !== 'none', so it's
          contextual, not always-on. Orthogonal to the transition CTA below
          (pivot plan), so the two never restate the same idea. */}
      {bankingState.mode !== 'none' && <SleepBankingCard state={bankingState} />}

      {/* A9: Where you are today — daily state card, moved out of Settings */}
      <View ref={shiftRef} collapsable={false}>
        <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
          <Eyebrow style={{ marginBottom: spacing.sm }}>{t('today.shift_label')}</Eyebrow>
          <SegmentedControl<ShiftKind>
            options={shiftOptions}
            value={onboarding.currentShift}
            onChange={(v) => update({ currentShift: v })}
          />
        </GlassCard>
      </View>

      {/* G4: Sleep journal — one-tap morning rating + USER-BUG-9 stats reveal */}
      <View ref={journalRef} collapsable={false}>
      <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
        <Eyebrow style={{ marginBottom: spacing.sm }}>
          {todayRating ? t('today.journal_logged') : t('today.journal_prompt')}
        </Eyebrow>
        <View style={styles.journalRow}>
          {(['good', 'ok', 'bad'] as const).map((rating) => {
            const active = todayRating === rating;
            return (
              <Pressable
                key={rating}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSleepRating(rating);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`today.journal_${rating}`)}
                style={[
                  styles.journalChip,
                  {
                    backgroundColor: active
                      ? rating === 'good'
                        ? colors.primary
                        : rating === 'ok'
                        ? colors.sunriseGlow
                        : colors.duskGlow
                      : colors.surfaceLow,
                  },
                ]}
              >
                <Text
                  variant="labelMd"
                  family="body"
                  weight="medium"
                  color={active && rating === 'good' ? 'onPrimary' : 'ink'}
                  uppercase
                >
                  {t(`today.journal_${rating}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {/* TODAY-9: OPTIONAL "how long?" capture — appears once a rating is
            logged. Free + fully skippable: writing a bucket midpoint to the
            parallel hours ledger never affects the 1-tap rating above. */}
        {todayRating && (
          <View style={styles.hoursCapture}>
            <Text variant="labelMd" family="body" weight="medium" color="inkMuted" uppercase>
              {t('today.journal_hours_prompt')}
            </Text>
            <View style={styles.hoursRow}>
              {HOURS_BUCKETS.map((bucket) => {
                const active = todayHours === bucket.value;
                return (
                  <Pressable
                    key={bucket.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSleepHours(bucket.value);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t(bucket.labelKey)}
                    style={[
                      styles.hoursChip,
                      { backgroundColor: active ? colors.primaryContainer : colors.surfaceLow },
                    ]}
                  >
                    <Text
                      variant="labelMd"
                      family="body"
                      weight="medium"
                      color={active ? 'onPrimaryContainer' : 'inkSubtle'}
                      align="center"
                      numberOfLines={1}
                    >
                      {t(bucket.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        {/* TODAY-10: OPTIONAL reflective "what affected it?" factor tags —
            appears once a rating is logged, same low-friction pattern as the
            hours row above. Multi-select toggle into the parallel factor store;
            never touches the rating journal. Compact one-line chips (CJK-safe
            via numberOfLines + adjustsFontSizeToFit, mirroring TODAY-9). */}
        {todayRating && (
          <View style={styles.factorsCapture}>
            <Text variant="labelMd" family="body" weight="medium" color="inkMuted" uppercase>
              {t('today.factors.prompt')}
            </Text>
            <View style={styles.factorsRow}>
              {SLEEP_FACTORS.map((factor) => {
                const active = todayFactors.includes(factor.id);
                return (
                  <Pressable
                    key={factor.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleSleepFactor(factor.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t(factor.labelKey)}
                    style={[
                      styles.factorChip,
                      { backgroundColor: active ? colors.primaryContainer : colors.surfaceLow },
                    ]}
                  >
                    <Text
                      variant="labelMd"
                      family="body"
                      weight="medium"
                      color={active ? 'onPrimaryContainer' : 'inkSubtle'}
                      align="center"
                      numberOfLines={1}
                    >
                      {t(factor.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        {/* D3: visible last-7-days dot strip so ratings are tracked at a glance.
            The numeric weekly tally + trend + adapt score now live in the
            consolidated "Your week in sleep" card below (TODAY-10) — this strip
            stays here as the compact in-context glance only, no duplicate
            tally. */}
        {todayRating && (() => {
          const tally = weeklyTally();
          if (!tally) return null;
          return (
            <Pressable
              onPress={() => router.push('/history')}
              style={{ marginTop: spacing.md }}
              accessibilityRole="button"
              accessibilityLabel={t('today.journal_stats_a11y')}
            >
              <View style={styles.journalDots}>
                {recentJournalDays(7).map((d) => (
                  <View
                    key={d.iso}
                    style={[
                      styles.journalDot,
                      {
                        backgroundColor:
                          d.rating === 'good'
                            ? colors.primary
                            : d.rating === 'ok'
                            ? colors.sunriseDim
                            : d.rating === 'bad'
                            ? colors.duskDim
                            : colors.inkGhost,
                      },
                    ]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })()}
      </GlassCard>
      </View>

      {/* TODAY-10: "Your week in sleep" — ONE consolidated card. Owns the weekly
          tally + trend (moved out of the loose journal line above), the adapt
          score promoted from Profile, and an HONEST factor correlate insight
          (only when bestCorrelate clears its thin-data guards; calm empty state
          otherwise). Sits right under the journal so the week summary follows
          the day's log. */}
      <WeekInSleepCard ratings={journal.entries} factors={factorsMap.entries} />

      {/* TODAY-9: Sleep-debt ledger — turns the optional hours capture above
          into a tracked metric. PREMIUM analysis card (free users get a
          screenshot-safe locked teaser → paywall; premium-but-unlogged gets an
          honest empty state, no fake number). Grouped right under the journal
          so the debt sits with the hours it's computed from. */}
      <SleepDebtCard need={sleepNeed} />

      <View ref={ringRef} collapsable={false} style={styles.ringWrap}>
        {/* F8: on-demand legend — tap "?" to learn what each arc/dot means */}
        <Pressable
          onPress={() => setIntroVisible(true)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Explain the timeline"
          style={styles.ringHelp}
        >
          <Text variant="labelMd" family="body" weight="medium" color="inkMuted">?</Text>
        </Pressable>
        <TimelineRing
          nowHour={nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={planHourAsFloat(generatedPlan?.sleep_end) ?? suggested.sleepEnd}
          shiftStart={realShiftBlock?.start}
          shiftEnd={realShiftBlock?.end}
          size={260}
          label={t('today.label_today')}
          centerLabel={formatHour(nowHour)}
          accessibilityLabel={ringA11yLabel}
        />
      </View>

      <Eyebrow>{t('today.section_24h')}</Eyebrow>
      <View style={{ height: spacing.md }} />
      <ShiftBar blocks={realBlocks} height={16} accessibilityLabel={shiftBarA11yLabel} />

      <View style={{ height: spacing.huge }} />

      {/* B3: Community stories — promoted from screen bottom to a prominent
          mid-feed slot so members see how peers normalized their sleep. */}
      <TipsCarousel />

      <View style={{ height: spacing.huge }} />

      {/* TODAY-1: Daily Insight — rotating, phase × profession-aware,
          journal-reactive content card. Replaces the old static "Tonight's
          read" (which picked one article by date % length). Deterministic
          per day, never-repeats until the pool is exhausted, and reacts to
          the user's live circadian phase + last-night rating. */}
      <DailyInsightCard
        phaseKey={phase.key}
        profession={
          onboarding.profession === 'nurse' ||
          onboarding.profession === 'firefighter' ||
          onboarding.profession === 'factory'
            ? onboarding.profession
            : null
        }
        rating={todayRating}
      />

      <View style={{ height: spacing.huge }} />

      <View ref={nextRef} collapsable={false}>
      <Eyebrow>{t('today.section_next')}</Eyebrow>
      <View style={{ height: spacing.md }} />

      {events.map((e) => {
        const isCaffeine = e.glyph === 'coffee';
        // TODAY-7: premium + logged → the caffeine card shows the ADAPTIVE
        // last-call recomputed from the real cup, REPLACING the static cutoff
        // number/relative-time. Exactly one caffeine line either way: the
        // static HeroNumber path and the adaptive path are mutually exclusive.
        const showAdaptiveCaffeine = isCaffeine && adaptiveCaffeine != null;
        return (
          <GlassCard key={e.labelKey} variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
            <View style={styles.eventRow}>
              <View style={[styles.eventIcon, { backgroundColor: e.tintBg }]}>
                <Glyph name={e.glyph} size={22} color={e.tintFg} />
              </View>
              <View style={{ flex: 1 }}>
                {showAdaptiveCaffeine && adaptiveCaffeine ? (
                  <>
                    <Eyebrow>{t('today.caffeine_lastcall_eyebrow')}</Eyebrow>
                    <Text
                      variant="bodyMd"
                      color={adaptiveCaffeine.clearForSleep ? 'ink' : 'coralDim'}
                      weight="medium"
                      style={{ marginTop: 4 }}
                    >
                      {adaptiveCaffeine.clearForSleep
                        ? t('today.caffeine_lastcall_clear', {
                            last: formatHour(adaptiveCaffeine.lastCupHour),
                            fades: formatHour(adaptiveCaffeine.fadesAt),
                            sleep: formatHour(sleepStartHour),
                          })
                        : t('today.caffeine_lastcall_warning', {
                            last: formatHour(adaptiveCaffeine.lastCupHour),
                            sleep: formatHour(sleepStartHour),
                            cutoff: formatHour(adaptiveCaffeine.recommendedCutoff),
                          })}
                    </Text>
                    {caffLog && (
                      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                        {t('today.caffeine_logged', { cups: caffLog.cups })}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Eyebrow>{t(e.labelKey)}</Eyebrow>
                    <HeroNumber value={formatHour(e.hour)} size="md" style={{ marginTop: 2 }} />
                    <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                      {formatRelativeTime(nowHour, e.hour)}
                    </Text>
                    {isCaffeine && caffLog && (
                      <Text variant="bodyMd" color="primary" style={{ marginTop: 2 }}>
                        {t('today.caffeine_logged', { cups: caffLog.cups })}
                      </Text>
                    )}
                  </>
                )}
              </View>
              {isCaffeine && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const cups = (caffLog?.cups ?? 0) + 1;
                    showAppDialog({
                      title: t('today.caffeine_confirm_title'),
                      message: t('today.caffeine_confirm_body', { cups }),
                      actions: [
                        { label: t('today.caffeine_cancel'), style: 'cancel' },
                        { label: t('today.caffeine_log_cta'), onPress: () => logCaffeine() },
                      ],
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('today.log_caffeine_a11y')}
                  hitSlop={10}
                  style={styles.logBtnCol}
                >
                  <View style={styles.logBtn}>
                    <Glyph name="plus" size={18} color="primary" />
                  </View>
                  <Text variant="labelMd" color="primary" style={{ marginTop: 4, fontSize: 10 }}>
                    {t('today.log_caffeine_label')}
                  </Text>
                </Pressable>
              )}
            </View>
          </GlassCard>
        );
      })}

      {/* F1: Transition card when a live plan exists. Otherwise show a
          CTA to plan one — the killer feature is now reachable from UI. */}
      {livePlan?.transition_type ? (
        <Pressable
          onPress={() => router.push('/transition')}
          style={{ marginTop: spacing.md }}
        >
          <GlassCard variant="dusk" padding="xxl">
            <View style={styles.eventRow}>
              <View style={[styles.eventIcon, { backgroundColor: colors.duskGlow }]}>
                <Glyph name="sparkle" size={22} color="duskDim" />
              </View>
              <View style={{ flex: 1 }}>
                <Eyebrow color="duskDim">{t('today.transition_in_progress')}</Eyebrow>
                <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
                  {t('today.transition_subtitle', { from: fromLabel, to: toLabel, done: doneToday, total: totalToday })}
                </Text>
                {transitionWindow ? (
                  <View style={styles.transitionWindowRow}>
                    <Glyph name="calendar" size={13} color="duskDim" />
                    <Text variant="labelMd" weight="medium" color="duskDim" style={{ marginLeft: spacing.xs }}>
                      {transitionWindow}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Glyph name="chevronRight" size={20} color="duskDim" />
            </View>
          </GlassCard>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push('/transition-create')}
          style={{ marginTop: spacing.md }}
        >
          <GlassCard variant="paper" padding="xxl">
            <View style={styles.eventRow}>
              <View style={{ flex: 1 }}>
                <Eyebrow>
                  {detected
                    ? t('today.plan_transition_detected_eyebrow')
                    : t('today.plan_transition_eyebrow')}
                </Eyebrow>
                <Text
                  variant="titleLg"
                  family="display"
                  weight="light"
                  color="ink"
                  style={{ marginTop: 2 }}
                >
                  {detected
                    ? detected.type === 'night_to_day'
                      ? t('today.plan_transition_n2d_title')
                      : t('today.plan_transition_d2n_title')
                    : t('today.plan_transition_title')}
                </Text>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {t('today.plan_transition_sub')}
                </Text>
              </View>
              <Glyph name="chevronRight" size={20} color="inkMuted" />
            </View>
          </GlassCard>
        </Pressable>
      )}
      </View>

      <TodayCoachmark
        visible={coachVisible}
        onDone={finishCoach}
        steps={coachSteps}
        scrollToY={handleScrollToY}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.sunriseGlow,
    flexShrink: 1,
    maxWidth: '62%',
  },
  streakAtRisk: {
    backgroundColor: colors.coralGlow,
  },
  streakText: {
    marginLeft: 6,
    marginRight: 6,
    flexShrink: 1,
  },
  streakNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.sunriseGlow,
  },
  streakNudgeText: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  logBtnCol: {
    alignItems: 'center',
  },
  logBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  transitionWindowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  nowHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ringWrap: {
    alignItems: 'center',
    marginBottom: spacing.huge,
    position: 'relative',
  },
  ringHelp: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowHeroText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  journalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  journalChip: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursCapture: {
    marginTop: spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  hoursChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorsCapture: {
    marginTop: spacing.md,
  },
  factorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  factorChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  journalDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
});
