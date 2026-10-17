import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RefreshCw, Trophy, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import Pill from '../components/Pill';
import PrimaryButton from '../components/PrimaryButton';
import TextButton from '../components/TextButton';
import { useGame } from '../context/GameContext';
import { storage } from '../utils/storage';
import { CATEGORIES } from '../data/words';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  chaos: 'Chaos',
};

export default function ResultScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const { votedOutId, votesFor, totalVotes } = useLocalSearchParams<{
    votedOutId: string; votesFor: string; totalVotes: string;
  }>();

  // votedOutId present → came from the vote flow
  // votedOutId absent  → the table skipped straight to the reveal
  const skippedVote = !votedOutId;

  const [revealed, setRevealed] = useState(false);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

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
      // Came from the vote: the table already committed, so show it.
      const t = setTimeout(() => reveal(true), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const reveal = (auto = false) => {
    if (!auto && Platform.OS !== 'web') {
      import('expo-haptics').then(Haptics => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }).catch(() => {});
    }
    setRevealed(true);
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  };

  const playAgain = () => {
    setGame(g => ({ ...g, word: '', imposterIds: [], hint: '' }));
    router.replace('/reveal');
  };

  const changeCategory = () => router.replace('/setup');

  const category = CATEGORIES.find(c => c.id === game.category);
  const packLabel = `${category?.label ?? 'General'} · ${DIFFICULTY_LABEL[game.difficulty] ?? 'Medium'}`;

  const outcomeLabel = skippedVote ? 'No vote' : caughtImposter ? 'Crew wins' : 'Imposter wins';
  const headline = skippedVote
    ? 'The imposter was...'
    : caughtImposter ? 'Caught them.' : 'They got away.';

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.headline}>
            <Pill
              tone="honey"
              label={outcomeLabel}
              icon={<Trophy size={14} color={COLORS.honeyText} />}
            />
            <Text style={styles.headlineText} maxFontSizeMultiplier={1.4}>{headline}</Text>
          </View>

          {/* The imposter */}
          {revealed ? (
            <Animated.View style={{ opacity: cardOpacity, transform: [{ scale: cardScale }] }}>
              <GlassCard style={styles.imposterCard}>
                <Text style={styles.label}>THE IMPOSTER WAS</Text>
                <View style={styles.avatarWrap}>
                  <Avatar name={imposter?.name ?? '?'} index={imposterIndex} size={82} />
                  <View style={styles.avatarBadge}>
                    <Eye size={15} color={COLORS.honey} />
                  </View>
                </View>
                <Text style={styles.imposterName} numberOfLines={1}>{imposter?.name}</Text>
                {!skippedVote && votesFor && totalVotes && (
                  <Text style={styles.sub}>{votesFor} of {totalVotes} votes</Text>
                )}
              </GlassCard>
            </Animated.View>
          ) : (
            <Pressable onPress={() => reveal(false)} accessibilityRole="button" accessibilityLabel="Reveal the imposter">
              <GlassCard style={styles.hiddenCard}>
                <EyeOff size={28} color={COLORS.textMuted} />
                <Text style={styles.hiddenTitle}>Tap to reveal the imposter</Text>
                <Text style={styles.sub}>Make sure everyone is watching.</Text>
              </GlassCard>
            </Pressable>
          )}

          {/* The word */}
          <GlassCard style={styles.wordCard}>
            <View style={styles.wordText}>
              <Text style={styles.label}>THE WORD WAS</Text>
              <Text style={styles.word} numberOfLines={1}>{game.word}</Text>
            </View>
            <Pill label={packLabel} />
          </GlassCard>

          {/* Who was voted out, when the crew got it wrong */}
          {!skippedVote && !caughtImposter && votedOut && (
            <Text style={styles.wrongVote}>
              The table voted out {votedOut.name}, who was crew.
            </Text>
          )}

          <View style={styles.spacer} />

          <PrimaryButton
            label="Play again"
            onPress={playAgain}
            icon={<RefreshCw size={18} color={COLORS.onHoney} />}
          />
          <TextButton label="Change category" onPress={changeCategory} />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 24,
    gap: SPACING.gap,
    alignItems: 'stretch',
  },

  headline: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  headlineText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
    color: COLORS.ink,
    textAlign: 'center',
    marginTop: 6,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
    textAlign: 'center',
  },

  imposterCard: {
    alignItems: 'center',
    gap: 10,
    borderRadius: 26,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  avatarWrap: { position: 'relative' },
  avatarBadge: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  imposterName: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },

  hiddenCard: {
    alignItems: 'center',
    gap: 8,
    borderRadius: 26,
    paddingVertical: 32,
    paddingHorizontal: 18,
  },
  hiddenTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 16,
    letterSpacing: -0.16,
    color: COLORS.ink,
  },

  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
  },
  wordText: { flex: 1, minWidth: 0 },
  word: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },

  wrongVote: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  spacer: { flex: 1, minHeight: SPACING.xs },
});
