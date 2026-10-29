import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PLAYER_NAMES: 'IMPOSTR_PLAYER_NAMES',
  STATS: 'IMPOSTR_STATS',
  SETTINGS: 'IMPOSTR_SETTINGS',
  USED_WORDS: 'IMPOSTR_USED_WORDS',
  IMPOSTER_HISTORY: 'IMPOSTR_IMPOSTER_HISTORY',
  LAST_CATEGORY: 'IMPOSTR_LAST_CATEGORY',
  GAME_SETTINGS: 'IMPOSTR_GAME_SETTINGS',
  SAVED_PLAYERS: 'IMPOSTR_SAVED_PLAYERS',
  TEAM_VOTE: 'IMPOSTR_TEAM_VOTE',
  TIMER_SOUND: 'IMPOSTR_TIMER_SOUND',
  SUGGESTIONS: 'IMPOSTR_SUGGESTIONS',
  REVIEW_UNLOCK: 'IMPOSTR_REVIEW_UNLOCK',
  WORDS_FEED: 'IMPOSTR_WORDS_FEED',
  WORDS_FEED_CHECKED_AT: 'IMPOSTR_WORDS_FEED_CHECKED_AT',
  WORDS_FEED_SEEN_VERSION: 'IMPOSTR_WORDS_FEED_SEEN_VERSION',
  LAST_OPENED_AT: 'IMPOSTR_LAST_OPENED_AT',
  REVEAL_BACK_TIP_SHOWN: 'IMPOSTR_REVEAL_BACK_TIP_SHOWN',
};

/** How long a gap between launches counts as "away for a while". */
export const LONG_ABSENCE_MS = 7 * 24 * 60 * 60 * 1000;

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
  /**
   * Shows a "go back" button alongside "pass to next" on the reveal screen,
   * letting a mis-tap be corrected. On by default; see app/reveal.tsx for
   * the privacy trade-off this carries (going back re-shows a previous
   * player's card, gated behind its own press-and-hold).
   */
  revealBackEnabled: boolean;
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
  revealBackEnabled: true,
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

  getLastCategory: () => get<string>(KEYS.LAST_CATEGORY, 'general'),
  setLastCategory: (cat: string) => set(KEYS.LAST_CATEGORY, cat),

  // Merged over the defaults so a record saved before a field existed
  // (e.g. revealBackEnabled) comes back with that field set rather than
  // undefined.
  getGameSettings: () =>
    get<Partial<GameSettings>>(KEYS.GAME_SETTINGS, defaultGameSettings).then(s =>
      applyGameSettingsDefaults({ ...defaultGameSettings, ...s })
    ),
  setGameSettings: (s: GameSettings) => set(KEYS.GAME_SETTINGS, s),

  getTeamVote: () => get<boolean>(KEYS.TEAM_VOTE, false),
  setTeamVote: (val: boolean) => set(KEYS.TEAM_VOTE, val),

  getTimerSound: () => get<boolean>(KEYS.TIMER_SOUND, true),
  setTimerSound: (val: boolean) => set(KEYS.TIMER_SOUND, val),

  getReviewUnlock: () => get<boolean>(KEYS.REVIEW_UNLOCK, false),
  setReviewUnlock: (val: boolean) => set(KEYS.REVIEW_UNLOCK, val),

  // The last feed that passed validation, and when we last looked.
  getWordsFeed: () => get<unknown>(KEYS.WORDS_FEED, null),
  setWordsFeed: (feed: unknown) => set(KEYS.WORDS_FEED, feed),

  getWordsFeedCheckedAt: () => get<number>(KEYS.WORDS_FEED_CHECKED_AT, 0),
  setWordsFeedCheckedAt: (at: number) => set(KEYS.WORDS_FEED_CHECKED_AT, at),

  /** The feed version whose New words sheet has already been shown. */
  getWordsFeedSeenVersion: () => get<number>(KEYS.WORDS_FEED_SEEN_VERSION, 0),
  setWordsFeedSeenVersion: (v: number) => set(KEYS.WORDS_FEED_SEEN_VERSION, v),

  getLastOpenedAt: () => get<number>(KEYS.LAST_OPENED_AT, 0),
  setLastOpenedAt: (at: number) => set(KEYS.LAST_OPENED_AT, at),

  /** The reveal screen's "you can turn off going back" tip — shown once ever. */
  getRevealBackTipShown: () => get<boolean>(KEYS.REVEAL_BACK_TIP_SHOWN, false),
  setRevealBackTipShown: (val: boolean) => set(KEYS.REVEAL_BACK_TIP_SHOWN, val),

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
