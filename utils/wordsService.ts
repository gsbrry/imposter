import type { CategoryKey, Difficulty } from '../data/words';
import { storage } from './storage';
import {
  parseFeed, validateFeed, mergeWords, countWords,
  FEED_CHECK_INTERVAL_MS, FEED_TIMEOUT_MS,
} from './wordsFeed';
import type { WordsFeed } from './wordsFeed';
import { WORDS_FEED_URL } from '../constants/support';

/**
 * The app's view of the word list: bundled words, plus whatever the last
 * accepted feed added. Everything here degrades to the bundled list, so a
 * device in airplane mode behaves exactly as it did before feeds existed.
 */

const FEED_URL = process.env.EXPO_PUBLIC_WORDS_FEED_URL || WORDS_FEED_URL;

export const WORD_UPDATES_ENABLED = FEED_URL.length > 0;

/** Cached for the session so screens do not re-parse on every render. */
let cachedFeed: WordsFeed | null = null;
let cacheLoaded = false;

export async function loadCachedFeed(): Promise<WordsFeed | null> {
  if (cacheLoaded) return cachedFeed;
  const raw = await storage.getWordsFeed();
  // Re-validated on read: a cache written by an older, laxer build, or
  // edited on a rooted device, still has to pass today's rules.
  cachedFeed = raw ? validateFeed(raw) : null;
  cacheLoaded = true;
  return cachedFeed;
}

export async function getWords(): Promise<Record<CategoryKey, Record<Difficulty, string[]>>> {
  return mergeWords(await loadCachedFeed());
}

export async function getTotalWordCount(): Promise<number> {
  return countWords(await getWords());
}

/** The date the live list was published, or null while only bundled words are in play. */
export async function getWordsUpdatedAt(): Promise<string | null> {
  const feed = await loadCachedFeed();
  return feed?.updatedAt ?? null;
}

export interface FeedCheckResult {
  /** True when a newer, valid feed was accepted. */
  updated: boolean;
  /** True when we actually went to the network. */
  checked: boolean;
  feed: WordsFeed | null;
}

/**
 * Fetches the feed if it is due, or always when `force` is set by the
 * Check button. Never throws and never blocks: any failure leaves the last
 * good feed in place and returns `updated: false`.
 */
export async function checkForNewWords(force = false): Promise<FeedCheckResult> {
  const current = await loadCachedFeed();
  if (!WORD_UPDATES_ENABLED) return { updated: false, checked: false, feed: current };

  if (!force) {
    const lastChecked = await storage.getWordsFeedCheckedAt();
    if (Date.now() - lastChecked < FEED_CHECK_INTERVAL_MS) {
      return { updated: false, checked: false, feed: current };
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return { updated: false, checked: true, feed: current };

    const text = await response.text();
    const next = parseFeed(text);
    // A feed that fails any check is discarded whole; the last good one stays.
    if (!next) return { updated: false, checked: true, feed: current };
    // Never go backwards: an older version is not an update.
    if (current && next.version <= current.version) {
      await storage.setWordsFeedCheckedAt(Date.now());
      return { updated: false, checked: true, feed: current };
    }

    await storage.setWordsFeed(next);
    cachedFeed = next;
    cacheLoaded = true;
    return { updated: true, checked: true, feed: next };
  } catch {
    // Offline, timed out, or malformed. Nothing changes.
    return { updated: false, checked: true, feed: current };
  } finally {
    clearTimeout(timer);
    await storage.setWordsFeedCheckedAt(Date.now()).catch(() => {});
  }
}

/**
 * Whether the New words sheet still owes the player a look at this feed.
 * Shown once per feed version.
 */
export async function pendingNewWords(): Promise<WordsFeed | null> {
  const feed = await loadCachedFeed();
  if (!feed || feed.packs.length === 0) return null;
  const seen = await storage.getWordsFeedSeenVersion();
  return feed.version > seen ? feed : null;
}

export async function markNewWordsSeen(version: number): Promise<void> {
  await storage.setWordsFeedSeenVersion(version);
}

/** Test seam: drops the in-memory cache so the next read hits storage. */
export function resetFeedCache(): void {
  cachedFeed = null;
  cacheLoaded = false;
}
