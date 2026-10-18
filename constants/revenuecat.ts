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

// PASTE PRODUCTION KEYS HERE (or set the EXPO_PUBLIC_ vars in eas.json)
// Never put a "test_" key here: RevenueCat force-closes release builds that
// use one, which is exactly what shipped to Play.
const ANDROID_KEY_FALLBACK = '';
const IOS_KEY_FALLBACK = '';

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

/**
 * Whether the paywall accepts real purchases.
 *
 * False until three things exist: a Play Console merchant account, the
 * three products created there and imported into RevenueCat, and a
 * service account connected so RevenueCat can validate them. Until then
 * the premium screen is a preview only — no purchase button, no free
 * unlock. Flip to true once all three are confirmed live.
 */
export const PURCHASES_ENABLED = false;

/** A key we must not hand to the SDK: missing, a sandbox test key, or an unfilled placeholder. */
function isUnusableKey(key: string): boolean {
  return !/^(goog|appl)_/.test(key);
}

/** The key for this platform, or null when it is missing or a test key. */
export function getUsableKey(platform: string): string | null {
  const key = platform === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
  return isUnusableKey(key) ? null : key;
}
