/**
 * S61 — Create account. Email + password (+ optional name).
 *
 * Entry: Login → "Create account", or Profile → "Save your account".
 * Success on Supabase email confirmation flow:
 *   - if confirm-email is OFF → session granted immediately → /(tabs)
 *   - if confirm-email is ON → show "check your inbox" state, no session yet
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

export default function Signup() {
  const { signUpWithPassword, configured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | 'session' | 'check_email'>(null);

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
      setError(err.message);
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
        <Eyebrow>CHECK YOUR INBOX</Eyebrow>
        <HeroNumber
          value="One last step"
          size="md"
          style={{ marginTop: spacing.lg }}
        />
        <Text
          variant="bodyLg"
          color="inkSubtle"
          style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
        >
          {`We sent a confirmation link to ${email}. Tap it to finish — then come back here to sign in.`}
        </Text>
        <PillCTA
          variant="primary"
          label="Back to sign in"
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
          label={loading ? 'Creating account…' : 'Create account'}
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      }
    >
      <Pressable
        onPress={() => safeBack('/auth/login')}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>SAVE YOUR PROGRESS</Eyebrow>

      <HeroNumber
        value="Create account"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {"Sync your plan across devices and never lose your streak."}
      </Text>

      <TextField
        label="NAME (OPTIONAL)"
        placeholder="Marina"
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
        label="EMAIL"
        placeholder="you@example.com"
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
        label="PASSWORD"
        placeholder="At least 6 characters"
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

      {!configured && (
        <View style={styles.demoBox}>
          <Text variant="labelMd" color="inkMuted" uppercase weight="medium">
            DEMO MODE
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
            {"Supabase keys aren't set yet. Submit will fail with a clear error — UI is fully wired."}
          </Text>
        </View>
      )}

      <Text variant="bodyMd" color="inkMuted" style={{ marginTop: spacing.xl }}>
        {"By creating an account you agree to our Terms and Privacy Policy."}
      </Text>

      <View style={styles.footerRow}>
        <Text variant="bodyMd" color="inkSubtle">
          Already registered?
        </Text>
        <Pressable onPress={() => router.replace('/auth/login')} hitSlop={8}>
          <Text variant="bodyMd" color="primary" weight="medium" style={{ marginLeft: 6 }}>
            Sign in
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
});
