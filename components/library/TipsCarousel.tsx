/**
 * TipsCarousel — full-width, swipeable, paginated cards of science-backed
 * shift-sleep tips drawn from the Sleep Library. Replaces the seeded
 * "community stories" block on Today: same swipe/paging/dots UX the user
 * liked, but the content is CITED expert advice (no fabricated users → no
 * fake-social-proof App Store risk), filtered to the user's profession.
 * Each card surfaces the article's actionable key-takeaway + a one-line
 * why + the source, and taps through to the full article.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Eyebrow, Text, GlassCard, Glyph } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import {
  articlesForProfession,
  LIBRARY_CATEGORIES,
  type LibraryArticle,
} from '../../lib/sleep-tips/library';
import { useOnboarding } from '../../lib/onboarding/store';
import { t } from '../../lib/i18n';

function catLabelKey(cat: LibraryArticle['category']): string {
  return LIBRARY_CATEGORIES.find((c) => c.key === cat)?.labelKey ?? 'library.cat_all';
}

function TipCard({ article, width }: { article: LibraryArticle; width: number }) {
  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/library/${article.id}`);
  };
  return (
    <View style={{ width }}>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={article.keyTakeaway}>
        <GlassCard variant="paper" padding="xxl" style={styles.card}>
          {/* category + science marker */}
          <View style={styles.catRow}>
            <View style={styles.iconWrap}>
              <Glyph name="sparkle" size={15} color="primary" />
            </View>
            <Eyebrow color="primary">{t(catLabelKey(article.category))}</Eyebrow>
          </View>

          {/* the actionable tip (article's key takeaway) */}
          <Text
            variant="titleMd"
            family="display"
            weight="light"
            color="ink"
            style={{ marginTop: spacing.md, lineHeight: 28 }}
          >
            {article.keyTakeaway}
          </Text>

          {/* one-line why */}
          <Text
            variant="bodyMd"
            color="inkSubtle"
            numberOfLines={3}
            style={{ marginTop: spacing.sm, lineHeight: 22 }}
          >
            {article.hook}
          </Text>

          {/* source + read more */}
          <View style={styles.footerRow}>
            <Text variant="labelMd" color="inkMuted" numberOfLines={1} style={{ flex: 1, marginRight: spacing.sm }}>
              {article.source}
            </Text>
            <Text variant="labelMd" weight="medium" color="primary">
              {t('library.read_more')}  →
            </Text>
          </View>
        </GlassCard>
      </Pressable>
    </View>
  );
}

export function TipsCarousel() {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<LibraryArticle>>(null);
  const { state } = useOnboarding();

  const tips = useMemo(() => {
    const prof =
      state.profession === 'nurse' ||
      state.profession === 'firefighter' ||
      state.profession === 'factory'
        ? state.profession
        : null;
    return articlesForProfession(prof).slice(0, 6);
  }, [state.profession]);

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

  if (tips.length === 0) return null;

  return (
    <View style={{ marginVertical: spacing.lg }} onLayout={onLayout}>
      <Eyebrow style={{ marginBottom: spacing.md }}>{t('library.tips_eyebrow')}</Eyebrow>
      {width > 0 && (
        <FlatList
          ref={listRef}
          data={tips}
          keyExtractor={(a) => a.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => <TipCard article={item} width={width} />}
        />
      )}

      {/* page dots */}
      <View style={styles.dots}>
        {tips.map((a, i) => (
          <View key={a.id} style={[styles.dot, i === index ? styles.dotActive : null]} />
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/library')}
        accessibilityRole="button"
        accessibilityLabel={t('library.browse_all')}
        style={{ alignSelf: 'center', marginTop: spacing.sm }}
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('library.browse_all')}  →
        </Text>
      </Pressable>
    </View>
  );
}

export default TipsCarousel;

const styles = StyleSheet.create({
  card: {
    minHeight: 200,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
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
