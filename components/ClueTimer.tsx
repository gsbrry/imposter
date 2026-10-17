import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import TimerRing from './TimerRing';
import { COLORS, FONTS } from '../constants/theme';

/**
 * The countdown ring and clock for the clue round.
 *
 * This owns the ticking second, so only this subtree re-renders each
 * second. Left in the screen it re-rendered the whole clue round once a
 * second: the avatar row, the glass cards and their blur layers included.
 *
 * Remount it with a `key` to restart the clock for a new turn.
 */

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
    await Haptics.impactAsync(
      style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
    );
  } catch { /* silently ignore */ }
}

interface ClueTimerProps {
  size: number;
  enabled: boolean;
  maxTime: number;
  /** The countdown and its tick sounds both stop while this is true. */
  paused: boolean;
  soundEnabled: boolean;
}

function ClueTimer({ size, enabled, maxTime, paused, soundEnabled }: ClueTimerProps) {
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // Which countdown ticks have already sounded.
  const firedAt = useRef<Set<number>>(new Set());

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!enabled || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [enabled, paused]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Countdown sound and haptics.
  useEffect(() => {
    if (!enabled || paused) return;
    if (timeLeft <= 3 && timeLeft > 0 && !firedAt.current.has(timeLeft)) {
      firedAt.current.add(timeLeft);
      if (soundEnabled) playTick();
      triggerHaptic('light');
    }
    if (timeLeft === 0 && !firedAt.current.has(0)) {
      firedAt.current.add(0);
      if (soundEnabled) playTimeUp();
      triggerHaptic('heavy');
    }
  }, [timeLeft, enabled, soundEnabled, paused]);

  const progress = enabled ? timeLeft / maxTime : 1;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const clock = enabled ? `${mins}:${String(secs).padStart(2, '0')}` : '--';
  const critical = enabled && timeLeft <= 10 && timeLeft > 0;

  return (
    <View style={styles.wrap}>
      <TimerRing size={size} progress={progress} strokeWidth={10}>
        <View style={styles.centre}>
          <AppText
            style={[styles.clock, critical && styles.clockCritical]}
            maxFontSizeMultiplier={1.3}
          >
            {clock}
          </AppText>
          <AppText style={styles.label}>
            {paused ? 'PAUSED' : enabled ? `OF ${maxTime}S` : 'NO TIMER'}
          </AppText>
        </View>
      </TimerRing>
    </View>
  );
}

export default React.memo(ClueTimer);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 4 },
  centre: { alignItems: 'center', gap: 2 },
  clock: {
    fontFamily: FONTS.displayBold,
    fontSize: 40,
    letterSpacing: -1.2,
    color: COLORS.ink,
  },
  // Urgency reads through weight and contrast; no red on this screen.
  clockCritical: { color: COLORS.honeyText },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
});
