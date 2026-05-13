/**
 * S08 — Caffeine habits. Step 7 / 10.
 * Stepper for cups/day + type picker + sensitivity picker.
 */

import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding, type CaffeineType, type CaffeineSensitivity } from '../../lib/onboarding/store';
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
import { t } from '../../lib/i18n';

export default function Caffeine() {
  const { state, update } = useOnboarding();
  const cups = state.caffeineCupsPerDay;
  const type = state.caffeineType;
  const sensitivity = state.caffeineSensitivity;

  const canContinue = !!type && !!sensitivity;

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
          onPress={() => router.push('/onboarding/melatonin')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 7, total: 10 })}</Eyebrow>
      <ProgressDots
        count={10}
        active={6}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <HeroNumber
        value={t('onboarding.caffeine.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('onboarding.caffeine.sub')}
      </Text>

      <View style={{ marginBottom: spacing.xxxl }}>
        <Stepper
          value={cups}
          min={0}
          max={8}
          step={1}
          unit={t('onboarding.caffeine.cups_unit_lower')}
          onChange={(v) => update({ caffeineCupsPerDay: v })}
          accessibilityLabel={t('onboarding.caffeine.stepper_a11y')}
        />
      </View>

      <Eyebrow style={{ marginBottom: spacing.md }}>{t('onboarding.caffeine.usual_type')}</Eyebrow>
      {mockCaffeineTypes.map((c) => (
        <OptionCard
          key={c.id}
          title={c.label}
          glyph={c.glyph}
          selected={type === c.id}
          onPress={() => update({ caffeineType: c.id as CaffeineType })}
          accessibilityLabel={c.label}
        />
      ))}

      <Eyebrow style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        {t('onboarding.caffeine.sensitivity')}
      </Eyebrow>
      {mockCaffeineSensitivities.map((s) => (
        <OptionCard
          key={s.id}
          title={s.label}
          subtitle={s.subtitle}
          selected={sensitivity === s.id}
          onPress={() => update({ caffeineSensitivity: s.id as CaffeineSensitivity })}
          accessibilityLabel={s.label}
        />
      ))}
    </Screen>
  );
}
