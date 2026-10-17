/**
 * Review access, development builds only.
 *
 * Tapping the version label on Settings the number of times below used to
 * unlock premium locally on any build. That shipped a permanent, offline
 * bypass of the paywall to everyone who heard about the gesture, so it is
 * now compiled out of release builds: REVIEW_ACCESS_ENABLED is false
 * whenever __DEV__ is false, and nothing reads the stored flag in release.
 *
 * It grants nothing on the server either way. It only flips the local flag
 * that hides subscription-only categories.
 *
 * For Play review, grant the reviewer account the entitlement in the
 * RevenueCat dashboard, or add them as a Play licence tester, rather than
 * shipping a gesture that any user can perform.
 */
export const REVIEW_ACCESS_ENABLED = __DEV__;

export const REVIEW_UNLOCK_TAPS = 7;
