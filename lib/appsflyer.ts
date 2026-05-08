/**
 * AppsFlyer SDK init.
 *
 * Activate once at app launch (called from `app/_layout.tsx` mount). Tracks
 * install attribution + in-app events. The SDK pulls Apple Search Ads
 * referrer + IDFA (after ATT consent) + UA strings for fingerprinting.
 *
 * Native module is not available in Expo Go — wire-up is no-op there. Lands
 * in dev/preview/production builds via EAS.
 *
 * Once attribution is wired we can pass install/conversion events into Apple
 * Search Ads campaigns and into our own analytics. Dev key is account-wide
 * (one across all 9 OQapps). Apple App ID is the numeric ASC id.
 */

import { Platform } from 'react-native';

let initialized = false;

export async function ensureAppsFlyerInit(): Promise<void> {
  if (initialized) return;
  const devKey = process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY;
  const appId = process.env.EXPO_PUBLIC_APPSFLYER_APP_ID;
  if (!devKey) {
    if (__DEV__) {
      console.log('[appsflyer] EXPO_PUBLIC_APPSFLYER_DEV_KEY missing — skipping init');
    }
    return;
  }

  // Lazy-require the SDK. In Expo Go the native module isn't bundled and
  // require() will throw a friendly "module not found" error — catch it so
  // the app keeps working during development.
  let appsFlyer: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    appsFlyer = require('react-native-appsflyer').default;
  } catch (err) {
    if (__DEV__) {
      console.log('[appsflyer] native module not bundled (Expo Go?) — skipping init');
    }
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      appsFlyer.initSdk(
        {
          devKey,
          isDebug: __DEV__,
          appId: Platform.OS === 'ios' ? appId : undefined,
          onInstallConversionDataListener: false,
          onDeepLinkListener: true,
          timeToWaitForATTUserAuthorization: 10,
        },
        (result: unknown) => {
          if (__DEV__) {
            console.log('[appsflyer] initSdk →', result);
          }
          resolve();
        },
        (error: unknown) => {
          console.warn('[appsflyer] initSdk error:', error);
          reject(error);
        },
      );
    });
    initialized = true;
  } catch (err) {
    // Don't crash on init failure — attribution just won't be tracked.
    console.warn('[appsflyer] init failed:', err);
  }
}

export function isAppsFlyerInitialized(): boolean {
  return initialized;
}
