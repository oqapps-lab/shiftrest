/**
 * S20 — Home (Today). Core screen: glance-and-go, <5 sec.
 * Eyebrow greeting + streak pill + Soft hero line + TimelineRing + ShiftBar + 3 next-event cards.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
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
  type SegmentOption,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { mockShiftBlocks, getMockTransition } from '../../mock/user';
import {
  countCompleted,
  formatHour,
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
  type SleepRating,
} from '../../lib/sleep-journal/store';
import { useLocalShifts } from '../../lib/local-shifts/store';
import { TodayIntroSheet } from '../../components/today/TodayIntroSheet';
import { StoriesCoverFlow } from '../../components/community/StoriesCoverFlow';
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
  const events = [
    ...(showCaffeine ? [{ ...EVENT_STYLES.caffeine, hour: caffeineHour }] : []),
    ...(showMelatonin ? [{ ...EVENT_STYLES.melatonin, hour: melatoninHour }] : []),
    { ...EVENT_STYLES.sleep,     hour: sleepStartHour },
  ];

  // Streak: real DB row when signed-in user has one, else 0.
  // Anon users see no pill (hidden when value===0).
  const streakValue = streak?.current_streak ?? 0;

  // Transition teaser: when a live plan exists pull its day-1 step counts;
  // else fall back to the mockTransition fixture so the demo still reads.
  // Resolve at render time so locale changes between batches re-translate.
  const mockTransition = getMockTransition();
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
  const shiftByIsoForDetect = new Map<string, ShiftKind>();
  for (const [iso, kind] of Object.entries(localShiftsMap)) {
    if (kind === 'day' || kind === 'night' || kind === 'off') {
      shiftByIsoForDetect.set(iso, kind);
    }
  }
  const todayIsoForDetect = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const detected = !livePlan?.transition_type
    ? detectTransitionOpportunity(shiftByIsoForDetect, todayIsoForDetect)
    : null;

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

  return (
    <Screen orbs="normal" scroll>
      <PlanUpdatedBanner />
      <TodayIntroSheet />
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{displayName ? `${getGreeting(nowHour)}, ${displayName}` : getGreeting(nowHour)}</Eyebrow>
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

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
        <SerifHero>{t('today.hero')}</SerifHero>
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

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
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
                    Alert.alert(
                      t('today.caffeine_confirm_title'),
                      t('today.caffeine_confirm_body', { cups }),
                      [
                        { text: t('today.caffeine_cancel'), style: 'cancel' },
                        { text: t('today.caffeine_log_cta'), onPress: () => logCaffeine() },
                      ],
                    );
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

      {/* F20-P3: Community stories cover-flow carousel */}
      <StoriesCoverFlow />
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
});
