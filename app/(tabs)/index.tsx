/**
 * S20 — Home (Today). Core screen: glance-and-go, <5 sec.
 * Eyebrow greeting + streak pill + Soft hero line + TimelineRing + ShiftBar + 3 next-event cards.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
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
import { mockShiftBlocks, getMockTransition } from '../../mock/user';
import {
  countCompleted,
  formatHour,
  formatDayMonth,
  formatRelativeTime,
  formatStreak,
  getGreeting,
  firstName,
  suggestedPlanFromOnboarding,
} from '../../lib/derive';
import {
  useOnboarding,
  chronotypeBucket,
  computeChronotypeScore,
  type ShiftKind,
} from '../../lib/onboarding/store';
import { useStreak, useActiveTransitionPlan } from '../../lib/queries';
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
  type SleepRating,
} from '../../lib/sleep-journal/store';
import { useLocalShifts } from '../../lib/local-shifts/store';
import { TodayIntroSheet } from '../../components/today/TodayIntroSheet';
import { TipsCarousel } from '../../components/library/TipsCarousel';
import { articlesForProfession } from '../../lib/sleep-tips/library';
import { detectTransitionOpportunity } from '../../lib/transition/generate';
import * as Haptics from 'expo-haptics';
import { t } from '../../lib/i18n';

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
  useSleepJournal();
  const todayRating = ratingForToday();

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

  // Streak: real DB row when signed-in user has one, else 0.
  // Anon users see no pill (hidden when value===0).
  const streakValue = streak?.current_streak ?? 0;

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

  // Real local time, expressed as fractional hours (e.g. 14.5 = 14:30) so
  // the TimelineRing's nowHour, the greeting, and the "in N hours" copy
  // all reflect what the user is actually looking at — instead of the
  // demo-fixed 14:30 from mockPlan.
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

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

  return (
    <Screen orbs="normal" scroll>
      <PlanUpdatedBanner />
      <TodayIntroSheet visible={introVisible} onClose={() => setIntroVisible(false)} />
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{displayName ? `${getGreeting(nowHour, onboarding.currentShift)}, ${displayName}` : getGreeting(nowHour, onboarding.currentShift)}</Eyebrow>
        </View>
        {streakValue > 0 && (
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
              style={{ marginLeft: 6 }}
            >
              {formatStreak(streakValue)}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <SerifHero>{t('today.hero')}</SerifHero>
      </View>

      {/* P1: "right now" anchor — sleep window + caffeine cutoff at a glance,
          so the actionable answer is the first thing seen post-shift. */}
      <View style={styles.nowHeroRow}>
        <Glyph name="moon" size={15} color="primary" />
        <Text variant="bodyMd" weight="medium" color="ink" style={styles.nowHeroText}>
          {nowHeroText}
        </Text>
      </View>

      {/* A9: Where you are today — daily state card, moved out of Settings */}
      <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.md }}>
        <Eyebrow style={{ marginBottom: spacing.sm }}>{t('today.shift_label')}</Eyebrow>
        <SegmentedControl<ShiftKind>
          options={shiftOptions}
          value={onboarding.currentShift}
          onChange={(v) => update({ currentShift: v })}
        />
      </GlassCard>

      {/* G4: Sleep journal — one-tap morning rating + USER-BUG-9 stats reveal */}
      <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.huge }}>
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
        {todayRating && (() => {
          const tally = weeklyTally();
          if (!tally) return null;
          const trendArrow = tally.trend === 'up' ? '↑' : tally.trend === 'down' ? '↓' : tally.trend === 'flat' ? '→' : '';
          return (
            <Pressable
              onPress={() => router.push('/history')}
              style={{ marginTop: spacing.md }}
              accessibilityRole="button"
              accessibilityLabel={t('today.journal_stats_a11y')}
            >
              {/* D3: visible last-7-days dot strip so ratings are tracked at a glance */}
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
              <Text variant="bodyMd" color="inkSubtle">
                {t('today.journal_tally_inline', { good: tally.good, ok: tally.ok, bad: tally.bad })}
              </Text>
              <Text variant="bodyMd" color="primary" style={{ marginTop: 2 }}>
                {trendArrow ? `${trendArrow} ${t(`today.journal_trend_${tally.trend ?? 'flat'}`)} · ${t('today.journal_tap_history')}` : t('today.journal_tap_history')}
              </Text>
            </Pressable>
          );
        })()}
      </GlassCard>

      <View style={styles.ringWrap}>
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
          shiftStart={suggested.shiftStart}
          shiftEnd={suggested.shiftEnd}
          size={260}
          label={t('today.label_today')}
          centerLabel={formatHour(nowHour)}
        />
      </View>

      <Eyebrow>{t('today.section_24h')}</Eyebrow>
      <View style={{ height: spacing.md }} />
      <ShiftBar blocks={mockShiftBlocks} height={16} />

      <View style={{ height: spacing.huge }} />

      {/* B3: Community stories — promoted from screen bottom to a prominent
          mid-feed slot so members see how peers normalized their sleep. */}
      <TipsCarousel />

      <View style={{ height: spacing.huge }} />

      {/* C6: Tonight's read — surface one Sleep Library article on Today,
          rotating daily + filtered to the user's profession. */}
      {(() => {
        const prof =
          onboarding.profession === 'nurse' ||
          onboarding.profession === 'firefighter' ||
          onboarding.profession === 'factory'
            ? onboarding.profession
            : null;
        const arts = articlesForProfession(prof);
        if (arts.length === 0) return null;
        const pick = arts[new Date().getDate() % arts.length];
        return (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/library/${pick.id}`);
            }}
            accessibilityRole="button"
          >
            <GlassCard variant="paper" padding="xxl">
              <View style={styles.eventRow}>
                <View style={[styles.eventIcon, { backgroundColor: colors.primaryContainer }]}>
                  <Glyph name="book" size={22} color="primary" />
                </View>
                <View style={{ flex: 1 }}>
                  <Eyebrow>{t('library.today_eyebrow')}</Eyebrow>
                  <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: 2 }}>
                    {pick.title}
                  </Text>
                  <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                    {t('library.read_min', { n: pick.readMin })}
                  </Text>
                </View>
                <Glyph name="chevronRight" size={20} color="inkMuted" />
              </View>
            </GlassCard>
          </Pressable>
        );
      })()}

      <View style={{ height: spacing.huge }} />

      <Eyebrow>{t('today.section_next')}</Eyebrow>
      <View style={{ height: spacing.md }} />

      {events.map((e) => {
        const isCaffeine = e.glyph === 'coffee';
        return (
          <GlassCard key={e.labelKey} variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
            <View style={styles.eventRow}>
              <View style={[styles.eventIcon, { backgroundColor: e.tintBg }]}>
                <Glyph name={e.glyph} size={22} color={e.tintFg} />
              </View>
              <View style={{ flex: 1 }}>
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
