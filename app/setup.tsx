import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PillButton from '../components/PillButton';
import { CATEGORIES, CategoryKey } from '../data/words';
import { storage } from '../utils/storage';
import { useGame } from '../context/GameContext';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', desc: 'Hints enabled' },
  { key: 'medium', label: 'Medium', desc: 'Standard' },
  { key: 'hard', label: 'Hard', desc: 'Tricky words' },
  { key: 'chaos', label: 'Chaos', desc: '2 imposters' },
] as const;

export default function SetupScreen() {
  const router = useRouter();
  const { setGame } = useGame();
  const [category, setCategory] = useState<CategoryKey>('general');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'chaos'>('medium');
  const [isPremium, setIsPremium] = useState(false);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    storage.getLastCategory().then(c => setCategory(c as CategoryKey));
    storage.getSubscription().then(setIsPremium);
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNext = async () => {
    await storage.setLastCategory(category);
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
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => !locked && setCategory(cat.id)}
                  activeOpacity={locked ? 1 : 0.75}
                  style={[
                    styles.catBtn,
                    selected && styles.catSelected,
                    locked && styles.catLocked,
                  ]}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, selected && styles.catLabelSelected]}>
                    {cat.label}
                  </Text>
                  {locked && (
                    <View style={styles.lockBadge}>
                      <Lock size={9} color={COLORS.nearBlack} />
                    </View>
                  )}
                </TouchableOpacity>
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

          <PillButton
            label="Next: Game Settings"
            onPress={handleNext}
            variant="yellow"
            style={styles.startBtn}
            icon={<ChevronRight size={18} color={COLORS.nearBlack} />}
          />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: SPACING.md, paddingBottom: 100 },

  header: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.md,
  },
  catBtn: {
    width: '31%',
    aspectRatio: 0.95,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    gap: 6,
  },
  catSelected: {
    borderColor: COLORS.yellow,
    backgroundColor: COLORS.yellowGlass,
  },
  catLocked: { opacity: 0.4 },
  catEmoji: { fontSize: 26 },
  catLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textLabel,
    textAlign: 'center',
  },
  catLabelSelected: { color: COLORS.yellow },
  lockBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    gap: 3,
  },
  diffSelected: {
    backgroundColor: COLORS.yellowGlass,
    borderColor: COLORS.yellow,
  },
  diffText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textLabel,
  },
  diffTextSelected: { color: COLORS.yellow },
  diffDesc: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  diffDescSelected: { color: 'rgba(255,214,0,0.6)' },

  startBtn: { marginTop: 0 },
});
