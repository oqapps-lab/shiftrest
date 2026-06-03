/**
 * S40 — Daily Sleep Plan. Hero timeline + 4 recommendation cards.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  SerifHero,
  TimelineRing,
  GlassCard,
  Text,
  Glyph,
} from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import {
  formatDayMonth,
  formatHour,
  hoursBetween,
  suggestedPlanFromOnboarding,
  lightWindowsForShift,
  formatHourRange,
  napWindowForShift,
  mealTimingForShift,
  movementWindowForShift,
  socialWindowForDay,
  isFastRotatingSchedule,
  anchorSleepWindow,
} from '../../lib/derive';
import { useGeneratedPlan, planHourAsFloat, type PlanRecommendation } from '../../lib/queries/plan';
import { useSubscription } from '../../lib/queries';
import { useOnboarding, chronotypeBucket, computeChronotypeScore } from '../../lib/onboarding/store';
import { useLocalShifts } from '../../lib/local-shifts/store';
import type { GlyphName } from '../../components/ui';
import i18n, { t } from '../../lib/i18n';

// B1: clamp how far the plan stepper can travel (1 week back → 2 weeks
// ahead) so a user can reach a shift they set several days out.
const MIN_OFFSET = -7;
const MAX_OFFSET = 14;
import { WhyTheseTimesSheet } from '../../components/plan/WhyTheseTimesSheet';

interface UiRec {
  glyph: GlyphName;
  eyebrow: string;
  hero: string;
  body: string;
  /** B2: expandable "why this helps" rationale. */
  why?: string;
  tintBg: string;
  tintFg: 'sunriseDim' | 'duskDim' | 'primary';
  locked?: boolean;
}

/**
 * Fallback recommendations built at render time so t() lookups resolve
 * against the CURRENT locale. Module-level const evaluation would freeze
 * the strings at load time and never update across locale switches.
 */
interface FallbackCtx {
  scheduleId: string | null | undefined;
  hasChildren: boolean;
  pickupHour: number | null;
  caffeineCups: number;
}

function buildFallbackRecs(
  suggested: ReturnType<typeof suggestedPlanFromOnboarding>,
  shift: 'day' | 'night' | 'off',
  isPremium: boolean,
  ctx: FallbackCtx,
): UiRec[] {
  const caffeineHour = Number(suggested.caffeineCutoff.split(':')[0]);
  const hoursBeforeSleep = hoursBetween(caffeineHour, suggested.sleepStart);

  // E1: light therapy fallback — pick the FIRST window of the day as the
  // hero. If the shift is night, that's evening bright light. If day, it's
  // the morning sun. Tip in body summarises the secondary window when
  // present (e.g. dark glasses on commute home).
  const lightWindows = lightWindowsForShift(shift);
  const primary = lightWindows[0];
  const secondary = lightWindows[1];
  const lightHero = primary
    ? primary.eyebrowKey === 'plan.cards.light.seek'
      ? t('plan.cards.light.seek_template', { range: formatHourRange(primary.startHour, primary.endHour) })
      : t('plan.cards.light.avoid_template', { range: formatHourRange(primary.startHour, primary.endHour) })
    : t('plan.cards.light.hero');
  const lightBody = secondary
    ? secondary.eyebrowKey === 'plan.cards.light.seek'
      ? t('plan.cards.light.body_seek', { range: formatHourRange(secondary.startHour, secondary.endHour) })
      : t('plan.cards.light.body_avoid', { range: formatHourRange(secondary.startHour, secondary.endHour) })
    : t('plan.cards.light.body');

  const recs: UiRec[] = [
    {
      glyph: 'coffee',
      eyebrow: t('plan.cards.caffeine.eyebrow'),
      hero: t('plan.cards.caffeine.hero', { time: suggested.caffeineCutoff }),
      body: t('plan.cards.caffeine.body', { h: hoursBeforeSleep }),
      why: t('plan.why_card.caffeine'),
      tintBg: colors.sunriseGlow,
      tintFg: 'sunriseDim',
    },
    {
      glyph: 'moon',
      eyebrow: isPremium
        ? t('plan.cards.melatonin.eyebrow')
        : `${t('plan.cards.melatonin.eyebrow')} · ${t('plan.premium_suffix')}`,
      hero: t('plan.cards.melatonin.hero', { time: suggested.melatoninTime }),
      body: t('plan.cards.melatonin.body'),
      why: t('plan.why_card.melatonin'),
      tintBg: colors.duskGlow,
      tintFg: 'duskDim',
      locked: !isPremium,
    },
    {
      glyph: 'sun',
      eyebrow: t('plan.cards.light.eyebrow'),
      hero: lightHero,
      body: lightBody,
      why: t('plan.why_card.light'),
      tintBg: colors.sunriseGlow,
      tintFg: 'sunriseDim',
    },
    // G2: shift-aware nap recommendation
    (() => {
      const nap = napWindowForShift(shift);
      if (!nap) {
        return {
          glyph: 'bed' as const,
          eyebrow: t('plan.cards.nap.eyebrow'),
          hero: t('plan.cards.nap.hero'),
          body: t('plan.cards.nap.body'),
          why: t('plan.why_card.nap'),
          tintBg: colors.primaryContainer,
          tintFg: 'primary' as const,
        };
      }
      return {
        glyph: 'bed' as const,
        eyebrow: t(`plan.cards.nap.eyebrow_${nap.kind}`),
        hero: t('plan.cards.nap.hero_template', {
          duration: nap.durationMin,
          time: formatHour(nap.hour),
        }),
        body: t(`plan.cards.nap.body_${nap.kind}`),
        why: t('plan.why_card.nap'),
        tintBg: colors.primaryContainer,
        tintFg: 'primary' as const,
      };
    })(),
    // F15 — Meal Timing card
    (() => {
      const meal = mealTimingForShift(shift, suggested.sleepStart);
      return {
        glyph: 'fork' as const,
        eyebrow: t(meal.eyebrowKey),
        hero: t('plan.cards.meal.hero_template', {
          main: formatHour(meal.mainMealHour),
          cutoff: formatHour(meal.cutoffHour),
        }),
        body: t(meal.bodyKey),
        why: t('plan.why_card.meal'),
        tintBg: colors.sunriseGlow,
        tintFg: 'sunriseDim' as const,
      };
    })(),
  ];

  // ── C4: rich-plan modules, gated by shift + profile ──────────────────────

  // Caffeine Strategy — night shifts with caffeine: front-load + tactical
  // pre-dawn dose, not a continuous sip.
  if (shift === 'night' && ctx.caffeineCups > 0) {
    recs.push({
      glyph: 'coffee',
      eyebrow: t('plan.cards.caffeine_timing.eyebrow'),
      hero: t('plan.cards.caffeine_timing.hero'),
      body: t('plan.cards.caffeine_timing.body'),
      why: t('plan.why_card.caffeine_timing'),
      tintBg: colors.sunriseGlow,
      tintFg: 'sunriseDim',
    });
  }

  // Movement Window — exercise in the active phase, gentle near sleep.
  {
    const mv = movementWindowForShift(shift);
    recs.push({
      glyph: 'pulse',
      eyebrow: t('plan.cards.movement.eyebrow'),
      hero: t('plan.cards.movement.hero_template', {
        range: formatHourRange(mv.startHour, mv.endHour),
      }),
      body: t('plan.cards.movement.body'),
      why: t('plan.why_card.movement'),
      tintBg: colors.primaryContainer,
      tintFg: 'primary',
    });
  }

  // Sleep Cave — blackout + cool + quiet, heaviest for daytime sleepers.
  if (shift === 'night' || shift === 'off') {
    recs.push({
      glyph: 'moon',
      eyebrow: t('plan.cards.environment.eyebrow'),
      hero: t('plan.cards.environment.hero'),
      body: t('plan.cards.environment.body'),
      why: t('plan.why_card.environment'),
      tintBg: colors.duskGlow,
      tintFg: 'duskDim',
    });
  }

  // Anchor Sleep — only for fast-rotating schedules that never fully adapt.
  if (isFastRotatingSchedule(ctx.scheduleId)) {
    const a = anchorSleepWindow();
    recs.push({
      glyph: 'bed',
      eyebrow: t('plan.cards.anchor_sleep.eyebrow'),
      hero: t('plan.cards.anchor_sleep.hero_template', {
        range: formatHourRange(a.startHour, a.endHour),
      }),
      body: t('plan.cards.anchor_sleep.body'),
      why: t('plan.why_card.anchor_sleep'),
      tintBg: colors.primaryContainer,
      tintFg: 'primary',
    });
  }

  // Recovery Sleep — on a day off (the recovery heuristic): short capped
  // morning sleep, then a full night to flip back. "This is the plan."
  if (shift === 'off') {
    recs.push({
      glyph: 'bed',
      eyebrow: t('plan.cards.recovery_sleep.eyebrow'),
      hero: t('plan.cards.recovery_sleep.hero'),
      body: t('plan.cards.recovery_sleep.body'),
      why: t('plan.why_card.recovery_sleep'),
      tintBg: colors.duskGlow,
      tintFg: 'duskDim',
    });
  }

  // Connect Window — one protected social/family slot that doesn't eat the
  // sleep block. Anchors to kid-pickup when the user has children.
  {
    const sw = socialWindowForDay(shift, ctx.hasChildren, ctx.pickupHour);
    recs.push({
      glyph: 'user',
      eyebrow: t('plan.cards.social_sync.eyebrow'),
      hero: t('plan.cards.social_sync.hero_template', {
        range: formatHourRange(sw.startHour, sw.endHour),
      }),
      body: ctx.hasChildren
        ? t('plan.cards.social_sync.body_kids')
        : t('plan.cards.social_sync.body'),
      why: t('plan.why_card.social_sync'),
      tintBg: colors.primaryContainer,
      tintFg: 'primary',
    });
  }

  // F6: premium teaser cards — free users see the depth behind the paywall
  // (real features: full transition protocol + 30-day progress), locked.
  recs.push({
    glyph: 'sparkle',
    eyebrow: isPremium ? t('plan.pt_eyebrow') : `${t('plan.pt_eyebrow')} \u00b7 ${t('plan.premium_suffix')}`,
    hero: t('plan.pt_hero'),
    body: t('plan.pt_body'),
    tintBg: colors.duskGlow,
    tintFg: 'duskDim',
    locked: !isPremium,
  });
  recs.push({
    glyph: 'pulse',
    eyebrow: isPremium ? t('plan.ph_eyebrow') : `${t('plan.ph_eyebrow')} \u00b7 ${t('plan.premium_suffix')}`,
    hero: t('plan.ph_hero'),
    body: t('plan.ph_body'),
    tintBg: colors.primaryContainer,
    tintFg: 'primary',
    locked: !isPremium,
  });

  return recs;
}

// B2: rationale per live-rec type (the WHY_CARD i18n block).
const WHY_BY_TYPE: Record<PlanRecommendation['type'], string> = {
  caffeine: 'plan.why_card.caffeine',
  melatonin: 'plan.why_card.melatonin',
  light: 'plan.why_card.light',
  nap: 'plan.why_card.nap',
  sleep_window: 'plan.why_card.sleep_window',
  wind_down: 'plan.why_card.wind_down',
  meal: 'plan.why_card.meal',
  caffeine_timing: 'plan.why_card.caffeine_timing',
  anchor_sleep: 'plan.why_card.anchor_sleep',
  recovery_sleep: 'plan.why_card.recovery_sleep',
  environment: 'plan.why_card.environment',
  movement: 'plan.why_card.movement',
  social_sync: 'plan.why_card.social_sync',
};

const REC_STYLE: Record<PlanRecommendation['type'], { glyph: GlyphName; tintBg: string; tintFg: 'sunriseDim' | 'duskDim' | 'primary' }> = {
  caffeine:       { glyph: 'coffee',  tintBg: colors.sunriseGlow,      tintFg: 'sunriseDim' },
  melatonin:      { glyph: 'moon',    tintBg: colors.duskGlow,         tintFg: 'duskDim'    },
  light:          { glyph: 'sun',     tintBg: colors.sunriseGlow,      tintFg: 'sunriseDim' },
  nap:            { glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  sleep_window:   { glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  wind_down:      { glyph: 'sparkle', tintBg: colors.duskGlow,         tintFg: 'duskDim'    },
  meal:           { glyph: 'fork',    tintBg: colors.sunriseGlow,      tintFg: 'sunriseDim' },
  caffeine_timing:{ glyph: 'coffee',  tintBg: colors.sunriseGlow,      tintFg: 'sunriseDim' },
  anchor_sleep:   { glyph: 'bed',     tintBg: colors.primaryContainer, tintFg: 'primary'   },
  recovery_sleep: { glyph: 'bed',     tintBg: colors.duskGlow,         tintFg: 'duskDim'    },
  environment:    { glyph: 'moon',    tintBg: colors.duskGlow,         tintFg: 'duskDim'    },
  movement:       { glyph: 'pulse',   tintBg: colors.primaryContainer, tintFg: 'primary'   },
  social_sync:    { glyph: 'user',    tintBg: colors.primaryContainer, tintFg: 'primary'   },
};

export default function Plan() {
  // B1: offset in days from today (0=today, -1=yesterday, +N=future). Was a
  // fixed 3-segment Y/T/T pager; now a date stepper so any scheduled date's
  // plan is reachable — owner asked "where's the plan for a shift in 2 days".
  const [offset, setOffset] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { data: subscription } = useSubscription();
  // R8-1: Melatonin card was hardcoded locked. Unlock for paid tiers.
  const isPremium =
    subscription?.status === 'active' ||
    subscription?.status === 'trial' ||
    subscription?.status === 'grace_period';
  const [whyOpen, setWhyOpen] = useState(false);
  const { data: livePlan } = useGeneratedPlan();
  const { state: onboarding } = useOnboarding();

  // K2/B1: per-day shift kind for the offset date. Plan derives entirely
  // from this date's shift kind + chronotype, so any date works.
  const localShiftsMap = useLocalShifts();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + offset);
  const targetIso = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  const dayShiftKind: 'day' | 'night' | 'off' =
    (localShiftsMap[targetIso] as 'day' | 'night' | 'off' | undefined)
    ?? (offset === 0 ? onboarding.currentShift : 'off');
  // J1: hide melatonin card when user opted out in onboarding
  const showMelatonin = onboarding.takesMelatonin !== false;
  // C2: hide caffeine card when user doesn't drink caffeine
  const showCaffeine = onboarding.caffeineCupsPerDay > 0;
  // F6: light/dark guidance applies to EVERY shift worker, not just
  // light-box owners — gating on ===true stripped it for most users and
  // left the plan thin. Default ON (hidden only if explicitly turned off).
  const showLight = onboarding.usesLightTherapy !== false;

  // Suggested plan derived from THIS day's shift kind + chronotype. So
  // Yesterday/Today/Tomorrow each render their own honest timings.
  const suggested = suggestedPlanFromOnboarding(
    dayShiftKind,
    chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
  );

  const liveRecs = livePlan?.metadata?.recommendations ?? null;
  // R22/M1: memoise rec computation — was running ~25 t() lookups + 3
  // filter passes + map on every render of Plan, including when only
  // whyOpen toggles.
  const baseRecs: UiRec[] = useMemo(() =>
    liveRecs && liveRecs.length > 0
      ? liveRecs
          .filter((r) => showMelatonin || r.type !== 'melatonin')
          .filter((r) => showCaffeine || r.type !== 'caffeine')
          .filter((r) => showLight || r.type !== 'light')
          .map((r) => {
            const effectiveLocked = r.locked && !isPremium;
            return {
              ...REC_STYLE[r.type],
              eyebrow: effectiveLocked ? `${r.eyebrow} · ${t('plan.premium_suffix')}` : r.eyebrow,
              hero: r.hero,
              body: r.body,
              why: WHY_BY_TYPE[r.type] ? t(WHY_BY_TYPE[r.type]) : undefined,
              locked: effectiveLocked,
            };
          })
      : buildFallbackRecs(suggested, dayShiftKind, isPremium, {
          scheduleId: onboarding.scheduleId,
          hasChildren: onboarding.hasChildren === true,
          pickupHour: onboarding.pickupTime ? Number(onboarding.pickupTime) : null,
          caffeineCups: onboarding.caffeineCupsPerDay ?? 0,
        }),
    [liveRecs, suggested, dayShiftKind, isPremium, showMelatonin, showCaffeine, showLight,
     onboarding.scheduleId, onboarding.hasChildren, onboarding.pickupTime, onboarding.caffeineCupsPerDay]);
  // Strip cards from fallback list when user opted out of that substance —
  // buildFallbackRecs always returns the full 4 for the demo "looks rich"
  // effect; honesty wins once user has set their prefs.
  const recs: UiRec[] = baseRecs
    .filter((r) => showMelatonin || r.glyph !== 'moon')
    .filter((r) => showCaffeine || r.glyph !== 'coffee')
    .filter((r) => showLight || r.glyph !== 'sun');

  const sleepStartHour =
    planHourAsFloat(livePlan?.sleep_start) ?? suggested.sleepStart;
  const sleepEndHour =
    planHourAsFloat(livePlan?.sleep_end) ?? suggested.sleepEnd;
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  // B1: relative label for ±1, else weekday — e.g. "MON · 2 JUN".
  const dateChip =
    offset === 0 ? `${t('plan.today')} · ${formatDayMonth(targetDate)}`
    : offset === -1 ? t('plan.yesterday')
    : offset === 1 ? t('plan.tomorrow')
    : `${new Intl.DateTimeFormat(i18n.locale, { weekday: 'short' }).format(targetDate).toUpperCase()} · ${formatDayMonth(targetDate)}`;
  const heroText =
    offset === 0 ? t('plan.hero_today')
    : offset === -1 ? t('plan.hero_yesterday')
    : offset === 1 ? t('plan.hero_tomorrow')
    : t('plan.hero_date', { date: formatDayMonth(targetDate) });
  const ringLabel =
    offset === 0 ? t('plan.now')
    : offset === -1 ? t('plan.yesterday')
    : offset === 1 ? t('plan.tomorrow')
    : formatDayMonth(targetDate);

  return (
    <Screen orbs="normal" scroll>
      <View style={styles.pagerRow}>
        <Pressable
          onPress={() => setOffset((o) => Math.max(MIN_OFFSET, o - 1))}
          disabled={offset <= MIN_OFFSET}
          style={[styles.pagerArrow, offset <= MIN_OFFSET && { opacity: 0.25 }]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('plan.prev_day_a11y')}
        >
          <Glyph name="chevronLeft" size={22} color="ink" />
        </Pressable>
        <View style={styles.pagerItemActive}>
          <Text variant="labelMd" family="body" weight="medium" color="primary" uppercase>
            {dateChip}
          </Text>
        </View>
        <Pressable
          onPress={() => setOffset((o) => Math.min(MAX_OFFSET, o + 1))}
          disabled={offset >= MAX_OFFSET}
          style={[styles.pagerArrow, offset >= MAX_OFFSET && { opacity: 0.25 }]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('plan.next_day_a11y')}
        >
          <Glyph name="chevronRight" size={22} color="ink" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xxl }}>
        <SerifHero>{heroText}</SerifHero>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={sleepEndHour}
          shiftStart={suggested.shiftStart}
          shiftEnd={suggested.shiftEnd}
          size={280}
          label={ringLabel}
          centerLabel={offset === 0 ? formatHour(nowHour) : formatHour(sleepStartHour)}
        />
      </View>

      {recs.map((r) => {
        const isOpen = expandedCard === r.hero;
        return (
          <Pressable
            key={r.hero}
            onPress={() => {
              if (!r.why) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedCard(isOpen ? null : r.hero);
            }}
            accessibilityRole={r.why ? 'button' : undefined}
            accessibilityLabel={r.why ? t('plan.expand_card_a11y') : undefined}
            accessibilityState={r.why ? { expanded: isOpen } : undefined}
          >
            <GlassCard
              variant="glass"
              padding="xxl"
              style={[{ marginBottom: spacing.md }, r.locked && { opacity: 0.62 }]}
            >
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: r.tintBg }]}>
                  <Glyph name={r.glyph} size={22} color={r.tintFg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Eyebrow color={r.locked ? 'duskDim' : 'inkMuted'}>{r.eyebrow}</Eyebrow>
                  <Text
                    variant="titleLg"
                    family="display"
                    weight="medium"
                    color="ink"
                    style={{ marginTop: 2 }}
                  >
                    {r.hero}
                  </Text>
                  <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
                    {r.body}
                  </Text>
                </View>
                {r.why ? (
                  <View style={{ transform: [{ rotate: isOpen ? '270deg' : '90deg' }], marginLeft: spacing.xs, marginTop: 4 }}>
                    <Glyph name="chevronRight" size={18} color="inkGhost" />
                  </View>
                ) : null}
              </View>
              {isOpen && r.why ? (
                <View style={styles.whyReveal}>
                  <Eyebrow color="primary" style={{ marginBottom: spacing.xs }}>
                    {t('plan.why_card_label')}
                  </Eyebrow>
                  <Text variant="bodyMd" color="inkSubtle">{r.why}</Text>
                </View>
              ) : null}
            </GlassCard>
          </Pressable>
        );
      })}

      <Pressable
        style={{ marginTop: spacing.xl, alignSelf: 'center' }}
        accessibilityRole="button"
        accessibilityLabel={t('plan.why_title')}
        onPress={() => setWhyOpen(true)}
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('plan.why_link')}
        </Text>
      </Pressable>

      <WhyTheseTimesSheet
        visible={whyOpen}
        onClose={() => setWhyOpen(false)}
        explanation={livePlan?.explanation ?? null}
        sleepStart={formatHour(sleepStartHour)}
        sleepEnd={formatHour(sleepEndHour)}
        caffeineCutoff={suggested.caffeineCutoff}
        melatoninTime={showMelatonin ? suggested.melatoninTime : null}
        chronotypeLabel={t(`chronotype.${chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers))}`)}
        shiftLabel={t(`shift_kind.${dayShiftKind}_long`)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pagerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  pagerArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyReveal: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.inkGhost,
  },
  pagerItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
});
