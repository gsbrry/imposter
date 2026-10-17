import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import VoteCard from '../components/VoteCard';
import ProgressBar from '../components/ProgressBar';
import PrimaryButton from '../components/PrimaryButton';
import GlassButton from '../components/GlassButton';
import { useGame } from '../context/GameContext';
import { useRequireGame } from '../hooks/useRequireGame';
import { Ballots, tallyVotes } from '../utils/tallyVotes';

export default function VoteScreen() {
  const router = useRouter();
  const { game } = useGame();
  const hasGame = useRequireGame();
  // A missing key is a voter still to go; null is a deliberate skip.
  const [votes, setVotes] = useState<Ballots>({});
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

  if (!hasGame) return null;
  if (phase === 'voting' && !voter) return null;

  /** `null` is a skip: the voter passes and their ballot counts for nobody. */
  const castVote = (targetId: string | null) => {
    if (targetId !== null && voter.id === targetId) return;
    const newVotes: Ballots = { ...votes, [voter.id]: targetId };
    setVotes(newVotes);
    if (voterIndex < game.players.length - 1) {
      setVoterIndex(v => v + 1);
    } else {
      checkTally(newVotes);
    }
  };

  const checkTally = (finalVotes: Ballots) => {
    const result = tallyVotes(finalVotes, game.players.length);
    if (result.allSkipped) {
      // Nobody was voted for, so the result shows its voting-skipped state.
      router.push('/result');
      return;
    }
    if (result.tiedIds.length > 1) {
      setTieIds(result.tiedIds);
      setVoterIndex(0);
      setVotes({});
    } else {
      setPhase('tally');
    }
  };

  const handleReveal = () => {
    const result = tallyVotes(votes, game.players.length);
    const top = result.ranked[0];
    router.push({
      pathname: '/result',
      params: top && !result.allSkipped
        ? { votedOutId: top.id, votesFor: String(top.count), totalVotes: String(game.players.length) }
        : {},
    });
  };

  const tally = tallyVotes(votes, game.players.length);
  const counts = tally.counts;
  const votesIn = tally.cast;
  const total = game.players.length;

  // The tally only appears once every vote is in, so an earlier voter's
  // choice cannot steer the people who vote after them.
  const showTally = phase === 'tally';
  const ranked = tally.ranked.map(r => ({
    name: game.players.find(p => p.id === r.id)?.name ?? '',
    percent: r.percent,
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
            <AppText style={styles.label}>
              VOTING · {votesIn} OF {total} IN
            </AppText>
          </View>

          <View style={styles.heading}>
            <AppText style={styles.title} maxFontSizeMultiplier={1.4}>Who is the imposter?</AppText>
            <AppText style={styles.sub}>
              {showTally
                ? 'Every vote is in. Reveal when the table is ready.'
                : `${voter.name}, tap the player you suspect.`}
            </AppText>
            {tieIds.length > 0 && !showTally && (
              <AppText style={styles.tie}>It was a tie, so everyone votes again.</AppText>
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
                  {isSelf && <AppText style={styles.selfTag}>You</AppText>}
                </View>
              );
            })}

            {/* The dashed skip cell. A skipped ballot counts for nobody. */}
            {!showTally && (
              <View style={styles.cell}>
                <TouchableOpacity
                  onPress={() => castVote(null)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Skip this vote"
                  style={styles.skipCell}
                >
                  <AppText style={styles.skipText}>Skip vote</AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {showTally && ranked.length > 0 && (
            <GlassCard style={styles.tallyCard}>
              <View style={styles.tallyHead}>
                <AppText style={styles.label}>VOTE TALLY</AppText>
                {leader && <AppText style={styles.leader}>{leader.name} leads</AppText>}
              </View>
              {ranked.map(r => (
                <View key={r.name} style={styles.tallyRow}>
                  <View style={styles.tallyLabels}>
                    <AppText style={styles.tallyName} numberOfLines={1}>{r.name}</AppText>
                    <AppText style={styles.tallyPercent}>{r.percent}%</AppText>
                  </View>
                  <ProgressBar progress={r.percent / 100} />
                </View>
              ))}
              {tally.skipped > 0 && (
                <AppText style={styles.skipped}>{tally.skipped} skipped</AppText>
              )}
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
  skipCell: {
    // Matches the dashed Skip vote cell in design/screens/11-vote.html.
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  skipped: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
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
