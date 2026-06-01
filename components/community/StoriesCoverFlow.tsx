/**
 * F20-P3 — Stories cover-flow carousel.
 *
 * iPod-style horizontal carousel for community stories: the centered
 * card sits at scale=1 opacity=1; siblings tilt away at scale=0.85
 * opacity=0.55 with a soft translate. Snap pagination, no scroll
 * indicator, momentum disabled (scrollEventThrottle=16 for buttery
 * worklets).
 *
 * Empty / first-launch state shows a "Share what helps you" CTA
 * that pushes /share-story.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, FlatList, Image, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eyebrow, Text, PillCTA, GlassCard, Glyph } from '../ui';
import { colors, radii, spacing, asGradient } from '../../constants/tokens';
import { useApprovedStories, reactToStory, type CommunityStory } from '../../lib/community/store';
import i18n, { t } from '../../lib/i18n';
import { useOnboarding } from '../../lib/onboarding/store';

const CARD_W_RATIO = 0.78;
const CARD_GAP = 16;

const PROFESSION_TINT: Record<string, [string, string]> = {
  nurse: [colors.primaryContainer, colors.surfaceLow],
  firefighter: [colors.sunriseGlow, colors.surfaceLow],
  factory: [colors.duskGlow, colors.surfaceLow],
};

const PROFESSION_PLURAL: Record<string, string> = {
  nurse: 'NURSES',
  firefighter: 'FIREFIGHTERS',
  factory: 'FACTORY WORKERS',
  other: 'SHIFT WORKERS',
};

function ProfessionLabel(profession: string | null): string {
  if (!profession) return t('community.eyebrow_universal');
  const plural = PROFESSION_PLURAL[profession] ?? profession.toUpperCase();
  return t('community.eyebrow', { profession: plural });
}

function StoryCard({ story, index, scrollX, cardW, snap }: {
  story: CommunityStory;
  index: number;
  scrollX: SharedValue<number>;
  cardW: number;
  snap: number;
}) {
  const tint = PROFESSION_TINT[story.profession ?? ''] ?? [colors.sunriseGlow, colors.surfaceLow];
  const animStyle = useAnimatedStyle(() => {
    const offset = index * snap;
    const distance = scrollX.value - offset;
    const ratio = distance / snap;
    const scale = interpolate(ratio, [-1, 0, 1], [0.86, 1, 0.86], Extrapolation.CLAMP);
    const opacity = interpolate(ratio, [-1, 0, 1], [0.55, 1, 0.55], Extrapolation.CLAMP);
    const translateY = interpolate(ratio, [-1, 0, 1], [12, 0, 12], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  }, [snap]);

  const onReact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void reactToStory(story.id);
  };

  return (
    <Animated.View style={[{ width: cardW, marginRight: CARD_GAP }, animStyle]}>
      <GlassCard variant="paper" padding="xxl" style={styles.card}>
        <LinearGradient
          colors={asGradient(tint)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardTopFade}
        />
        {(story.avatar || story.author_name) && (
          <View style={styles.authorRow}>
            {story.avatar ? (
              <Image source={story.avatar} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Glyph name="user" size={18} color="primary" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              {story.author_name && (
                <Text variant="bodyMd" weight="medium" color="ink">
                  {story.author_name}
                </Text>
              )}
              {story.role_line && (
                <Text variant="labelMd" color="inkMuted">
                  {story.role_line}
                </Text>
              )}
            </View>
          </View>
        )}
        <Text variant="bodyLg" color="ink" style={{ lineHeight: 26, marginTop: 8 }}>
          {story.ai_summary?.trim() ? `“${story.ai_summary.trim()}”` : '…'}
        </Text>
        <View style={styles.footer}>
          {!story.role_line && story.profession && (
            <Text variant="labelMd" color="inkMuted" uppercase>
              {story.profession}
            </Text>
          )}
          {story.role_line ? <View style={{ flex: 1 }} /> : null}
          <Pressable
            onPress={onReact}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('community.react_a11y')}
            style={styles.reactBtn}
          >
            <Glyph name="sparkle" size={14} color="primary" />
            <Text variant="labelMd" color="primary" weight="medium" style={{ marginLeft: 4 }}>
              {story.reactions}
            </Text>
          </Pressable>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export function StoriesCoverFlow() {
  const { width: winW } = useWindowDimensions();
  const cardW = Math.floor(winW * CARD_W_RATIO);
  const snap = cardW + CARD_GAP;
  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const { state } = useOnboarding();
  const { stories, loading } = useApprovedStories(state.profession ?? null, i18n.locale);

  const eyebrow = useMemo(() => ProfessionLabel(state.profession), [state.profession]);

  if (loading) return null;
  if (stories.length === 0) {
    return (
      <View style={{ marginVertical: spacing.lg }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <GlassCard variant="whisper" padding="xxl" style={{ marginTop: spacing.md }}>
          <Text variant="titleMd" family="display" weight="medium" color="ink">
            {t('community.empty_title')}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
            {t('community.empty_sub')}
          </Text>
          <PillCTA
            variant="glass"
            size="md"
            label={t('community.submit_cta')}
            onPress={() => router.push('/share-story')}
          />
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: spacing.lg }}>
      <Eyebrow style={{ marginBottom: spacing.md }}>{eyebrow}</Eyebrow>
      <Animated.FlatList
        data={stories}
        keyExtractor={(s) => s.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: (winW - cardW) / 2 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <StoryCard story={item} index={index} scrollX={scrollX} cardW={cardW} snap={snap} />
        )}
      />
      <Pressable
        onPress={() => router.push('/share-story')}
        accessibilityRole="button"
        accessibilityLabel={t('profile.share_story_a11y')}
        style={{ alignSelf: 'center', marginTop: spacing.md }}
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('community.submit_cta')}  →
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 200,
    overflow: 'hidden',
  },
  cardTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLow,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  reactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
  },
});

export default StoriesCoverFlow;
