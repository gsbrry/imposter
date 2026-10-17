import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, AccessibilityInfo, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dice5, Play } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import Chip from '../components/Chip';
import Pill from '../components/Pill';
import PrimaryButton from '../components/PrimaryButton';
import TextButton from '../components/TextButton';
import { useGame } from '../context/GameContext';
import { useRequireGame } from '../hooks/useRequireGame';
import { storage, defaultGameSettings } from '../utils/storage';
import { pickStarter, clueOrder } from '../utils/pickStarter';

/**
 * Screen 37, Who starts. Shown once everyone has seen their word: the app
 * draws a starting player at random, then the clues go round in seating
 * order from them. The imposter is in the draw like anyone else.
 */
export default function WhoStartsScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const hasGame = useRequireGame();
  const [rounds, setRounds] = useState(defaultGameSettings.turnsBeforeGuess);
  const [timerLabel, setTimerLabel] = useState('timer off');

  const glow = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  const roll = useCallback(() => {
    setGame(g => ({
      ...g,
      starterId: pickStarter(g.players.map(p => p.id), g.lastStarterId),
    }));
  }, [setGame]);

  // First draw on arrival.
  useEffect(() => {
    roll();
  }, [roll]);

  useEffect(() => {
    storage.getGameSettings().then(gs => {
      setRounds(gs.turnsBeforeGuess ?? defaultGameSettings.turnsBeforeGuess);
      if (gs.timerPerClue === 'none') setTimerLabel('timer off');
      else if (gs.timerPerClue === 'custom') setTimerLabel(`${gs.customTimerSeconds || 60}s per clue`);
      else setTimerLabel(`${gs.timerPerClue}s per clue`);
    });

    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    let cancelled = false;
    const startPulse = () => {
      if (cancelled) return;
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    };
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduced => { if (!reduced) startPulse(); })
      .catch(startPulse);

    return () => { cancelled = true; };
  }, [entryAnim, entryY, glow]);

  const pickAgain = () => {
    roll();
    if (Platform.OS !== 'web') {
      import('expo-haptics')
        .then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
        .catch(() => {});
    }
  };

  const startClues = () => {
    // The starter this game becomes the one who sits out the next draw.
    setGame(g => ({ ...g, lastStarterId: g.starterId }));
    router.push('/clue-round');
  };

  const order = clueOrder(game.players, game.starterId);
  const starter = order[0];
  if (!hasGame || !starter) return null;

  const starterSeat = game.players.findIndex(p => p.id === starter.id);
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.38, 0.16] });
  const roundsLabel = `${rounds} clue round${rounds === 1 ? '' : 's'} · ${timerLabel}`;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          <Text style={styles.label}>EVERYONE HAS SEEN THEIR WORD</Text>

          <View style={styles.markWrap}>
            <Animated.View
              pointerEvents="none"
              style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
            />
            <Avatar name={starter.name} index={starterSeat} size={104} />
            <View style={styles.badge}>
              <Dice5 size={18} color={COLORS.honey} />
            </View>
          </View>

          <View style={styles.heading}>
            <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {starter.name} starts
            </Text>
            <Text style={styles.sub}>Picked at random. Then go clockwise.</Text>
          </View>

          <GlassCard style={styles.orderCard}>
            <Text style={styles.label}>CLUE ORDER</Text>
            <View style={styles.orderRow}>
              {order.map((p, i) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  selected={i === 0}
                  icon={
                    <Text style={[styles.seat, i === 0 && styles.seatOn]}>{i + 1}</Text>
                  }
                />
              ))}
            </View>
          </GlassCard>

          <Pill label={roundsLabel} style={styles.roundsPill} />

          <View style={styles.spacer} />

          <PrimaryButton
            label="Start clues"
            onPress={startClues}
            icon={<Play size={18} color={COLORS.onHoney} />}
          />
          <TextButton
            label="Pick again"
            onPress={pickAgain}
            icon={<Dice5 size={16} color={COLORS.textBody} />}
          />
        </Animated.View>
      </SafeAreaView>
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
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  markWrap: {
    alignSelf: 'center',
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 38,
    backgroundColor: COLORS.honey,
  },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 38,
    height: 38,
    borderRadius: RADIUS.icon,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
    borderWidth: 3,
    borderColor: COLORS.background,
  },

  heading: { alignItems: 'center', gap: 6 },
  title: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.2,
    color: COLORS.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
    textAlign: 'center',
  },

  orderCard: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  orderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  seat: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  seatOn: { color: COLORS.honey },

  roundsPill: { alignSelf: 'center' },


  spacer: { minHeight: SPACING.xs },
});
