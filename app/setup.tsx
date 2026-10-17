import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight, Brain, Car, House, UtensilsCrossed,
  Clapperboard, Trophy, PawPrint, Briefcase, PartyPopper, Crown,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from '../components/PrimaryButton';
import { CATEGORIES, CategoryKey, CategoryIcon } from '../data/words';
import { storage } from '../utils/storage';
import { useGame } from '../context/GameContext';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', desc: 'Hints enabled' },
  { key: 'medium', label: 'Medium', desc: 'Standard' },
  { key: 'hard', label: 'Hard', desc: 'Tricky words' },
  { key: 'chaos', label: 'Chaos', desc: '2 imposters' },
] as const;

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
  const { setGame, isPremium } = useGame();
  const [category, setCategory] = useState<CategoryKey>('general');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'chaos'>('easy');
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  // Per-card pulse anims for locked cards
  const pulseAnims = useRef(
    Object.fromEntries(CATEGORIES.map(c => [c.id, new Animated.Value(1)]))
  ).current;

  useEffect(() => {
    storage.getLastCategory().then(c => {
      if (c) setCategory(c as CategoryKey);
    });
    // Load last difficulty, default 'easy'
    import('@react-native-async-storage/async-storage').then(({ default: AS }) => {
      AS.getItem(LAST_DIFFICULTY_KEY).then(d => {
        if (d === 'easy' || d === 'medium' || d === 'hard' || d === 'chaos') {
          setDifficulty(d);
        }
      });
    });
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLockedPress = (catId: CategoryKey) => {
    // Pulse animation
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
      category,
      difficulty: difficulty === 'chaos' ? 'medium' : difficulty,
    }));
    router.push('/game-settings');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <Text style={styles.label}>STEP 1 OF 3</Text>
            <Text style={styles.title}>Choose Category</Text>
          </View>

          <View style={styles.grid}>
            {CATEGORIES.map(cat => {
              const locked = !cat.free && !isPremium;
              const selected = category === cat.id;
              const Icon = CATEGORY_ICONS[cat.icon];
              const iconColor = selected ? COLORS.honey : locked ? COLORS.textFaint : COLORS.textBody;
              return (
                <Animated.View
                  key={cat.id}
                  style={{ width: '31%', transform: [{ scale: pulseAnims[cat.id] }] }}
                >
                  <TouchableOpacity
                    onPress={() => locked ? handleLockedPress(cat.id) : setCategory(cat.id)}
                    activeOpacity={0.75}
                    style={[
                      styles.catBtn,
                      selected && styles.catSelected,
                      locked && styles.catLocked,
                    ]}
                  >
                    {locked && (
                      <View style={styles.premiumBadge}>
                        <Crown size={10} color={COLORS.ink} />
                      </View>
                    )}
                    <Icon size={24} color={iconColor} strokeWidth={1.75} />
                    <Text style={[
                      styles.catLabel,
                      selected && styles.catLabelSelected,
                      locked && styles.catLabelLocked,
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.label}>DIFFICULTY</Text>
          </View>

          <View style={styles.diffRow}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity
                key={d.key}
                onPress={() => setDifficulty(d.key)}
                style={[styles.diffBtn, difficulty === d.key && styles.diffSelected]}
                activeOpacity={0.75}
              >
                <Text style={[styles.diffText, difficulty === d.key && styles.diffTextSelected]}>
                  {d.label}
                </Text>
                <Text style={[styles.diffDesc, difficulty === d.key && styles.diffDescSelected]}>
                  {d.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <PrimaryButton
            label="Next: Game Settings"
            onPress={handleNext}
            style={styles.startBtn}
            icon={<ChevronRight size={18} color={COLORS.ink} />}
          />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: SPACING.md, paddingBottom: 100 },

  header: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.ink,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.md,
  },
  catBtn: {
    aspectRatio: 0.95,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    gap: 6,
    overflow: 'hidden',
  },
  catSelected: {
    borderColor: COLORS.honey,
    backgroundColor: COLORS.honeySoft,
  },
  catLocked: {
    backgroundColor: COLORS.glassFill,
    borderColor: COLORS.divider,
  },
  catLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  catLabelSelected: { color: COLORS.honey },
  catLabelLocked: { color: COLORS.textFaint },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.honey,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.honey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },

  sectionHeader: { marginBottom: SPACING.xs },

  diffRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassFill,
    alignItems: 'center',
    gap: 3,
  },
  diffSelected: {
    backgroundColor: COLORS.honeySoft,
    borderColor: COLORS.honey,
  },
  diffText: {
    fontFamily: FONTS.displayBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  diffTextSelected: { color: COLORS.honey },
  diffDesc: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: COLORS.textFaint,
  },
  diffDescSelected: { color: COLORS.honeyText },

  startBtn: { marginTop: 0 },
});
