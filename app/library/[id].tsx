/**
 * C5 — Sleep Library article detail. Reads the article from the inline
 * corpus by route param. Layout: back · category eyebrow · title · read-time
 * · hook · body paragraphs · key-takeaway callout · source pill.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Screen, Eyebrow, Text, SerifHero, GlassCard, Glyph } from '../../components/ui';
import { colors, spacing, radii } from '../../constants/tokens';
import { articleById, LIBRARY_CATEGORIES } from '../../lib/sleep-tips/library';
import { t } from '../../lib/i18n';

export default function LibraryArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = articleById(String(id));

  if (!article) {
    return (
      <Screen scroll orbs="subtle">
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginBottom: spacing.lg }}>
          <Glyph name="chevronLeft" size={22} color="ink" />
        </Pressable>
        <Text variant="bodyLg" color="inkSubtle">
          {t('library.not_found')}
        </Text>
      </Screen>
    );
  }

  const catLabelKey =
    LIBRARY_CATEGORIES.find((c) => c.key === article.category)?.labelKey ?? 'library.cat_all';
  const paragraphs = article.body.split('\n\n');

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

      <View style={styles.metaRow}>
        <Eyebrow>{t(catLabelKey)}</Eyebrow>
        <View style={styles.readPill}>
          <Text variant="labelMd" color="inkMuted" uppercase>
            {t('library.read_min', { n: article.readMin })}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
        <SerifHero>{article.title}</SerifHero>
      </View>

      <Text variant="bodyLg" color="ink" style={{ marginBottom: spacing.xl, lineHeight: 28 }}>
        {article.hook}
      </Text>

      {paragraphs.map((p, i) => (
        <Text
          key={i}
          variant="bodyMd"
          color="inkSubtle"
          style={{ marginBottom: spacing.md, lineHeight: 24 }}
        >
          {p}
        </Text>
      ))}

      <GlassCard variant="whisper" padding="xl" style={{ marginTop: spacing.md }}>
        <Eyebrow style={{ marginBottom: spacing.xs }}>{t('library.takeaway_label')}</Eyebrow>
        <Text variant="titleMd" family="display" weight="light" color="ink">
          {article.keyTakeaway}
        </Text>
      </GlassCard>

      <View style={styles.sourcePill}>
        <Text variant="labelMd" color="inkMuted" uppercase>
          {t('library.source_label')} · {article.source}
        </Text>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={styles.backLink}
        accessibilityRole="button"
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          ←  {t('library.back_to_library')}
        </Text>
      </Pressable>

      <View style={{ height: spacing.huge * 2 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.pill,
  },
  sourcePill: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.pill,
  },
  backLink: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
});
