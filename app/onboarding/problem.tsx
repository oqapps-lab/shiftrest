/**
 * S05 — Main Problem picker. Step 4 / 10.
 * Iterates mockMainProblems and renders OptionCard rows.
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
  OptionCard,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockMainProblems } from '../../mock/user';
import { useOnboarding, type MainProblem } from '../../lib/onboarding/store';
import { t } from '../../lib/i18n';

export default function Problem() {
  const { state, update } = useOnboarding();
  const selected = state.mainProblem;

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
          onPress={() => router.push('/onboarding/social-proof-1')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 5, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={4}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.problem.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding_screens.problem.sub')}
      </Text>

      {mockMainProblems.map((p) => (
        <OptionCard
          key={p.id}
          title={p.title}
          subtitle={p.subtitle}
          glyph={p.glyph}
          selected={selected === p.id}
          onPress={() => update({ mainProblem: p.id as MainProblem })}
          accessibilityLabel={p.title}
        />
      ))}
    </Screen>
  );
}
