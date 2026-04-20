/**
 * S05 — Main Problem picker. Step 4 / 10.
 * Iterates mockMainProblems and renders OptionCard rows.
 */

import React, { useState } from 'react';
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

export default function Problem() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Continue"
          disabled={!selected}
          onPress={() => router.push('/onboarding/social-proof-1')}
        />
      }
    >
      <Eyebrow>STEP 4 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={3}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="What bothers you most?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        We'll prioritise it in your plan.
      </Text>

      {mockMainProblems.map((p) => (
        <OptionCard
          key={p.id}
          title={p.title}
          subtitle={p.subtitle}
          glyph={p.glyph}
          selected={selected === p.id}
          onPress={() => setSelected(p.id)}
          accessibilityLabel={p.title}
        />
      ))}
    </Screen>
  );
}
