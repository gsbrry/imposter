/**
 * In-app support.
 *
 * SUPPORT_EMAIL is the one place the address lives. The Help screen shows it
 * as plain text next to a copy button, so a player with no mail app set up
 * can still reach us, and the Report form uses it as the destination.
 */
export const SUPPORT_EMAIL = 'gsbrry@gmail.com';

/** Where Play sends people to manage or cancel a subscription. */
export const PLAY_SUBSCRIPTIONS_URL =
  'https://play.google.com/store/account/subscriptions';

/**
 * The marketing site. One place to change if the domain moves: the policy,
 * terms, support page and the words feed all hang off it.
 */
export const WEB_ORIGIN = 'https://apps.obio.in/imposter';

/** Sections of the one-page site. There is no second copy of the policy. */
export const PRIVACY_URL = `${WEB_ORIGIN}/#privacy`;

/**
 * The hosted word feed. The app reads EXPO_PUBLIC_WORDS_FEED_URL in
 * preference to this, so a build can be pointed elsewhere without a code
 * change; this is the default the repo ships with.
 */
export const WORDS_FEED_URL = `${WEB_ORIGIN}/words/feed.json`;

/** How long we tell people to expect to wait. */
export const SUPPORT_REPLY_TIME = 'We reply within 2 working days.';

export interface QuickAnswer {
  question: string;
  answer: string;
}

export const QUICK_ANSWERS: QuickAnswer[] = [
  {
    question: 'Does it need internet?',
    answer:
      'No. Every word is bundled with the app, so a whole game works in airplane mode. '
      + 'A connection is only used to check a purchase.',
  },
  {
    question: 'How many players can play?',
    answer:
      'Three to fifteen on one phone. Pass it round: everyone sees their word, '
      + 'then the clues go in the order the Who starts screen picks.',
  },
  {
    question: 'How do I get my purchase back on a new phone?',
    answer:
      'Sign in to the same Google account, open Premium and tap Restore. '
      + 'Your plan is tied to the account that bought it, not the phone.',
  },
];

export type ReportType = 'Bug' | 'Bad word' | 'Purchase' | 'Other';

export const REPORT_TYPES: ReportType[] = ['Bug', 'Bad word', 'Purchase', 'Other'];

/** Keeps a report short enough to stay inside a mailto URL. */
export const REPORT_MAX_LENGTH = 600;
