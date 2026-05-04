export interface Player {
  id: string;
  name: string;
  iconIndex: number;
}

export function selectImposter(players: Player[], history: string[]): { imposter: Player; history: string[] } {
  const recent = history.slice(-Math.floor(players.length / 2));
  const eligible = players.filter(p => !recent.includes(p.id));
  const pool = eligible.length > 0 ? eligible : players;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const newHistory = [...history, chosen.id].slice(-10);
  return { imposter: chosen, history: newHistory };
}

export function selectTwoImposters(players: Player[], history: string[]): { imposters: Player[]; history: string[] } {
  const { imposter: first, history: h1 } = selectImposter(players, history);
  const remaining = players.filter(p => p.id !== first.id);
  const { imposter: second, history: h2 } = selectImposter(remaining, h1);
  return { imposters: [first, second], history: h2 };
}
