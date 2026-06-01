/**
 * C5 — Sleep Library: browsable grid of deep, research-backed reads with
 * category filter chips. Cards: gradient cover (until art lands) + read-time
 * pill + title + hook. Tap → /library/[id] detail. Profession-aware.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen, Eyebrow, Text, SerifHero, GlassCard, Glyph } from '../../components/ui';
import { colors, spacing, radii, asGradient } from '../../constants/tokens';
import { useOnboarding } from '../../lib/onboarding/store';
import {
  articlesForProfession,
  LIBRARY_CATEGORIES,
  type LibraryArticle,
  type LibraryCategory,
} from '../../lib/sleep-tips/library';
import { t } from '../../lib/i18n';

const CATEGORY_TINT: Record<LibraryCategory, { from: string; to: string }> = {
  light_clock: { from: colors.sunriseGlow, to: colors.surfaceLow },
  caffeine_stimulants: { from: colors.sunriseGlow, to: colors.duskGlow },
  sleep_architecture: { from: colors.primaryContainer, to: colors.surfaceLow },
  night_shift: { from: colors.duskGlow, to: colors.surfaceLow },
  recovery_social: { from: colors.primaryContainer, to: colors.sunriseGlow },
};

function professionTag(p: string | null): 'nurse' | 'firefighter' | 'factory' | null {
  if (p === 'nurse' || p === 'firefighter' || p === 'factory') return p;
  return null;
}

export default function LibraryScreen() {
  const { state } = useOnboarding();
  const [cat, setCat] = useState<LibraryCategory | 'all'>('all');

  const base = articlesForProfession(professionTag(state.profession));
  const visible: LibraryArticle[] =
    cat === 'all' ? base : base.filter((a) => a.category === cat);

  return (
    <Screen scroll orbs="subtle">
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={{ marginBottom: spacing.md }}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.back')}
      >
        <Glyph name="chevronLeft" size={22} color="ink" />
      </Pressable>

      <Eyebrow>{t('library.screen_eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
        <SerifHero>{t('library.screen_hero')}</SerifHero>
      </View>
      <Text variant="bodyLg" color="inkSubtle" style={{ marginBottom: spacing.xl }}>
        {t('library.screen_sub')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
        style={{ marginBottom: spacing.lg, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl }}
      >
        {LIBRARY_CATEGORIES.map((c) => {
          const active = cat === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCat(c.key);
              }}
              style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surfaceLow }]}
            >
              <Text variant="labelMd" family="body" weight="medium" color={active ? 'onPrimary' : 'ink'} uppercase>
                {t(c.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {visible.map((a) => {
        const tint = CATEGORY_TINT[a.category];
        return (
          <Pressable
            key={a.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/library/${a.id}`);
            }}
          >
            <GlassCard variant="paper" padding="xxl" style={{ marginBottom: spacing.md }}>
              <View style={styles.coverWrap}>
                <LinearGradient
                  colors={asGradient([tint.from, tint.to])}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.coverImage}
                />
                <View style={styles.readPill}>
                  <Text variant="labelMd" color="inkMuted" uppercase>
                    {t('library.read_min', { n: a.readMin })}
                  </Text>
                </View>
              </View>
              <Text variant="titleLg" family="display" weight="light" color="ink" style={{ marginTop: spacing.md }}>
                {a.title}
              </Text>
              <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.xs }}>
                {a.hook}
              </Text>
            </GlassCard>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => router.push('/tips')}
        style={{ alignSelf: 'center', marginTop: spacing.sm }}
        accessibilityRole="button"
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('library.quick_tips_link')}
        </Text>
      </Pressable>

      <View style={{ height: spacing.huge * 2 }} />
    </Screen>
  );
}

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
  readPill: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.canvas,
    borderRadius: radii.pill,
  },
});
