/**
 * RevenueCat configuration.
 *
 * These are the PUBLIC SDK keys. RevenueCat issues a separate one per
 * platform and intends them to ship inside the app binary, so they are
 * safe to commit. The v1 SECRET key from the dashboard is a different
 * thing entirely and must never appear in this file.
 *
 * To go live, paste the production keys below (or set the matching
 * EXPO_PUBLIC_ vars). Find them in the RevenueCat dashboard under
 * Project settings > API keys > Public app-specific SDK keys.
 *   Android (Google Play) keys start with "goog_"
 *   iOS (App Store) keys start with "appl_"
 */

// PASTE PRODUCTION KEYS HERE
const ANDROID_KEY_FALLBACK = 'test_OoPSKqHBmWqxGxprtfMWFIPGrVO';
const IOS_KEY_FALLBACK = 'test_OoPSKqHBmWqxGxprtfMWFIPGrVO';

export const RC_ANDROID_KEY =
  process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? ANDROID_KEY_FALLBACK;
export const RC_IOS_KEY =
  process.env.EXPO_PUBLIC_RC_IOS_KEY ?? IOS_KEY_FALLBACK;

/** Must match the entitlement identifier in the RevenueCat dashboard exactly. */
export const ENTITLEMENT_ID = 'in.Impostr.gooseberrymedia Pro';

export const PRODUCTS = {
  monthly: 'monthly',
  yearly: 'yearly',
  lifetime: 'lifetime',
};

/** True while the keys are still RevenueCat's sandbox test keys. */
export const IS_PLACEHOLDER_RC_KEY =
  RC_ANDROID_KEY.startsWith('test_') || RC_IOS_KEY.startsWith('test_');
