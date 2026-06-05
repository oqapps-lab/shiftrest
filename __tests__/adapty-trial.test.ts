/**
 * G5 — unit tests for the trial intro-offer derivation in lib/adapty.ts.
 *
 * These are pure functions over the AdaptyPaywallProduct shape (Adapty 3.15):
 *   product.subscription?.offer.identifier.type === 'introductory'
 *   + a phase with paymentMode === 'free_trial' whose subscriptionPeriod
 *     gives the trial length.
 *
 * Eligibility model: the native SDK only POPULATES `offer` when StoreKit
 * reports the user is eligible, so offer presence == eligibility. There is no
 * separate introductoryOfferEligibility field in this SDK version.
 */

import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { getIntroTrialDays, getTrialEligibility } from '../lib/adapty';

// Minimal product factory matching the runtime shape Adapty returns.
function makeProduct(
  trial?: { numberOfUnits: number; unit: 'day' | 'week' | 'month' | 'year' },
  offerType: 'introductory' | 'promotional' = 'introductory',
  paymentMode: 'free_trial' | 'pay_up_front' = 'free_trial',
): AdaptyPaywallProduct {
  const base: Record<string, unknown> = {
    vendorProductId: 'shiftrest.premium.yearly',
    price: { amount: 49.99, currencyCode: 'USD', localizedString: '$49.99' },
  };
  if (trial) {
    base.subscription = {
      subscriptionPeriod: { numberOfUnits: 1, unit: 'year' },
      offer: {
        identifier: offerType === 'introductory' ? { type: 'introductory' } : { type: 'promotional', id: 'x' },
        phases: [
          {
            numberOfPeriods: 1,
            paymentMode,
            price: { amount: 0, currencyCode: 'USD', localizedString: '$0.00' },
            subscriptionPeriod: trial,
          },
        ],
      },
    };
  }
  // Cast through unknown — the test only exercises the fields the functions read.
  return base as unknown as AdaptyPaywallProduct;
}

describe('getIntroTrialDays', () => {
  it('reads a 7-day trial (P7D)', () => {
    expect(getIntroTrialDays(makeProduct({ numberOfUnits: 7, unit: 'day' }))).toBe(7);
  });
  it('reads a 3-day trial (P3D)', () => {
    expect(getIntroTrialDays(makeProduct({ numberOfUnits: 3, unit: 'day' }))).toBe(3);
  });
  it('converts a 1-week trial to 7 days', () => {
    expect(getIntroTrialDays(makeProduct({ numberOfUnits: 1, unit: 'week' }))).toBe(7);
  });
  it('converts a 1-month trial to 30 days', () => {
    expect(getIntroTrialDays(makeProduct({ numberOfUnits: 1, unit: 'month' }))).toBe(30);
  });
  it('returns null when there is no offer (ineligible)', () => {
    expect(getIntroTrialDays(makeProduct())).toBeNull();
  });
  it('returns null when product is not loaded', () => {
    expect(getIntroTrialDays(null)).toBeNull();
    expect(getIntroTrialDays(undefined)).toBeNull();
  });
  it('ignores a non-free_trial intro phase (pay-up-front)', () => {
    expect(getIntroTrialDays(makeProduct({ numberOfUnits: 7, unit: 'day' }, 'introductory', 'pay_up_front'))).toBeNull();
  });
  it('ignores a promotional (non-introductory) offer', () => {
    expect(getIntroTrialDays(makeProduct({ numberOfUnits: 7, unit: 'day' }, 'promotional'))).toBeNull();
  });
});

describe('getTrialEligibility', () => {
  it('is "eligible" when an introductory free-trial offer is present', () => {
    expect(getTrialEligibility(makeProduct({ numberOfUnits: 7, unit: 'day' }))).toBe('eligible');
  });
  it('is "ineligible" when the loaded product has no intro free-trial offer', () => {
    expect(getTrialEligibility(makeProduct())).toBe('ineligible');
  });
  it('is "ineligible" when the offer is promotional only', () => {
    expect(getTrialEligibility(makeProduct({ numberOfUnits: 7, unit: 'day' }, 'promotional'))).toBe('ineligible');
  });
  it('is "unknown" when the product is not loaded (Expo Go / pre-load)', () => {
    expect(getTrialEligibility(null)).toBe('unknown');
    expect(getTrialEligibility(undefined)).toBe('unknown');
  });
});
