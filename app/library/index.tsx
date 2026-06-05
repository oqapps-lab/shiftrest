/**
 * C5 / D5-D6 — Sleep Library grid. Sticky back header (always visible),
 * category filter chips, and article cards whose title sits *over* the
 * gradient cover (serif) so cards read as intentional until real art lands.
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
  light_clock: { from: colors.sunriseGlow, to: colors.primaryContainer },
  caffeine_stimulants: { from: colors.sunriseGlow, to: colors.duskGlow },
  sleep_architecture: { from: colors.primaryContainer, to: colors.surfaceLow },
  night_shift: { from: colors.duskGlow, to: colors.primaryContainer },
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
    <Screen scroll={false} orbs="subtle">
      <Stack.Screen options={{ headerShown: false }} />

      {/* D6: sticky back header — always visible, no need to scroll up */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.back')}
        >
          <Glyph name="chevronLeft" size={22} color="ink" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.huge * 2 }}>
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
          style={{ marginBottom: spacing.lg, marginHorizontal: -spacing.xxl, paddingHorizontal: spacing.xxl }}
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
              <GlassCard variant="paper" padding="md" style={{ marginBottom: spacing.md }}>
                <View style={styles.coverWrap}>
                  <LinearGradient
                    colors={asGradient([tint.from, tint.to])}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* soft bottom scrim so the serif title stays legible */}
                  <LinearGradient
                    colors={asGradient(['rgba(28,26,23,0)', 'rgba(28,26,23,0.28)'])}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.readPill}>
                    <Text variant="labelMd" color="inkMuted" uppercase>
                      {t('library.read_min', { n: a.readMin })}
                    </Text>
                  </View>
                  {/* D5: title over the cover */}
                  <Text
                    variant="titleLg"
                    family="display"
                    weight="light"
                    color="onPrimary"
                    style={styles.coverTitle}
                  >
                    {a.title}
                  </Text>
                </View>
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.md, marginHorizontal: spacing.sm }}>
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  coverWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radii.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  coverTitle: {
    margin: spacing.lg,
    lineHeight: 30,
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
