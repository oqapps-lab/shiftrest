/**
 * AuthProvider — React Context wrapping Supabase session state.
 *
 * Why Context (not Zustand): single concern, low write rate, no cross-cutting
 * subscriptions needed. Easy to swap to Zustand later if state grows.
 *
 * `loading` is true on first mount until we resolve initial session
 * (or skip immediately when supabase is unconfigured). Guards downstream
 * router redirects so we don't flash the wrong screen during hydration.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';
import { logEvent } from '../events';

type AuthResult = { error: AuthError | Error | null };

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthState | null>(null);

const NOT_CONFIGURED: AuthResult = {
  error: new Error(
    'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.',
  ),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return NOT_CONFIGURED;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) logEvent('signed_in', { provider: 'password' });
      return { error };
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
      if (!supabase) return NOT_CONFIGURED;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'shiftrest://auth/confirm',
          ...(displayName ? { data: { display_name: displayName } } : {}),
        },
      });
      if (!error) logEvent('signed_up', { provider: 'password' });
      return { error };
    },
    [],
  );

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return NOT_CONFIGURED;
    if (Platform.OS !== 'ios') {
      return { error: new Error('Sign in with Apple is iOS only.') };
    }

    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        return {
          error: new Error('Sign in with Apple is unavailable on this device. Set up an iCloud account in Settings first.'),
        };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { error: new Error('Apple did not return an identity token.') };
      }

      // Apple returns the user's full name only on the FIRST sign-in. Pass it
      // through so the trigger can backfill `display_name` in the profile row.
      const fullName =
        credential.fullName?.givenName || credential.fullName?.familyName
          ? `${credential.fullName?.givenName ?? ''} ${credential.fullName?.familyName ?? ''}`.trim()
          : undefined;

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        ...(fullName ? { options: { data: { display_name: fullName } } } : {}),
      } as Parameters<typeof supabase.auth.signInWithIdToken>[0]);
      if (!error) logEvent('signed_in', { provider: 'apple' });
      return { error };
    } catch (e) {
      // User cancelled the sheet — silent no-op so we don't show a scary error.
      const code = (e as { code?: string }).code;
      if (code === 'ERR_REQUEST_CANCELED') {
        return { error: null };
      }
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return NOT_CONFIGURED;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'shiftrest://auth/confirm',
    });
    return { error };
  }, []);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return NOT_CONFIGURED;
    // Log first — after signOut() the session is gone and RLS rejects the insert.
    await logEvent('signed_out');
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signInWithPassword,
      signUpWithPassword,
      signInWithApple,
      resetPassword,
      signOut,
    }),
    [session, loading, signInWithPassword, signUpWithPassword, signInWithApple, resetPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return ctx;
}
