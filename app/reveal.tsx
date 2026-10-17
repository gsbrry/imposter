import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, Pressable, Animated, Easing, Platform,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import Pointer from 'lucide-react-native/dist/esm/icons/pointer';
import X from 'lucide-react-native/dist/esm/icons/x';
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
import RevealCard from '../components/RevealCard';
import InkButton from '../components/InkButton';
import IconButton from '../components/IconButton';
import Pill from '../components/Pill';
import ProgressBar from '../components/ProgressBar';
import { useGame } from '../context/GameContext';
import { useRequireGame } from '../hooks/useRequireGame';
import { useAccessibility } from '../context/AccessibilityContext';
import { setSensitiveStrings } from '../utils/crashReporting';
import { storage } from '../utils/storage';
import { getWord } from '../utils/getWord';
import { selectImposter, selectTwoImposters } from '../utils/selectImposter';
import { HINTS, CATEGORIES, CategoryIcon, CategoryKey, Difficulty } from '../data/words';

// How long the word stays up once revealed, matching the card's countdown bar.
const PEEK_MS = 3000;

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

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  chaos: 'Chaos',
};

/**
 * Body copy for the reveal card. Both roles get one sentence of the same
 * shape so the card's height never depends on who is holding the phone.
 */
function subtitleFor(isImposter: boolean, isEasy: boolean, hint: string) {
  if (!isImposter) return 'Give clues that prove you know it, without giving it away.';
  if (isEasy && hint) return `You do not know the word. A hint: ${hint}.`;
  return 'You do not know the word. Listen closely and blend in.';
}

/**
 * One haptic pulse on reveal, fired identically for crew and imposter.
 * Anyone listening must not be able to tell the roles apart.
 */
async function pulse() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch { /* haptics unavailable */ }
}

export default function RevealScreen() {
  const router = useRouter();
  const { game, setGame, resetGame } = useGame();
  const hasGame = useRequireGame();
  const { reduceMotion, screenReader } = useAccessibility();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(false);
  const [hasSeenWord, setHasSeenWord] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const peekAnim = useRef(new Animated.Value(1)).current;
  const peekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;
  const holdPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    if (!reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(holdPulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(holdPulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      holdPulse.setValue(0);
    }

    if (!hasGame) return;

    async function setup() {
      // Chaos draws from the hard pack; its extra twist is the second imposter below.
      const safeDifficulty: Difficulty = (game.difficulty === 'chaos' ? 'hard' : game.difficulty) as Difficulty;
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
      // Keep the names and the secret word out of any crash report.
      setSensitiveStrings([word, ...game.players.map(p => p.name)]);
      setGame(g => ({ ...g, word, imposterIds, hint }));
      setSetupDone(true);
    }
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGame, reduceMotion]);

  useEffect(() => () => clearTimeout(peekTimer.current), []);

  const hideWord = useCallback(() => {
    clearTimeout(peekTimer.current);
    setWordVisible(false);
    peekAnim.setValue(1);
  }, [peekAnim]);

  const showWord = useCallback(() => {
    setWordVisible(true);
    setHasSeenWord(true);
    pulse();

    peekAnim.setValue(1);
    Animated.timing(peekAnim, {
      toValue: 0,
      duration: PEEK_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(hideWord, PEEK_MS);
  }, [peekAnim, hideWord]);

  const exitGame = () => {
    resetGame();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    hideWord();
    if (currentIndex < game.players.length - 1) {
      setHasSeenWord(false);
      setCurrentIndex(i => i + 1);
    } else {
      // Everyone has seen their word, so draw who opens the clue rounds.
      // The word reveal order itself is unchanged.
      router.push('/who-starts');
    }
  };

  const player = setupDone && hasGame ? game.players[currentIndex] : null;

  if (!setupDone || !player) {
    return (
      <View style={styles.container}>
        <ScreenBackground />
        <View style={styles.loading}>
          <ProgressBar progress={0.4} />
        </View>
      </View>
    );
  }

  const isImposter = game.imposterIds.includes(player.id);
  const total = game.players.length;
  const category = CATEGORIES.find(c => c.id === game.category);
  const CategoryIconCmp = category ? CATEGORY_ICONS[category.icon] : Brain;
  const packLabel = `${category?.label ?? 'General'} · ${DIFFICULTY_LABEL[game.difficulty] ?? 'Medium'}`;

  const glowScale = holdPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const glowOpacity = reduceMotion
    ? 0
    : holdPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.12] });

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          {wordVisible ? (
            /* Revealed: no exit button, so nobody taps away mid-peek. */
            <View style={styles.revealHeader}>
              <AppText style={styles.label}>
                {player.name.toUpperCase()} · PLAYER {currentIndex + 1}
              </AppText>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <IconButton onPress={exitGame} accessibilityLabel="Exit game">
                  <X size={20} color={COLORS.ink} />
                </IconButton>
                <AppText style={styles.label}>PLAYER {currentIndex + 1} OF {total}</AppText>
                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.pips}>
                {game.players.map((p, i) => (
                  <View
                    key={p.id}
                    style={[
                      styles.pip,
                      i < currentIndex && styles.pipDone,
                      i === currentIndex && styles.pipCurrent,
                    ]}
                  />
                ))}
              </View>
            </>
          )}

          {!wordVisible && (
            <View style={styles.passTo}>
              <AppText style={styles.label}>PASS THE PHONE TO</AppText>
              <AppText style={styles.playerName} maxFontSizeMultiplier={1.4} numberOfLines={1} adjustsFontSizeToFit>
                {player.name}
              </AppText>
              <AppText style={styles.sub}>Make sure nobody else can see the screen.</AppText>
              {screenReader && (
                <AppText style={styles.headphones}>
                  Use headphones so others cannot hear your word.
                </AppText>
              )}
            </View>
          )}

          {/* Press and hold to peek. Identical for crew and imposter. */}
          <Pressable
            style={styles.cardPress}
            onPressIn={showWord}
            onPressOut={hideWord}
            accessibilityRole="button"
            accessibilityLabel="Press and hold to see your word"
            accessibilityHint="Your word stays hidden until you hold this card"
          >
            {wordVisible ? (
              <RevealCard
                badge={
                  <Pill
                    tone="honey"
                    label={packLabel}
                    icon={<CategoryIconCmp size={14} color={COLORS.honeyText} />}
                  />
                }
                eyebrow={isImposter ? 'Your role' : 'Your secret word'}
                title={isImposter ? 'Imposter' : game.word}
                // The easy-mode hint rides inside the subtitle rather than in
                // a badge of its own: an extra element would make the imposter
                // card a different shape from the crew card, which is exactly
                // what the reveal must never do.
                subtitle={subtitleFor(isImposter, game.difficulty === 'easy', game.hint)}
                footer={
                  <View style={styles.peekWrap}>
                    <View style={styles.peekBar}>
                      {/* scaleX anchored left, not width, so the countdown
                          runs on the UI thread rather than the JS thread. */}
                      <Animated.View
                        style={[styles.peekFill, { transform: [{ scaleX: peekAnim }] }]}
                      />
                    </View>
                    <AppText style={styles.peekText}>Let go to hide it</AppText>
                  </View>
                }
              />
            ) : (
              <View style={styles.holdCard}>
                <View style={styles.holdIconWrap}>
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.holdGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
                  />
                  <View style={styles.holdIcon}>
                    <Pointer size={38} color={COLORS.honey} />
                  </View>
                </View>
                <AppText style={styles.holdTitle}>Press and hold to see your word</AppText>
                <AppText style={styles.holdSub}>Let go to hide it again</AppText>
              </View>
            )}
          </Pressable>

          {hasSeenWord && !wordVisible && (
            <InkButton
              label="Hide and pass"
              onPress={handleNext}
              icon={<EyeOff size={18} color={COLORS.background} />}
            />
          )}
        </Animated.View>
      </SafeAreaView>
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerSpacer: { width: 40 },
  revealHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },

  pips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.divider,
  },
  pipDone: { backgroundColor: COLORS.ink },
  pipCurrent: { width: 22, backgroundColor: COLORS.honey },

  passTo: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  playerName: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -1.2,
    color: COLORS.ink,
    textAlign: 'center',
  },
  headphones: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.honeyText,
    textAlign: 'center',
    marginTop: 4,
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
    textAlign: 'center',
  },

  cardPress: { flex: 1 },

  // Pre-reveal card
  holdCard: {
    flex: 1,
    minHeight: 300,
    borderRadius: 26,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  holdIconWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: COLORS.honey,
  },
  holdIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  holdTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 16,
    letterSpacing: -0.16,
    color: COLORS.ink,
    textAlign: 'center',
  },
  holdSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Revealed card footer
  peekWrap: {
    width: 150,
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  peekBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: COLORS.divider,
  },
  peekFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.honey,
    // scaleX shrinks towards this origin, matching the old width animation.
    transformOrigin: 'left',
  },
  peekText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
