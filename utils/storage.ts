import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PLAYER_NAMES: 'IMPOSTR_PLAYER_NAMES',
  STATS: 'IMPOSTR_STATS',
  SETTINGS: 'IMPOSTR_SETTINGS',
  USED_WORDS: 'IMPOSTR_USED_WORDS',
  IMPOSTER_HISTORY: 'IMPOSTR_IMPOSTER_HISTORY',
  SUBSCRIPTION: 'IMPOSTR_SUBSCRIPTION',
  CUSTOM_WORDS: 'IMPOSTR_CUSTOM_WORDS',
  LAST_CATEGORY: 'IMPOSTR_LAST_CATEGORY',
  GAME_SETTINGS: 'IMPOSTR_GAME_SETTINGS',
  SAVED_PLAYERS: 'IMPOSTR_SAVED_PLAYERS',
  TEAM_VOTE: 'IMPOSTR_TEAM_VOTE',
  TIMER_SOUND: 'IMPOSTR_TIMER_SOUND',
  SUGGESTIONS: 'IMPOSTR_SUGGESTIONS',
  REVIEW_UNLOCK: 'IMPOSTR_REVIEW_UNLOCK',
};

export interface PlayerData {
  id: string;
  name: string;
  iconIndex: number;
}

export interface Stats {
  gamesPlayed: number;
  gamesAsImposter: number;
  impostersWon: number;
  crewmatesWon: number;
  bestCategory: string;
  categoryWins: Record<string, number>;
}

export interface Settings {
  timerEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  /** Accessibility preferences. Stored now, applied in a later change. */
  largerText: boolean;
  reduceMotion: boolean;
}

export interface Suggestion {
  category: string;
  reason: string;
  savedAt: number;
}

export interface GameSettings {
  playerCount: number;
  turnsBeforeGuess: number;
  timerPerClue: number | 'none' | 'custom';
  customTimerSeconds: number;
  /** Which generation of shipped defaults this record has been through. */
  defaultsVersion?: number;
}

const defaultStats: Stats = {
  gamesPlayed: 0,
  gamesAsImposter: 0,
  impostersWon: 0,
  crewmatesWon: 0,
  bestCategory: '',
  categoryWins: {},
};

const defaultSettings: Settings = {
  timerEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  largerText: false,
  reduceMotion: false,
};

/** Bumped whenever a shipped default changes. */
export const GAME_SETTINGS_DEFAULTS_VERSION = 2;

export const defaultGameSettings: GameSettings = {
  playerCount: 4,
  turnsBeforeGuess: 2,
  timerPerClue: 'none',
  customTimerSeconds: 60,
  defaultsVersion: GAME_SETTINGS_DEFAULTS_VERSION,
};

/** What version 1 of the app shipped as defaults. */
const v1Defaults = {
  turnsBeforeGuess: 1,
  timerPerClue: 30 as GameSettings['timerPerClue'],
};

/**
 * New defaults reach new installs and anyone who never touched the setting.
 * A value that still matches the old default was never chosen, so it moves on;
 * anything else is the player's own choice and is left alone.
 */
export function applyGameSettingsDefaults(s: GameSettings): GameSettings {
  if ((s.defaultsVersion ?? 1) >= GAME_SETTINGS_DEFAULTS_VERSION) return s;
  return {
    ...s,
    timerPerClue:
      s.timerPerClue === v1Defaults.timerPerClue
        ? defaultGameSettings.timerPerClue
        : s.timerPerClue,
    turnsBeforeGuess:
      (s.turnsBeforeGuess ?? v1Defaults.turnsBeforeGuess) === v1Defaults.turnsBeforeGuess
        ? defaultGameSettings.turnsBeforeGuess
        : s.turnsBeforeGuess,
    defaultsVersion: GAME_SETTINGS_DEFAULTS_VERSION,
  };
}

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getPlayers: () => get<PlayerData[]>(KEYS.PLAYER_NAMES, []),
  setPlayers: (players: PlayerData[]) => set(KEYS.PLAYER_NAMES, players),

  getStats: () => get<Stats>(KEYS.STATS, defaultStats),
  setStats: (stats: Stats) => set(KEYS.STATS, stats),

  // Merged over the defaults so a record written before a new preference
  // existed comes back with that preference set rather than undefined.
  getSettings: () =>
    get<Partial<Settings>>(KEYS.SETTINGS, defaultSettings).then(
      s => ({ ...defaultSettings, ...s })
    ),
  setSettings: (settings: Settings) => set(KEYS.SETTINGS, settings),

  getUsedWords: () => get<Record<string, string[]>>(KEYS.USED_WORDS, {}),
  setUsedWords: (used: Record<string, string[]>) => set(KEYS.USED_WORDS, used),

  getImposterHistory: () => get<string[]>(KEYS.IMPOSTER_HISTORY, []),
  setImposterHistory: (history: string[]) => set(KEYS.IMPOSTER_HISTORY, history),

  getSubscription: () => get<boolean>(KEYS.SUBSCRIPTION, false),
  setSubscription: (val: boolean) => set(KEYS.SUBSCRIPTION, val),

  getCustomWords: () => get<Record<string, string[]>>(KEYS.CUSTOM_WORDS, {}),
  setCustomWords: (words: Record<string, string[]>) => set(KEYS.CUSTOM_WORDS, words),

  getLastCategory: () => get<string>(KEYS.LAST_CATEGORY, 'general'),
  setLastCategory: (cat: string) => set(KEYS.LAST_CATEGORY, cat),

  getGameSettings: () =>
    get<GameSettings>(KEYS.GAME_SETTINGS, defaultGameSettings).then(applyGameSettingsDefaults),
  setGameSettings: (s: GameSettings) => set(KEYS.GAME_SETTINGS, s),

  getTeamVote: () => get<boolean>(KEYS.TEAM_VOTE, false),
  setTeamVote: (val: boolean) => set(KEYS.TEAM_VOTE, val),

  getTimerSound: () => get<boolean>(KEYS.TIMER_SOUND, true),
  setTimerSound: (val: boolean) => set(KEYS.TIMER_SOUND, val),

  getReviewUnlock: () => get<boolean>(KEYS.REVIEW_UNLOCK, false),
  setReviewUnlock: (val: boolean) => set(KEYS.REVIEW_UNLOCK, val),

  getSuggestions: () => get<Suggestion[]>(KEYS.SUGGESTIONS, []),
  addSuggestion: async (category: string, reason: string): Promise<void> => {
    const existing = await get<Suggestion[]>(KEYS.SUGGESTIONS, []);
    const merged = [{ category, reason, savedAt: Date.now() }, ...existing].slice(0, 50);
    await set(KEYS.SUGGESTIONS, merged);
  },

  getSavedPlayers: () => get<string[]>(KEYS.SAVED_PLAYERS, []),
  addSavedPlayers: async (names: string[]): Promise<void> => {
    const existing = await get<string[]>(KEYS.SAVED_PLAYERS, []);
    const fresh = names.map(n => n.trim()).filter(n => n.length > 0 && !n.startsWith('Player '));
    // prepend new names, deduplicate preserving first occurrence, cap at 20
    const merged = [...fresh, ...existing.filter(e => !fresh.includes(e))].slice(0, 20);
    await set(KEYS.SAVED_PLAYERS, merged);
  },
  removeSavedPlayer: async (name: string): Promise<void> => {
    const existing = await get<string[]>(KEYS.SAVED_PLAYERS, []);
    await set(KEYS.SAVED_PLAYERS, existing.filter(n => n !== name));
  },
};
