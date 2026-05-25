/**
 * S11 — Name input. Step 10 / 10.
 * Simple text field; Continue unlocks at >= 2 chars trimmed.
 */

import React from 'react';
import { router } from 'expo-router';
import { useOnboarding } from '../../lib/onboarding/store';
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
import { t } from '../../lib/i18n';

export default function Name() {
  const { state, update } = useOnboarding();
  const name = state.displayName;
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
          label={t('onboarding.continue')}
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/social-proof-2')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 11, total: 11 })}</Eyebrow>
      <ProgressDots
        count={11}
        active={10}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding_screens.name.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding_screens.name.sub')}
      </Text>

      <TextField
        label={t('onboarding_screens.name.label')}
        placeholder={t('onboarding_screens.name.placeholder')}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
        value={name}
        onChangeText={(v) => update({ displayName: v })}
        returnKeyType="done"
      />
    </Screen>
  );
}
