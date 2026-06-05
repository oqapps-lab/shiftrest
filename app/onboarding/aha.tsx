/**
 * S14 — Aha-Moment. Rich personalised plan reveal BEFORE the paywall.
 *
 * Sister-app depth (Sugar Quit / Vitaminico) adapted to shift-work sleep:
 *  1. Personalised persona hero (profession + schedule + chronotype)
 *  2. Your situation — disruption-read severity cards
 *  3. Your action plan — interventions, each with 3 benefit bullets
 *  4. Your personalised program — 3 LOCKED pillars
 *  5. Also included — locked feature list
 *  6. What's inside — content showcase grid (unlocked previews + locked tiles)
 *  7. Trust strip — grounded authority text, NO fabricated reviews
 *  8. Floating CTA → /paywall
 *
 * Screenshot-safe: every locked element renders only a lock glyph + a pill
 * label, never readable premium body text.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  SerifHero,
  Eyebrow,
  HeroNumber,
  GlassCard,
  TimelineRing,
  PillCTA,
  Text,
  Glyph,
  type GlyphName,
} from '../../components/ui';
import { spacing, radii, colors } from '../../constants/tokens';
import {
  formatHour,
  formatHourRange,
  hoursBetween,
  firstName,
  suggestedPlanFromOnboarding,
  personaForReveal,
  disruptionReadForSchedule,
  type Severity,
} from '../../lib/derive';
import {
  useOnboarding,
  chronotypeBucket,
  computeChronotypeScore,
} from '../../lib/onboarding/store';
import { useGeneratedPlan, planHourAsFloat, formatPlanHour } from '../../lib/queries/plan';
import { t } from '../../lib/i18n';

// ─── Local presentation data (key-refs only; copy lives in i18n) ────────────

interface Intervention {
  glyph: GlyphName;
  tint: string;
  iconColor: keyof typeof colors;
  titleKey: string;
  bulletsKey: string;
}

interface ShowcaseTile {
  kicker: string; // resolved label
  title: string; // resolved title (unlocked) — empty when locked
  locked?: boolean;
  lockLabel?: string;
}

const SEVERITY_COLOR: Record<Severity, keyof typeof colors> = {
  low: 'primary',
  moderate: 'sunriseDim',
  high: 'duskDim',
};

const SEVERITY_FILL: Record<Severity, keyof typeof colors> = {
  low: 'primaryContainer',
  moderate: 'sunriseGlow',
  high: 'duskGlow',
};

export default function Aha() {
  const { state: onboarding } = useOnboarding();
  const { data: livePlan } = useGeneratedPlan();
  // No mockUser.name fallback — eyebrow drops the name fragment in cold-start
  // rather than greeting a fake name on a fresh device.
  const userName = onboarding.displayName?.trim();
  const displayName = userName ? firstName(userName).toUpperCase() : '';

  const chronotype = useMemo(
    () => chronotypeBucket(computeChronotypeScore(onboarding.chronotypeAnswers)),
    [onboarding.chronotypeAnswers],
  );

  // Suggested plan from this user's onboarding answers — never mockPlan.
  const suggested = useMemo(
    () => suggestedPlanFromOnboarding(onboarding.currentShift, chronotype),
    [onboarding.currentShift, chronotype],
  );

  const sleepStartHour = planHourAsFloat(livePlan?.sleep_start) ?? suggested.sleepStart;
  const sleepEndHour = planHourAsFloat(livePlan?.sleep_end) ?? suggested.sleepEnd;
  const caffeineCutoffStr = formatPlanHour(livePlan?.caffeine_cutoff_at) || suggested.caffeineCutoff;
  const caffeineHourValue = Number(caffeineCutoffStr.split(':')[0]);
  const hoursBeforeSleep = hoursBetween(caffeineHourValue, sleepStartHour);

  // Real wall-clock so the ring center reflects when the user is looking
  // at the screen, not the mockPlan demo's fixed 14:30.
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  // ── 1. Persona hero ──
  const persona = useMemo(
    () => personaForReveal(onboarding.profession, onboarding.currentShift, chronotype),
    [onboarding.profession, onboarding.currentShift, chronotype],
  );
  const personaBody = persona.chronoKey
    ? `${t(persona.bodyKey)} ${t(persona.chronoKey)}`
    : t(persona.bodyKey);

  // ── 2. Disruption read ──
  const disruption = useMemo(
    () => disruptionReadForSchedule(onboarding.scheduleId, onboarding.currentShift),
    [onboarding.scheduleId, onboarding.currentShift],
  );

  // ── 3. Interventions (melatonin card only when the user takes it) ──
  const interventions = useMemo<Intervention[]>(() => {
    const list: Intervention[] = [
      {
        glyph: 'sun',
        tint: colors.sunriseGlow,
        iconColor: 'sunriseDim',
        titleKey: 'reveal.plan.light_title',
        bulletsKey: 'reveal.plan.light_bullets',
      },
      {
        glyph: 'coffee',
        tint: colors.primaryContainer,
        iconColor: 'primary',
        titleKey: 'reveal.plan.caffeine_title',
        bulletsKey: 'reveal.plan.caffeine_bullets',
      },
      {
        glyph: 'bed',
        tint: colors.duskGlow,
        iconColor: 'duskDim',
        titleKey: 'reveal.plan.window_title',
        bulletsKey: 'reveal.plan.window_bullets',
      },
    ];
    if (onboarding.takesMelatonin) {
      list.splice(2, 0, {
        glyph: 'moon',
        tint: colors.primaryContainerDim,
        iconColor: 'primaryDim',
        titleKey: 'reveal.plan.melatonin_title',
        bulletsKey: 'reveal.plan.melatonin_bullets',
      });
    }
    return list;
  }, [onboarding.takesMelatonin]);

  // ── 4. Program pillars (all locked) ──
  const pillarKeys = ['reveal.program.p1', 'reveal.program.p2', 'reveal.program.p3'] as const;

  // ── 5. Also-included locked list ──
  const includedKeys = [
    'reveal.included.chronotype',
    'reveal.included.melatonin',
    'reveal.included.transitions',
    'reveal.included.tracking',
    'reveal.included.library',
  ] as const;

  // ── 6. Showcase tiles (6 unlocked previews + 4 locked) ──
  const tiles = useMemo<ShowcaseTile[]>(
    () => [
      { kicker: t('reveal.showcase.tag_light'), title: t('reveal.showcase.t_sunglasses') },
      { kicker: t('reveal.showcase.tag_tip'), title: t('reveal.showcase.t_478') },
      { kicker: t('reveal.showcase.tag_meal'), title: t('reveal.showcase.t_snack') },
      { kicker: t('reveal.showcase.tag_light'), title: t('reveal.showcase.t_brightblock') },
      { kicker: t('reveal.showcase.tag_movement'), title: t('reveal.showcase.t_walk') },
      { kicker: t('reveal.showcase.tag_tip'), title: t('reveal.showcase.t_cooldark') },
      { kicker: t('reveal.showcase.tag_lesson'), title: '', locked: true, lockLabel: t('reveal.showcase.lock_day7') },
      { kicker: t('reveal.showcase.tag_meal'), title: '', locked: true, lockLabel: t('reveal.showcase.lock_more') },
      { kicker: t('reveal.showcase.tag_light'), title: '', locked: true, lockLabel: t('reveal.showcase.lock_premium') },
      { kicker: t('reveal.showcase.tag_lesson'), title: '', locked: true, lockLabel: t('reveal.showcase.lock_premium') },
    ],
    [],
  );

  return (
    <Screen
      orbs="normal"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('aha.cta')}
          onPress={() => router.push('/paywall?from=onboarding')}
        />
      }
    >
      <Eyebrow>{displayName ? `${displayName}, ${t('aha.eyebrow')}` : t('aha.eyebrow')}</Eyebrow>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.huge }}>
        <SerifHero>{t('aha.hero')}</SerifHero>
      </View>

      {/* Timeline ring — the personalised 24h glance */}
      <View style={{ alignItems: 'center', marginBottom: spacing.huge }}>
        <TimelineRing
          nowHour={nowHour}
          sleepStart={sleepStartHour}
          sleepEnd={sleepEndHour}
          shiftStart={suggested.shiftStart}
          shiftEnd={suggested.shiftEnd}
          size={280}
          label={t('today.label_today')}
          centerLabel={formatHour(nowHour)}
        />
      </View>

      {/* ── 1. PERSONA HERO ── */}
      <Eyebrow color="primary">{t('reveal.persona.eyebrow')}</Eyebrow>
      <Text
        variant="titleLg"
        family="display"
        weight="light"
        color="ink"
        style={{ marginTop: spacing.sm }}
      >
        {t(persona.titleKey)}
      </Text>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.sm, marginBottom: spacing.xxxl }}>
        {personaBody}
      </Text>

      {/* ── 2. DISRUPTION READ ── */}
      <Eyebrow color="primary">{t('reveal.disruption.eyebrow')}</Eyebrow>
      <View style={[styles.severityRow, { marginTop: spacing.md, marginBottom: spacing.xxxl }]}>
        {disruption.map((row) => (
          <GlassCard
            key={row.labelKey}
            variant="glass"
            padding="lg"
            radius="lg"
            style={styles.severityCard}
          >
            <View style={[styles.severityDot, { backgroundColor: colors[SEVERITY_FILL[row.severity]] }]}>
              <View style={[styles.severityCore, { backgroundColor: colors[SEVERITY_COLOR[row.severity]] }]} />
            </View>
            <Eyebrow size="md" style={{ marginTop: spacing.sm }}>{t(row.labelKey)}</Eyebrow>
            <Text variant="bodyMd" weight="medium" color={SEVERITY_COLOR[row.severity]} style={{ marginTop: 2 }}>
              {t(`reveal.disruption.sev_${row.severity}`)}
            </Text>
          </GlassCard>
        ))}
      </View>

      {/* ── 3. ACTION PLAN — interventions + benefit bullets ── */}
      <Eyebrow color="primary">{t('reveal.plan.eyebrow')}</Eyebrow>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        {t('reveal.plan.sub')}
      </Text>
      {interventions.map((iv) => {
        const bullets = (t(iv.bulletsKey) as unknown) as string[];
        return (
          <GlassCard key={iv.titleKey} variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: iv.tint }]}>
                <Glyph name={iv.glyph} size={22} color={iv.iconColor} />
              </View>
              <Text variant="titleMd" family="display" weight="medium" color="ink" style={{ flex: 1 }}>
                {t(iv.titleKey)}
              </Text>
            </View>
            <View style={{ marginTop: spacing.md }}>
              {(Array.isArray(bullets) ? bullets : []).map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletCheck}>
                    <Glyph name="check" size={14} color="primary" />
                  </View>
                  <Text variant="bodyMd" color="inkSubtle" style={{ flex: 1 }}>
                    {b}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        );
      })}

      {/* ── 4. PERSONALISED PROGRAM — 3 locked pillars ── */}
      <Eyebrow color="primary" style={{ marginTop: spacing.xl }}>{t('reveal.program.eyebrow')}</Eyebrow>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        {t('reveal.program.sub')}
      </Text>
      {pillarKeys.map((key) => (
        <GlassCard key={key} variant="glass" padding="xxl" style={[styles.pillar, { marginBottom: spacing.md }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceHigh }]}>
              <Glyph name="moon" size={20} color="inkMuted" />
            </View>
            <Text variant="titleMd" family="display" weight="medium" color="ink" style={{ flex: 1 }}>
              {t(`${key}_title`)}
            </Text>
            <LockPill label={t('reveal.lock_premium')} />
          </View>
        </GlassCard>
      ))}

      {/* ── 5. ALSO INCLUDED — locked list ── */}
      <Eyebrow color="primary" style={{ marginTop: spacing.xl }}>{t('reveal.included.eyebrow')}</Eyebrow>
      <GlassCard variant="glass" padding="xxl" style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}>
        {includedKeys.map((key, i) => (
          <View key={key} style={[styles.includedRow, i > 0 && styles.includedBorder]}>
            <View style={styles.lockMark}>
              <Glyph name="moon" size={14} color="inkMuted" />
            </View>
            <Text variant="bodyMd" color="ink" style={{ flex: 1 }}>
              {t(key)}
            </Text>
            <Glyph name="chevronRight" size={16} color="inkGhost" />
          </View>
        ))}
      </GlassCard>

      {/* ── 6. WHAT'S INSIDE — showcase grid ── */}
      <Eyebrow color="primary">{t('reveal.showcase.eyebrow')}</Eyebrow>
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        {t('reveal.showcase.sub')}
      </Text>
      <View style={styles.grid}>
        {tiles.map((tile, i) => (
          <View key={i} style={styles.gridCell}>
            <GlassCard
              variant={tile.locked ? 'paper' : 'glass'}
              padding="lg"
              radius="lg"
              style={[styles.tile, tile.locked && styles.tileLocked]}
            >
              <Eyebrow size="md" color={tile.locked ? 'inkGhost' : 'primary'}>{tile.kicker}</Eyebrow>
              {tile.locked ? (
                <View style={styles.tileLockBody}>
                  <View style={styles.lockMark}>
                    <Glyph name="moon" size={16} color="inkMuted" />
                  </View>
                  <Text variant="labelMd" weight="medium" color="inkMuted" uppercase style={{ marginTop: spacing.xs }}>
                    {tile.lockLabel}
                  </Text>
                </View>
              ) : (
                <Text variant="bodyMd" weight="medium" color="ink" style={{ marginTop: spacing.xs }}>
                  {tile.title}
                </Text>
              )}
            </GlassCard>
          </View>
        ))}
      </View>
      <Text variant="bodyMd" color="inkSubtle" align="center" style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}>
        {t('reveal.showcase.footer')}
      </Text>

      {/* ── 7. TRUST STRIP — grounded, NO reviews ── */}
      <GlassCard variant="paper" padding="xxl" style={{ marginBottom: spacing.xxl }}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
            <Glyph name="leaf" size={22} color="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow color="primary">{t('reveal.trust.eyebrow')}</Eyebrow>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs }}>
              {t('reveal.trust.body')}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* ── 8. "Plan ready" framing above the floating CTA ── */}
      <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <HeroNumber value={formatHourRange(sleepStartHour, sleepEndHour)} size="md" align="center" />
        <Text variant="bodyMd" color="inkSubtle" align="center" style={{ marginTop: spacing.xs }}>
          {t('reveal.ready', { hours: hoursBeforeSleep })}
        </Text>
      </View>

    </Screen>
  );
}

// Small locked-affordance pill. Renders only a lock glyph + a short label —
// never any readable premium content (screenshot-safe).
function LockPill({ label }: { label: string }) {
  return (
    <View style={styles.lockPill}>
      <Glyph name="moon" size={12} color="inkMuted" />
      <Text variant="labelMd" weight="medium" color="inkMuted" uppercase style={{ marginLeft: 4 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  // Disruption severity cards
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  severityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Benefit bullets
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 1,
  },
  // Program pillars (locked)
  pillar: {
    opacity: 0.92,
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  // Also-included list
  includedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  includedBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(49,51,47,0.07)',
  },
  lockMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  // Showcase grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  tile: {
    minHeight: 96,
  },
  tileLocked: {
    opacity: 0.7,
  },
  tileLockBody: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
});
