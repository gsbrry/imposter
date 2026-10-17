import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import {
  Crown, ChevronRight, Timer, Repeat, Volume2, Bell, Vibrate,
  ALargeSmall, Waves, CloudDownload, LifeBuoy, MessageSquare, FileText, Minus, Plus,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import SectionLabel from '../../components/SectionLabel';
import ListRow, { listRowStyles } from '../../components/ListRow';
import Toggle from '../../components/Toggle';
import IconButton from '../../components/IconButton';
import {
  storage, Settings, GameSettings, defaultGameSettings,
  GAME_SETTINGS_DEFAULTS_VERSION,
} from '../../utils/storage';
import { useGame } from '../../context/GameContext';
import { usePremium } from '@/hooks/usePremium';
import { REVIEW_ACCESS_ENABLED, REVIEW_UNLOCK_TAPS } from '@/constants/reviewAccess';
import { CATEGORIES, wordCount, CategoryKey } from '../../data/words';

// CustomerCenter is native-only.
let CustomerCenterModule: any = null;
if (Platform.OS !== 'web') {
  try {
    CustomerCenterModule = require('react-native-purchases-ui');
  } catch { /* not available */ }
}

const MIN_ROUNDS = 1;
const MAX_ROUNDS = 4;
const PRIVACY_URL = 'https://gooseberrymedia.in/impostr/privacy';
const SUPPORT_EMAIL = 'support@gooseberrymedia.in';

const TOTAL_WORDS = CATEGORIES.reduce((n, c) => n + wordCount(c.id as CategoryKey), 0);

export default function SettingsScreen() {
  const router = useRouter();
  const { isPremium, setIsPremium } = useGame();
  const { getExpiryDate } = usePremium();
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  const [settings, setSettings] = useState<Settings | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);
  const [timerSound, setTimerSound] = useState(true);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [unlockTaps, setUnlockTaps] = useState(0);
  const [reviewUnlocked, setReviewUnlocked] = useState(false);
  const [packsChecked, setPacksChecked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        storage.getSettings(),
        storage.getGameSettings(),
        storage.getTimerSound(),
      ]).then(([s, gs, ts]) => {
        setSettings(s);
        setGameSettings(gs);
        setTimerSound(ts);
        entryAnim.setValue(0);
        entryY.setValue(16);
        Animated.parallel([
          Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
      if (isPremium) getExpiryDate().then(setExpiryDate);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPremium, entryAnim, entryY])
  );

  const update = async (key: keyof Settings, value: boolean) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    await storage.setSettings(next);
  };

  const updateGame = async (patch: Partial<GameSettings>) => {
    const next: GameSettings = {
      ...gameSettings,
      ...patch,
      defaultsVersion: GAME_SETTINGS_DEFAULTS_VERSION,
    };
    setGameSettings(next);
    await storage.setGameSettings(next);
  };

  const updateTimerSound = async (value: boolean) => {
    setTimerSound(value);
    await storage.setTimerSound(value);
  };

  const adjustRounds = (delta: number) =>
    updateGame({
      turnsBeforeGuess: Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, gameSettings.turnsBeforeGuess + delta)),
    });

  /** Development aid only. Compiled out of release builds. */
  const handleVersionTap = async () => {
    if (!REVIEW_ACCESS_ENABLED || isPremium) return;
    const next = unlockTaps + 1;
    setUnlockTaps(next);
    if (next >= REVIEW_UNLOCK_TAPS) {
      await storage.setReviewUnlock(true);
      setIsPremium(true);
      setReviewUnlocked(true);
      setUnlockTaps(0);
    }
  };

  const openCustomerCenter = async () => {
    if (Platform.OS === 'web' || !CustomerCenterModule) return;
    try {
      await CustomerCenterModule.CustomerCenter.presentCustomerCenter();
    } catch (e) {
      console.warn('Customer Center failed:', e);
    }
  };

  const openUrl = (url: string) => { Linking.openURL(url).catch(() => {}); };

  if (!settings) return null;

  const timerOn = gameSettings.timerPerClue !== 'none';
  const timerSummary = !timerOn
    ? 'Off'
    : gameSettings.timerPerClue === 'custom'
    ? `${gameSettings.customTimerSeconds || 60}s per clue`
    : `${gameSettings.timerPerClue}s per clue`;

  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const versionLine = reviewUnlocked
    ? `Impostr ${version} · review access on`
    : `Impostr ${version} · Gooseberry Media`;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <Text style={styles.title} maxFontSizeMultiplier={1.4}>Settings</Text>

          {/* Premium */}
          {isPremium ? (
            <GlassCard style={styles.card}>
              <ListRow
                icon={<Crown size={17} color={COLORS.honeyText} />}
                title="Premium active"
                description={formattedExpiry ? `Renews ${formattedExpiry}` : 'Every pack unlocked'}
              />
              {Platform.OS !== 'web' && (
                <>
                  <View style={listRowStyles.divider} />
                  <ListRow
                    icon={<Crown size={17} color={COLORS.honeyText} />}
                    title="Manage subscription"
                    trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
                    onPress={openCustomerCenter}
                  />
                </>
              )}
            </GlassCard>
          ) : (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/premium')}
              accessibilityRole="button"
              accessibilityLabel="Go Premium"
              style={styles.goPremium}
            >
              <View style={styles.goPremiumTile}>
                <Crown size={18} color={COLORS.onHoney} />
              </View>
              <View style={styles.goPremiumText}>
                <Text style={styles.goPremiumTitle}>Go Premium</Text>
                <Text style={styles.goPremiumSub}>All 9 categories, no ads</Text>
              </View>
              <ChevronRight size={18} color={COLORS.honey} />
            </TouchableOpacity>
          )}

          {/* Gameplay */}
          <SectionLabel>Gameplay</SectionLabel>
          <GlassCard style={styles.card}>
            <ListRow
              icon={<Timer size={17} color={COLORS.honeyText} />}
              title="Round timer"
              description={`Countdown in the clue round · ${timerSummary}`}
              trailing={
                <Toggle
                  value={timerOn}
                  onValueChange={v => updateGame({ timerPerClue: v ? 30 : 'none' })}
                  accessibilityLabel="Round timer"
                />
              }
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<Repeat size={17} color={COLORS.honeyText} />}
              title="Clue rounds"
              description="Turns before voting"
              trailing={
                <View style={styles.stepper}>
                  <IconButton
                    size={32}
                    onPress={() => adjustRounds(-1)}
                    accessibilityLabel="Fewer clue rounds"
                    style={gameSettings.turnsBeforeGuess <= MIN_ROUNDS ? styles.disabled : undefined}
                  >
                    <Minus
                      size={16}
                      color={gameSettings.turnsBeforeGuess <= MIN_ROUNDS ? COLORS.textFaint : COLORS.ink}
                    />
                  </IconButton>
                  <Text style={styles.stepperValue}>{gameSettings.turnsBeforeGuess}</Text>
                  <IconButton
                    size={32}
                    onPress={() => adjustRounds(1)}
                    accessibilityLabel="More clue rounds"
                    style={gameSettings.turnsBeforeGuess >= MAX_ROUNDS ? styles.disabled : undefined}
                  >
                    <Plus
                      size={16}
                      color={gameSettings.turnsBeforeGuess >= MAX_ROUNDS ? COLORS.textFaint : COLORS.ink}
                    />
                  </IconButton>
                </View>
              }
            />
          </GlassCard>

          {/* Sound and feel */}
          <SectionLabel>Sound and feel</SectionLabel>
          <GlassCard style={styles.card}>
            <ListRow
              icon={<Volume2 size={17} color={COLORS.honeyText} />}
              title="Sound effects"
              description="Blip on reveal, fanfare at the end"
              trailing={
                <Toggle
                  value={settings.soundEnabled}
                  onValueChange={v => update('soundEnabled', v)}
                  accessibilityLabel="Sound effects"
                />
              }
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<Bell size={17} color={COLORS.honeyText} />}
              title="Timer sounds"
              description="Tick in the last 10 seconds"
              trailing={
                <Toggle
                  value={timerSound}
                  onValueChange={updateTimerSound}
                  accessibilityLabel="Timer sounds"
                />
              }
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<Vibrate size={17} color={COLORS.honeyText} />}
              title="Haptics"
              description="Buzz on every reveal, the same for everyone"
              trailing={
                <Toggle
                  value={settings.hapticsEnabled}
                  onValueChange={v => update('hapticsEnabled', v)}
                  accessibilityLabel="Haptics"
                />
              }
            />
          </GlassCard>

          {/* Accessibility */}
          <SectionLabel>Accessibility</SectionLabel>
          <GlassCard style={styles.card}>
            <ListRow
              icon={<ALargeSmall size={17} color={COLORS.honeyText} />}
              title="Larger text"
              description="Bigger words and buttons"
              trailing={
                <Toggle
                  value={settings.largerText}
                  onValueChange={v => update('largerText', v)}
                  accessibilityLabel="Larger text"
                />
              }
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<Waves size={17} color={COLORS.honeyText} />}
              title="Reduce motion"
              description="Turn off pulses and glows"
              trailing={
                <Toggle
                  value={settings.reduceMotion}
                  onValueChange={v => update('reduceMotion', v)}
                  accessibilityLabel="Reduce motion"
                />
              }
            />
          </GlassCard>

          {/* Word packs */}
          <SectionLabel>Word packs</SectionLabel>
          <GlassCard style={styles.card}>
            <ListRow
              icon={<CloudDownload size={17} color={COLORS.honeyText} />}
              title={packsChecked ? 'Words are up to date' : 'Words up to date'}
              description={`${TOTAL_WORDS.toLocaleString()} words · bundled with this version`}
              trailing={
                <TouchableOpacity
                  onPress={() => setPacksChecked(true)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Check for new words"
                  style={styles.checkBtn}
                >
                  <Text style={styles.checkText}>Check</Text>
                </TouchableOpacity>
              }
            />
          </GlassCard>

          {/* Help */}
          <SectionLabel>Help</SectionLabel>
          <GlassCard style={styles.card}>
            <ListRow
              icon={<LifeBuoy size={17} color={COLORS.honeyText} />}
              title="Help and support"
              description="Report a problem or a word"
              trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
              onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}?subject=Impostr%20${version}`)}
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<MessageSquare size={17} color={COLORS.honeyText} />}
              title="Suggest a category"
              trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
              onPress={() => router.push('/suggest')}
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<FileText size={17} color={COLORS.honeyText} />}
              title="Privacy policy"
              trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
              onPress={() => openUrl(PRIVACY_URL)}
            />
          </GlassCard>

          <TouchableOpacity
            activeOpacity={1}
            onPress={handleVersionTap}
            accessibilityRole="text"
          >
            <Text style={styles.version}>{versionLine}</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    // Clears the floating tab bar.
    paddingBottom: 120,
    gap: 10,
  },

  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
    marginBottom: 2,
  },

  card: { borderRadius: 18 },

  // Go Premium
  goPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: SPACING.cardPadding,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.ink,
  },
  goPremiumTile: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honey,
  },
  goPremiumText: { flex: 1, minWidth: 0 },
  goPremiumTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.background,
  },
  goPremiumSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.onInkMuted,
    marginTop: 1,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 17,
    width: 18,
    textAlign: 'center',
    color: COLORS.ink,
  },
  disabled: { opacity: 0.4 },

  checkBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
  },
  checkText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.honeyText,
  },

  version: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 10,
  },
});
