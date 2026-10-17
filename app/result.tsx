import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RotateCcw, Ghost, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import Avatar from '../components/Avatar';
import { useGame } from '../context/GameContext';
import { storage } from '../utils/storage';
import HomeButton from '../components/HomeButton';

export default function ResultScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const { votedOutId } = useLocalSearchParams<{ votedOutId: string }>();

  // votedOutId present  → came from vote flow
  // votedOutId absent   → came from "Reveal Imposter" button (skipped vote)
  const skippedVote = !votedOutId;

  const [imposterRevealed, setImposterRevealed] = useState(false);
  const [wordRevealed, setWordRevealed] = useState(false);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  // Imposter card reveal animation
  const imposterScale = useRef(new Animated.Value(0.8)).current;
  const imposterOpacity = useRef(new Animated.Value(0)).current;

  // Word card reveal animation (slide-up)
  const wordTranslateY = useRef(new Animated.Value(24)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;

  const imposter = game.players.find(p => game.imposterIds.includes(p.id));
  const votedOut = game.players.find(p => p.id === votedOutId);
  const caughtImposter = !skippedVote && game.imposterIds.includes(votedOutId ?? '');
  const imposterIndex = imposter ? game.players.indexOf(imposter) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    if (!skippedVote) {
      // Came from vote: auto-reveal everything after short delay
      setTimeout(() => revealImposter(true), 500);
    }

    updateStats();
  }, []);

  const updateStats = async () => {
    const stats = await storage.getStats();
    stats.gamesPlayed += 1;
    if (imposter) stats.gamesAsImposter += 1;
    if (!skippedVote) {
      if (caughtImposter) stats.crewmatesWon += 1;
      else stats.impostersWon += 1;
    }
    if (!stats.categoryWins[game.category]) stats.categoryWins[game.category] = 0;
    stats.categoryWins[game.category] += caughtImposter ? 1 : 0;
    const best = Object.entries(stats.categoryWins).sort((a, b) => b[1] - a[1])[0];
    if (best) stats.bestCategory = best[0];
    await storage.setStats(stats);
  };

  const revealImposter = (auto = false) => {
    if (!auto && Platform.OS !== 'web') {
      // Haptic feedback on manual reveal
      import('expo-haptics').then(Haptics => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }).catch(() => {});
    }
    setImposterRevealed(true);
    Animated.sequence([
      Animated.spring(imposterScale, { toValue: 1.1, useNativeDriver: true, friction: 4 }),
      Animated.spring(imposterScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
    Animated.timing(imposterOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // Word reveals 1 second after imposter
    setTimeout(() => {
      setWordRevealed(true);
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(wordTranslateY, { toValue: 0, friction: 6, tension: 80, useNativeDriver: true }),
      ]).start();
    }, 1000);
  };

  const hideImposter = () => {
    setImposterRevealed(false);
    setWordRevealed(false);
    Animated.parallel([
      Animated.spring(imposterScale, { toValue: 0.8, useNativeDriver: true }),
      Animated.timing(imposterOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(wordOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    wordTranslateY.setValue(24);
  };

  const playAgain = () => {
    setGame(g => ({ ...g, word: '', imposterIds: [], hint: '' }));
    router.replace('/reveal');
  };

  const changeCategory = () => {
    router.replace('/setup');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          {/* Top bar */}
          <View style={styles.topRow}>
            <HomeButton />
            <View style={{ width: 36 }} />
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            {skippedVote ? (
              <>
                <Text style={styles.outcomeLabel}>VOTING SKIPPED</Text>
                <Text style={styles.heroText}>The imposter was...</Text>
              </>
            ) : (
              <>
                <View style={styles.outcomeIconWrap}>
                  <Ghost size={28} color={COLORS.honey} />
                </View>
                <Text style={styles.outcomeLabel}>
                  {caughtImposter ? 'CREW WINS' : 'IMPOSTER WINS'}
                </Text>
                <Text style={styles.heroText}>
                  {imposter?.name} was the liar
                </Text>
              </>
            )}
          </View>

          {/* Imposter label */}
          <Text style={styles.cardSectionLabel}>THE IMPOSTER</Text>

          {/* Imposter card — hidden or revealed */}
          {!imposterRevealed ? (
            <View style={styles.hiddenCard}>
              <Ghost size={32} color={COLORS.textFaint} />
              <Text style={styles.hiddenCardText}>???</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.identityCard,
                { transform: [{ scale: imposterScale }], opacity: imposterOpacity },
              ]}
            >
              {imposter && (
                <Avatar name={imposter.name} index={imposterIndex} size={44} />
              )}
              <View style={styles.identityInfo}>
                <Text style={styles.identityName}>{imposter?.name}</Text>
                <Text style={styles.identitySubtitle}>WAS THE IMPOSTER</Text>
              </View>
            </Animated.View>
          )}

          {/* Reveal / hide button */}
          {!imposterRevealed ? (
            <TouchableOpacity style={styles.revealBtn} onPress={() => revealImposter(false)} activeOpacity={0.85}>
              <Eye size={20} color={COLORS.ink} fill={COLORS.ink} />
              <Text style={styles.revealBtnText}>REVEAL IMPOSTER</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.hideBtn} onPress={hideImposter} activeOpacity={0.75}>
              <EyeOff size={16} color={COLORS.textFaint} />
              <Text style={styles.hideBtnText}>HIDDEN — TAP TO HIDE AGAIN</Text>
            </TouchableOpacity>
          )}

          {/* Word card — always rendered, opacity-animated */}
          <Text style={[styles.cardSectionLabel, { marginTop: SPACING.sm }]}>THE WORD WAS</Text>
          <Animated.View
            style={[
              styles.wordCard,
              { opacity: wordOpacity, transform: [{ translateY: wordTranslateY }] },
            ]}
          >
            {wordRevealed ? (
              <>
                <Text style={styles.wordCardValue}>{game.word}</Text>
                <Text style={styles.wordCardCategory}>{game.category?.toUpperCase()}</Text>
              </>
            ) : (
              <Text style={styles.hiddenWordText}>???</Text>
            )}
          </Animated.View>

          {/* Wrong vote callout */}
          {!skippedVote && !caughtImposter && votedOut && (
            <View style={styles.wrongVoteCard}>
              <Text style={styles.wrongVoteText}>{votedOut.name} was a crewmate</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={playAgain} activeOpacity={0.9}>
              <RotateCcw size={18} color={COLORS.ink} />
              <Text style={styles.btnPrimaryText}>PLAY AGAIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={changeCategory} activeOpacity={0.85}>
              <Text style={styles.btnSecondaryText}>Change Category</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  inner: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 48,
    gap: SPACING.xs,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  headerSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  outcomeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.honey,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  outcomeLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.honeyText,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  heroText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 32,
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 38,
  },

  cardSectionLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  hiddenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
    width: '100%',
  },
  hiddenCardText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 28,
    color: COLORS.textFaint,
    letterSpacing: 6,
  },

  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    width: '100%',
    shadowColor: COLORS.honey,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  identityInfo: { flex: 1 },
  identityName: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: COLORS.honey,
  },
  identitySubtitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  revealBtn: {
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.honey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  revealBtnText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 15,
    color: COLORS.ink,
    letterSpacing: 1,
  },
  hideBtn: {
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hideBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  wordCard: {
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
    gap: 8,
    minHeight: 90,
    justifyContent: 'center',
  },
  wordCardValue: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 36,
    color: COLORS.honey,
    letterSpacing: 3,
    textAlign: 'center',
  },
  wordCardCategory: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  hiddenWordText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 28,
    color: COLORS.textFaint,
    letterSpacing: 6,
  },

  wrongVoteCard: {
    backgroundColor: COLORS.glassFill,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    width: '100%',
    alignItems: 'center',
  },
  wrongVoteText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textBody,
  },

  actions: { gap: SPACING.xs, marginTop: SPACING.sm },
  btnPrimary: {
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.honey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 15,
    color: COLORS.ink,
    letterSpacing: 1,
  },
  btnSecondary: {
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontFamily: FONTS.displayBold,
    fontSize: 15,
    color: COLORS.textBody,
  },
});
