/**
 * Where a game is in its clue rounds. The order itself never changes once
 * the Who starts screen has drawn it; only the position within it moves.
 */
export interface ClueProgress {
  /** Index into the clue order, 0-based. */
  index: number;
  /** Which round is being played, 1-based. */
  round: number;
  /** How many rounds this game will play, including any added on the night. */
  totalRounds: number;
}

export function startProgress(totalRounds: number): ClueProgress {
  return { index: 0, round: 1, totalRounds: Math.max(1, totalRounds) };
}

/**
 * Move to the next clue. Returns null once the final player of the final
 * round has spoken, which is when the table chooses to vote or add a round.
 */
export function nextTurn(p: ClueProgress, playerCount: number): ClueProgress | null {
  if (p.index < playerCount - 1) return { ...p, index: p.index + 1 };
  if (p.round < p.totalRounds) return { ...p, index: 0, round: p.round + 1 };
  return null;
}

/**
 * One more round: a single extra pass in the same order, starting straight
 * away. The header reads "Clue round N+1 of N+1". It can be used again.
 */
export function oneMoreRound(p: ClueProgress): ClueProgress {
  return { index: 0, round: p.round + 1, totalRounds: p.totalRounds + 1 };
}

export function isFinalTurn(p: ClueProgress, playerCount: number): boolean {
  return p.index >= playerCount - 1 && p.round >= p.totalRounds;
}
