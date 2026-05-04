import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Eye } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import PlayerAvatar from '../components/PlayerAvatar';
import TimerRing from '../components/TimerRing';
import PillButton from '../components/PillButton';
import { useGame } from '../context/GameContext';
import HomeButton from '../components/HomeButton';
import { storage } from '../utils/storage';

export default function ClueRoundScreen() {
  const router = useRouter();
  const { game } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [maxTime, setMaxTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [teamVote, setTeamVote] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Promise.all([storage.getSettings(), storage.getGameSettings(), storage.getTeamVote()]).then(
      ([, gs, tv]) => {
        const timer = gs.timerPerClue;
        const noTimer = timer === 'none';
        let seconds = 60;
        if (!noTimer) {
          seconds = timer === 'custom' ? (gs.customTimerSeconds || 60) : (timer as number);
        }
        setTimerEnabled(!noTimer);
        setMaxTime(seconds);
        setTimeLeft(seconds);
        setTeamVote(tv);
        setSettingsLoaded(true);
      }
    );
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    clearInterval(timerRef.current);
    if (!timerEnabled) return;
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerEnabled, maxTime, currentIndex, settingsLoaded]);

  const goToNext = () => {
    clearInterval(timerRef.current);
    setTimeLeft(maxTime);
    if (currentIndex < game.players.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // All turns done
      if (teamVote) {
        // Team vote ON: go straight to result, skipping vote
        router.push('/result');
      } else {
        router.push('/vote');
      }
    }
  };

  const goToVote = () => {
    clearInterval(timerRef.current);
    router.push('/vote');
  };

  const revealImposter = () => {
    clearInterval(timerRef.current);
    router.push('/result');
  };

  const player = game.players[currentIndex];
  const progress = timerEnabled ? timeLeft / maxTime : 1;
  const isLast = currentIndex === game.players.length - 1;
  const allTurnsDone = isLast;
  const timeCritical = timerEnabled && timeLeft <= 10 && timeLeft > 0;

  // Primary button label depends on team vote mode
  const primaryLabel = teamVote
    ? (allTurnsDone ? 'REVEAL IMPOSTER' : `Next: ${game.players[currentIndex + 1]?.name}`)
    : (isLast ? 'Go to Vote' : `Next: ${game.players[currentIndex + 1]?.name}`);

  const handlePrimary = () => {
    if (teamVote && allTurnsDone) {
      revealImposter();
    } else {
      goToNext();
    }
  };

  if (!player) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          {/* Header */}
          <View style={styles.topRow}>
            <HomeButton />
            <Text style={styles.title}>Clue Round</Text>
            <View style={styles.timerBadge}>
              <Text style={[styles.timerText, timeCritical && styles.timerCritical]}>
                {timerEnabled ? `${timeLeft}s` : '—'}
              </Text>
            </View>
          </View>

          {/* Progress dots */}
          <View style={styles.progress}>
            {game.players.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < currentIndex && styles.dotDone,
                  i === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Player card */}
          <GlassCard style={styles.playerCard}>
            <View style={styles.avatarWrap}>
              <TimerRing size={96} progress={progress} strokeWidth={3} />
              <View style={styles.avatarInner}>
                <PlayerAvatar iconIndex={player.iconIndex} playerIndex={currentIndex} size={52} />
              </View>
            </View>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.instruction}>Give one word clue about the secret word</Text>
            {timeLeft === 0 && timerEnabled && (
              <View style={styles.timesUpBadge}>
                <Text style={styles.timesUp}>TIME'S UP</Text>
              </View>
            )}
          </GlassCard>

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsLabel}>TIPS</Text>
            <Text style={styles.tipItem}>One word only — no phrases</Text>
            <Text style={styles.tipItem}>Don't say the word itself</Text>
            <Text style={styles.tipItem}>Imposters — be convincing!</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <PillButton
              label={primaryLabel}
              onPress={handlePrimary}
              variant="yellow"
              icon={
                teamVote && allTurnsDone
                  ? <Eye size={18} color={COLORS.nearBlack} />
                  : <ChevronRight size={18} color={COLORS.nearBlack} />
              }
            />

            {/* Secondary row — only shown when NOT in team vote mode */}
            {!teamVote && (
              <View style={styles.secondaryRow}>
                <TouchableOpacity style={styles.ghostBtn} onPress={goToVote} activeOpacity={0.75}>
                  <Text style={styles.ghostText}>Go to Vote</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.revealBtn} onPress={revealImposter} activeOpacity={0.75}>
                  <Eye size={14} color={COLORS.yellow} />
                  <Text style={styles.revealText}>Reveal Imposter</Text>
                </TouchableOpacity>
              </View>
            )}
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
    justifyContent: 'space-between',
    paddingBottom: 32,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  timerBadge: {
    backgroundColor: COLORS.yellowGlass,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    minWidth: 48,
    alignItems: 'center',
  },
  timerText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.yellow,
  },
  timerCritical: { color: COLORS.rose },

  progress: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dotDone: { backgroundColor: 'rgba(255,214,0,0.4)' },
  dotActive: { backgroundColor: COLORS.yellow, width: 18 },

  playerCard: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
  avatarWrap: {
    position: 'relative',
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: { position: 'absolute' },
  playerName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.white,
  },
  instruction: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLabel,
    textAlign: 'center',
  },
  timesUpBadge: {
    backgroundColor: 'rgba(244,63,94,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
    marginTop: 4,
  },
  timesUp: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.rose,
    letterSpacing: 2,
  },

  tips: {
    gap: 6,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tipsLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipItem: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textBody,
  },

  actions: { gap: SPACING.xs },
  secondaryRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  ghostBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textLabel,
  },
  revealBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    backgroundColor: COLORS.yellowGlass,
  },
  revealText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.yellow,
  },
});
