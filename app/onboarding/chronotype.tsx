/**
 * S07 — Chronotype Quiz. Step 6 / 10.
 * Three-question mini MEQ. Each question = stack of OptionCards (text-only).
 * Continue enabled only when all three answered.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
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
import { mockChronotypeQuestions } from '../../mock/user';

export default function Chronotype() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/caffeine')}
        />
      }
    >
      <Eyebrow>STEP 6 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={5}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="Your natural rhythm"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        Three quick questions — answer from your gut.
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
          <Eyebrow>{`Q${qIdx + 1} OF ${mockChronotypeQuestions.length}`}</Eyebrow>
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
                setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
              }
              accessibilityLabel={`${q.question} — ${opt.label}`}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}
