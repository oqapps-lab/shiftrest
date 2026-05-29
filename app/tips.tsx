/**
 * F20-P1 — Sleep Tips library.
 *
 * Vertical grid of curated tips with category filter chips at the
 * top. Cards show: cover (gradient placeholder until MidJourney
 * images land) + title + 2-line body + citation pill.
 *
 * Profession-aware: filters out tips tagged for other professions
 * (e.g. nurse-specific blackout-curtain tip won't show to a factory
 * worker). Universal tips (no profession tag) always appear.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Image, type ImageSourcePropType } from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  Text,
  SerifHero,
  GlassCard,
  Glyph,
} from '../components/ui';
import { colors, spacing, radii, asGradient } from '../constants/tokens';
import { useOnboarding } from '../lib/onboarding/store';
import { TIPS, tipsForProfession, type SleepTip, type TipCategory } from '../lib/sleep-tips/seed';
import { t } from '../lib/i18n';

const CATEGORIES: { key: TipCategory | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'tips.category_all' },
  { key: 'environment', labelKey: 'tips.category_environment' },
  { key: 'nutrition', labelKey: 'tips.category_nutrition' },
  { key: 'pre_sleep', labelKey: 'tips.category_pre_sleep' },
  { key: 'mental', labelKey: 'tips.category_mental' },
  { key: 'post_shift', labelKey: 'tips.category_post_shift' },
];

const CATEGORY_TINT: Record<TipCategory, { from: string; to: string }> = {
  environment: { from: colors.duskGlow, to: colors.surfaceLow },
  nutrition: { from: colors.sunriseGlow, to: colors.surfaceLow },
  pre_sleep: { from: colors.primaryContainer, to: colors.surfaceLow },
  mental: { from: colors.sunriseGlow, to: colors.duskGlow },
  post_shift: { from: colors.primaryContainer, to: colors.sunriseGlow },
};

function professionToTag(p: string | null): SleepTip['profession'] {
  if (p === 'nurse') return 'nurse';
  if (p === 'firefighter') return 'firefighter';
  if (p === 'factory') return 'factory';
  return null;
}

export default function TipsScreen() {
  const { state } = useOnboarding();
  const [cat, setCat] = useState<TipCategory | 'all'>('all');

  const profTag = professionToTag(state.profession);
  const base = tipsForProfession(profTag);
  const visible = cat === 'all' ? base : base.filter((tip) => tip.category === cat);

  return (
    <Screen scroll orbs="subtle">
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginBottom: spacing.md }}>
        <Glyph name="chevronLeft" size={22} color="ink" />
      </Pressable>

      <Eyebrow>{t('tips.screen_eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
        <SerifHero>{t('tips.screen_hero')}</SerifHero>
      </View>
      <Text variant="bodyLg" color="inkSubtle" style={{ marginBottom: spacing.xl }}>
        {t('tips.screen_sub')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
        style={{ marginBottom: spacing.lg, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl }}
      >
        {CATEGORIES.map((c) => {
          const active = cat === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCat(c.key);
              }}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.surfaceLow },
              ]}
            >
              <Text
                variant="labelMd"
                family="body"
                weight="medium"
                color={active ? 'onPrimary' : 'ink'}
                uppercase
              >
                {t(c.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {visible.map((tip) => {
        const tint = CATEGORY_TINT[tip.category];
        return (
          <GlassCard key={tip.id} variant="paper" padding="xxl" style={{ marginBottom: spacing.md }}>
            <View style={styles.coverWrap}>
              {tip.image && IMAGE_MAP[tip.image] ? (
                <Image source={IMAGE_MAP[tip.image]} style={styles.coverImage} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={asGradient([tint.from, tint.to])}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.coverImage}
                />
              )}
            </View>
            <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: spacing.md }}>
              {t(`tips.${tip.i18nKey}.title`)}
            </Text>
            <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs }}>
              {t(`tips.${tip.i18nKey}.body`)}
            </Text>
            {tip.citation && (
              <View style={styles.citationPill}>
                <Text variant="labelMd" color="inkMuted" uppercase>
                  {t('tips.citation_label')} · {tip.citation}
                </Text>
              </View>
            )}
          </GlassCard>
        );
      })}

      <View style={{ height: spacing.huge * 2 }} />
    </Screen>
  );
}

/**
 * Cover image mapping. Empty initially — user generates MidJourney
 * covers and drops them under assets/tips/<slug>.jpg, then plug
 * the require() here. Until then everything renders as a category
 * gradient — visually consistent, never broken.
 *
 * Example after generation:
 *   'warm-socks': require('../assets/tips/warm-socks.jpg'),
 */
const IMAGE_MAP: Record<string, ImageSourcePropType> = {};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  coverWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  citationPill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.pill,
  },
});

export { TIPS };
