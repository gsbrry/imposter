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
}

interface GameContextType {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  resetGame: () => void;
}

const defaultGame: GameState = {
  players: [],
  category: 'general',
  difficulty: 'medium' as GameDifficulty,
  word: '',
  imposterIds: [],
  hint: '',
  gameSettings: defaultGameSettings,
};

const GameContext = createContext<GameContextType>({
  game: defaultGame,
  setGame: () => {},
  resetGame: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(defaultGame);

  const resetGame = () => setGame(defaultGame);

  return (
    <GameContext.Provider value={{ game, setGame, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
