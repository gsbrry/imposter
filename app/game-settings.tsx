import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, TextInput, Animated, Keyboard,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ArrowRight from 'lucide-react-native/dist/esm/icons/arrow-right';
import Minus from 'lucide-react-native/dist/esm/icons/minus';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import StepHeader from '../components/StepHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import IconButton from '../components/IconButton';
import Stepper from '../components/Stepper';
import Chip from '../components/Chip';
import Toggle from '../components/Toggle';
import { storage, GameSettings, defaultGameSettings, GAME_SETTINGS_DEFAULTS_VERSION } from '../utils/storage';
import { useGame } from '../context/GameContext';
import { useWebFocusRing } from '../hooks/useWebFocusRing';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 15;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 4;

type TimerValue = number | 'none' | 'custom';

const TIMER_OPTIONS: { label: string; value: TimerValue }[] = [
  { label: 'Off', value: 'none' },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: 'Custom', value: 'custom' },
];

export default function GameSettingsScreen() {
  const router = useRouter();
  const { setGame } = useGame();
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  const [playerCount, setPlayerCount] = useState(defaultGameSettings.playerCount);
  const [turnsBeforeGuess, setTurnsBeforeGuess] = useState(defaultGameSettings.turnsBeforeGuess);
  const [timerPerClue, setTimerPerClue] = useState<TimerValue>(defaultGameSettings.timerPerClue);
  const [customSeconds, setCustomSeconds] = useState(String(defaultGameSettings.customTimerSeconds));
  const [teamVote, setTeamVote] = useState(false);
  const customFocus = useWebFocusRing();

  useEffect(() => {
    storage.getGameSettings().then(s => {
      setPlayerCount(s.playerCount);
      setTurnsBeforeGuess(s.turnsBeforeGuess ?? defaultGameSettings.turnsBeforeGuess);
      setTimerPerClue(s.timerPerClue);
      setCustomSeconds(String(s.customTimerSeconds));
    });
    storage.getTeamVote().then(setTeamVote);
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  const adjustPlayers = (delta: number) =>
    setPlayerCount(p => Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, p + delta)));

  const adjustRounds = (delta: number) =>
    setTurnsBeforeGuess(r => Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, r + delta)));

  const handleNext = async () => {
    const parsed = parseInt(customSeconds, 10);
    const safeCustom = isNaN(parsed) || parsed < 1 ? 60 : Math.min(300, parsed);
    // Saving here is an explicit choice, so stamp it against the current defaults.
    const settings: GameSettings = {
      playerCount, turnsBeforeGuess, timerPerClue,
      customTimerSeconds: safeCustom,
      defaultsVersion: GAME_SETTINGS_DEFAULTS_VERSION,
    };
    await storage.setGameSettings(settings);
    await storage.setTeamVote(teamVote);
    const savedPlayers = await storage.getPlayers();
    const defaultPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: `player_${i}`,
      name: savedPlayers[i]?.name ?? `Player ${i + 1}`,
      iconIndex: savedPlayers[i]?.iconIndex ?? i,
      score: 0,
    }));
    setGame(g => ({ ...g, gameSettings: settings, players: defaultPlayers }));
    router.push('/player-names');
  };

  const timerSummary =
    timerPerClue === 'none'
      ? 'Off'
      : timerPerClue === 'custom'
      ? `${parseInt(customSeconds, 10) || 60} sec`
      : `${timerPerClue} sec`;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <StepHeader step={2} label="Step 2 of 3" onBack={() => router.back()} />

          <AppText style={styles.title} maxFontSizeMultiplier={1.4}>Game settings</AppText>

          {/* Players */}
          <GlassCard style={styles.card}>
            <AppText style={styles.label}>PLAYERS</AppText>
            <Stepper
              value={playerCount}
              onDecrement={() => adjustPlayers(-1)}
              onIncrement={() => adjustPlayers(1)}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              decrementAccessibilityLabel="Fewer players"
              incrementAccessibilityLabel="More players"
            />
            <View style={styles.dots}>
              {Array.from({ length: Math.min(playerCount, 8) }, (_, i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: COLORS.avatars[i % COLORS.avatars.length] }]}
                />
              ))}
              <View style={[styles.dot, styles.dotEmpty]} />
            </View>
          </GlassCard>

          {/* Timer per clue */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHead}>
              <AppText style={styles.label}>TIMER PER CLUE</AppText>
              <AppText style={styles.value}>{timerSummary}</AppText>
            </View>
            <View style={styles.chips}>
              {TIMER_OPTIONS.map(opt => (
                <Chip
                  key={String(opt.value)}
                  label={opt.label}
                  selected={timerPerClue === opt.value}
                  onPress={() => setTimerPerClue(opt.value)}
                />
              ))}
            </View>
            {timerPerClue === 'custom' && (
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.customInput, customFocus.focusStyle]}
                  onFocus={customFocus.onFocus}
                  onBlur={customFocus.onBlur}
                  value={customSeconds}
                  onChangeText={t => setCustomSeconds(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="60"
                  placeholderTextColor={COLORS.textFaint}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  accessibilityLabel="Custom timer in seconds"
                />
                <AppText style={styles.customUnit}>sec, max 300</AppText>
              </View>
            )}
          </GlassCard>

          {/* Rounds and team vote */}
          <GlassCard style={styles.list}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <AppText style={styles.rowTitle}>Clue rounds</AppText>
                <AppText style={styles.rowSub}>Turns before voting</AppText>
              </View>
              <View style={styles.rowStepper}>
                <IconButton
                  size={32}
                  onPress={() => adjustRounds(-1)}
                  accessibilityLabel="Fewer clue rounds"
                  style={turnsBeforeGuess <= MIN_ROUNDS ? styles.disabled : undefined}
                >
                  <Minus size={16} color={turnsBeforeGuess <= MIN_ROUNDS ? COLORS.textFaint : COLORS.ink} />
                </IconButton>
                <AppText style={styles.rowValue}>{turnsBeforeGuess}</AppText>
                <IconButton
                  size={32}
                  onPress={() => adjustRounds(1)}
                  accessibilityLabel="More clue rounds"
                  style={turnsBeforeGuess >= MAX_ROUNDS ? styles.disabled : undefined}
                >
                  <Plus size={16} color={turnsBeforeGuess >= MAX_ROUNDS ? COLORS.textFaint : COLORS.ink} />
                </IconButton>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowText}>
                <AppText style={styles.rowTitle}>Team votes together</AppText>
                <AppText style={styles.rowSub}>One shared vote on this phone</AppText>
              </View>
              <Toggle
                value={teamVote}
                onValueChange={setTeamVote}
                accessibilityLabel="Team votes together"
              />
            </View>
          </GlassCard>

          <View style={styles.spacer} />

          <PrimaryButton
            label="Add player names"
            onPress={handleNext}
            iconPosition="trailing"
            icon={<ArrowRight size={18} color={COLORS.onHoney} />}
          />
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

  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  value: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12.5,
    color: COLORS.honeyText,
  },

  card: {
    padding: SPACING.cardPadding,
    gap: 10,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.textMuted,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    width: 86,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: COLORS.ink,
    textAlign: 'center',
  },
  customUnit: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },

  list: { borderRadius: RADIUS.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  rowSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rowStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 17,
    width: 18,
    textAlign: 'center',
    color: COLORS.ink,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  disabled: { opacity: 0.4 },

  spacer: { flex: 1, minHeight: SPACING.sm },
});
