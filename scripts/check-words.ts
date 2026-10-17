/**
 * Fails the build if any shipped word is on the blocked list.
 *
 * Checks both sources a player can be shown a word from: the bundled list
 * in data/words.ts and the hosted feed in public/words/feed.json. The feed
 * is also run through the app's own validator, so a file that the app would
 * reject at runtime fails here instead of shipping quietly.
 *
 * Run with `npm run check-words`; also runs as part of `npm test`.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { WORDS } from '../data/words.ts';
import type { CategoryKey, Difficulty } from '../data/words.ts';
import { validateFeed } from '../utils/wordsFeed.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

/** Lower case, letters and digits only, so spacing and punctuation cannot hide a word. */
function normalise(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

interface Finding {
  source: string;
  category: string;
  difficulty: string;
  word: string;
  blocked: string;
}

function main(): number {
  const blockedFile = JSON.parse(
    readFileSync(join(root, 'data/blocked-words.json'), 'utf8')
  ) as { blocked: string[] };
  const blocked = blockedFile.blocked.map(normalise).filter(Boolean);

  if (blocked.length === 0) {
    console.error('check-words: the blocked list is empty.');
    return 1;
  }

  const findings: Finding[] = [];
  let checked = 0;

  const blockedSet = new Set(blocked);

  const check = (source: string, category: string, difficulty: string, word: string) => {
    checked += 1;
    // Matched whole, and per token for multi-word entries. Deliberately not
    // a substring match: that flagged "Hammock" for "ammo" and "Sextant"
    // for "sex". Compound forms worth blocking go in the list explicitly.
    const candidates = [normalise(word), ...word.split(/[\s-]+/).map(normalise)];
    const hit = candidates.find(c => c.length > 0 && blockedSet.has(c));
    if (hit) findings.push({ source, category, difficulty, word, blocked: hit });
  };

  for (const category of Object.keys(WORDS) as CategoryKey[]) {
    for (const difficulty of DIFFICULTIES) {
      for (const word of WORDS[category][difficulty]) {
        check('bundled', category, difficulty, word);
      }
    }
  }

  // The hosted feed, if one is committed.
  let feedWords = 0;
  try {
    const raw = readFileSync(join(root, 'public/words/feed.json'), 'utf8');
    const feed = validateFeed(JSON.parse(raw));
    if (!feed) {
      console.error('check-words: public/words/feed.json does not pass the app validator.');
      return 1;
    }
    for (const pack of feed.packs) {
      for (const difficulty of DIFFICULTIES) {
        for (const word of pack.words[difficulty]) {
          feedWords += 1;
          check(`feed:${pack.id}`, pack.category, difficulty, word);
        }
      }
    }
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT') {
      console.error('check-words: could not read public/words/feed.json:', err.message);
      return 1;
    }
  }

  if (findings.length > 0) {
    console.error(`check-words: ${findings.length} blocked word(s) found.\n`);
    for (const f of findings) {
      console.error(`  ${f.source} / ${f.category} / ${f.difficulty}: "${f.word}" matches "${f.blocked}"`);
    }
    console.error('\nRemove the word, or justify it and amend data/blocked-words.json.');
    return 1;
  }

  console.log(
    `check-words: ${checked} words checked `
    + `(${checked - feedWords} bundled, ${feedWords} from the feed) against `
    + `${blocked.length} blocked terms. Clean.`
  );
  return 0;
}

process.exit(main());
