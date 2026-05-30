/**
 * F20-P2 — Share Your Story screen.
 *
 * Lets a signed-in user submit a short note ("what helps you sleep")
 * which the summarize-story Edge Function rewrites into a 1-2 sentence
 * anonymized summary. Approved=false on insert; a moderator flips
 * the flag from Supabase Studio.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  Text,
  SerifHero,
  PillCTA,
  GlassCard,
  Glyph,
} from '../components/ui';
import { colors, radii, spacing } from '../constants/tokens';
import { useAuth } from '../lib/auth/store';
import { useOnboarding } from '../lib/onboarding/store';
import { submitStory } from '../lib/community/store';
import i18n, { t } from '../lib/i18n';

export default function ShareStoryScreen() {
  const { user } = useAuth();
  const { state } = useOnboarding();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const remaining = 1000 - text.length;
  const canSubmit = text.trim().length >= 20 && !submitting && !!user?.id;

  const submit = async () => {
    if (!user?.id) {
      Alert.alert(t('share_story.signin_title'), t('share_story.signin_body'));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    const res = await submitStory(text, state.profession, i18n.locale, user.id);
    setSubmitting(false);
    if (res.ok) {
      Alert.alert(
        t('share_story.thanks_title'),
        t('share_story.thanks_body'),
        [{ text: t('share_story.ok'), onPress: () => router.back() }],
      );
    } else {
      // R12-1: map error codes to localized strings. Falls back to a
      // generic "unknown" message for un-mapped Supabase errors so the
      // user never sees raw error identifiers like "offline" / "too_long".
      const localizedBody =
        res.error === 'offline' ? t('share_story.error_offline')
        : res.error === 'empty' ? t('share_story.error_empty')
        : res.error === 'too_long' ? t('share_story.error_too_long')
        : t('share_story.error_unknown');
      Alert.alert(t('share_story.failed_title'), localizedBody);
    }
  };

  return (
    <Screen scroll orbs="subtle" keyboardAvoiding>
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

      <Eyebrow>{t('share_story.eyebrow')}</Eyebrow>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
        <SerifHero>{t('share_story.hero')}</SerifHero>
      </View>
      <Text variant="bodyLg" color="inkSubtle" style={{ marginBottom: spacing.xl }}>
        {t('share_story.sub')}
      </Text>

      <GlassCard variant="paper" padding="xl" style={{ marginBottom: spacing.lg }}>
        <Eyebrow style={{ marginBottom: spacing.sm }}>{t('share_story.field_label')}</Eyebrow>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          placeholder={t('share_story.placeholder')}
          placeholderTextColor={colors.inkGhost}
          style={styles.input}
        />
        <Text variant="labelMd" color={remaining < 50 ? 'duskDim' : 'inkMuted'} style={{ marginTop: spacing.sm }}>
          {t('share_story.remaining', { n: remaining })}
        </Text>
      </GlassCard>

      <GlassCard variant="whisper" padding="lg" style={{ marginBottom: spacing.xl }}>
        <Text variant="bodyMd" color="inkSubtle">
          {t('share_story.privacy_note')}
        </Text>
      </GlassCard>

      <PillCTA
        variant="primary"
        label={submitting ? t('share_story.submitting') : t('share_story.cta')}
        disabled={!canSubmit}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 140,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
});
