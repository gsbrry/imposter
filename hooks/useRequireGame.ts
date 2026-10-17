import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';

/**
 * In-game screens only make sense with a game in progress. On the web a
 * refresh or a pasted URL lands straight on one of these routes with empty
 * state, so send the player back to Home rather than running the setup with
 * no players. Returns false while that redirect is pending.
 */
export function useRequireGame(): boolean {
  const router = useRouter();
  const { game } = useGame();
  const hasGame = game.players.length > 0;

  useEffect(() => {
    if (!hasGame) router.replace('/(tabs)');
  }, [hasGame, router]);

  return hasGame;
}
