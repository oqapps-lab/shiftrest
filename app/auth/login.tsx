/**
 * S60 — Sign in. Email + password, link to forgot-password, link to signup.
 *
 * Entry: Welcome → "I already have an account".
 * Success: replace stack with /(tabs).
 * Failure: inline error under the password field. No PII in console.
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
import { safeBack } from '../../lib/nav';
import { t } from '../../lib/i18n';

export default function Login() {
  const { signInWithPassword, signInWithApple, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onApple = async () => {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error: err } = await signInWithApple();
    if (err) {
      setError(err.message);
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
    const { error: err } = await signInWithPassword(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      floatingFooter={
        <PillCTA
          variant="primary"
          label={loading ? t('auth.signing_in') : t('auth.sign_in_button')}
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      }
    >
      <Pressable
        onPress={() => safeBack('/')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('auth.back_a11y')}
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>{t('auth.welcome_back')}</Eyebrow>

      <HeroNumber
        value={t('auth.sign_in_hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {t('auth.sign_in_sub')}
      </Text>

      {Platform.OS === 'ios' && configured && (
        <View style={{ marginBottom: spacing.xxxl }}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={28}
            style={styles.appleBtn}
            onPress={onApple}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text variant="labelMd" color="inkMuted" uppercase weight="medium" style={{ marginHorizontal: spacing.md }}>
              {t('auth.or_divider')}
            </Text>
            <View style={styles.dividerLine} />
          </View>
        </View>
      )}

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
        autoComplete="password"
        secureTextEntry
        textContentType="password"
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
            {t('auth.demo_mode_text')}
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/auth/forgot')}
        hitSlop={12}
        style={styles.linkRow}
        accessibilityRole="button"
        accessibilityLabel={t('auth.forgot_pw_a11y')}
      >
        <Text variant="bodyMd" color="primary" weight="medium">
          {t('auth.forgot_password')}
        </Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text variant="bodyMd" color="inkSubtle">
          {t('auth.new_to_app')}
        </Text>
        <Pressable
          onPress={() => router.replace('/auth/signup')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('auth.create_account_a11y')}
        >
          <Text variant="bodyMd" color="primary" weight="medium" style={{ marginLeft: 6 }}>
            {t('auth.create_account')}
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
  linkRow: {
    alignSelf: 'flex-start',
    marginTop: spacing.xl,
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
