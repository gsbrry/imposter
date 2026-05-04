import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORDS } from '../data/words';

const USED_WORDS_KEY = 'IMPOSTR_USED_WORDS';
const MAX_HISTORY_PER_CATEGORY = 30;
const RESET_THRESHOLD = 0.8; // reset once 80% of the category's words have been used

async function loadUsed() {
  try {
    const raw = await AsyncStorage.getItem(USED_WORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveUsed(used) {
  try {
    await AsyncStorage.setItem(USED_WORDS_KEY, JSON.stringify(used));
  } catch {
    // non-fatal
  }
}

/**
 * getWord(category, difficulty)
 *
 * Returns a word from WORDS[category][difficulty] that hasn't been used
 * recently. Tracks the last 30 used words per category in AsyncStorage.
 *
 * Reset rule: once 80% or more of the available words for that
 * category+difficulty have appeared in the history, the history for that
 * category is cleared and any word can be picked again.
 *
 * Falls back: hard → medium → easy if a difficulty tier is missing/empty.
 */
export async function getWord(category, difficulty = 'medium') {
  const categoryWords = WORDS[category];
  if (!categoryWords) {
    throw new Error(`Unknown category: ${category}`);
  }

  // Resolve word list with difficulty fallback
  const DIFFICULTY_ORDER = ['hard', 'medium', 'easy'];
  const startIdx = DIFFICULTY_ORDER.indexOf(difficulty);
  let wordList = null;
  for (let i = startIdx; i < DIFFICULTY_ORDER.length; i++) {
    const candidate = categoryWords[DIFFICULTY_ORDER[i]];
    if (candidate && candidate.length > 0) {
      wordList = candidate;
      break;
    }
  }
  if (!wordList || wordList.length === 0) {
    throw new Error(`No words available for category: ${category}`);
  }

  const used = await loadUsed();

  // Per-category history (shared across difficulties — prevents the same word
  // appearing regardless of which difficulty level it was drawn from)
  const categoryKey = category;
  const recentForCat = used[categoryKey] || [];

  // How many unique words from this difficulty tier have been seen
  const seenFromList = recentForCat.filter(w => wordList.includes(w));
  const usedRatio = wordList.length > 0 ? seenFromList.length / wordList.length : 0;

  // Reset if 80%+ of the difficulty tier has been exhausted
  let freshHistory = recentForCat;
  if (usedRatio >= RESET_THRESHOLD) {
    freshHistory = [];
  }

  // Eligible = words in this difficulty tier not in recent history
  const eligible = wordList.filter(w => !freshHistory.includes(w));
  const pool = eligible.length > 0 ? eligible : wordList;

  const word = pool[Math.floor(Math.random() * pool.length)];

  // Append word to history, cap at MAX_HISTORY_PER_CATEGORY
  const updatedHistory = [...freshHistory, word].slice(-MAX_HISTORY_PER_CATEGORY);
  used[categoryKey] = updatedHistory;

  await saveUsed(used);

  return word;
}
