import { CATEGORIES, WORDS } from '../data/words';
import type { CategoryKey, Difficulty } from '../data/words';

/**
 * Word updates without an app update.
 *
 * One JSON file over HTTPS, fetched at most once a day and never blocking
 * anything. The whole file is validated before it is trusted and rejected
 * outright if any part of it is wrong, so a broken or hostile feed can only
 * ever leave the player on the last good word list. The bundled words in
 * data/words.ts are always the floor: a feed only ever adds to them.
 */

export const FEED_MAX_BYTES = 1024 * 1024;
export const FEED_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
/** A fetch that hangs must not keep a timer alive all session. */
export const FEED_TIMEOUT_MS = 8000;

const MAX_WORD_LENGTH = 40;
const MAX_WORDS_PER_PACK = 500;
const MAX_PACKS = 50;
/** Letters, digits, spaces and the punctuation a word can legitimately carry. */
const PLAIN_WORD = /^[\p{L}\p{N} '’&.\-]+$/u;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const KNOWN_CATEGORIES = new Set<string>(CATEGORIES.map(c => c.id));

export interface WordPack {
  category: CategoryKey;
  id: string;
  title: string;
  free?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  words: Record<Difficulty, string[]>;
}

export interface WordsFeed {
  version: number;
  updatedAt: string;
  packs: WordPack[];
}

function isPlainWord(value: unknown): value is string {
  return (
    typeof value === 'string'
    && value.trim().length > 0
    && value.length <= MAX_WORD_LENGTH
    && PLAIN_WORD.test(value)
  );
}

/**
 * Returns the feed only if every part of it is valid. One bad word, one
 * unknown category or one wrong type rejects the whole file.
 */
export function validateFeed(raw: unknown): WordsFeed | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const feed = raw as Record<string, unknown>;

  if (typeof feed.version !== 'number' || !Number.isInteger(feed.version) || feed.version < 1) {
    return null;
  }
  if (typeof feed.updatedAt !== 'string' || !ISO_DATE.test(feed.updatedAt)) return null;
  if (!Array.isArray(feed.packs) || feed.packs.length > MAX_PACKS) return null;

  const packs: WordPack[] = [];
  const seenIds = new Set<string>();

  for (const entry of feed.packs) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const pack = entry as Record<string, unknown>;

    if (typeof pack.category !== 'string' || !KNOWN_CATEGORIES.has(pack.category)) return null;
    if (typeof pack.id !== 'string' || pack.id.length === 0 || pack.id.length > 64) return null;
    if (seenIds.has(pack.id)) return null;
    seenIds.add(pack.id);
    if (typeof pack.title !== 'string' || pack.title.length === 0 || pack.title.length > 64) {
      return null;
    }
    if (pack.free !== undefined && typeof pack.free !== 'boolean') return null;
    for (const key of ['availableFrom', 'availableUntil'] as const) {
      const v = pack[key];
      if (v !== undefined && (typeof v !== 'string' || !ISO_DATE.test(v))) return null;
    }

    if (!pack.words || typeof pack.words !== 'object' || Array.isArray(pack.words)) return null;
    const rawWords = pack.words as Record<string, unknown>;
    // Only the three known difficulties; anything else is a malformed feed.
    for (const key of Object.keys(rawWords)) {
      if (!DIFFICULTIES.includes(key as Difficulty)) return null;
    }

    const words = { easy: [], medium: [], hard: [] } as Record<Difficulty, string[]>;
    let total = 0;
    for (const difficulty of DIFFICULTIES) {
      const list = rawWords[difficulty];
      if (list === undefined) continue;
      if (!Array.isArray(list)) return null;
      for (const word of list) {
        if (!isPlainWord(word)) return null;
        words[difficulty].push(word.trim());
      }
      total += words[difficulty].length;
    }
    if (total === 0 || total > MAX_WORDS_PER_PACK) return null;

    packs.push({
      category: pack.category as CategoryKey,
      id: pack.id,
      title: pack.title,
      free: pack.free as boolean | undefined,
      availableFrom: pack.availableFrom as string | undefined,
      availableUntil: pack.availableUntil as string | undefined,
      words,
    });
  }

  return { version: feed.version, updatedAt: feed.updatedAt, packs };
}

/** Parses and validates raw response text, size limit included. */
export function parseFeed(text: string): WordsFeed | null {
  // Counted in bytes, not characters, so multi-byte words cannot slip past.
  const bytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(text).length
    : text.length;
  if (bytes > FEED_MAX_BYTES) return null;
  try {
    return validateFeed(JSON.parse(text));
  } catch {
    return null;
  }
}

/** A pack counts today if it has started and has not finished. */
export function isPackActive(pack: WordPack, today: Date = new Date()): boolean {
  const day = today.toISOString().slice(0, 10);
  if (pack.availableFrom && day < pack.availableFrom) return false;
  if (pack.availableUntil && day > pack.availableUntil) return false;
  return true;
}

/**
 * Bundled words plus every active pack. Duplicates are dropped so a pack
 * that repeats a bundled word does not make it twice as likely.
 */
export function mergeWords(
  feed: WordsFeed | null,
  today: Date = new Date()
): Record<CategoryKey, Record<Difficulty, string[]>> {
  const merged = {} as Record<CategoryKey, Record<Difficulty, string[]>>;
  for (const category of Object.keys(WORDS) as CategoryKey[]) {
    merged[category] = {
      easy: [...WORDS[category].easy],
      medium: [...WORDS[category].medium],
      hard: [...WORDS[category].hard],
    };
  }
  if (!feed) return merged;

  for (const pack of feed.packs) {
    if (!isPackActive(pack, today)) continue;
    const target = merged[pack.category];
    if (!target) continue;
    for (const difficulty of DIFFICULTIES) {
      const existing = new Set(target[difficulty].map(w => w.toLowerCase()));
      for (const word of pack.words[difficulty]) {
        if (existing.has(word.toLowerCase())) continue;
        existing.add(word.toLowerCase());
        target[difficulty].push(word);
      }
    }
  }
  return merged;
}

export function countWords(
  words: Record<CategoryKey, Record<Difficulty, string[]>>
): number {
  return (Object.keys(words) as CategoryKey[]).reduce(
    (n, c) => n + words[c].easy.length + words[c].medium.length + words[c].hard.length,
    0
  );
}

/** How many words an accepted feed adds on top of the bundled list. */
export function newWordCount(feed: WordsFeed | null, today: Date = new Date()): number {
  if (!feed) return 0;
  return countWords(mergeWords(feed, today)) - countWords(mergeWords(null, today));
}

/** The titles of the active packs, for the New words sheet. */
export function activePackTitles(feed: WordsFeed | null, today: Date = new Date()): string[] {
  if (!feed) return [];
  const titles = feed.packs.filter(p => isPackActive(p, today)).map(p => p.title);
  return [...new Set(titles)];
}
