import { WORDS, CategoryKey, Difficulty } from '../data/words';
import { storage } from './storage';

export async function getWord(category: CategoryKey, difficulty: Difficulty): Promise<string> {
  const all = WORDS[category][difficulty];
  const used = await storage.getUsedWords();
  const usedCat = used[category] || [];
  let pool = all.filter(w => !usedCat.includes(w));
  if (pool.length < all.length * 0.2) pool = all;
  const word = pool[Math.floor(Math.random() * pool.length)];
  used[category] = [...usedCat, word].slice(-30);
  await storage.setUsedWords(used);
  return word;
}
