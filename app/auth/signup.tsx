/**
 * S61 — Create account. Email + password (+ optional name).
 *
 * Entry: Login → "Create account", or Profile → "Save your account".
 * Success on Supabase email confirmation flow:
 *   - if confirm-email is OFF → session granted immediately → /(tabs)
 *   - if confirm-email is ON → show "check your inbox" state, no session yet
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
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
import { localizeAuthError } from '../../lib/auth/errors';
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function Signup() {
  const { signUpWithPassword, signInWithApple, configured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | 'session' | 'check_email'>(null);

  const onApple = async () => {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error: err } = await signInWithApple();
    if (err) {
      setError(localizeAuthError(err.message));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  const canSubmit = email.includes('@') && password.length >= 6 && !loading;

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error: err } = await signUpWithPassword(
      email.trim(),
      password,
      name.trim() || undefined,
    );
    setLoading(false);
    if (err) {
      setError(localizeAuthError(err.message));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Optimistic: if Supabase confirm-email is OFF, the auth state listener
    // will land us in /(tabs) automatically. Otherwise show the prompt.
    setDone('check_email');
  };

  if (done === 'check_email') {
    return (
      <Screen orbs="subtle" scroll tabBarClearance={false}>
        <Eyebrow>{t('auth.check_inbox')}</Eyebrow>
        <HeroNumber
          value={t('auth.one_last_step')}
          size="md"
          style={{ marginTop: spacing.lg }}
        />
        <Text
          variant="bodyLg"
          color="inkSubtle"
          style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
        >
          {t('auth.signup_sent_template', { email })}
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
          label={loading ? t('auth.creating') : t('auth.sign_up_button')}
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

      <Eyebrow>{t('auth.save_progress')}</Eyebrow>

      <HeroNumber
        value={t('auth.create_account')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('auth.signup_sub')}
      </Text>

      {Platform.OS === 'ios' && configured && (
        <View style={{ marginBottom: spacing.xxxl }}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={28}
            style={styles.appleBtn}
            onPress={onApple}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text variant="labelMd" color="inkMuted" uppercase weight="medium" style={{ marginHorizontal: spacing.md }}>
              OR
            </Text>
            <View style={styles.dividerLine} />
          </View>
        </View>
      )}

      <TextField
        label={t('auth.name_optional')}
        placeholder={t('auth.name_placeholder')}
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="name"
        textContentType="name"
        value={name}
        onChangeText={setName}
        returnKeyType="next"
      />

      <View style={{ height: spacing.lg }} />

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
        returnKeyType="next"
      />

      <View style={{ height: spacing.lg }} />

      <TextField
        label={t('auth.password_label')}
        placeholder={t('auth.password_placeholder')}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        secureTextEntry
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
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

      <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.xl }}>
        {t('auth.terms_notice')}
      </Text>

      <View style={styles.footerRow}>
        <Text variant="bodyMd" color="inkSubtle">
          {t('auth.already_registered')}
        </Text>
        <Pressable
          onPress={() => router.replace('/auth/login')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('auth.sign_in_a11y')}
        >
          <Text variant="bodyMd" color="primary" weight="medium" style={{ marginLeft: 6 }}>
            {t('auth.sign_in_button')}
          </Text>
        </Pressable>
      </View>
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.huge,
  },
  appleBtn: {
    width: '100%',
    height: 56,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceLow,
  },
});
