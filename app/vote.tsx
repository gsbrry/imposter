import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PlayerAvatar from '../components/PlayerAvatar';
import PillButton from '../components/PillButton';
import { useGame } from '../context/GameContext';
import HomeButton from '../components/HomeButton';

export default function VoteScreen() {
  const router = useRouter();
  const { game } = useGame();
  const [votes, setVotes] = useState<Record<string, string | null>>(
    Object.fromEntries(game.players.map(p => [p.id, null]))
  );
  const [voterIndex, setVoterIndex] = useState(0);
  const [phase, setPhase] = useState<'voting' | 'tally'>('voting');
  const [tieIds, setTieIds] = useState<string[]>([]);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const voter = game.players[voterIndex];

  if (phase === 'voting' && !voter) return null;

  const castVote = (targetId: string) => {
    if (voter.id === targetId) return;
    const newVotes = { ...votes, [voter.id]: targetId };
    setVotes(newVotes);
    if (voterIndex < game.players.length - 1) {
      setVoterIndex(v => v + 1);
    } else {
      checkTally(newVotes);
    }
  };

  const checkTally = (finalVotes: Record<string, string | null>) => {
    const counts: Record<string, number> = {};
    Object.values(finalVotes).forEach(v => {
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(counts));
    const tied = Object.entries(counts).filter(([, c]) => c === maxVotes).map(([id]) => id);
    if (tied.length > 1) {
      setTieIds(tied);
      setVoterIndex(0);
      setVotes(Object.fromEntries(game.players.map(p => [p.id, null])));
    } else {
      setPhase('tally');
    }
  };

  const handleReveal = () => {
    const counts: Record<string, number> = {};
    Object.values(votes).forEach(v => {
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    router.push({ pathname: '/result', params: { votedOutId: topId } });
  };

  if (phase === 'tally') {
    const counts: Record<string, number> = {};
    Object.values(votes).forEach(v => {
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(counts), 0);

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.View
            style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
          >
            <View style={styles.header}>
              <HomeButton />
              <Text style={styles.title}>Vote Tally</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.tallyScroll} showsVerticalScrollIndicator={false}>
              {game.players
                .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
                .map(player => {
                  const voteCount = counts[player.id] ?? 0;
                  const isTop = voteCount === maxVotes && maxVotes > 0;
                  return (
                    <View key={player.id} style={[styles.tallyRow, isTop && styles.tallyRowTop]}>
                      <PlayerAvatar iconIndex={player.iconIndex} playerIndex={game.players.indexOf(player)} size={32} />
                      <Text style={styles.tallyName}>{player.name}</Text>
                      <View style={styles.tallyBarWrap}>
                        {Array.from({ length: voteCount }).map((_, i) => (
                          <View key={i} style={styles.tallyDot} />
                        ))}
                      </View>
                      <Text style={[styles.tallyCount, isTop && styles.tallyCountTop]}>{voteCount}</Text>
                    </View>
                  );
                })}
            </ScrollView>

            <PillButton label="Reveal Imposter!" onPress={handleReveal} variant="yellow" />
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          <View style={styles.header}>
            <HomeButton />
            <Text style={styles.title}>Vote</Text>
            <View style={{ width: 36 }} />
          </View>

          {tieIds.length > 0 && (
            <View style={styles.tieBanner}>
              <Text style={styles.tieBannerText}>TIE — Re-vote between tied players</Text>
            </View>
          )}

          <View style={styles.voterCard}>
            <PlayerAvatar iconIndex={voter.iconIndex} playerIndex={voterIndex} size={36} />
            <View style={styles.voterInfo}>
              <Text style={styles.voterLabel}>VOTING NOW</Text>
              <Text style={styles.voterName}>{voter.name}</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{voterIndex}/{game.players.length}</Text>
            </View>
          </View>

          <Text style={styles.suspectLabel}>WHO IS THE IMPOSTER?</Text>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {game.players
              .filter(p => p.id !== voter.id)
              .map(suspect => (
                <TouchableOpacity
                  key={suspect.id}
                  style={styles.suspectCard}
                  onPress={() => castVote(suspect.id)}
                  activeOpacity={0.75}
                >
                  <PlayerAvatar
                    iconIndex={suspect.iconIndex}
                    playerIndex={game.players.indexOf(suspect)}
                    size={36}
                  />
                  <Text style={styles.suspectName}>{suspect.name}</Text>
                  <View style={styles.voteBtn}>
                    <CheckCircle size={18} color={COLORS.yellow} />
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
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
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },

  tieBanner: {
    backgroundColor: 'rgba(244,63,94,0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
  },
  tieBannerText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.rose,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  voterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  voterInfo: { flex: 1 },
  voterLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  voterName: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.white,
  },
  progressBadge: {
    backgroundColor: COLORS.yellowGlass,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
  },
  progressText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.yellow,
  },

  suspectLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },

  scroll: { gap: SPACING.xs, paddingBottom: 20 },
  suspectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  suspectName: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.white,
  },
  voteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tally phase
  tallyScroll: { gap: SPACING.xs, paddingBottom: 20, flexGrow: 1 },
  tallyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tallyRowTop: {
    borderColor: COLORS.yellowBorder,
    backgroundColor: COLORS.yellowGlass,
  },
  tallyName: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
    width: 90,
  },
  tallyBarWrap: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tallyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.yellow,
  },
  tallyCount: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: COLORS.textLabel,
    width: 24,
    textAlign: 'right',
  },
  tallyCountTop: { color: COLORS.yellow },
});
