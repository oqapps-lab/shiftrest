/**
 * Email-confirm deep-link landing route.
 *
 * Triggered by URLs of the shape `shiftrest://auth/confirm?code=<pkce_code>`
 * (Supabase v2 PKCE flow). The route exchanges the code for a session and
 * routes the user into the app. Works for both signup-confirm and
 * password-reset flows; reset gets routed onward to the change-password
 * screen via `?type=recovery` when present.
 *
 * Errors are surfaced inline so a stale or already-consumed link doesn't
 * leave the user staring at a spinner forever.
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Eyebrow, SerifHero, Text, PillCTA } from '../../components/ui';
import { spacing } from '../../constants/tokens';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { t } from '../../lib/i18n';

type Status = 'pending' | 'success' | 'error';

export default function AuthConfirm() {
  const params = useLocalSearchParams<{ code?: string; type?: string; error?: string; error_description?: string }>();
  const [status, setStatus] = React.useState<Status>('pending');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (cancelled) return;
        setErrorMsg('Sign-in service is unavailable right now. Try again in a minute.');
        setStatus('error');
        return;
      }

      // GoTrue may bounce back errors as ?error=...&error_description=...
      if (params.error) {
        if (cancelled) return;
        setErrorMsg(params.error_description ?? params.error ?? t('errors.link_unverified'));
        setStatus('error');
        return;
      }

      const code = typeof params.code === 'string' ? params.code : null;
      if (!code) {
        if (cancelled) return;
        setErrorMsg(t('errors.link_missing_code'));
        setStatus('error');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;

      if (error) {
        setErrorMsg(error.message ?? t('errors.verification_failed'));
        setStatus('error');
        return;
      }

      setStatus('success');

      // Recovery → user must set a new password before continuing.
      // Other types → straight into the app.
      const next = params.type === 'recovery' ? '/auth/forgot' : '/(tabs)';
      setTimeout(() => router.replace(next as never), 600);
    })();

    return () => {
      cancelled = true;
    };
  }, [params.code, params.type, params.error, params.error_description]);

  return (
    <Screen orbs="subtle">
      <View style={{ marginTop: spacing.huge * 2 }}>
        <Eyebrow>{t('auth.email_confirmation')}</Eyebrow>
        <View style={{ marginTop: spacing.md }}>
          <SerifHero>
            {status === 'pending' && 'Verifying...'}
            {status === 'success' && 'You’re in.'}
            {status === 'error' && 'Couldn’t verify.'}
          </SerifHero>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          {status === 'pending' && <ActivityIndicator />}
          {status === 'success' && (
            <Text variant="bodyLg" color="inkSubtle">
              Taking you to the app...
            </Text>
          )}
          {status === 'error' && (
            <>
              <Text variant="bodyLg" color="inkSubtle">
                {errorMsg ?? t('auth.something_went_wrong')}
              </Text>
              <View style={{ marginTop: spacing.huge }}>
                <PillCTA
                  variant="primary"
                  label={t('auth.back_to_signin')}
                  onPress={() => router.replace('/auth/login')}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}
