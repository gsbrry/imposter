import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CategoryKey, Difficulty } from '../data/words';
import { GameSettings, defaultGameSettings } from '../utils/storage';

export type GameDifficulty = Difficulty | 'chaos';

export interface Player {
  id: string;
  name: string;
  iconIndex: number;
  score: number;
}

export interface GameState {
  players: Player[];
  category: CategoryKey;
  difficulty: GameDifficulty;
  word: string;
  imposterIds: string[];
  hint: string;
  gameSettings: GameSettings;
  /** Who opens the clue rounds this game. */
  starterId: string | null;
  /** Who opened the previous game, so they do not open two in a row. */
  lastStarterId: string | null;
}

interface GameContextType {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  resetGame: () => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  /** True for this app session only, when the previous launch was a long time ago. */
  longAbsence: boolean;
  setLongAbsence: (v: boolean) => void;
}

const defaultGame: GameState = {
  players: [],
  category: 'general',
  difficulty: 'medium' as GameDifficulty,
  word: '',
  imposterIds: [],
  hint: '',
  gameSettings: defaultGameSettings,
  starterId: null,
  lastStarterId: null,
};

const GameContext = createContext<GameContextType>({
  game: defaultGame,
  setGame: () => {},
  resetGame: () => {},
  isPremium: false,
  setIsPremium: () => {},
  longAbsence: false,
  setLongAbsence: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(defaultGame);
  const [isPremium, setIsPremium] = useState(false);
  const [longAbsence, setLongAbsence] = useState(false);

  const resetGame = () => setGame(defaultGame);

  return (
    <GameContext.Provider
      value={{ game, setGame, resetGame, isPremium, setIsPremium, longAbsence, setLongAbsence }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
