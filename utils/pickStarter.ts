/**
 * Who starts the clue rounds.
 *
 * The imposter is never excluded from the draw. If the starter could never be
 * the imposter, the starter would be known to be innocent, which gives the
 * game away. With three or more players the previous starter sits out one
 * game, so the same person does not open two games in a row.
 */
export function pickStarter(
  playerIds: string[],
  lastStarterId?: string | null,
  random: () => number = Math.random,
): string | null {
  if (playerIds.length === 0) return null;

  const skipLast =
    playerIds.length >= 3 && !!lastStarterId && playerIds.includes(lastStarterId);
  const pool = skipLast ? playerIds.filter(id => id !== lastStarterId) : playerIds;
  if (pool.length === 0) return playerIds[0];

  // A proper uniform pick, not a sort with Math.random.
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  return pool[index];
}

/** Seating order wrapped round so that `startId` goes first. */
export function clueOrder<T extends { id: string }>(
  players: T[],
  startId?: string | null,
): T[] {
  if (!startId) return players;
  const start = players.findIndex(p => p.id === startId);
  if (start <= 0) return players;
  return [...players.slice(start), ...players.slice(0, start)];
}
