/**
 * Adapty SDK init.
 *
 * Activate once at app launch (called from `app/_layout.tsx` mount). The SDK
 * batches subsequent purchase + paywall calls — anywhere in the app you can
 * use `adapty.getPaywall(...)`, `adapty.getPaywallProducts(...)`,
 * `adapty.makePurchase(...)`, etc.
 *
 * Public key is shipped in the app binary (Adapty marks it as safe-to-publish).
 * Server-side operations against secret keys live on Supabase Edge Functions
 * — never on the client.
 */

import { adapty } from 'react-native-adapty';

let activated = false;

export async function ensureAdaptyActivated(): Promise<void> {
  if (activated) return;
  const key = process.env.EXPO_PUBLIC_ADAPTY_PUBLIC_KEY;
  if (!key) {
    if (__DEV__) {
      console.log('[adapty] EXPO_PUBLIC_ADAPTY_PUBLIC_KEY missing — skipping activate (dev mode is fine)');
    }
    return;
  }
  try {
    await adapty.activate(key, {
      // observerMode=false → SDK manages purchases (default).
      // Set to true only if your app already has its own StoreKit pipeline.
      observerMode: false,
      logLevel: __DEV__ ? 'verbose' : 'error',
    });
    activated = true;
    if (__DEV__) {
      console.log('[adapty] activated');
    }
  } catch (err) {
    // Don't crash the app on init failure — Premium just stays locked.
    console.warn('[adapty] activate failed:', err);
  }
}

export function isAdaptyActivated(): boolean {
  return activated;
}

/**
 * Restore previous purchases. Apple Guideline 3.1.2(c) requires this from
 * any paywall — without it, App Review rejects.
 *
 * Throws if SDK was never activated or there are no prior purchases on this
 * Apple ID. Callers should catch and show a non-alarming message
 * ("No purchases to restore") for the empty-history case.
 */
export async function restorePurchases() {
  if (!activated) {
    await ensureAdaptyActivated();
  }
  return adapty.restorePurchases();
}
