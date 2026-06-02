/**
 * S03 — Schedule template picker. Step 2 / 10.
 * Iterates mockScheduleTemplates and renders OptionCard rows.
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
import { mockScheduleTemplates } from '../../mock/user';
import { useOnboarding, type ScheduleId } from '../../lib/onboarding/store';
import { t } from '../../lib/i18n';

export default function Schedule() {
  const { state, update } = useOnboarding();
  const selected = state.scheduleId;

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
          onPress={() => router.push('/onboarding/current-shift')}
        />
      }
    >
      <OnboardingBack />
      <Eyebrow>{t('onboarding.step_template', { n: 2, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={1}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.schedule.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding_screens.schedule.sub')}
      </Text>

      {mockScheduleTemplates.map((s) => (
        <OptionCard
          key={s.id}
          title={s.title}
          subtitle={s.subtitle}
          glyph={s.glyph}
          selected={selected === s.id}
          onPress={() => update({ scheduleId: s.id as ScheduleId })}
          accessibilityLabel={s.title}
        />
      ))}
    </Screen>
  );
}
