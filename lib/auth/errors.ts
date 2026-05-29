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
  if (!message) return t('auth.something_went_wrong');
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return t('auth.error_invalid_credentials');
  }
  if (m.includes('email not confirmed') || m.includes('not confirmed')) {
    return t('auth.error_email_not_confirmed');
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('typeerror')) {
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
