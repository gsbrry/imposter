/**
 * Review access.
 *
 * Google Play reviewers cannot create accounts, use their own, or take a
 * free trial, so without this they could never see the subscription-only
 * categories. Tapping the version label on the Settings screen the number
 * of times below unlocks premium locally on that device.
 *
 * This grants nothing on the server: it only flips the local flag that
 * hides locked categories. It is documented in the Play Console "Sign in
 * details" declaration so reviewers know the gesture.
 */
export const REVIEW_UNLOCK_TAPS = 7;
