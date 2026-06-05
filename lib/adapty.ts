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

import { adapty, type AdaptyPaywallProduct, type AdaptyPaywall } from 'react-native-adapty';

let activated = false;

// Default Adapty placement (configured in dashboard). Override via env if needed.
export const PAYWALL_PLACEMENT_ID =
  process.env.EXPO_PUBLIC_ADAPTY_PLACEMENT_ID ?? 'main';

// G5: the #1 cause of a "dead" Start-trial button is a placement-id mismatch
// between the dashboard and the app — `getPaywall('main')` throws (or returns
// no products), products stay null, and the CTA silently does nothing. We don't
// hard-code a single id: try the env-configured one first, then the ids this
// project has used in the Adapty dashboard. Whichever returns products wins,
// and we log it so a future mismatch is debuggable from the Metro console.
const PLACEMENT_CANDIDATES: string[] = Array.from(
  new Set(
    [process.env.EXPO_PUBLIC_ADAPTY_PLACEMENT_ID, 'main', 'main_paywall'].filter(
      Boolean,
    ) as string[],
  ),
);

// Single-flight cache so repeated useEffect renders don't refetch.
let paywallCache: { paywall: AdaptyPaywall; products: AdaptyPaywallProduct[] } | null = null;

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

/**
 * Fetch the paywall + its products for {@link PAYWALL_PLACEMENT_ID}.
 *
 * Returns null on Expo Go (no native module) or when no public key is set —
 * callers should fall back to hardcoded prices. Throws only for genuine
 * Adapty errors so the paywall surface can surface a friendly message.
 *
 * Results are cached per session (single-flight) so render-driven calls
 * don't refetch the placement.
 */
export async function loadPaywallProducts(): Promise<
  { paywall: AdaptyPaywall; products: AdaptyPaywallProduct[] } | null
> {
  if (paywallCache) return paywallCache;
  if (!activated) {
    await ensureAdaptyActivated();
    if (!activated) return null;
  }
  let lastErr: unknown = null;
  for (const placementId of PLACEMENT_CANDIDATES) {
    try {
      const paywall = await adapty.getPaywall(placementId);
      const products = await adapty.getPaywallProducts(paywall);
      if (products && products.length > 0) {
        paywallCache = { paywall, products };
        if (__DEV__) {
          console.log(
            `[adapty] paywall loaded from placement "${placementId}" (${products.length} products)`,
          );
        }
        return paywallCache;
      }
      if (__DEV__) {
        console.log(`[adapty] placement "${placementId}" returned 0 products — trying next`);
      }
    } catch (err) {
      lastErr = err;
      if (__DEV__) {
        console.log(`[adapty] placement "${placementId}" failed:`, err);
      }
    }
  }
  if (__DEV__) {
    console.log('[adapty] loadPaywallProducts: no placement yielded products', lastErr);
  }
  return null;
}

/**
 * G5 — Trial intro-offer helpers.
 *
 * Adapty 3.15 (`@adapty/core`) models a subscription's introductory offer at
 * `product.subscription?.offer`. The native SDK only POPULATES that `offer`
 * (with `identifier.type === 'introductory'`) when StoreKit reports the user
 * is ELIGIBLE for the group's introductory offer. Once a user has consumed the
 * subscription group's one free trial, StoreKit (and therefore Adapty) omits
 * the introductory offer — so its presence IS the eligibility signal. There is
 * no separate `introductoryOfferEligibility` field in this SDK version.
 *
 * A free trial is the offer phase whose `paymentMode === 'free_trial'`; its
 * length is `phase.subscriptionPeriod` (`numberOfUnits` + `unit`).
 */

/** Find the free-trial phase of a product's introductory offer, if any. */
function introTrialPhase(product: AdaptyPaywallProduct | null | undefined) {
  const offer = product?.subscription?.offer;
  if (!offer || offer.identifier.type !== 'introductory') return null;
  return offer.phases.find((ph) => ph.paymentMode === 'free_trial') ?? null;
}

/**
 * Trial length in days for a product's introductory free-trial offer, or null
 * when the product has no such offer (ineligible / not loaded / no trial).
 * Converts the StoreKit period unit to days (week ×7, month ×30, year ×365).
 */
export function getIntroTrialDays(
  product: AdaptyPaywallProduct | null | undefined,
): number | null {
  const phase = introTrialPhase(product);
  if (!phase) return null;
  const { numberOfUnits, unit } = phase.subscriptionPeriod;
  if (!numberOfUnits || numberOfUnits <= 0) return null;
  const perUnit =
    unit === 'day' ? 1 : unit === 'week' ? 7 : unit === 'month' ? 30 : unit === 'year' ? 365 : 0;
  if (perUnit === 0) return null;
  return numberOfUnits * perUnit;
}

/**
 * Eligibility for the introductory free trial:
 *  - 'eligible'   — product loaded AND carries an introductory free-trial offer
 *  - 'ineligible' — product loaded but no introductory free-trial offer
 *                   (user already consumed the group's one offer)
 *  - 'unknown'    — product not loaded (Expo Go / pre-load); StoreKit can't be
 *                   queried, so callers should keep the trial marketing default.
 */
export function getTrialEligibility(
  product: AdaptyPaywallProduct | null | undefined,
): 'eligible' | 'ineligible' | 'unknown' {
  if (!product) return 'unknown';
  return introTrialPhase(product) ? 'eligible' : 'ineligible';
}

/**
 * Invoke StoreKit purchase for a product loaded via {@link loadPaywallProducts}.
 * Returns the resulting profile (with accessLevels) on success.
 * Throws on user cancel or transaction failure — caller must catch.
 */
export async function purchaseProduct(product: AdaptyPaywallProduct) {
  if (!activated) {
    await ensureAdaptyActivated();
  }
  const result = await adapty.makePurchase(product);
  // After purchase: invalidate cache so the next paywall open re-reads the
  // post-purchase profile.
  paywallCache = null;
  return result;
}
