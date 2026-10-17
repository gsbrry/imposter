import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  HelpCircle, Play, Users, WifiOff, RefreshCw, ChevronRight, X,
  Brain, Car, House, UtensilsCrossed, Clapperboard, Trophy, PawPrint, Briefcase, PartyPopper,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import InkButton from '../../components/InkButton';
import IconButton from '../../components/IconButton';
import BottomSheet from '../../components/BottomSheet';
import AppMark from '../../components/AppMark';
import Pill from '../../components/Pill';
import { CATEGORIES, CategoryIcon, CategoryKey } from '../../data/words';
import { storage } from '../../utils/storage';
import { useGame } from '../../context/GameContext';
import { useHideTabBar } from '../../components/TabBarVisibility';

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

const HOW_TO_PLAY = [
  {
    title: 'One word, one imposter',
    body: 'Everyone sees the same secret word except the imposter, who has to blend in.',
  },
  {
    title: 'Give one-word clues',
    body: 'Take turns. Say a clue about the word without saying the word itself.',
  },
  {
    title: 'Vote and reveal',
    body: 'Vote for the imposter. Crew wins by catching them. The imposter wins by surviving.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { setGame } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [lastGame, setLastGame] = useState<{ category: CategoryKey; players: number } | null>(null);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  // The sheet is drawn inside this screen, so the tab bar steps aside.
  useHideTabBar(showHowToPlay);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  // Refresh the "Play again" summary whenever the tab regains focus, so it
  // reflects a game that was just played.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([storage.getLastCategory(), storage.getGameSettings()]).then(([cat, gs]) => {
        if (!active) return;
        const known = CATEGORIES.some(c => c.id === cat);
        setLastGame(known ? { category: cat as CategoryKey, players: gs.playerCount } : null);
      });
      return () => { active = false; };
    }, [])
  );

  const startFresh = () => router.push('/setup');

  const playAgain = () => {
    if (!lastGame) return;
    setGame(g => ({ ...g, category: lastGame.category }));
    router.push('/game-settings');
  };

  const openCategory = (id: CategoryKey) => {
    setGame(g => ({ ...g, category: id }));
    router.push('/setup');
  };

  const lastCategoryLabel = lastGame
    ? CATEGORIES.find(c => c.id === lastGame.category)?.label ?? 'General'
    : '';

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          {/* Masthead */}
          <View style={styles.masthead}>
            <View style={styles.brand}>
              <AppMark size={36} />
              <View style={styles.brandText}>
                <Text style={styles.label}>PARTY WORD GAME</Text>
                <Text style={styles.brandName}>Impostr</Text>
              </View>
            </View>
            <IconButton onPress={() => setShowHowToPlay(true)} accessibilityLabel="How to play">
              <HelpCircle size={20} color={COLORS.ink} />
            </IconButton>
          </View>

          {/* Hero */}
          <GlassCard style={styles.hero}>
            <View style={styles.pills}>
              <Pill
                tone="honey"
                label="3 to 12 players"
                icon={<Users size={14} color={COLORS.honeyText} />}
              />
              <Pill
                label="Works offline"
                icon={<WifiOff size={14} color={COLORS.textBody} />}
              />
            </View>

            <Text style={styles.heroTitle} maxFontSizeMultiplier={1.4}>
              Someone here{'\n'}is <Text style={styles.heroAccent}>lying.</Text>
            </Text>

            <Text style={styles.heroBody}>
              Everyone gets the secret word except one. Give clues, stay sneaky, then vote.
            </Text>

            <PrimaryButton
              label="Play now"
              onPress={startFresh}
              icon={<Play size={18} color={COLORS.onHoney} fill={COLORS.onHoney} />}
            />
          </GlassCard>

          {/* Play again */}
          {lastGame && (
            <TouchableOpacity
              onPress={playAgain}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Play again: ${lastCategoryLabel}, ${lastGame.players} players`}
            >
              <GlassCard style={styles.againCard}>
                <View style={styles.againIcon}>
                  <RefreshCw size={18} color={COLORS.honey} />
                </View>
                <View style={styles.againText}>
                  <Text style={styles.againTitle}>Play again</Text>
                  <Text style={styles.againSub} numberOfLines={1}>
                    {lastCategoryLabel} · {lastGame.players} players
                  </Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </GlassCard>
            </TouchableOpacity>
          )}

          {/* Categories */}
          <View style={styles.sectionHead}>
            <Text style={styles.label}>CATEGORIES</Text>
            <Text style={[styles.label, styles.labelAccent]}>{CATEGORIES.length} PACKS</Text>
          </View>

          <View style={styles.catGrid}>
            {CATEGORIES.slice(0, 6).map(cat => {
              const Icon = CATEGORY_ICONS[cat.icon];
              return (
                <View key={cat.id} style={styles.catCell}>
                  <TouchableOpacity
                    onPress={() => openCategory(cat.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={cat.label}
                  >
                    <GlassCard style={styles.catTile}>
                      <Icon size={17} color={COLORS.honeyText} strokeWidth={1.8} />
                      <Text style={styles.catName} numberOfLines={1}>{cat.label}</Text>
                    </GlassCard>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <HowToPlaySheet visible={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </View>
  );
}

function HowToPlaySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetHead}>
        <Text style={styles.sheetTitle}>How to play</Text>
        <IconButton onPress={onClose} glass={false} accessibilityLabel="Close">
          <X size={20} color={COLORS.ink} />
        </IconButton>
      </View>

      {HOW_TO_PLAY.map((step, i) => (
        <View key={step.title} style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
          </View>
        </View>
      ))}

      <InkButton label="Got it" onPress={onClose} style={styles.sheetButton} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    // Clears the floating tab bar (64 tall, 16 from the bottom inset).
    paddingBottom: 110,
    gap: SPACING.gap,
  },

  // Masthead
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandText: { gap: 1, flexShrink: 1 },
  brandName: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  labelAccent: { color: COLORS.honeyText },

  // Hero
  hero: {
    padding: 20,
    borderRadius: RADIUS.xl,
    gap: 16,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroTitle: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
    color: COLORS.ink,
  },
  heroAccent: { color: COLORS.honeyText },
  heroBody: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },

  // Play again
  againCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
  },
  againIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  againText: { flex: 1, minWidth: 0 },
  againTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  againSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Categories
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catCell: {
    // Three across, accounting for the two 8px gaps.
    width: '31.5%',
  },
  catTile: {
    padding: 10,
    borderRadius: RADIUS.md,
    gap: 6,
    minWidth: 0,
  },
  catName: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.ink,
  },

  // How to play sheet
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sheetTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 26,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  stepNumberText: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: COLORS.honey,
  },
  stepText: { flex: 1, gap: 3 },
  stepTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 16,
    letterSpacing: -0.16,
    color: COLORS.ink,
  },
  stepBody: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
  sheetButton: { marginTop: 4 },
});
