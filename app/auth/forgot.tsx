/**
 * S62 — Forgot password. One field (email) → magic-link reset.
 *
 * Entry: Login → "Forgot password?".
 * Success: show "check your inbox" state, do not navigate.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  HeroNumber,
  Eyebrow,
  Text,
  PillCTA,
  TextField,
  Glyph,
} from '../../components/ui';
import { colors, spacing } from '../../constants/tokens';
import { useAuth } from '../../lib/auth/store';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function Forgot() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = email.includes('@') && !loading;

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (sent) {
    return (
      <Screen orbs="subtle" scroll tabBarClearance={false}>
        <Eyebrow>{t('auth.check_inbox')}</Eyebrow>
        <HeroNumber
          value={t('auth.reset_link_sent')}
          size="md"
          style={{ marginTop: spacing.lg }}
        />
        <Text
          variant="bodyLg"
          color="inkSubtle"
          style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
        >
          {t('auth.forgot_sent_template', { email })}
        </Text>
        <PillCTA
          variant="primary"
          label={t('auth.back_to_signin')}
          onPress={() => router.replace('/auth/login')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      floatingFooter={
        <PillCTA
          variant="primary"
          label={loading ? t('auth.sending') : t('auth.send_reset')}
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      }
    >
      <Pressable
        onPress={() => safeBack('/auth/login')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('auth.back_a11y')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('auth.no_worries')}</Eyebrow>

      <HeroNumber
        value={t('auth.reset_password')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('auth.forgot_sub')}
      </Text>

      <TextField
        label={t('auth.email_label')}
        placeholder={t('auth.email_placeholder')}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        returnKeyType="done"
        onSubmitEditing={canSubmit ? onSubmit : undefined}
      />

      {error && (
        <View style={styles.errorBox}>
          <Text variant="bodyMd" color="coralDim">
            {error}
          </Text>
        </View>
      )}

      {__DEV__ && !configured && (
        <View style={styles.demoBox}>
          <Text variant="labelMd" color="inkMuted" uppercase weight="medium">
            {t('auth.demo_mode_label')}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
            {t('auth.signup_demo_sub')}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
  },
  demoBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
  },
});
