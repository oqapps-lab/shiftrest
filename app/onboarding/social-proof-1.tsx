/**
 * S06 — Social Proof break #1. Step 5 / 10.
 * Static content (no input) — big stat + serif reassurance + one testimonial card.
 */

import React from 'react';
import { router } from 'expo-router';
import {
  Screen,
  GlassCard,
  HeroNumber,
  SerifHero,
  Eyebrow,
  Text,
  PillCTA,
  ProgressDots,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { mockTestimonials, mockSocialProofStats } from '../../mock/user';
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

      <HeroNumber
        value={`${mockSocialProofStats.percentUnderslept}%`}
        size="xxl"
        align="center"
        style={{ marginTop: spacing.huge }}
      />

      <Text
        variant="titleLg"
        family="display"
        weight="light"
        align="center"
        color="inkSubtle"
        style={{ marginTop: spacing.lg }}
      >
        {t('onboarding.social_proof_1.sub')}
      </Text>

      <SerifHero align="center" style={{ marginTop: spacing.xl }}>
        {t('onboarding.social_proof_1.hero')}
      </SerifHero>

      <GlassCard
        variant="glass"
        padding="xxl"
        style={{ marginTop: spacing.huge }}
      >
        <Text
          variant="serifHero"
          family="serif"
          weight="lightItalic"
          color="ink"
        >
          {`"${mockTestimonials.nurse.quote}"`}
        </Text>
        <Text
          variant="labelLg"
          family="body"
          weight="medium"
          color="inkMuted"
          uppercase
          style={{ marginTop: spacing.lg }}
        >
          {`— ${mockTestimonials.nurse.author}`}
        </Text>
      </GlassCard>
    </Screen>
  );
}
