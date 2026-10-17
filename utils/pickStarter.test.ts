import test from 'node:test';
import assert from 'node:assert/strict';
import { pickStarter, clueOrder } from './pickStarter.ts';

const PLAYERS = ['p0', 'p1', 'p2', 'p3', 'p4'];
const GAMES = 100;

test('100 games of 5 players share the start fairly', () => {
  const starts: Record<string, number> = Object.fromEntries(PLAYERS.map(id => [id, 0]));
  let imposterStarts = 0;
  let lastStarter: string | null = null;

  for (let g = 0; g < GAMES; g++) {
    // A fresh imposter each game, drawn independently of the starter.
    const imposter = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    const starter = pickStarter(PLAYERS, lastStarter);
    assert.ok(starter !== null, 'a starter is always drawn');

    assert.notEqual(starter, lastStarter, 'nobody starts two games in a row');

    starts[starter!] += 1;
    if (starter === imposter) imposterStarts += 1;
    lastStarter = starter;
  }

  for (const id of PLAYERS) {
    assert.ok(starts[id] > 0, `${id} never started in ${GAMES} games`);
  }

  // One in five, with room for the noise in 100 draws.
  const rate = imposterStarts / GAMES;
  assert.ok(
    rate > 0.08 && rate < 0.34,
    `imposter started ${imposterStarts} of ${GAMES} games, expected near 20`,
  );
});

test('two players can start back to back, three or more cannot', () => {
  // With two players, sitting the last starter out would fix the order.
  const two = ['a', 'b'];
  const seen = new Set<string>();
  for (let i = 0; i < 50; i++) seen.add(pickStarter(two, 'a')!);
  assert.deepEqual([...seen].sort(), ['a', 'b']);

  const three = ['a', 'b', 'c'];
  for (let i = 0; i < 50; i++) assert.notEqual(pickStarter(three, 'a'), 'a');
});

test('the draw is uniform over the eligible players', () => {
  // A stubbed random proves the pick is an index, not a biased sort.
  assert.equal(pickStarter(PLAYERS, null, () => 0), 'p0');
  assert.equal(pickStarter(PLAYERS, null, () => 0.999), 'p4');
  assert.equal(pickStarter(PLAYERS, 'p0', () => 0), 'p1');
});

test('clue order wraps round from the starter', () => {
  const players = PLAYERS.map(id => ({ id }));
  assert.deepEqual(
    clueOrder(players, 'p3').map(p => p.id),
    ['p3', 'p4', 'p0', 'p1', 'p2'],
  );
  assert.deepEqual(clueOrder(players, 'p0').map(p => p.id), PLAYERS);
  assert.deepEqual(clueOrder(players, null).map(p => p.id), PLAYERS);
});
