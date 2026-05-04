import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'IMPOSTR_IMPOSTER_HISTORY';

async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveHistory(history) {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // non-fatal — next load will just get stale data
  }
}

function pickOne(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pick one player fairly from `pool` given a recent-history exclusion list.
 * Returns the chosen player; does NOT mutate history.
 */
function pickFair(pool, recentIds) {
  const eligible = pool.filter(p => !recentIds.includes(p.id));
  return pickOne(eligible.length > 0 ? eligible : pool);
}

/**
 * selectImposter(players, difficulty)
 *
 * players    – array of { id, name, iconIndex, ... }
 * difficulty – 'easy' | 'medium' | 'hard' | 'chaos'
 *
 * Returns Promise<{ imposterIds: string[] }>
 *
 * History window: last floor(N/2) player ids are excluded from selection.
 * If all players are in the window, history is reset and anyone can be picked.
 * Chaos mode: randomly picks 1 or 2 imposters.
 */
export async function selectImposter(players, difficulty = 'medium') {
  if (!players || players.length === 0) {
    return { imposterIds: [] };
  }

  const history = await loadHistory();
  const windowSize = Math.floor(players.length / 2);

  // The recent window is the last windowSize entries
  const recentIds = history.slice(-windowSize);

  const isChaos = difficulty === 'chaos';
  const twoImposters = isChaos && players.length >= 4 && Math.random() < 0.5;

  let chosen;
  let updatedHistory = [...history];

  if (twoImposters) {
    const first = pickFair(players, recentIds);
    // Second pick excludes first + the same recent window
    const remaining = players.filter(p => p.id !== first.id);
    const second = pickFair(remaining, [...recentIds, first.id]);
    chosen = [first, second];
  } else {
    chosen = [pickFair(players, recentIds)];
  }

  // Append chosen ids to history, cap at 2× player count to avoid unbounded growth
  for (const p of chosen) {
    updatedHistory.push(p.id);
  }
  updatedHistory = updatedHistory.slice(-(players.length * 2));

  await saveHistory(updatedHistory);

  return { imposterIds: chosen.map(p => p.id) };
}
