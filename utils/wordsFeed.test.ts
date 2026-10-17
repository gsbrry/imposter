import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateFeed, parseFeed, mergeWords, countWords, isPackActive,
  newWordCount, activePackTitles, FEED_MAX_BYTES,
} from './wordsFeed.ts';

const GOOD = {
  version: 2,
  updatedAt: '2026-10-15',
  packs: [
    {
      category: 'general',
      id: 'general-additions-3',
      title: 'General',
      free: true,
      words: { easy: ['Umbrella'], medium: ['Lighthouse'], hard: ['Sundial'] },
    },
  ],
};

// The fixtures are deliberately loose: the point is to feed the validator
// shapes TypeScript would not otherwise allow.
const clone = (v: unknown): any => JSON.parse(JSON.stringify(v));

test('a well formed feed is accepted', () => {
  const feed = validateFeed(clone(GOOD));
  assert.ok(feed);
  assert.equal(feed!.version, 2);
  assert.equal(feed!.packs.length, 1);
  assert.deepEqual(feed!.packs[0].words.easy, ['Umbrella']);
});

test('the whole feed is rejected if any part of it is wrong', () => {
  const bad: [string, (f: any) => void][] = [
    ['missing version', f => { delete f.version; }],
    ['version is not an integer', f => { f.version = 1.5; }],
    ['version below one', f => { f.version = 0; }],
    ['updatedAt is not a date', f => { f.updatedAt = 'last Tuesday'; }],
    ['packs is not an array', f => { f.packs = {}; }],
    ['unknown category', f => { f.packs[0].category = 'politics'; }],
    ['duplicate pack id', f => { f.packs.push(clone(f.packs[0])); }],
    ['missing title', f => { delete f.packs[0].title; }],
    ['word is a number', f => { f.packs[0].words.easy = [42]; }],
    ['word is an object', f => { f.packs[0].words.easy = [{ word: 'Umbrella' }]; }],
    ['word is empty', f => { f.packs[0].words.easy = ['   ']; }],
    ['word is too long', f => { f.packs[0].words.easy = ['x'.repeat(41)]; }],
    ['word carries markup', f => { f.packs[0].words.easy = ['<script>alert(1)</script>']; }],
    ['unknown difficulty', f => { f.packs[0].words.expert = ['Thing']; }],
    ['difficulty is not an array', f => { f.packs[0].words.easy = 'Umbrella'; }],
    ['pack has no words at all', f => { f.packs[0].words = { easy: [], medium: [], hard: [] }; }],
    ['bad availableFrom', f => { f.packs[0].availableFrom = '25-10-2026'; }],
  ];

  for (const [name, mutate] of bad) {
    const feed = clone(GOOD);
    mutate(feed);
    assert.equal(validateFeed(feed), null, `should reject: ${name}`);
  }
});

test('non-objects are rejected', () => {
  for (const v of [null, undefined, 'feed', 7, [], true]) {
    assert.equal(validateFeed(v), null);
  }
});

test('a feed over 1 MB is rejected before it is parsed', () => {
  const big = { ...clone(GOOD) } as any;
  big.packs[0].words.easy = Array.from({ length: 120000 }, (_, i) => `Word${i}`);
  const text = JSON.stringify(big);
  assert.ok(text.length > FEED_MAX_BYTES);
  assert.equal(parseFeed(text), null);
});

test('malformed JSON is rejected without throwing', () => {
  assert.equal(parseFeed('{ not json'), null);
  assert.equal(parseFeed(''), null);
});

test('the bundled list is the floor and a feed only adds to it', () => {
  const bundled = countWords(mergeWords(null));
  const merged = mergeWords(validateFeed(clone(GOOD)));
  assert.equal(countWords(merged), bundled + 3);
  assert.ok(merged.general.easy.includes('Umbrella'));
});

test('a word already in the bundled list is not added twice', () => {
  const feed = clone(GOOD);
  // "Chair" is in the bundled general easy list.
  feed.packs[0].words.easy = ['Chair', 'Umbrella'];
  const bundled = countWords(mergeWords(null));
  assert.equal(countWords(mergeWords(validateFeed(feed))), bundled + 3);
});

test('a festival pack appears and disappears on its dates', () => {
  const feed = clone(GOOD);
  feed.packs[0].availableFrom = '2026-10-25';
  feed.packs[0].availableUntil = '2026-11-15';
  const valid = validateFeed(feed)!;
  const pack = valid.packs[0];

  assert.equal(isPackActive(pack, new Date('2026-10-24T12:00:00Z')), false);
  assert.equal(isPackActive(pack, new Date('2026-10-25T12:00:00Z')), true);
  assert.equal(isPackActive(pack, new Date('2026-11-15T12:00:00Z')), true);
  assert.equal(isPackActive(pack, new Date('2026-11-16T12:00:00Z')), false);

  const bundled = countWords(mergeWords(null));
  assert.equal(countWords(mergeWords(valid, new Date('2026-10-24T12:00:00Z'))), bundled);
  assert.equal(countWords(mergeWords(valid, new Date('2026-11-01T12:00:00Z'))), bundled + 3);
  assert.equal(countWords(mergeWords(valid, new Date('2026-12-01T12:00:00Z'))), bundled);

  assert.deepEqual(activePackTitles(valid, new Date('2026-11-01T12:00:00Z')), ['General']);
  assert.deepEqual(activePackTitles(valid, new Date('2026-12-01T12:00:00Z')), []);
});

test('newWordCount reports only what the feed adds today', () => {
  const valid = validateFeed(clone(GOOD))!;
  assert.equal(newWordCount(valid), 3);
  assert.equal(newWordCount(null), 0);
});

test('the committed feed passes its own validator', async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const here = dirname(import.meta.filename);
  const raw = readFileSync(join(here, '..', 'public', 'words', 'feed.json'), 'utf8');
  const feed = parseFeed(raw);
  assert.ok(feed, 'public/words/feed.json must be valid');
  // It ships with no extra packs, so the app runs on bundled words alone.
  assert.deepEqual(feed!.packs, []);
});
