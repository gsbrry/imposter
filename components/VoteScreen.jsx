import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ghost, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, ArrowRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PlayerAvatar, { ICON_COMPONENTS } from './PlayerAvatar';
import PillButton from './PillButton';

const { width } = Dimensions.get('window');

// ── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i < current && styles.progressDotDone,
            i === current && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );
}

// ── Suspect card ──────────────────────────────────────────────────────────────
function SuspectCard({ player, playerIndex, onVote, disabled }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 60 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }).start();
  };
  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onVote(player.id));
  };

  const bgOpacity = flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={[styles.suspectWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        style={[styles.suspectTouchable, disabled && styles.suspectDisabled]}
      >
        <BlurView intensity={28} tint="dark" style={styles.suspectCard}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: COLORS.rose, opacity: bgOpacity, borderRadius: RADIUS.card },
            ]}
          />
          <PlayerAvatar
            iconIndex={player.iconIndex}
            playerIndex={playerIndex}
            size={38}
          />
          <Text style={styles.suspectName}>{player.name}</Text>
          {!disabled && (
            <View style={styles.voteChevron}>
              <ArrowRight size={16} color="rgba(255,255,255,0.35)"  />
            </View>
          )}
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Tally bar row ─────────────────────────────────────────────────────────────
function TallyRow({ player, playerIndex, count, maxCount, isTop }) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: maxCount > 0 ? count / maxCount : 0,
      duration: 600,
      delay: playerIndex * 80,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.tallyRow}>
      <PlayerAvatar iconIndex={player.iconIndex} playerIndex={playerIndex} size={30} />
      <Text style={[styles.tallyName, isTop && styles.tallyNameTop]} numberOfLines={1}>
        {player.name}
      </Text>
      <View style={styles.tallyBarTrack}>
        <Animated.View
          style={[
            styles.tallyBarFill,
            {
              width: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: isTop ? COLORS.rose : 'rgba(124,58,237,0.5)',
            },
          ]}
        />
      </View>
      <Text style={[styles.tallyCount, isTop && styles.tallyCountTop]}>{count}</Text>
    </View>
  );
}

// ── Main vote screen ──────────────────────────────────────────────────────────
export default function VoteScreen({ navigation, route }) {
  const players = route?.params?.players ?? [];
  const imposterIds = route?.params?.imposterIds ?? [];

  const [votes, setVotes] = useState(() =>
    Object.fromEntries(players.map(p => [p.id, null]))
  );
  const [voterIndex, setVoterIndex] = useState(0);
  const [phase, setPhase] = useState('voting'); // 'voting' | 'tally'
  const [tieIds, setTieIds] = useState([]);
  const [isTieBreaker, setIsTieBreaker] = useState(false);

  const voterSlide = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, []);

  // Animate voter card in on change
  useEffect(() => {
    voterSlide.setValue(24);
    Animated.spring(voterSlide, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  }, [voterIndex]);

  const voter = players[voterIndex];

  const getTallyCounts = useCallback((currentVotes) => {
    const counts = {};
    Object.values(currentVotes).forEach(v => {
      if (v) counts[v] = (counts[v] ?? 0) + 1;
    });
    return counts;
  }, []);

  const castVote = (targetId) => {
    const newVotes = { ...votes, [voter.id]: targetId };
    setVotes(newVotes);

    if (voterIndex < players.length - 1) {
      setVoterIndex(v => v + 1);
    } else {
      // All voted — check for tie
      const counts = getTallyCounts(newVotes);
      const maxVotes = Math.max(...Object.values(counts), 0);
      const tied = Object.entries(counts)
        .filter(([, c]) => c === maxVotes)
        .map(([id]) => id);

      if (tied.length > 1 && !isTieBreaker) {
        setTieIds(tied);
        setIsTieBreaker(true);
        setVoterIndex(0);
        setVotes(Object.fromEntries(players.map(p => [p.id, null])));
      } else {
        setPhase('tally');
      }
    }
  };

  const handleReveal = () => {
    const counts = getTallyCounts(votes);
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    if (navigation) navigation.navigate('Result', { votedOutId: topId, players, imposterIds });
  };

  // Which players are available to vote on
  const suspects = isTieBreaker
    ? players.filter(p => tieIds.includes(p.id) && p.id !== voter?.id)
    : players.filter(p => p.id !== voter?.id);

  // ── Tally phase ──────────────────────────────────────────────────────────────
  if (phase === 'tally') {
    const counts = getTallyCounts(votes);
    const maxCount = Math.max(...Object.values(counts), 0);
    const topIds = Object.entries(counts)
      .filter(([, c]) => c === maxCount)
      .map(([id]) => id);

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.tallyHeader}>
            <Ghost size={28} color={COLORS.rose}  />
            <Text style={styles.tallyTitle}>Vote Tally</Text>
          </View>

          <ScrollView contentContainerStyle={styles.tallyScroll} showsVerticalScrollIndicator={false}>
            {[...players]
              .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
              .map((player, i) => (
                <TallyRow
                  key={player.id}
                  player={player}
                  playerIndex={players.indexOf(player)}
                  count={counts[player.id] ?? 0}
                  maxCount={maxCount}
                  isTop={topIds.includes(player.id)}
                />
              ))}
          </ScrollView>

          <View style={styles.tallyFooter}>
            {topIds.length > 1 && (
              <View style={styles.tieWarning}>
                <AlertTrianglesize={16} color={COLORS.yellow}  />
                <Text style={styles.tieWarningText}>It's a tie — the imposter might escape!</Text>
              </View>
            )}
            <PillButton
              label="Reveal Imposter"
              onPress={handleReveal}
              variant="rose"
              style={styles.revealBtn}
              textStyle={styles.revealBtnText}
              icon={<Ghost size={18} color={COLORS.white}  />}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Voting phase ──────────────────────────────────────────────────────────────
  const votedCount = Object.values(votes).filter(v => v !== null).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Who's the Imposter?</Text>
            {isTieBreaker && (
              <View style={styles.tieBadge}>
                <AlertTrianglesize={12} color={COLORS.yellow}  />
                <Text style={styles.tieBadgeText}>TIE BREAKER</Text>
              </View>
            )}
          </View>

          {/* Progress dots */}
          <ProgressDots total={players.length} current={voterIndex} />

          {/* Current voter banner */}
          {voter && (
            <Animated.View
              style={[
                styles.voterBanner,
                {
                  opacity: voterSlide.interpolate({ inputRange: [0, 24], outputRange: [1, 0] }),
                  transform: [{ translateY: voterSlide }],
                },
              ]}
            >
              <BlurView intensity={40} tint="dark" style={styles.voterBlur}>
                <PlayerAvatar iconIndex={voter.iconIndex} playerIndex={voterIndex} size={34} />
                <View style={styles.voterTextWrap}>
                  <Text style={styles.voterLabel}>Now voting</Text>
                  <Text style={styles.voterName}>{voter.name}</Text>
                </View>
                <View style={styles.voterCounter}>
                  <Text style={styles.voterCounterText}>
                    {votedCount}/{players.length}
                  </Text>
                </View>
              </BlurView>
            </Animated.View>
          )}

          <Text style={styles.instruction}>
            {voter?.name}, tap the player you suspect — only you can see your vote.
          </Text>

          {/* Suspect cards */}
          <ScrollView
            contentContainerStyle={styles.suspectScroll}
            showsVerticalScrollIndicator={false}
          >
            {suspects.map(suspect => (
              <SuspectCard
                key={suspect.id}
                player={suspect}
                playerIndex={players.indexOf(suspect)}
                onVote={castVote}
                disabled={false}
              />
            ))}
          </ScrollView>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  flex: { flex: 1 },

  header: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    flex: 1,
  },
  tieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,214,0,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.25)',
  },
  tieBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.8,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDotDone: {
    backgroundColor: COLORS.rose,
    width: 8,
    height: 8,
  },
  progressDotActive: {
    backgroundColor: COLORS.yellow,
    width: 20,
    height: 8,
    borderRadius: 4,
  },

  // Voter banner
  voterBanner: {
    marginHorizontal: SPACING.sm,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
  },
  voterBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: 'rgba(124,58,237,0.1)',
  },
  voterTextWrap: { flex: 1 },
  voterLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  voterName: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.white,
  },
  voterCounter: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  voterCounterText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },

  instruction: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    paddingHorizontal: SPACING.sm,
    marginBottom: 10,
    lineHeight: 17,
  },

  // Suspect cards
  suspectScroll: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 80,
    gap: 8,
  },
  suspectWrap: {},
  suspectTouchable: {},
  suspectDisabled: { opacity: 0.4 },
  suspectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(124,58,237,0.06)',
  },
  suspectName: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  voteChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tally phase
  tallyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  tallyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },
  tallyScroll: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 20,
    gap: 10,
  },
  tallyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tallyName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    width: 78,
  },
  tallyNameTop: { color: COLORS.white, fontFamily: FONTS.bold },
  tallyBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  tallyBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  tallyCount: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
    width: 20,
    textAlign: 'right',
  },
  tallyCountTop: { color: COLORS.rose },
  tallyFooter: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  tieWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,214,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.2)',
  },
  tieWarningText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.yellow,
  },
  revealBtn: {},
  revealBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    letterSpacing: 1,
  },
});
