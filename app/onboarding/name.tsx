/**
 * S11 — Name input. Step 10 / 10.
 * Simple text field; Continue unlocks at >= 2 chars trimmed.
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
  TextField,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';

export default function Name() {
  const [name, setName] = useState('');
  const canContinue = name.trim().length >= 2;

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/social-proof-2')}
        />
      }
    >
      <Eyebrow>STEP 10 OF 10</Eyebrow>
      <ProgressDots
        count={10}
        active={9}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value="What's your name?"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        We'll greet you with it.
      </Text>

      <TextField
        label="NAME"
        placeholder="Marina"
        autoCapitalize="words"
        autoCorrect={false}
        value={name}
        onChangeText={setName}
        returnKeyType="done"
      />
    </Screen>
  );
}
