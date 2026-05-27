/**
 * S12 — Onboarding research break #2 (no step dots — questions are done).
 * Replaces fake "★ 4.8 · N reviews" + fabricated testimonial per Apple
 * Guideline 2.3.7 / 5.2.5. Evidence-based copy, no star ratings, no
 * fabricated review counts.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  SerifHero,
  Eyebrow,
  GlassCard,
  Text,
  PillCTA,
} from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { t } from '../../lib/i18n';

export default function SocialProof2() {
  return (
    <Screen
      orbs="normal"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={t('onboarding_screens.social_proof_2.cta')}
          onPress={() => router.push('/onboarding/loading')}
        />
      }
    >
      <View style={styles.headWrap}>
        <Eyebrow>{t('onboarding_screens.social_proof_2.eyebrow')}</Eyebrow>
        <View style={{ marginTop: spacing.md }}>
          <SerifHero align="center">{t('onboarding_screens.social_proof_2.hero')}</SerifHero>
        </View>
      </View>

      <GlassCard variant="glass" padding="xxl">
        <Text variant="bodyLg" color="ink">
          {t('onboarding_screens.social_proof_2.body')}
        </Text>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headWrap: {
    alignItems: 'center',
    marginTop: spacing.huge,
    marginBottom: spacing.huge,
  },
});
