/**
 * Community stories — full-width, swipeable, paginated carousel of real
 * shift-worker advice. One card per page (snaps, no side-peek), page dots
 * below. Each card: author (avatar + name + role) → the concrete tip →
 * the practical method → a clear "♥ N found this helpful" action.
 *
 * Empty / first-launch state shows a "Share what helps you" CTA.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eyebrow, Text, PillCTA, GlassCard, Glyph } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { useApprovedStories, reactToStory, type CommunityStory } from '../../lib/community/store';
import i18n, { t } from '../../lib/i18n';
import { useOnboarding } from '../../lib/onboarding/store';

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

function StoryCard({ story, width }: { story: CommunityStory; width: number }) {
  const [count, setCount] = useState(story.reactions);
  const [reacted, setReacted] = useState(false);

  const onReact = () => {
    if (reacted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((c) => c + 1);
    setReacted(true);
    void reactToStory(story.id);
  };

  return (
    <View style={{ width }}>
      <GlassCard variant="paper" padding="xxl" style={styles.card}>
        {/* author */}
        <View style={styles.authorRow}>
          {story.avatar ? (
            <Image source={story.avatar} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Glyph name="user" size={20} color="primary" />
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

        {/* the concrete tip */}
        <Text variant="titleMd" family="display" weight="light" color="ink" style={{ marginTop: spacing.md, lineHeight: 26 }}>
          {story.ai_summary?.trim() || '…'}
        </Text>

        {/* the method */}
        {story.raw_text?.trim() ? (
          <Text variant="bodyMd" color="inkSubtle" numberOfLines={4} style={{ marginTop: spacing.sm, lineHeight: 22 }}>
            {story.raw_text.trim()}
          </Text>
        ) : null}

        {/* helpful */}
        <Pressable
          onPress={onReact}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('community.helpful_a11y')}
          style={styles.helpfulRow}
        >
          <Text variant="labelMd" weight="medium" color={reacted ? 'primary' : 'inkMuted'}>
            ♥  {t('community.helpful_count', { n: count })}
          </Text>
        </Pressable>
      </GlassCard>
    </View>
  );
}

export function StoriesCoverFlow() {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<CommunityStory>>(null);

  const { state } = useOnboarding();
  const { stories, loading } = useApprovedStories(state.profession ?? null, i18n.locale);
  const eyebrow = useMemo(() => ProfessionLabel(state.profession), [state.profession]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - width) > 1) setWidth(w);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) {
      const i = Math.round(e.nativeEvent.contentOffset.x / width);
      if (i !== index) setIndex(i);
    }
  };

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
          <PillCTA variant="glass" size="md" label={t('community.submit_cta')} onPress={() => router.push('/share-story')} />
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: spacing.lg }} onLayout={onLayout}>
      <Eyebrow style={{ marginBottom: spacing.md }}>{eyebrow}</Eyebrow>
      {width > 0 && (
        <FlatList
          ref={listRef}
          data={stories}
          keyExtractor={(s) => s.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => <StoryCard story={item} width={width} />}
        />
      )}

      {/* page dots */}
      <View style={styles.dots}>
        {stories.map((s, i) => (
          <View
            key={s.id}
            style={[styles.dot, i === index ? styles.dotActive : null]}
          />
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/share-story')}
        accessibilityRole="button"
        accessibilityLabel={t('profile.share_story_a11y')}
        style={{ alignSelf: 'center', marginTop: spacing.sm }}
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
    minHeight: 210,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  helpfulRow: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inkGhost,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});

export default StoriesCoverFlow;
