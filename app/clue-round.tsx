import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowRight, Check, Pause,
  Brain, Car, House, UtensilsCrossed, Clapperboard, Trophy, PawPrint, Briefcase, PartyPopper,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import TimerRing from '../components/TimerRing';
import PrimaryButton from '../components/PrimaryButton';
import GlassButton from '../components/GlassButton';
import InkButton from '../components/InkButton';
import TextButton from '../components/TextButton';
import IconButton from '../components/IconButton';
import BottomSheet from '../components/BottomSheet';
import Pill from '../components/Pill';
import { useGame } from '../context/GameContext';
import { storage } from '../utils/storage';
import { CATEGORIES, CategoryIcon } from '../data/words';

const CATEGORY_ICONS: Record<CategoryIcon, typeof Brain> = {
  brain: Brain,
  car: Car,
  house: House,
  utensils: UtensilsCrossed,
  clapperboard: Clapperboard,
  trophy: Trophy,
  paw: PawPrint,
  briefcase: Briefcase,
  party: PartyPopper,
};

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
  const { game, resetGame } = useGame();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [maxTime, setMaxTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [teamVote, setTeamVote] = useState(false);
  const [rounds, setRounds] = useState(1);
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;
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
      setRounds(gs.turnsBeforeGuess ?? 1);
      setTimerSoundEnabled(ts);
      setSettingsLoaded(true);
    });
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  // Reset fired ticks when player changes
  useEffect(() => {
    firedAt.current = new Set();
  }, [currentIndex]);

  useEffect(() => {
    if (!settingsLoaded) return;
    clearInterval(timerRef.current);
    if (!timerEnabled) return;
    // Pausing stops the countdown, and with it the tick sounds.
    if (paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerEnabled, maxTime, currentIndex, settingsLoaded, paused]);

  // Restart the clock for each new player
  useEffect(() => {
    if (!settingsLoaded || !timerEnabled) return;
    firedAt.current = new Set();
    setTimeLeft(maxTime);
  }, [currentIndex, settingsLoaded, timerEnabled, maxTime]);

  // Countdown sound + haptic effects
  useEffect(() => {
    if (!timerEnabled || paused) return;
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
  }, [timeLeft, timerEnabled, timerSoundEnabled, paused]);

  const goToNext = () => {
    clearInterval(timerRef.current);
    setTimeLeft(maxTime);
    if (currentIndex < game.players.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      router.push(teamVote ? '/result' : '/vote');
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

  const exitGame = () => {
    clearInterval(timerRef.current);
    setPaused(false);
    resetGame();
    router.replace('/(tabs)');
  };

  const player = game.players[currentIndex];
  const progress = timerEnabled ? timeLeft / maxTime : 1;
  const isLast = currentIndex === game.players.length - 1;
  const timeCritical = timerEnabled && timeLeft <= 10 && timeLeft > 0;

  const handlePrimary = () => {
    if (teamVote && isLast) revealImposter();
    else goToNext();
  };

  if (!player) return null;

  const category = CATEGORIES.find(c => c.id === game.category);
  const CategoryIconCmp = category ? CATEGORY_ICONS[category.icon] : Brain;
  const ringSize = Math.min(190, width * 0.56);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const clock = timerEnabled ? `${mins}:${String(secs).padStart(2, '0')}` : '--';
  const primaryLabel = teamVote && isLast
    ? 'Reveal imposter'
    : isLast ? 'Go to vote' : 'Next player';

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          {/* Header: pause top left, round label, category pill */}
          <View style={styles.header}>
            <IconButton onPress={() => setPaused(true)} accessibilityLabel="Pause game">
              <Pause size={20} color={COLORS.ink} />
            </IconButton>
            <Text style={styles.label}>CLUE ROUND 1 OF {rounds}</Text>
            <Pill
              tone="honey"
              label={category?.label ?? 'General'}
              icon={<CategoryIconCmp size={14} color={COLORS.honeyText} />}
            />
          </View>

          {/* Timer ring */}
          <View style={styles.ringWrap}>
            <TimerRing size={ringSize} progress={progress} strokeWidth={10}>
              <View style={styles.ringCentre}>
                <Text
                  style={[styles.clock, timeCritical && styles.clockCritical]}
                  maxFontSizeMultiplier={1.3}
                >
                  {clock}
                </Text>
                <Text style={styles.label}>
                  {timerEnabled ? `OF ${maxTime}S` : 'NO TIMER'}
                </Text>
              </View>
            </TimerRing>
          </View>

          {/* Who is speaking */}
          <GlassCard style={styles.nowCard}>
            <Avatar name={player.name} index={currentIndex} size={44} />
            <View style={styles.nowText}>
              <Text style={styles.label}>NOW GIVING A CLUE</Text>
              <Text style={styles.nowName} numberOfLines={1}>{player.name}</Text>
            </View>
            <Text style={styles.nowCount}>
              {currentIndex + 1} of {game.players.length}
            </Text>
          </GlassCard>

          {/* Turn order */}
          <View style={styles.pips}>
            {game.players.map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.pipWrap,
                  i === currentIndex && styles.pipCurrent,
                  i > currentIndex && styles.pipUpcoming,
                ]}
              >
                {i < currentIndex ? (
                  <View style={styles.pipDone}>
                    <Check size={14} color={COLORS.ink} />
                  </View>
                ) : (
                  <Avatar name={p.name} index={i} size={30} />
                )}
              </View>
            ))}
          </View>

          {/* Rules */}
          <GlassCard style={styles.rules}>
            <Text style={styles.label}>RULES</Text>
            <Text style={styles.rulesText}>One word only. Do not say the word itself.</Text>
          </GlassCard>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            {!teamVote && (
              <GlassButton label="Skip to vote" onPress={goToVote} style={styles.actionSkip} />
            )}
            <PrimaryButton
              label={primaryLabel}
              onPress={handlePrimary}
              iconPosition="trailing"
              icon={<ArrowRight size={18} color={COLORS.onHoney} />}
              style={styles.actionNext}
            />
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Pause sheet. The countdown and its ticks stop while this is open. */}
      <BottomSheet visible={paused} onClose={() => setPaused(false)}>
        <Text style={styles.sheetTitle}>Paused</Text>
        <Text style={styles.sheetSub}>The timer is stopped. Nobody can see the word from here.</Text>
        <InkButton label="Resume" onPress={() => setPaused(false)} />
        <GlassButton
          label="Skip to the reveal"
          onPress={() => { setPaused(false); revealImposter(); }}
        />
        <TextButton label="Exit game" onPress={exitGame} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 24,
    gap: SPACING.gap,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },

  ringWrap: { alignItems: 'center', paddingVertical: 4 },
  ringCentre: { alignItems: 'center', gap: 2 },
  clock: {
    fontFamily: FONTS.displayBold,
    fontSize: 40,
    letterSpacing: -1.2,
    color: COLORS.ink,
  },
  // Urgency reads through weight and contrast; no red on this screen.
  clockCritical: { color: COLORS.honeyText },

  nowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
  },
  nowText: { flex: 1, minWidth: 0 },
  nowName: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  nowCount: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  pips: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pipWrap: { borderRadius: 10 },
  pipCurrent: {
    borderWidth: 2,
    borderColor: COLORS.honey,
    padding: 2,
    margin: -2,
  },
  pipUpcoming: { opacity: 0.35 },
  pipDone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
  },

  rules: {
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rulesText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.textBody,
  },

  spacer: { flex: 1, minHeight: SPACING.xs },
  actions: { flexDirection: 'row', gap: 8 },
  actionSkip: { flex: 1 },
  actionNext: { flex: 1.4 },

  sheetTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 26,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  sheetSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
    marginTop: -6,
  },
});
