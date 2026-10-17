import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import VoteCard from '../components/VoteCard';
import ProgressBar from '../components/ProgressBar';
import PrimaryButton from '../components/PrimaryButton';
import GlassButton from '../components/GlassButton';
import { useGame } from '../context/GameContext';

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
  const entryY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

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
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    router.push({
      pathname: '/result',
      params: top
        ? { votedOutId: top[0], votesFor: String(top[1]), totalVotes: String(game.players.length) }
        : {},
    });
  };

  const counts: Record<string, number> = {};
  Object.values(votes).forEach(v => {
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  });
  const votesIn = Object.values(votes).filter(Boolean).length;
  const total = game.players.length;

  // The tally only appears once every vote is in, so an earlier voter's
  // choice cannot steer the people who vote after them.
  const showTally = phase === 'tally';
  const ranked = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => ({
      name: game.players.find(p => p.id === id)?.name ?? '',
      percent: Math.round((n / total) * 100),
    }));
  const leader = ranked[0];

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <Text style={styles.label}>
              VOTING · {votesIn} OF {total} IN
            </Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.title} maxFontSizeMultiplier={1.4}>Who is the imposter?</Text>
            <Text style={styles.sub}>
              {showTally
                ? 'Every vote is in. Reveal when the table is ready.'
                : `${voter.name}, tap the player you suspect.`}
            </Text>
            {tieIds.length > 0 && !showTally && (
              <Text style={styles.tie}>It was a tie, so everyone votes again.</Text>
            )}
          </View>

          <View style={styles.grid}>
            {game.players.map((p, i) => {
              const isSelf = !showTally && p.id === voter.id;
              return (
                <View key={p.id} style={styles.cell}>
                  <VoteCard
                    name={p.name}
                    avatarIndex={i}
                    voteCount={showTally ? counts[p.id] ?? 0 : undefined}
                    selected={showTally && counts[p.id] === Math.max(...Object.values(counts), 0) && (counts[p.id] ?? 0) > 0}
                    onPress={isSelf || showTally ? undefined : () => castVote(p.id)}
                  />
                  {isSelf && <Text style={styles.selfTag}>You</Text>}
                </View>
              );
            })}
          </View>

          {showTally && ranked.length > 0 && (
            <GlassCard style={styles.tallyCard}>
              <View style={styles.tallyHead}>
                <Text style={styles.label}>VOTE TALLY</Text>
                {leader && <Text style={styles.leader}>{leader.name} leads</Text>}
              </View>
              {ranked.map(r => (
                <View key={r.name} style={styles.tallyRow}>
                  <View style={styles.tallyLabels}>
                    <Text style={styles.tallyName} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.tallyPercent}>{r.percent}%</Text>
                  </View>
                  <ProgressBar progress={r.percent / 100} />
                </View>
              ))}
            </GlassCard>
          )}

          <View style={styles.spacer} />

          {showTally ? (
            <PrimaryButton
              label="Reveal imposter"
              onPress={handleReveal}
              icon={<Eye size={18} color={COLORS.onHoney} />}
            />
          ) : (
            <GlassButton label="Skip to the reveal" onPress={handleReveal} />
          )}
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
  },

  header: { alignItems: 'center', paddingVertical: 4 },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },

  heading: { gap: 4 },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
  tie: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12.5,
    color: COLORS.honeyText,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    // Two across, accounting for the 8px gap.
    width: '48.5%',
    position: 'relative',
  },
  selfTag: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },

  tallyCard: {
    padding: SPACING.cardPadding,
    gap: 10,
  },
  tallyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leader: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12.5,
    color: COLORS.honeyText,
  },
  tallyRow: { gap: 5 },
  tallyLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tallyName: {
    flex: 1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12.5,
    color: COLORS.ink,
  },
  tallyPercent: {
    fontFamily: FONTS.displayBold,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },

  spacer: { flex: 1, minHeight: SPACING.xs },
});
