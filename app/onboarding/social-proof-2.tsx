/**
 * S12 — Social proof break #2. Filler before the loading → aha chain.
 * No step dots (onboarding questions are done); final CTA leads into loading.
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
import { mockTestimonials, mockSocialProofStats } from '../../mock/user';

export default function SocialProof2() {
  // Intentional: SP1 shows `.nurse`, SP2 shows `.fire` — different voice/angle.
  const testimonial = mockTestimonials.fire;

  return (
    <Screen
      orbs="normal"
      scroll
      tabBarClearance={false}
      floatingFooter={
        <PillCTA
          variant="primary"
          label="Show my plan"
          onPress={() => router.push('/onboarding/loading')}
        />
      }
    >
      <View style={styles.headWrap}>
        <Eyebrow>{"YOU'RE IN GOOD COMPANY"}</Eyebrow>
        <View style={{ marginTop: spacing.md }}>
          <SerifHero align="center">
            {`From ${mockSocialProofStats.totalUsers.toLocaleString()} shift workers`}
          </SerifHero>
        </View>
      </View>

      <GlassCard
        variant="glass"
        padding="xxl"
        style={{ marginBottom: spacing.xl }}
      >
        <Text
          variant="titleMd"
          family="serif"
          weight="lightItalic"
          color="ink"
          style={{ marginBottom: spacing.md }}
        >
          {`"${testimonial.quote}"`}
        </Text>
        <Text variant="labelLg" family="body" weight="medium" color="inkMuted" uppercase>
          {testimonial.author}
        </Text>
      </GlassCard>

      <Text variant="bodyMd" color="inkSubtle" align="center">
        {`★ ${mockSocialProofStats.appStoreRating} · ${mockSocialProofStats.totalReviews.toLocaleString()}+ reviews`}
      </Text>
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
