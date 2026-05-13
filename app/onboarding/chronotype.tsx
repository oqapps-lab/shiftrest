/**
 * S07 — Chronotype Quiz. Step 6 / 10.
 * Three-question mini MEQ. Each question = stack of OptionCards (text-only).
 * Continue enabled only when all three answered.
 */

import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../../lib/onboarding/store';
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
import { mockChronotypeQuestions } from '../../mock/user';
import { t } from '../../lib/i18n';

export default function Chronotype() {
  const { state, update } = useOnboarding();
  const answers = state.chronotypeAnswers;

  const canContinue =
    Object.keys(answers).length === mockChronotypeQuestions.length;

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.continue')}
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/caffeine')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 6, total: 10 })}</Eyebrow>
      <ProgressDots
        count={10}
        active={5}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding.chronotype.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding.chronotype.sub')}
      </Text>

      {mockChronotypeQuestions.map((q, qIdx) => (
        <View
          key={q.id}
          style={{
            marginBottom:
              qIdx === mockChronotypeQuestions.length - 1
                ? 0
                : spacing.huge,
          }}
        >
          <Eyebrow>{t('onboarding.chronotype.q_template', { n: qIdx + 1, total: mockChronotypeQuestions.length })}</Eyebrow>
          <Text
            variant="titleLg"
            family="display"
            weight="light"
            color="ink"
            style={{ marginTop: spacing.sm, marginBottom: spacing.md }}
          >
            {q.question}
          </Text>
          {q.options.map((opt) => (
            <OptionCard
              key={opt.id}
              title={opt.label}
              selected={answers[q.id] === opt.id}
              onPress={() =>
                update({ chronotypeAnswers: { ...answers, [q.id]: opt.id } })
              }
              accessibilityLabel={`${q.question} — ${opt.label}`}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}
