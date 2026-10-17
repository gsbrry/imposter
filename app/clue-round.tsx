import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, Platform,
  BackHandler, AppState,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ArrowRight from 'lucide-react-native/dist/esm/icons/arrow-right';
import Check from 'lucide-react-native/dist/esm/icons/check';
import Pause from 'lucide-react-native/dist/esm/icons/pause';
import Play from 'lucide-react-native/dist/esm/icons/play';
import RefreshCw from 'lucide-react-native/dist/esm/icons/refresh-cw';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import Brain from 'lucide-react-native/dist/esm/icons/brain';
import Car from 'lucide-react-native/dist/esm/icons/car';
import House from 'lucide-react-native/dist/esm/icons/house';
import UtensilsCrossed from 'lucide-react-native/dist/esm/icons/utensils-crossed';
import Clapperboard from 'lucide-react-native/dist/esm/icons/clapperboard';
import Trophy from 'lucide-react-native/dist/esm/icons/trophy';
import PawPrint from 'lucide-react-native/dist/esm/icons/paw-print';
import Briefcase from 'lucide-react-native/dist/esm/icons/briefcase';
import PartyPopper from 'lucide-react-native/dist/esm/icons/party-popper';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import { useContentSize } from '../components/ContentSize';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import ClueTimer from '../components/ClueTimer';
import PrimaryButton from '../components/PrimaryButton';
import GlassButton from '../components/GlassButton';
import IconButton from '../components/IconButton';
import BottomSheet from '../components/BottomSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import ListRow, { listRowStyles } from '../components/ListRow';
import Pill from '../components/Pill';
import { useGame } from '../context/GameContext';
import { useRequireGame } from '../hooks/useRequireGame';
import { storage, defaultGameSettings } from '../utils/storage';
import { CATEGORIES, CategoryIcon } from '../data/words';
import { clueOrder } from '../utils/pickStarter';
import {
  ClueProgress, startProgress, nextTurn, oneMoreRound, isFinalTurn,
} from '../utils/clueRounds';

const CATEGORY_ICONS: Record<CategoryIcon, typeof Brain> = {
  brain: Brain,
  car: Car,
  house: House,
  utensils: UtensilsCrossed,
  clapperboard: Clapperboard,
  trophy: Trophy,
  paw: PawPrint,
  briefcase: Briefcase,
  party: PartyPopper,
};

export default function ClueRoundScreen() {
  const router = useRouter();
  const { game, resetGame } = useGame();
  const hasGame = useRequireGame();
  const { width } = useContentSize();
  const [progress, setProgress] = useState<ClueProgress>(
    () => startProgress(defaultGameSettings.turnsBeforeGuess)
  );
  const currentIndex = progress.index;
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [maxTime, setMaxTime] = useState(30);
  const [teamVote, setTeamVote] = useState(false);
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Promise.all([
      storage.getSettings(),
      storage.getGameSettings(),
      storage.getTeamVote(),
      storage.getTimerSound(),
    ]).then(([, gs, tv, ts]) => {
      const timer = gs.timerPerClue;
      const noTimer = timer === 'none';
      let seconds = 30;
      if (!noTimer) {
        seconds = timer === 'custom' ? (gs.customTimerSeconds || 30) : (timer as number);
      }
      setTimerEnabled(!noTimer);
      setMaxTime(seconds);
      setTeamVote(tv);
      setProgress(startProgress(gs.turnsBeforeGuess ?? defaultGameSettings.turnsBeforeGuess));
      setTimerSoundEnabled(ts);
    });
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  // Android back during a round opens the pause sheet instead of leaving.
  // BottomSheet and ConfirmDialog register their own handlers while open,
  // and the last one registered wins, so this only fires when neither is up.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPaused(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  // Sending the app to the background pauses the game, so the timer is not
  // still running when the phone comes back out of a pocket.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') setPaused(true);
    });
    return () => sub.remove();
  }, []);

  const goToNext = () => {
    // Same order every round, so everyone gives one clue per round.
    const next = nextTurn(progress, order.length);
    if (next) setProgress(next);
    else router.push(teamVote ? '/result' : '/vote');
  };

  /** One more full pass in the same order, as many times as the table likes. */
  const addRound = () => {
    setProgress(oneMoreRound(progress));
  };

  /**
   * Back to the first clue of round 1 with the same word and the same
   * imposter. Only the position in the clue rounds resets, so the game
   * state the reveal set up is untouched.
   */
  const restartRound = () => {
    setProgress(startProgress(progress.totalRounds));
    setPaused(false);
  };

  const goToVote = () => {
    router.push('/vote');
  };

  const revealImposter = () => {
    router.push('/result');
  };

  /**
   * Leaving mid-game. Stats are only ever written on the result screen, so
   * a game abandoned here never counts towards games played or wins.
   */
  const exitGame = () => {
    setConfirmExit(false);
    setPaused(false);
    resetGame();
    router.replace('/(tabs)');
  };

  // Clues go round in seating order from whoever the Who starts screen drew.
  const order = clueOrder(game.players, game.starterId);
  const player = order[currentIndex];
  const seat = player ? game.players.findIndex(p => p.id === player.id) : 0;
  const isLast = isFinalTurn(progress, order.length);

  const handlePrimary = () => {
    if (teamVote && isLast) revealImposter();
    else goToNext();
  };

  if (!hasGame || !player) return null;

  const category = CATEGORIES.find(c => c.id === game.category);
  const CategoryIconCmp = category ? CATEGORY_ICONS[category.icon] : Brain;
  const ringSize = Math.min(190, width * 0.56);
  const primaryLabel = teamVote && isLast
    ? 'Reveal imposter'
    : isLast ? 'Go to vote' : 'Next player';

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          {/* Header: pause top left, round label, category pill */}
          <View style={styles.header}>
            <IconButton onPress={() => setPaused(true)} accessibilityLabel="Pause game">
              <Pause size={20} color={COLORS.ink} />
            </IconButton>
            <AppText style={styles.label}>CLUE ROUND {progress.round} OF {progress.totalRounds}</AppText>
            <Pill
              tone="honey"
              label={category?.label ?? 'General'}
              icon={<CategoryIconCmp size={14} color={COLORS.honeyText} />}
            />
          </View>

          {/* Owns the ticking second, so the rest of this screen does not
              re-render once a second. The key restarts it each turn. */}
          <ClueTimer
            key={`${progress.round}-${progress.index}`}
            size={ringSize}
            enabled={timerEnabled}
            maxTime={maxTime}
            paused={paused}
            soundEnabled={timerSoundEnabled}
          />

          {/* Who is speaking */}
          <GlassCard style={styles.nowCard}>
            <Avatar name={player.name} index={seat} size={44} />
            <View style={styles.nowText}>
              <AppText style={styles.label}>NOW GIVING A CLUE</AppText>
              <AppText style={styles.nowName} numberOfLines={1}>{player.name}</AppText>
            </View>
            <AppText style={styles.nowCount}>
              {currentIndex + 1} of {order.length}
            </AppText>
          </GlassCard>

          {/* Turn order */}
          <View style={styles.pips}>
            {order.map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.pipWrap,
                  i === currentIndex && styles.pipCurrent,
                  i > currentIndex && styles.pipUpcoming,
                ]}
              >
                {i < currentIndex ? (
                  <View style={styles.pipDone}>
                    <Check size={14} color={COLORS.ink} />
                  </View>
                ) : (
                  <Avatar name={p.name} index={game.players.findIndex(q => q.id === p.id)} size={30} />
                )}
              </View>
            ))}
          </View>

          {/* Rules */}
          <GlassCard style={styles.rules}>
            <AppText style={styles.label}>RULES</AppText>
            <AppText style={styles.rulesText}>One word only. Do not say the word itself.</AppText>
          </GlassCard>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            {isLast ? (
              <GlassButton
                label="One more round"
                onPress={addRound}
                style={styles.actionMore}
              />
            ) : !teamVote ? (
              <GlassButton label="Skip to vote" onPress={goToVote} style={styles.actionSkip} />
            ) : null}
            <PrimaryButton
              label={primaryLabel}
              onPress={handlePrimary}
              iconPosition="trailing"
              icon={<ArrowRight size={18} color={COLORS.onHoney} />}
              style={isLast ? styles.actionVote : styles.actionNext}
            />
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Pause sheet. The countdown and its ticks stop while this is open,
          and the secret word is never on screen behind it. */}
      <BottomSheet visible={paused} onClose={() => setPaused(false)}>
        <View style={styles.sheetHead}>
          <AppText style={styles.sheetTitle} maxFontSizeMultiplier={1.4}>Game paused</AppText>
          <AppText style={styles.sheetSub}>
            The timer has stopped. Nobody can see the word.
          </AppText>
        </View>

        <PrimaryButton
          label="Resume"
          onPress={() => setPaused(false)}
          icon={<Play size={18} color={COLORS.onHoney} />}
        />

        <GlassCard style={styles.sheetList}>
          <ListRow
            icon={<RefreshCw size={17} color={COLORS.honeyText} />}
            title="Restart round"
            description="Same word, clues start again"
            trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
            onPress={restartRound}
          />
          <View style={listRowStyles.divider} />
          <ListRow
            icon={<Eye size={17} color={COLORS.honeyText} />}
            title="End and reveal"
            description="Show the imposter and the word"
            trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
            onPress={() => { setPaused(false); revealImposter(); }}
          />
          <View style={listRowStyles.divider} />
          <ListRow
            icon={<House size={17} color={COLORS.honeyText} />}
            title="Exit to home"
            description="This game will not count in stats"
            trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
            onPress={() => setConfirmExit(true)}
          />
        </GlassCard>
      </BottomSheet>

      <ConfirmDialog
        visible={confirmExit}
        icon={<House size={20} color={COLORS.honey} />}
        title="Leave this game?"
        message="Players will lose this round. The word is not shown."
        cancelLabel="Keep playing"
        confirmLabel="Leave"
        onCancel={() => setConfirmExit(false)}
        onConfirm={exitGame}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 24,
    gap: SPACING.gap,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },


  nowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
  },
  nowText: { flex: 1, minWidth: 0 },
  nowName: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  nowCount: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  pips: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pipWrap: { borderRadius: 10 },
  pipCurrent: {
    borderWidth: 2,
    borderColor: COLORS.honey,
    padding: 2,
    margin: -2,
  },
  pipUpcoming: { opacity: 0.35 },
  pipDone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
  },

  rules: {
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rulesText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.textBody,
  },

  spacer: { flex: 1, minHeight: SPACING.xs },
  actions: { flexDirection: 'row', gap: 8 },
  actionSkip: { flex: 1 },
  actionNext: { flex: 1.4 },
  // "One more round" is the longer label, so it takes the larger share.
  actionMore: { flex: 1.25 },
  actionVote: { flex: 1 },

  sheetHead: { gap: 4 },
  sheetList: { borderRadius: 18 },
  sheetTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 26,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  sheetSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
});
