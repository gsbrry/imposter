import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Ghost, RotateCcw, ShieldCheck, Crown, Sparkles,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PlayerAvatar from './PlayerAvatar';
import PillButton from './PillButton';
import { storage } from '../utils/storage';

const { width, height } = Dimensions.get('window');

// ── Score ticker ──────────────────────────────────────────────────────────────
function ScoreTicker({ value, color, delay = 0 }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animVal, {
        toValue: value,
        duration: 900,
        useNativeDriver: false,
      }).start();
      animVal.addListener(({ value: v }) => setDisplay(Math.round(v)));
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <Text style={[styles.scoreTick, { color }]}>{display}</Text>
  );
}

// ── Confetti particle ─────────────────────────────────────────────────────────
const CONFETTI_COLORS = [COLORS.yellow, COLORS.rose, '#38BDF8', '#34D399', '#FB923C'];
const CONFETTI_COUNT = 22;
const CONFETTI_ITEMS = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  id: i,
  x: (i * 137.5) % width,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 5 + (i % 4),
  duration: 1200 + (i % 6) * 200,
  delay: (i % 8) * 120,
  rotation: (i * 47) % 360,
}));

function ConfettiPiece({ x, color, size, duration, delay, rotation }) {
  const y = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(rotation)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, { toValue: height * 0.55, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 400, delay: duration - 400, useNativeDriver: true }),
        ]),
        Animated.timing(rot, { toValue: rotation + 360, duration, useNativeDriver: true }),
      ]),
    ]);
    anim.start();
  }, []);

  const deg = rot.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: x,
          top: 0,
          width: size,
          height: size * 1.6,
          backgroundColor: color,
          opacity,
          transform: [{ translateY: y }, { rotate: deg }],
        },
      ]}
    />
  );
}

// ── Player score row ──────────────────────────────────────────────────────────
function ScoreRow({ player, playerIndex, delta, isImposter, delay }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 5 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  const deltaColor = delta > 0 ? COLORS.yellow : delta < 0 ? COLORS.rose : 'rgba(255,255,255,0.3)';
  const sign = delta > 0 ? '+' : '';

  return (
    <Animated.View
      style={[
        styles.scoreRow,
        isImposter && styles.scoreRowImposter,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <PlayerAvatar iconIndex={player.iconIndex} playerIndex={playerIndex} size={32} />
      <Text style={[styles.scorePlayerName, isImposter && styles.scorePlayerNameImposter]}>
        {player.name}
      </Text>
      {isImposter && (
        <View style={styles.imposterPill}>
          <Ghost size={11} color={COLORS.rose}  />
          <Text style={styles.imposterPillText}>IMPOSTR</Text>
        </View>
      )}
      <View style={styles.scoreRight}>
        <ScoreTicker value={player.score} color={COLORS.white} delay={delay + 200} />
        {delta !== 0 && (
          <Text style={[styles.scoreDelta, { color: deltaColor }]}>
            {sign}{delta}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ── Main result screen ────────────────────────────────────────────────────────
export default function ResultScreen({ navigation, route }) {
  const votedOutId = route?.params?.votedOutId ?? null;
  const players = route?.params?.players ?? [];
  const imposterIds = route?.params?.imposterIds ?? [];
  const word = route?.params?.word ?? '';
  const category = route?.params?.category ?? '';

  const imposter = players.find(p => imposterIds.includes(p.id));
  const votedOut = players.find(p => p.id === votedOutId);
  const caughtImposter = imposterIds.includes(votedOutId ?? '');

  // Score deltas: crew gets +1 if caught, imposter gets +2 if escaped
  const [scoredPlayers, setScoredPlayers] = useState(players);
  const [deltas, setDeltas] = useState({});

  // Animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconRotate = useRef(new Animated.Value(caughtImposter ? -0.2 : 0.2)).current;
  const outcomeSlide = useRef(new Animated.Value(40)).current;
  const outcomeOpacity = useRef(new Animated.Value(0)).current;
  const revealSlide = useRef(new Animated.Value(60)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Build score deltas
    const newDeltas = {};
    const updatedPlayers = players.map(p => {
      let delta = 0;
      const isImp = imposterIds.includes(p.id);
      if (caughtImposter) {
        if (!isImp) delta = 1;       // crew each gets +1
      } else {
        if (isImp) delta = 2;        // imposter escapes, +2
      }
      newDeltas[p.id] = delta;
      return { ...p, score: (p.score ?? 0) + delta };
    });
    setDeltas(newDeltas);
    setScoredPlayers(updatedPlayers);

    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 60 }),
        Animated.spring(iconRotate, { toValue: 0, useNativeDriver: true, friction: 6 }),
      ]),
      Animated.parallel([
        Animated.spring(outcomeSlide, { toValue: 0, useNativeDriver: true, speed: 50, bounciness: 8 }),
        Animated.timing(outcomeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(revealSlide, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 5 }),
        Animated.timing(revealOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();

    // Confetti burst for crew win
    if (caughtImposter) {
      setTimeout(() => setShowConfetti(true), 200);
    }

    // Persist stats
    updateStats();
  }, []);

  const updateStats = async () => {
    try {
      const stats = await storage.getStats();
      stats.gamesPlayed = (stats.gamesPlayed ?? 0) + 1;
      if (caughtImposter) {
        stats.crewmatesWon = (stats.crewmatesWon ?? 0) + 1;
      } else {
        stats.impostersWon = (stats.impostersWon ?? 0) + 1;
      }
      if (category) {
        if (!stats.categoryWins) stats.categoryWins = {};
        stats.categoryWins[category] = (stats.categoryWins[category] ?? 0) + (caughtImposter ? 1 : 0);
        const best = Object.entries(stats.categoryWins).sort((a, b) => b[1] - a[1])[0];
        if (best) stats.bestCategory = best[0];
      }
      await storage.setStats(stats);
    } catch (_) {}
  };

  const handlePlayAgain = () => {
    if (navigation) navigation.navigate('Reveal', { players: scoredPlayers });
  };

  const handleChangeCategory = () => {
    if (navigation) navigation.navigate('Setup');
  };

  const imposterIndex = imposter ? players.indexOf(imposter) : 0;
  const iconDeg = iconRotate.interpolate({ inputRange: [-0.3, 0, 0.3], outputRange: ['-20deg', '0deg', '20deg'] });
  const glowBg = caughtImposter ? 'rgba(244,63,94,0.15)' : 'rgba(255,214,0,0.08)';

  return (
    <View style={styles.container}>
      {/* Radial glow bg */}
      <Animated.View style={[styles.glowBg, { opacity: glowAnim, backgroundColor: glowBg }]} />

      {/* Confetti */}
      {showConfetti && CONFETTI_ITEMS.map(c => (
        <ConfettiPiece key={c.id} x={c.x} color={c.color} size={c.size}
          duration={c.duration} delay={c.delay} rotation={c.rotation} />
      ))}

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero icon ── */}
          <View style={styles.heroSection}>
            <Animated.View
              style={[
                styles.iconWrap,
                {
                  transform: [{ scale: iconScale }, { rotate: iconDeg }],
                  shadowColor: caughtImposter ? COLORS.rose : COLORS.yellow,
                },
              ]}
            >
              {caughtImposter
                ? <Ghost size={80} color={COLORS.rose}  />
                : <Crown size={80} color={COLORS.yellow}  />
              }
            </Animated.View>

            {/* Outcome headline */}
            <Animated.View
              style={{
                opacity: outcomeOpacity,
                transform: [{ translateY: outcomeSlide }],
                alignItems: 'center',
              }}
            >
              <Text style={[styles.outcomeHeadline, { color: caughtImposter ? COLORS.rose : COLORS.yellow }]}>
                {caughtImposter ? 'Caught!' : 'Escaped!'}
              </Text>
              <Text style={styles.outcomeSubline}>
                {caughtImposter ? 'The crew wins this round' : 'The imposter fooled everyone'}
              </Text>
            </Animated.View>
          </View>

          {/* ── Imposter reveal card ── */}
          <Animated.View
            style={[
              styles.revealCard,
              { opacity: revealOpacity, transform: [{ translateY: revealSlide }] },
            ]}
          >
            <BlurView intensity={35} tint="dark" style={styles.revealBlur}>
              <View style={[
                styles.revealInner,
                { borderColor: caughtImposter ? 'rgba(244,63,94,0.4)' : 'rgba(255,214,0,0.3)' },
              ]}>
                <View style={styles.revealTop}>
                  <Text style={styles.revealLabel}>The Imposter was</Text>
                  <View style={styles.revealPlayerRow}>
                    {imposter && (
                      <PlayerAvatar iconIndex={imposter.iconIndex} playerIndex={imposterIndex} size={44} />
                    )}
                    <View>
                      <Text style={styles.revealName}>{imposter?.name ?? '???'}</Text>
                      {!caughtImposter && votedOut && votedOut.id !== imposter?.id && (
                        <View style={styles.wrongVote}>
                          <ShieldCheck size={12} color={COLORS.violet}  />
                          <Text style={styles.wrongVoteText}>
                            You voted {votedOut.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Word reveal */}
                {word ? (
                  <View style={styles.wordSection}>
                    <Text style={styles.wordLabel}>The secret word was</Text>
                    <Text style={styles.wordValue}>{word}</Text>
                  </View>
                ) : null}
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Scoreboard ── */}
          <Animated.View style={{ opacity: revealOpacity }}>
            <Text style={styles.scoreboardTitle}>Scoreboard</Text>
            <View style={styles.scoreboard}>
              {[...scoredPlayers]
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                .map((player, i) => (
                  <ScoreRow
                    key={player.id}
                    player={player}
                    playerIndex={players.indexOf(player)}
                    delta={deltas[player.id] ?? 0}
                    isImposter={imposterIds.includes(player.id)}
                    delay={300 + i * 80}
                  />
                ))}
            </View>
          </Animated.View>

          {/* ── Actions ── */}
          <View style={styles.actions}>
            <PillButton
              label="Play Again"
              onPress={handlePlayAgain}
              variant="yellow"
              style={styles.playBtn}
              textStyle={styles.playBtnText}
              icon={<RotateCcw size={18} color={COLORS.nearBlack} />}
            />
            <TouchableOpacity onPress={handleChangeCategory} style={styles.changeLink} activeOpacity={0.6}>
              <Text style={styles.changeLinkText}>Change Category</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },

  glowBg: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: COLORS.rose,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 120,
    elevation: 0,
  },

  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },

  scroll: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: 60,
    gap: SPACING.sm,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
    gap: 12,
  },
  iconWrap: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 12,
  },
  outcomeHeadline: {
    fontFamily: FONTS.extraBold,
    fontSize: 42,
    letterSpacing: 2,
  },
  outcomeSubline: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },

  // Reveal card
  revealCard: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  revealBlur: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    backgroundColor: 'rgba(244,63,94,0.06)',
  },
  revealInner: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.sm,
    gap: 14,
  },
  revealTop: { gap: 10 },
  revealLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  revealPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  revealName: {
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    color: COLORS.rose,
  },
  wrongVote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  wrongVoteText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  wordSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
    alignItems: 'center',
    gap: 4,
  },
  wordLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
  },
  wordValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 30,
    color: COLORS.yellow,
    letterSpacing: 3,
  },

  // Scoreboard
  scoreboardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  scoreboard: {
    gap: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scoreRowImposter: {
    backgroundColor: 'rgba(244,63,94,0.07)',
    borderColor: 'rgba(244,63,94,0.2)',
  },
  scorePlayerName: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  scorePlayerNameImposter: {
    color: COLORS.rose,
    fontFamily: FONTS.bold,
  },
  imposterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(244,63,94,0.15)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
  },
  imposterPillText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.rose,
    letterSpacing: 0.5,
  },
  scoreRight: {
    alignItems: 'flex-end',
  },
  scoreTick: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
  },
  scoreDelta: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginTop: -2,
  },

  // Actions
  actions: {
    gap: SPACING.xs,
    marginTop: 4,
  },
  playBtn: {},
  playBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    letterSpacing: 1.5,
  },
  changeLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  changeLinkText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    textDecorationLine: 'underline',
  },
});
