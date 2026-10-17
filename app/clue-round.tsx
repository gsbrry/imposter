import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Eye, FastForward } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import TimerRing from '../components/TimerRing';
import PrimaryButton from '../components/PrimaryButton';
import { useGame } from '../context/GameContext';
import HomeButton from '../components/HomeButton';
import { storage } from '../utils/storage';

// ---------------------------------------------------------------------------
// Web Audio sound helpers (no external files needed)
// ---------------------------------------------------------------------------
function playTick(volume = 0.6) {
  if (Platform.OS !== 'web') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
    osc.onended = () => ctx.close();
  } catch { /* silently ignore */ }
}

function playTimeUp(volume = 0.8) {
  if (Platform.OS !== 'web') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const play = (freq: number, startAt: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
      gain.gain.setValueAtTime(volume, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + dur);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + dur);
    };
    play(1200, 0, 0.06);
    play(800, 0.08, 0.06);
    setTimeout(() => ctx.close(), 300);
  } catch { /* silently ignore */ }
}

async function triggerHaptic(style: 'light' | 'heavy') {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = await import('expo-haptics');
    if (style === 'heavy') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch { /* silently ignore */ }
}

export default function ClueRoundScreen() {
  const router = useRouter();
  const { game } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [maxTime, setMaxTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [teamVote, setTeamVote] = useState(false);
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSkipSheet, setShowSkipSheet] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  // Track which countdown ticks we've already fired
  const firedAt = useRef<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      storage.getSettings(),
      storage.getGameSettings(),
      storage.getTeamVote(),
      storage.getTimerSound(),
    ]).then(([, gs, tv, ts]) => {
      const timer = gs.timerPerClue;
      const noTimer = timer === 'none';
      let seconds = 30;
      if (!noTimer) {
        seconds = timer === 'custom' ? (gs.customTimerSeconds || 30) : (timer as number);
      }
      setTimerEnabled(!noTimer);
      setMaxTime(seconds);
      setTimeLeft(seconds);
      setTeamVote(tv);
      setTimerSoundEnabled(ts);
      setSettingsLoaded(true);
    });
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  // Reset fired ticks when player changes
  useEffect(() => {
    firedAt.current = new Set();
  }, [currentIndex]);

  useEffect(() => {
    if (!settingsLoaded) return;
    clearInterval(timerRef.current);
    if (!timerEnabled) return;
    firedAt.current = new Set();
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerEnabled, maxTime, currentIndex, settingsLoaded]);

  // Countdown sound + haptic effects
  useEffect(() => {
    if (!timerEnabled) return;
    if (timeLeft <= 3 && timeLeft > 0 && !firedAt.current.has(timeLeft)) {
      firedAt.current.add(timeLeft);
      if (timerSoundEnabled) playTick();
      triggerHaptic('light');
    }
    if (timeLeft === 0 && !firedAt.current.has(0)) {
      firedAt.current.add(0);
      if (timerSoundEnabled) playTimeUp();
      triggerHaptic('heavy');
    }
  }, [timeLeft, timerEnabled, timerSoundEnabled]);

  const openSkipSheet = () => {
    setShowSkipSheet(true);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start();
  };

  const closeSkipSheet = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setShowSkipSheet(false)
    );
  };

  const confirmSkip = () => {
    closeSkipSheet();
    clearInterval(timerRef.current);
    router.push('/result');
  };

  const goToNext = () => {
    clearInterval(timerRef.current);
    setTimeLeft(maxTime);
    if (currentIndex < game.players.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      if (teamVote) {
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
  const timeCritical = timerEnabled && timeLeft <= 10 && timeLeft > 0;

  const primaryLabel = teamVote
    ? (isLast ? 'REVEAL IMPOSTER' : `Next: ${game.players[currentIndex + 1]?.name}`)
    : (isLast ? 'Go to Vote' : `Next: ${game.players[currentIndex + 1]?.name}`);

  const handlePrimary = () => {
    if (teamVote && isLast) revealImposter();
    else goToNext();
  };

  if (!player) return null;

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

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
            <View style={styles.topRight}>
              <View style={styles.timerBadge}>
                <Text style={[styles.timerText, timeCritical && styles.timerCritical]}>
                  {timerEnabled ? `${timeLeft}s` : '—'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={openSkipSheet}
                style={styles.skipAllBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Skip all remaining clues"
              >
                <FastForward size={22} color={COLORS.honey} fill={COLORS.honey} />
              </TouchableOpacity>
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
                <Avatar name={player.name} index={currentIndex} size={52} />
              </View>
            </View>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.instruction}>Give one word clue about the secret word</Text>
            {timeLeft === 0 && timerEnabled && (
              <View style={styles.timesUpBadge}>
                <Text style={styles.timesUp}>TIME&apos;S UP</Text>
              </View>
            )}
          </GlassCard>

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsLabel}>TIPS</Text>
            <Text style={styles.tipItem}>One word only — no phrases</Text>
            <Text style={styles.tipItem}>Don&apos;t say the word itself</Text>
            <Text style={styles.tipItem}>Imposters — be convincing!</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <PrimaryButton
              label={primaryLabel}
              onPress={handlePrimary}
              icon={
                teamVote && isLast
                  ? <Eye size={18} color={COLORS.ink} />
                  : <ChevronRight size={18} color={COLORS.ink} />
              }
            />

            {!teamVote && (
              <View style={styles.secondaryRow}>
                <TouchableOpacity style={styles.ghostBtn} onPress={goToVote} activeOpacity={0.75}>
                  <Text style={styles.ghostText}>Go to Vote</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.revealBtn} onPress={revealImposter} activeOpacity={0.75}>
                  <Eye size={14} color={COLORS.honey} />
                  <Text style={styles.revealText}>Reveal Imposter</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Skip-all confirmation bottom sheet */}
      {showSkipSheet && (
        <Modal transparent animationType="none" onRequestClose={closeSkipSheet}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSkipSheet} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Skip all turns and reveal imposter?</Text>
            <Text style={styles.sheetSub}>All remaining clue turns will be skipped.</Text>
            <TouchableOpacity style={styles.sheetYes} onPress={confirmSkip} activeOpacity={0.85}>
              <Text style={styles.sheetYesText}>Yes, skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetNo} onPress={closeSkipSheet} activeOpacity={0.75}>
              <Text style={styles.sheetNoText}>Keep playing</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: COLORS.ink,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    backgroundColor: COLORS.honeySoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    minWidth: 48,
    alignItems: 'center',
  },
  timerText: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: COLORS.honey,
  },
  timerCritical: { color: COLORS.danger },
  skipAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
    backgroundColor: COLORS.divider,
  },
  dotDone: { backgroundColor: COLORS.honeyBorder },
  dotActive: { backgroundColor: COLORS.honey, width: 18 },

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
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.ink,
  },
  instruction: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  timesUpBadge: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    marginTop: 4,
  },
  timesUp: {
    fontFamily: FONTS.displayBold,
    fontSize: 12,
    color: COLORS.danger,
    letterSpacing: 2,
  },

  tips: {
    gap: 6,
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tipsLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipItem: {
    fontFamily: FONTS.bodyRegular,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  revealBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    backgroundColor: COLORS.honeySoft,
  },
  revealText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.honey,
  },

  // Bottom sheet
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.scrim,
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.glassFillStrong,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.md,
    paddingBottom: 40,
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  sheetTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  sheetYes: {
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetYesText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 15,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  sheetNo: {
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetNoText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
