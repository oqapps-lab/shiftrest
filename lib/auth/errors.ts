/**
 * Map a Supabase auth error (or any thrown Error) into a localized
 * user-facing string. Falls back to the generic something-went-wrong
 * key — never the raw English message Supabase returns.
 *
 * R12-3: auth/login + auth/signup previously displayed err.message
 * directly, so non-EN users saw "Invalid login credentials" and
 * similar regardless of locale.
 */

import { t } from '../i18n';

export function localizeAuthError(message: string | undefined | null): string {
  // R17/A4: preserve original error for dev debugging — display layer
  // gets the localised version, console gets the raw cause.
  if (__DEV__ && message) console.warn('[auth-error]', message);
  if (!message) return t('auth.something_went_wrong');
  // R14-2: internal error codes from the auth store come through
  // as exact strings — map them to their localised description.
  if (message === 'apple_ios_only') return t('errors.apple_ios_only');
  if (message === 'apple_unavailable') return t('errors.apple_unavailable');
  if (message === 'apple_no_token') return t('errors.apple_no_token');
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return t('auth.error_invalid_credentials');
  }
  if (m.includes('email not confirmed') || m.includes('not confirmed')) {
    return t('auth.error_email_not_confirmed');
  }
  // R17/A4: dropped overly-broad 'typeerror' keyword — non-network
  // TypeErrors (undefined.foo) would be misclassified as offline.
  if (m.includes('network request failed') || m.includes('fetch failed')) {
    return t('auth.error_network');
  }
  if (m.includes('already registered') || m.includes('user already')) {
    return t('auth.error_user_exists');
  }
  if (m.includes('password') && (m.includes('short') || m.includes('weak') || m.includes('6 characters'))) {
    return t('auth.error_weak_password');
  }
  return t('auth.something_went_wrong');
}
