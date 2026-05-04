import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RotateCcw, Ghost, ShieldCheck } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PlayerAvatar from '../components/PlayerAvatar';
import { useGame } from '../context/GameContext';
import { storage } from '../utils/storage';
import HomeButton from '../components/HomeButton';

export default function ResultScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const { votedOutId } = useLocalSearchParams<{ votedOutId: string }>();

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;
  const wordScale = useRef(new Animated.Value(0.8)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;

  const imposter = game.players.find(p => game.imposterIds.includes(p.id));
  const votedOut = game.players.find(p => p.id === votedOutId);
  const caughtImposter = game.imposterIds.includes(votedOutId ?? '');
  const imposterIndex = imposter ? game.players.indexOf(imposter) : 0;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(entryAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(entryY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();

      // Word reveal
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(wordScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
          Animated.timing(wordOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 200);
    }, 300);

    updateStats();
  }, []);

  const updateStats = async () => {
    const stats = await storage.getStats();
    stats.gamesPlayed += 1;
    if (imposter) stats.gamesAsImposter += 1;
    if (caughtImposter) stats.crewmatesWon += 1;
    else stats.impostersWon += 1;
    if (!stats.categoryWins[game.category]) stats.categoryWins[game.category] = 0;
    stats.categoryWins[game.category] += caughtImposter ? 1 : 0;
    const best = Object.entries(stats.categoryWins).sort((a, b) => b[1] - a[1])[0];
    if (best) stats.bestCategory = best[0];
    await storage.setStats(stats);
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
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          {/* Top bar */}
          <View style={styles.topRow}>
            <HomeButton />
            <View style={{ width: 36 }} />
          </View>

          {/* Outcome section */}
          <View style={styles.outcomeSection}>
            {/* Icon circle */}
            <View style={styles.outcomeIconWrap}>
              {caughtImposter
                ? <Ghost size={28} color={COLORS.yellow} />
                : <ShieldCheck size={28} color={COLORS.yellow} />
              }
            </View>

            {/* Outcome label */}
            <Text style={styles.outcomeLabel}>
              {caughtImposter ? 'CREW WINS' : 'IMPOSTER WINS'}
            </Text>

            {/* Hero text */}
            <Text style={styles.heroText}>
              {imposter?.name} was the liar
            </Text>

            {/* Imposter identity card */}
            <View style={styles.identityCard}>
              {imposter && (
                <PlayerAvatar iconIndex={imposter.iconIndex} playerIndex={imposterIndex} size={44} />
              )}
              <View style={styles.identityInfo}>
                <Text style={styles.identityName}>{imposter?.name}</Text>
                <Text style={styles.identitySubtitle}>WAS THE IMPOSTER</Text>
              </View>
            </View>

            {/* Word reveal card */}
            <Animated.View
              style={[
                styles.wordCard,
                { transform: [{ scale: wordScale }], opacity: wordOpacity },
              ]}
            >
              <Text style={styles.wordCardLabel}>THE WORD WAS</Text>
              <Text style={styles.wordCardValue}>{game.word}</Text>
            </Animated.View>

            {/* Wrong vote callout */}
            {!caughtImposter && votedOut && (
              <View style={styles.wrongVoteCard}>
                <Text style={styles.wrongVoteText}>{votedOut.name} was a crewmate</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={playAgain} activeOpacity={0.9}>
              <RotateCcw size={18} color={COLORS.nearBlack} />
              <Text style={styles.btnPrimaryText}>PLAY AGAIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={changeCategory} activeOpacity={0.85}>
              <Text style={styles.btnSecondaryText}>Change Category</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    padding: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  outcomeSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  outcomeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  outcomeLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: 'rgba(255,214,0,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  heroText: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 42,
  },

  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    width: '100%',
  },
  identityInfo: { flex: 1 },
  identityName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.yellow,
  },
  identitySubtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  wordCard: {
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
    gap: 8,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  wordCardLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  wordCardValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: COLORS.yellow,
    letterSpacing: 3,
    textAlign: 'center',
  },

  wrongVoteCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    width: '100%',
    alignItems: 'center',
  },
  wrongVoteText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textBody,
  },

  actions: { gap: SPACING.xs },
  btnPrimary: {
    height: 56,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: COLORS.nearBlack,
    letterSpacing: 1,
  },
  btnSecondary: {
    height: 56,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textBody,
  },
});
