/**
 * S08 — Caffeine habits. Step 7 / 10.
 * Stepper for cups/day + type picker + sensitivity picker.
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
  Stepper,
  OptionCard,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockCaffeineTypes, mockCaffeineSensitivities } from '../../mock/user';

export default function Caffeine() {
  const [cups, setCups] = useState(2);
  const [type, setType] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState<string | null>(null);

  const canContinue = !!type && !!sensitivity;

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
          onPress={() => router.push('/onboarding/melatonin')}
        />
      }
    >
      <Eyebrow>STEP 7 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={6}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="How much caffeine?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        We time your cutoff around this.
      </Text>

      <View style={{ marginBottom: spacing.xxxl }}>
        <Stepper
          value={cups}
          min={0}
          max={8}
          step={1}
          unit="cups/day"
          onChange={setCups}
          accessibilityLabel="Cups per day"
        />
      </View>

      <Eyebrow style={{ marginBottom: spacing.md }}>USUAL TYPE</Eyebrow>
      {mockCaffeineTypes.map((t) => (
        <OptionCard
          key={t.id}
          title={t.label}
          glyph={t.glyph}
          selected={type === t.id}
          onPress={() => setType(t.id)}
          accessibilityLabel={t.label}
        />
      ))}

      <Eyebrow style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        SENSITIVITY
      </Eyebrow>
      {mockCaffeineSensitivities.map((s) => (
        <OptionCard
          key={s.id}
          title={s.label}
          subtitle={s.subtitle}
          selected={sensitivity === s.id}
          onPress={() => setSensitivity(s.id)}
          accessibilityLabel={s.label}
        />
      ))}
    </Screen>
  );
}
