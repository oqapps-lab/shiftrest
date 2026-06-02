/**
 * S05 — Next-shift picker. Step 4 / 11.
 *
 * Single most actionable data point per 2026-05-25 funnel research:
 * powers the 36-hour pre-shift plan that's ShiftRest's main aha-moment.
 * Always shown (research advised "ask for all users, not just off-today").
 */

import React from 'react';
import { router } from 'expo-router';
import {
  Screen,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  OnboardingBack,
  OptionCard,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import type { GlyphName } from '../../components/ui';
import { useOnboarding, type NextShift } from '../../lib/onboarding/store';
import { t } from '../../lib/i18n';

interface NextShiftOption {
  id: NextShift;
  glyph: GlyphName;
}

const OPTIONS: NextShiftOption[] = [
  { id: 'tonight', glyph: 'moon' },
  { id: 'tomorrow_am', glyph: 'sun' },
  { id: 'tomorrow_pm', glyph: 'alarm' },
  { id: 'day_after', glyph: 'calendar' },
  { id: 'on_break', glyph: 'leaf' },
];

export default function NextShiftScreen() {
  const { state, update } = useOnboarding();
  const selected = state.nextShift;

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          disabled={!selected}
          onPress={() => router.push('/onboarding/problem')}
        />
      }
    >
      <OnboardingBack />
      <Eyebrow>{t('onboarding.step_template', { n: 4, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={3}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.next_shift.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding_screens.next_shift.sub')}
      </Text>

      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.id}
          title={t(`onboarding_screens.next_shift.options.${opt.id}.title`)}
          subtitle={t(`onboarding_screens.next_shift.options.${opt.id}.subtitle`)}
          glyph={opt.glyph}
          selected={selected === opt.id}
          onPress={() => update({ nextShift: opt.id })}
          accessibilityLabel={t(`onboarding_screens.next_shift.options.${opt.id}.title`)}
        />
      ))}
    </Screen>
  );
}
