/**
 * Supabase client (React Native — Expo SDK 55).
 *
 * Reads env vars at bundle time:
 *   EXPO_PUBLIC_SUPABASE_URL
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY
 *
 * If either is missing the module exports `null` and `isSupabaseConfigured`
 * returns false. Auth UI uses this flag to render a "demo mode" notice
 * instead of crashing.
 *
 * R19/S-4: auth tokens are persisted via LargeSecureStore — AES-256
 * encrypted, key in the iOS Keychain / Android Keystore — instead of
 * plain AsyncStorage. Fail-safe: degrades to AsyncStorage on any
 * SecureStore/crypto error, so it can never lock users out.
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LargeSecureStore } from './secure-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: LargeSecureStore,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;
