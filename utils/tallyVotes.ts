/**
 * A ballot per voter id. A string is a vote against that player, null is a
 * deliberate skip, and a missing key is a voter who has not voted yet.
 */
export type Ballots = Record<string, string | null>;

export interface TallyRow {
  id: string;
  count: number;
  /** Share of everyone at the table, so skips show as the missing remainder. */
  percent: number;
}

export interface Tally {
  counts: Record<string, number>;
  /** Ballots deliberately skipped. A skip counts for nobody. */
  skipped: number;
  /** Ballots cast, skips included. */
  cast: number;
  ranked: TallyRow[];
  /** Everyone level on the most votes, when that is more than one player. */
  tiedIds: string[];
  /** The single player with the most votes, or null if nobody or a tie. */
  leaderId: string | null;
  /** Every ballot was a skip, so the table votes nobody out. */
  allSkipped: boolean;
}

export function tallyVotes(ballots: Ballots, voterCount: number): Tally {
  const values = Object.values(ballots);
  const counts: Record<string, number> = {};
  let skipped = 0;

  for (const v of values) {
    if (v === null) skipped += 1;
    else counts[v] = (counts[v] ?? 0) + 1;
  }

  const total = Math.max(1, voterCount);
  const ranked: TallyRow[] = Object.entries(counts)
    .map(([id, count]) => ({ id, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  const top = ranked[0]?.count ?? 0;
  const tied = ranked.filter(r => r.count === top).map(r => r.id);

  return {
    counts,
    skipped,
    cast: values.length,
    ranked,
    tiedIds: tied.length > 1 ? tied : [],
    leaderId: tied.length === 1 ? tied[0] : null,
    allSkipped: values.length > 0 && skipped === values.length,
  };
}
