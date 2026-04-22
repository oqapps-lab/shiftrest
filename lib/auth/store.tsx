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
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';

type AuthResult = { error: AuthError | Error | null };

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
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
        options: displayName ? { data: { display_name: displayName } } : undefined,
      });
      return { error };
    },
    [],
  );

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return NOT_CONFIGURED;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }, []);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return NOT_CONFIGURED;
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
      resetPassword,
      signOut,
    }),
    [session, loading, signInWithPassword, signUpWithPassword, resetPassword, signOut],
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
