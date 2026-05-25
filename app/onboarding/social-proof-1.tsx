/**
 * S06 — Onboarding step 5 / 10 — research-foundation break.
 * Replaces earlier fake-stat + testimonial layout per Apple Guideline 2.3.7 / 5.2.5.
 */

import React from 'react';
import { router } from 'expo-router';
import {
  Screen,
  GlassCard,
  SerifHero,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
  Glyph,
} from '../../components/ui';
import { View } from 'react-native';
import { spacing, colors, radii } from '../../constants/tokens';
import { t } from '../../lib/i18n';

export default function SocialProof1() {
  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding.next')}
          onPress={() => router.push('/onboarding/chronotype')}
        />
      }
    >
      <Eyebrow>{t('onboarding.step_template', { n: 5, total: 10 })}</Eyebrow>
      <ProgressDots
        count={10}
        active={4}
        style={{ marginVertical: spacing.sm, justifyContent: 'flex-start' }}
      />

      <View style={{ marginTop: spacing.huge, marginBottom: spacing.xl }}>
        <SerifHero align="center">{t('onboarding.social_proof_1.hero')}</SerifHero>
      </View>

      <Text
        variant="titleMd"
        family="display"
        weight="light"
        align="center"
        color="inkSubtle"
        style={{ marginBottom: spacing.huge }}
      >
        {t('onboarding.social_proof_1.sub')}
      </Text>

      <GlassCard variant="glass" padding="xxl">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.lg,
            backgroundColor: colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Glyph name="sparkle" size={22} color="primary" />
        </View>
        <Eyebrow color="primary" style={{ marginBottom: spacing.sm }}>
          {t('onboarding.social_proof_1.research_title')}
        </Eyebrow>
        <Text variant="bodyLg" color="ink">
          {t('onboarding.social_proof_1.research_body')}
        </Text>
      </GlassCard>
    </Screen>
  );
}
