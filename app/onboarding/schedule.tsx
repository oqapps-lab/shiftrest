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
  OptionCard,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockScheduleTemplates } from '../../mock/user';
import { useOnboarding, type ScheduleId } from '../../lib/onboarding/store';

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
          label="Continue"
          disabled={!selected}
          onPress={() => router.push('/onboarding/current-shift')}
        />
      }
    >
      <Eyebrow>STEP 2 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={1}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="What's your schedule?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {"We tune sleep windows to your rotation's rhythm."}
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
