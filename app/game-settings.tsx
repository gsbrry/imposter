import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, Animated, Keyboard, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { storage, GameSettings, defaultGameSettings } from '../utils/storage';
import { useGame } from '../context/GameContext';

const TURNS_OPTIONS = [1, 2, 3, 4];
const TIMER_OPTIONS: { label: string; value: number | 'none' | 'custom' }[] = [
  { label: 'No Timer', value: 'none' },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: 'Custom', value: 'custom' },
];

export default function GameSettingsScreen() {
  const router = useRouter();
  const { setGame } = useGame();
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  const [playerCount, setPlayerCount] = useState(defaultGameSettings.playerCount);
  const [turnsBeforeGuess, setTurnsBeforeGuess] = useState(defaultGameSettings.turnsBeforeGuess);
  const [timerPerClue, setTimerPerClue] = useState<number | 'none' | 'custom'>(30);
  const [customSeconds, setCustomSeconds] = useState(String(defaultGameSettings.customTimerSeconds));
  const [teamVote, setTeamVote] = useState(false);

  const playerScaleDown = useRef(new Animated.Value(1)).current;
  const playerScaleUp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    storage.getGameSettings().then(s => {
      setPlayerCount(s.playerCount);
      setTurnsBeforeGuess(s.turnsBeforeGuess ?? 1);
      setTimerPerClue(s.timerPerClue);
      setCustomSeconds(String(s.customTimerSeconds));
    });
    storage.getTeamVote().then(setTeamVote);
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const pulse = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  };

  const adjustPlayerCount = (delta: number) => {
    pulse(delta < 0 ? playerScaleDown : playerScaleUp);
    setPlayerCount(p => Math.min(15, Math.max(3, p + delta)));
  };

  const handleNext = async () => {
    const parsed = parseInt(customSeconds, 10);
    const safeCustom = isNaN(parsed) || parsed < 1 ? 60 : Math.min(300, parsed);
    const settings: GameSettings = { playerCount, turnsBeforeGuess, timerPerClue, customTimerSeconds: safeCustom };
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

  const timerLabel =
    timerPerClue === 'none'
      ? 'Off'
      : timerPerClue === 'custom'
      ? `${parseInt(customSeconds, 10) || 60}s`
      : timerPerClue >= 60
      ? `${timerPerClue / 60} min`
      : `${timerPerClue}s`;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ChevronLeft size={22} color={COLORS.textBody} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerLabel}>STEP 2 OF 3</Text>
              <Text style={styles.title}>Game Settings</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          {/* Number of players */}
          <Text style={styles.sectionLabel}>NUMBER OF PLAYERS</Text>
          <View style={styles.card}>
            <Animated.View style={{ transform: [{ scale: playerScaleDown }] }}>
              <TouchableOpacity
                style={[styles.countBtn, playerCount <= 3 && styles.countBtnDisabled]}
                onPress={() => adjustPlayerCount(-1)}
                activeOpacity={0.75}
                disabled={playerCount <= 3}
              >
                <Minus size={24} color={playerCount <= 3 ? COLORS.textMuted : COLORS.white} />
              </TouchableOpacity>
            </Animated.View>
            <View style={styles.countCenter}>
              <Text style={styles.countNumber}>{playerCount}</Text>
              <Text style={styles.countSub}>players</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: playerScaleUp }] }}>
              <TouchableOpacity
                style={[styles.countBtn, playerCount >= 15 && styles.countBtnDisabled]}
                onPress={() => adjustPlayerCount(1)}
                activeOpacity={0.75}
                disabled={playerCount >= 15}
              >
                <Plus size={24} color={playerCount >= 15 ? COLORS.textMuted : COLORS.yellow} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Turns before guess */}
          <Text style={styles.sectionLabel}>TURNS BEFORE GUESS</Text>
          <Text style={styles.sectionSubtitle}>
            Each player gives one clue word per turn, then the group guesses the imposter
          </Text>
          <View style={styles.pillRow}>
            {TURNS_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.pill, turnsBeforeGuess === n && styles.pillActive]}
                onPress={() => setTurnsBeforeGuess(n)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, turnsBeforeGuess === n && styles.pillTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Timer per clue */}
          <Text style={styles.sectionLabel}>TIMER PER CLUE</Text>
          <View style={styles.timerRow}>
            {TIMER_OPTIONS.map(opt => {
              const active = timerPerClue === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.timerPill, active && styles.pillActive]}
                  onPress={() => setTimerPerClue(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {timerPerClue === 'custom' && (
            <View style={styles.customInputWrap}>
              <Text style={styles.customLabel}>Seconds (max 300)</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  value={customSeconds}
                  onChangeText={t => setCustomSeconds(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="60"
                  placeholderTextColor={COLORS.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                <Text style={styles.customUnit}>sec</Text>
              </View>
            </View>
          )}

          {/* Team Vote toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Team votes together</Text>
              <Text style={styles.toggleSub}>
                Skip individual voting, reveal imposter directly
              </Text>
            </View>
            <Switch
              value={teamVote}
              onValueChange={setTeamVote}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.yellowGlow }}
              thumbColor={teamVote ? COLORS.yellow : 'rgba(255,255,255,0.4)'}
              ios_backgroundColor="rgba(255,255,255,0.1)"
            />
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <SummaryRow label="Players" value={`${playerCount}`} />
            <SummaryRow label="Turns before guess" value={`${turnsBeforeGuess}`} />
            <SummaryRow label="Timer per clue" value={timerLabel} />
            <SummaryRow label="Team votes together" value={teamVote ? 'Yes' : 'No'} />
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Enter Player Names</Text>
            <ChevronRight size={20} color={COLORS.nearBlack} />
          </TouchableOpacity>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: SPACING.md, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    textAlign: 'center',
  },

  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: SPACING.md,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    marginTop: -2,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  countBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  countBtnDisabled: { opacity: 0.3 },
  countCenter: { alignItems: 'center', gap: 2 },
  countNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 56,
    color: COLORS.yellow,
    lineHeight: 64,
  },
  countSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLabel,
  },

  pillRow: { flexDirection: 'row', gap: SPACING.xs },
  timerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flex: 1,
    minHeight: 52,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  timerPill: {
    minHeight: 48,
    minWidth: 56,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  pillActive: {
    backgroundColor: COLORS.yellowGlass,
    borderColor: COLORS.yellow,
  },
  pillText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textLabel,
  },
  pillTextActive: {
    color: COLORS.yellow,
    fontFamily: FONTS.bold,
  },

  customInputWrap: { marginTop: SPACING.xs },
  customLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textLabel,
    marginBottom: 6,
  },
  customInputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  customInput: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.yellowGlass,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    paddingHorizontal: SPACING.sm,
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    color: COLORS.yellow,
    textAlign: 'center',
  },
  customUnit: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.textLabel,
    width: 32,
  },

  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  toggleInfo: { flex: 1, gap: 3 },
  toggleLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
  },
  toggleSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLabel,
  },

  summary: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLabel,
  },
  summaryValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.yellow,
  },

  nextBtn: {
    height: 56,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: COLORS.nearBlack,
    letterSpacing: 0.3,
  },
});
