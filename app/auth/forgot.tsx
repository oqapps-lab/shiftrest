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
        <Eyebrow>CHECK YOUR INBOX</Eyebrow>
        <HeroNumber
          value="Reset link sent"
          size="md"
          style={{ marginTop: spacing.lg }}
        />
        <Text
          variant="bodyLg"
          color="inkSubtle"
          style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
        >
          {`Tap the link in the email we sent to ${email} to set a new password.`}
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
          label={loading ? 'Sending…' : 'Send reset link'}
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      }
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backRow}
      >
        <Glyph name="chevronLeft" size={22} color="inkMuted" />
      </Pressable>

      <Eyebrow>NO WORRIES</Eyebrow>

      <HeroNumber
        value="Reset password"
        size="md"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        variant="bodyLg"
        color="inkSubtle"
        style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
      >
        {"Enter the email you signed up with and we'll send a link."}
      </Text>

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
