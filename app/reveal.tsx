import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ghost, ShieldCheck } from 'lucide-react-native';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PlayerAvatar from '../components/PlayerAvatar';
import { useGame } from '../context/GameContext';
import { storage } from '../utils/storage';
import { getWord } from '../utils/getWord';
import { selectImposter, selectTwoImposters } from '../utils/selectImposter';
import { HINTS, CategoryKey, Difficulty } from '../data/words';
import HomeButton from '../components/HomeButton';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function useScramble(word: string, running: boolean) {
  const [display, setDisplay] = useState(word);
  const frame = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!running || !word) {
      setDisplay(word);
      return;
    }
    let iteration = 0;
    const totalFrames = word.length * 4;
    clearInterval(frame.current);
    frame.current = setInterval(() => {
      setDisplay(
        word
          .split('')
          .map((char, i) => {
            if (i < Math.floor(iteration / 4)) return char;
            if (char === ' ') return ' ';
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      iteration++;
      if (iteration > totalFrames) {
        clearInterval(frame.current);
        setDisplay(word);
      }
    }, 40);
    return () => clearInterval(frame.current);
  }, [running, word]);

  return display;
}

export default function RevealScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(false);
  const [hasSeenWord, setHasSeenWord] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [scrambleRunning, setScrambleRunning] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const lockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    async function setup() {
      const safeDifficulty: Difficulty = (game.difficulty === 'chaos' ? 'medium' : game.difficulty) as Difficulty;
      const word = await getWord(game.category, safeDifficulty);
      const history = await storage.getImposterHistory();
      let imposterIds: string[];
      let newHistory: string[];

      if (game.difficulty === 'chaos' && Math.random() > 0.5 && game.players.length >= 6) {
        const result = selectTwoImposters(game.players, history);
        imposterIds = result.imposters.map(p => p.id);
        newHistory = result.history;
      } else {
        const result = selectImposter(game.players, history);
        imposterIds = [result.imposter.id];
        newHistory = result.history;
      }

      const hint = HINTS[game.category as CategoryKey][
        Math.floor(Math.random() * HINTS[game.category as CategoryKey].length)
      ];

      await storage.setImposterHistory(newHistory);
      setGame(g => ({ ...g, word, imposterIds, hint }));
      setSetupDone(true);
    }
    setup();
  }, []);

  const player = setupDone ? game.players[currentIndex] : null;
  const isImposter = player ? game.imposterIds.includes(player.id) : false;
  const scrambledWord = useScramble(game.word || '', scrambleRunning);

  const showWord = () => {
    clearTimeout(lockTimer.current);
    setWordVisible(true);
    setHasSeenWord(true);
    setScrambleRunning(true);
    setTimeout(() => setScrambleRunning(false), 500);

    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, friction: 5 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    });

    lockTimer.current = setTimeout(() => hideWord(), 3000);
  };

  const hideWord = () => {
    clearTimeout(lockTimer.current);
    setWordVisible(false);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const toggleWord = () => {
    if (wordVisible) {
      hideWord();
    } else {
      showWord();
    }
  };

  const handleNext = async () => {
    hideWord();
    if (currentIndex < game.players.length - 1) {
      setHasSeenWord(false);
      setCurrentIndex(i => i + 1);
    } else {
      // Last player done — check if timer is off; if so skip clue round
      const gs = await storage.getGameSettings();
      const tv = await storage.getTeamVote();
      if (gs.timerPerClue === 'none') {
        router.push(tv ? '/result' : '/vote');
      } else {
        router.push('/clue-round');
      }
    }
  };

  if (!setupDone || !player) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.loadingDot} />
      </View>
    );
  }

  const isLast = currentIndex === game.players.length - 1;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          {/* Header */}
          <View style={styles.topRow}>
            <HomeButton />
            <View style={styles.progress}>
              {game.players.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i < currentIndex && styles.progressDone,
                    i === currentIndex && styles.progressActive,
                  ]}
                />
              ))}
            </View>
            <View style={{ width: 36 }} />
          </View>

          {/* Pass card */}
          <View style={styles.passCard}>
            <Text style={styles.passLabel}>PASS TO</Text>
            <PlayerAvatar iconIndex={player.iconIndex} playerIndex={currentIndex} size={52} />
            <Text style={styles.playerName}>{player.name}</Text>
          </View>

          {/* Word area — always tappable to toggle */}
          <TouchableOpacity
            style={wordVisible ? styles.revealCardWrap : styles.tapArea}
            onPress={toggleWord}
            activeOpacity={0.85}
          >
            {!wordVisible ? (
              <>
                <View style={styles.eyeCircle}>
                  <Eye size={28} color={COLORS.yellow} weight="fill" />
                </View>
                <Text style={styles.tapText}>TAP TO SEE YOUR WORD</Text>
                <Text style={styles.tapSubtext}>Make sure only {player.name} can see</Text>
              </>
            ) : (
              <Animated.View
                style={[
                  styles.revealCardInner,
                  { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                ]}
              >
                {isImposter ? (
                  <>
                    <Ghost size={48} color={COLORS.yellow} />
                    <Text style={styles.imposterLabel}>IMPOSTER</Text>
                    <Text style={styles.imposterSub}>Blend in — you don't know the word.</Text>
                    {game.difficulty === 'easy' && (
                      <View style={styles.hintBadge}>
                        <Text style={styles.hintText}>HINT: {game.hint}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <ShieldCheck size={36} color={COLORS.yellow} />
                    <Text style={styles.wordLabel}>{scrambledWord}</Text>
                    <Text style={styles.categoryLabel}>{game.category?.toUpperCase()}</Text>
                  </>
                )}
                <View style={styles.hideHint}>
                  <EyeSlash size={14} color={COLORS.textMuted} weight="fill" />
                  <Text style={styles.hideText}>Tap to hide (auto-hides in 3s)</Text>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Next button */}
          <TouchableOpacity
            style={[styles.nextBtn, hasSeenWord && styles.nextBtnActive]}
            onPress={handleNext}
            disabled={!hasSeenWord}
            activeOpacity={0.85}
          >
            <Text style={[styles.nextText, hasSeenWord && styles.nextTextActive]}>
              {isLast ? 'START GAME' : `DONE — PASS TO ${game.players[currentIndex + 1]?.name?.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  inner: { flex: 1, padding: SPACING.md, paddingTop: SPACING.md, justifyContent: 'space-between' },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.yellow,
    opacity: 0.5,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  progress: { flexDirection: 'row', gap: 6 },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  progressDone: { backgroundColor: 'rgba(255,214,0,0.4)' },
  progressActive: { backgroundColor: COLORS.yellow, width: 18 },

  passCard: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  passLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  playerName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },

  tapArea: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  eyeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tapText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textBody,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tapSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLabel,
    textAlign: 'center',
  },

  revealCardWrap: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  revealCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  imposterLabel: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: COLORS.yellow,
    letterSpacing: 4,
  },
  imposterSub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textBody,
    textAlign: 'center',
  },
  hintBadge: {
    backgroundColor: COLORS.yellowGlass,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    marginTop: 4,
  },
  hintText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  wordLabel: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: COLORS.yellow,
    letterSpacing: 3,
    textAlign: 'center',
  },
  categoryLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  hideHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  hideText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },

  nextBtn: {
    height: 56,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  nextText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textLabel,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nextTextActive: {
    color: COLORS.nearBlack,
    fontFamily: FONTS.extraBold,
  },
});
