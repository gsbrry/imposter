import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Animated,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowRight, Brain, Car, House, UtensilsCrossed,
  Clapperboard, Trophy, PawPrint, Briefcase, PartyPopper,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import StepHeader from '../components/StepHeader';
import CategoryTile from '../components/CategoryTile';
import Segmented from '../components/Segmented';
import PrimaryButton from '../components/PrimaryButton';
import { CATEGORIES, CategoryKey, CategoryIcon, wordCount } from '../data/words';
import { storage } from '../utils/storage';
import { useGame } from '../context/GameContext';

type SetupDifficulty = 'easy' | 'medium' | 'hard' | 'chaos';

const DIFFICULTIES: { key: SetupDifficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
  { key: 'chaos', label: 'Chaos' },
];

const DIFFICULTY_BLURB: Record<SetupDifficulty, string> = {
  easy: 'Simple words, hints on',
  medium: 'Standard words',
  hard: 'Tricky words',
  chaos: 'Tricky words, maybe two imposters',
};

const LAST_DIFFICULTY_KEY = 'IMPOSTR_LAST_DIFFICULTY';

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

export default function SetupScreen() {
  const router = useRouter();
  const { game, setGame, isPremium } = useGame();
  const [category, setCategory] = useState<CategoryKey>(game.category);
  const [difficulty, setDifficulty] = useState<SetupDifficulty>('medium');
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  // Per-card pulse anims for locked cards
  const pulseAnims = useRef(
    Object.fromEntries(CATEGORIES.map(c => [c.id, new Animated.Value(1)]))
  ).current;

  useEffect(() => {
    storage.getLastCategory().then(c => {
      if (c && CATEGORIES.some(cat => cat.id === c)) setCategory(c as CategoryKey);
    });
    // Load last difficulty, default 'medium'.
    import('@react-native-async-storage/async-storage').then(({ default: AS }) => {
      AS.getItem(LAST_DIFFICULTY_KEY).then(d => {
        if (d === 'easy' || d === 'medium' || d === 'hard' || d === 'chaos') setDifficulty(d);
      });
    });
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  const handleLockedPress = (catId: CategoryKey) => {
    const anim = pulseAnims[catId];
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.05, duration: 75, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 75, useNativeDriver: true }),
    ]).start();
    router.push('/premium');
  };

  const handleNext = async () => {
    await storage.setLastCategory(category);
    await import('@react-native-async-storage/async-storage').then(({ default: AS }) =>
      AS.setItem(LAST_DIFFICULTY_KEY, difficulty)
    );
    setGame(g => ({
      ...g,
      // 'chaos' is carried through as-is; reveal.tsx plays it from the hard
      // word pack and adds the two-imposter roll.
      category,
      difficulty,
    }));
    router.push('/game-settings');
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <StepHeader step={1} label="Step 1 of 3" onBack={() => router.back()} />

          <View style={styles.heading}>
            <AppText style={styles.title} maxFontSizeMultiplier={1.4}>Pick a category</AppText>
            <AppText style={styles.sub}>Words come from this pack.</AppText>
          </View>

          <View style={styles.grid}>
            {CATEGORIES.map(cat => {
              const locked = !cat.free && !isPremium;
              return (
                <Animated.View
                  key={cat.id}
                  style={[styles.cell, { transform: [{ scale: pulseAnims[cat.id] }] }]}
                >
                  <CategoryTile
                    icon={CATEGORY_ICONS[cat.icon]}
                    label={cat.label}
                    count={`${wordCount(cat.id)} words`}
                    selected={category === cat.id}
                    locked={locked}
                    onPress={() => (locked ? handleLockedPress(cat.id) : setCategory(cat.id))}
                  />
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.difficulty}>
            <AppText style={styles.label}>DIFFICULTY</AppText>
            <Segmented options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
            <AppText style={styles.blurb}>{DIFFICULTY_BLURB[difficulty]}</AppText>
          </View>

          <View style={styles.spacer} />

          <PrimaryButton
            label="Continue"
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

  heading: { gap: 4 },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    // Three across, accounting for the two 8px gaps.
    width: '31.5%',
  },

  difficulty: { gap: 8 },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  blurb: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textBody,
  },

  // Pushes the one honey button to the end of the content on tall screens.
  spacer: { flex: 1, minHeight: SPACING.sm },
});
