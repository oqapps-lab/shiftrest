/**
 * D7 — in-app legal document screen (Privacy / Terms). Sticky back header;
 * renders the bundled doc so the user never leaves the app for a browser.
 */

import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Screen, Eyebrow, Text, SerifHero, Glyph } from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { legalDoc } from '../../lib/legal/content';
import { t } from '../../lib/i18n';

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const data = legalDoc(String(doc));

  return (
    <Screen scroll={false} orbs="subtle" tabBarClearance={false}>
      <Stack.Screen options={{ headerShown: false }} />

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

      {!data ? (
        <Text variant="bodyLg" color="inkSubtle">
          {t('library.not_found')}
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.huge * 2 }}>
          <View style={{ marginBottom: spacing.xs }}>
            <SerifHero>{data.title}</SerifHero>
          </View>
          <Text variant="labelMd" color="inkMuted" uppercase style={{ marginBottom: spacing.lg }}>
            {data.updated}
          </Text>
          <Text variant="bodyLg" color="ink" style={{ marginBottom: spacing.xl, lineHeight: 26 }}>
            {data.intro}
          </Text>

          {data.sections.map((s, i) => (
            <View key={i} style={{ marginBottom: spacing.xl }}>
              <Eyebrow style={{ marginBottom: spacing.sm }}>{s.heading}</Eyebrow>
              {s.body.split('\n\n').map((p, j) => (
                <Text key={j} variant="bodyMd" color="inkSubtle" style={{ marginBottom: spacing.sm, lineHeight: 24 }}>
                  {p}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.sm,
  },
});
