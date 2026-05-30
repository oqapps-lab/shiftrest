/**
 * Unit tests for lib/auth/errors.ts — localizeAuthError().
 *
 * Locks the R12 (error-code mapping) + R14-2 (Apple codes) + R17/A4
 * (typeerror must NOT classify as network) behaviour. Each Supabase /
 * internal error class must map to its own localised key; unknowns fall
 * through to a generic message — never the raw English string.
 */

import { localizeAuthError } from '../lib/auth/errors';

jest.mock('../lib/i18n', () => ({
  t: (key: string): string => `[${key}]`,
}));

describe('localizeAuthError', () => {
  test('null / undefined / empty → generic', () => {
    expect(localizeAuthError(null)).toBe('[auth.something_went_wrong]');
    expect(localizeAuthError(undefined)).toBe('[auth.something_went_wrong]');
    expect(localizeAuthError('')).toBe('[auth.something_went_wrong]');
  });

  test('Apple internal error codes (R14-2)', () => {
    expect(localizeAuthError('apple_ios_only')).toBe('[errors.apple_ios_only]');
    expect(localizeAuthError('apple_unavailable')).toBe('[errors.apple_unavailable]');
    expect(localizeAuthError('apple_no_token')).toBe('[errors.apple_no_token]');
  });

  test('invalid credentials variants', () => {
    expect(localizeAuthError('Invalid login credentials')).toBe('[auth.error_invalid_credentials]');
    expect(localizeAuthError('invalid credentials')).toBe('[auth.error_invalid_credentials]');
  });

  test('email not confirmed', () => {
    expect(localizeAuthError('Email not confirmed')).toBe('[auth.error_email_not_confirmed]');
  });

  test('network failures', () => {
    expect(localizeAuthError('Network request failed')).toBe('[auth.error_network]');
    expect(localizeAuthError('TypeError: Network request failed')).toBe('[auth.error_network]');
    expect(localizeAuthError('fetch failed')).toBe('[auth.error_network]');
  });

  test('user already registered', () => {
    expect(localizeAuthError('User already registered')).toBe('[auth.error_user_exists]');
  });

  test('weak password', () => {
    expect(localizeAuthError('Password should be at least 6 characters')).toBe('[auth.error_weak_password]');
  });

  test('R17/A4 regression — non-network TypeError must NOT map to network', () => {
    // "Cannot read property foo of undefined" is a TypeError but not a
    // connectivity issue. Before the R17 fix the broad "typeerror" keyword
    // misclassified these as offline. Must fall through to generic.
    expect(localizeAuthError('Cannot read property foo of undefined')).toBe('[auth.something_went_wrong]');
    expect(localizeAuthError('undefined is not a function')).toBe('[auth.something_went_wrong]');
  });

  test('unknown Supabase error → generic (never raw)', () => {
    expect(localizeAuthError('Some brand new GoTrue error 4711')).toBe('[auth.something_went_wrong]');
  });
});
