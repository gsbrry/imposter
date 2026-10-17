import test from 'node:test';
import assert from 'node:assert/strict';
import { startProgress, nextTurn, oneMoreRound, isFinalTurn } from './clueRounds.ts';

const ORDER = ['p3', 'p4', 'p0', 'p1', 'p2'];

/** Walk the clue rounds to the end, recording who speaks on each turn. */
function walk(totalRounds: number, addRoundsAtEnd = 0) {
  const spoke: string[] = [];
  const headers: string[] = [];
  let p = startProgress(totalRounds);
  let extras = addRoundsAtEnd;

  for (let guard = 0; guard < 200; guard++) {
    spoke.push(ORDER[p.index]);
    headers.push(`${p.round} of ${p.totalRounds}`);
    const next = nextTurn(p, ORDER.length);
    if (next) { p = next; continue; }
    if (extras > 0) { extras -= 1; p = oneMoreRound(p); continue; }
    return { spoke, headers };
  }
  throw new Error('clue rounds did not finish');
}

test('one more round adds exactly one pass in the same order', () => {
  const base = walk(2);
  const extended = walk(2, 1);

  assert.equal(base.spoke.length, ORDER.length * 2);
  assert.equal(extended.spoke.length, ORDER.length * 3);
  // Everything before the extra pass is untouched.
  assert.deepEqual(extended.spoke.slice(0, base.spoke.length), base.spoke);
  // The extra pass is the same order, once.
  assert.deepEqual(extended.spoke.slice(base.spoke.length), ORDER);
});

test('the header bumps to round N+1 of N+1 and can be used again', () => {
  const once = walk(2, 1);
  assert.equal(once.headers[once.headers.length - 1], '3 of 3');

  const twice = walk(2, 2);
  assert.equal(twice.spoke.length, ORDER.length * 4);
  assert.equal(twice.headers[twice.headers.length - 1], '4 of 4');
  assert.deepEqual(twice.spoke.slice(ORDER.length * 3), ORDER);
});

test('the final turn is the last player of the last round', () => {
  assert.equal(isFinalTurn({ index: 4, round: 2, totalRounds: 2 }, 5), true);
  assert.equal(isFinalTurn({ index: 3, round: 2, totalRounds: 2 }, 5), false);
  assert.equal(isFinalTurn({ index: 4, round: 1, totalRounds: 2 }, 5), false);
  // After one more round the old final turn is no longer final.
  assert.equal(
    isFinalTurn(oneMoreRound({ index: 4, round: 2, totalRounds: 2 }), 5),
    false,
  );
});

test('a round never starts anywhere but the top of the order', () => {
  const p = nextTurn({ index: 4, round: 1, totalRounds: 3 }, 5);
  assert.deepEqual(p, { index: 0, round: 2, totalRounds: 3 });
  assert.deepEqual(oneMoreRound({ index: 4, round: 3, totalRounds: 3 }), {
    index: 0, round: 4, totalRounds: 4,
  });
});
