import test from 'node:test';
import assert from 'node:assert/strict';
import { tallyVotes } from './tallyVotes.ts';
import type { Ballots } from './tallyVotes.ts';

test('a skipped ballot counts for nobody but is still counted as cast', () => {
  const ballots: Ballots = { a: 'd', b: 'd', c: null, d: 'a', e: null };
  const t = tallyVotes(ballots, 5);

  assert.deepEqual(t.counts, { d: 2, a: 1 });
  assert.equal(t.skipped, 2);
  assert.equal(t.cast, 5);
  assert.equal(t.leaderId, 'd');
  assert.deepEqual(t.tiedIds, []);
  assert.equal(t.allSkipped, false);

  // Percentages are of the whole table, so the skips show as the remainder.
  assert.deepEqual(t.ranked, [
    { id: 'd', count: 2, percent: 40 },
    { id: 'a', count: 1, percent: 20 },
  ]);
});

test('one real vote among skips still carries', () => {
  const t = tallyVotes({ a: null, b: null, c: 'a', d: null, e: null }, 5);
  assert.equal(t.leaderId, 'a');
  assert.equal(t.skipped, 4);
  assert.deepEqual(t.tiedIds, []);
  assert.equal(t.allSkipped, false);
});

test('skips do not create or break a tie', () => {
  const tie = tallyVotes({ a: 'c', b: 'd', c: null, d: null }, 4);
  assert.deepEqual(tie.tiedIds.sort(), ['c', 'd']);
  assert.equal(tie.leaderId, null);
  assert.equal(tie.skipped, 2);
  assert.equal(tie.allSkipped, false);
});

test('every ballot skipped gives the skipped state and nobody voted out', () => {
  const t = tallyVotes({ a: null, b: null, c: null, d: null, e: null }, 5);

  assert.equal(t.allSkipped, true);
  assert.equal(t.skipped, 5);
  assert.deepEqual(t.counts, {});
  assert.deepEqual(t.ranked, []);
  assert.equal(t.leaderId, null);
  assert.deepEqual(t.tiedIds, []);
});

test('no ballots cast at all is not the skipped state', () => {
  const t = tallyVotes({}, 5);
  assert.equal(t.allSkipped, false);
  assert.equal(t.cast, 0);
  assert.equal(t.leaderId, null);
});
