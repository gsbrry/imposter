import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, Pressable, Animated, Easing, Platform, TouchableOpacity,
} from 'react-native';
import AppText from '../components/AppText';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import Pointer from 'lucide-react-native/dist/esm/icons/pointer';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left';
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
import { COLORS, FONTS, SPACING, SHADOW, BLUR, NATIVE_BLUR } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import RevealCard from '../components/RevealCard';
import PrimaryButton from '../components/PrimaryButton';
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
  const { game, setGame, resetGame, longAbsence } = useGame();
  const hasGame = useRequireGame();
  const { reduceMotion, screenReader } = useAccessibility();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(false);
  const [hasSeenWord, setHasSeenWord] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [showBackTip, setShowBackTip] = useState(false);

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

  // The one-time nudge that going back can be turned off — only once ever,
  // and only after a real gap since the last launch (see SessionTracker in
  // app/_layout.tsx), so it never shows up on a fresh install or every reopen.
  useEffect(() => {
    if (!hasGame || !longAbsence || !game.gameSettings.revealBackEnabled) return;
    storage.getRevealBackTipShown().then(alreadyShown => {
      if (alreadyShown) return;
      setShowBackTip(true);
      storage.setRevealBackTipShown(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGame]);

  const hideWord = useCallback(() => {
    setWordVisible(false);
  }, []);

  const showWord = useCallback(() => {
    setWordVisible(true);
    setHasSeenWord(true);
    pulse();
  }, []);

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

  // Undoes a mis-tap of "pass": re-shows the previous player's own
  // pass-the-phone prompt, gated behind its own press-and-hold again rather
  // than auto-revealing — the phone has already moved on, so whoever is
  // holding it now is not necessarily that player.
  const handlePrevious = () => {
    hideWord();
    setHasSeenWord(false);
    setCurrentIndex(i => Math.max(0, i - 1));
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
  const canGoBack = currentIndex > 0 && game.gameSettings.revealBackEnabled;
  const nextPlayer = game.players[currentIndex + 1];
  const passLabel = nextPlayer ? `Pass to ${nextPlayer.name}` : 'Start the game';

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
              <AppText style={styles.label}>{player.name.toUpperCase()}</AppText>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <IconButton onPress={exitGame} accessibilityLabel="Exit game">
                  <X size={20} color={COLORS.ink} />
                </IconButton>
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
              {showBackTip && !hasSeenWord && (
                <View style={styles.tip}>
                  <AppText style={styles.tipText}>
                    Tip: a back button lets a player undo an accidental pass. Turn it off
                    in Game Settings if you would rather it was not there.
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setShowBackTip(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss tip"
                  >
                    <X size={14} color={COLORS.honeyText} />
                  </TouchableOpacity>
                </View>
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
                footer={<AppText style={styles.peekText}>Let go to hide it</AppText>}
              />
            ) : (
              // Same shadow/blur/radius recipe as RevealCard above, so the
              // pre-reveal and revealed states read as one physical card
              // rather than a swap to a different pop-up.
              <View style={styles.shadowWrap}>
                <View style={styles.card}>
                  {NATIVE_BLUR && (
                    <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
                  )}
                  <View style={styles.holdContent}>
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
                </View>
              </View>
            )}
          </Pressable>

          {hasSeenWord && (
            <View style={styles.actions}>
              <AppText style={styles.counterLabel}>PLAYER {currentIndex + 1} OF {total}</AppText>
              <View style={styles.actionRow}>
                {canGoBack && (
                  <IconButton
                    size={48}
                    onPress={handlePrevious}
                    accessibilityLabel="Go back to the previous player's turn"
                  >
                    <ArrowLeft size={20} color={COLORS.ink} />
                  </IconButton>
                )}
                <PrimaryButton
                  label={passLabel}
                  onPress={handleNext}
                  icon={<EyeOff size={18} color={COLORS.onHoney} />}
                  style={styles.passButton}
                />
              </View>
            </View>
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
    gap: 10,
  },
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
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    maxWidth: 320,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
  },
  tipText: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.honeyText,
  },

  cardPress: { flex: 1 },

  // Shared card recipe — pre-reveal and revealed states both use this, via
  // RevealCard's own copy of the same styling for the revealed state.
  shadowWrap: {
    flex: 1,
    borderRadius: 26,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: SHADOW.card.offsetY },
    shadowOpacity: SHADOW.card.opacity,
    shadowRadius: SHADOW.card.radius,
    elevation: SHADOW.card.elevation,
  },
  card: {
    flex: 1,
    minHeight: 300,
    borderRadius: 26,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  holdContent: {
    flex: 1,
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

  peekText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 16,
  },

  actions: { gap: 10 },
  counterLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passButton: { flex: 1 },
});
