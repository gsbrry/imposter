import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PillButton from './PillButton';
import { CATEGORIES } from '../data/words';
import { storage } from '../utils/storage';

const { width } = Dimensions.get('window');

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy',   color: '#22C55E' },
  { key: 'medium', label: 'Medium', color: COLORS.yellow },
  { key: 'hard',   label: 'Hard',   color: '#F97316' },
  { key: 'chaos',  label: 'Chaos',  color: COLORS.rose },
];

const PLAYER_COUNTS = Array.from({ length: 13 }, (_, i) => i + 3); // 3..15

// ── Glassmorphism category card ──────────────────────────────────────────────
function CategoryCard({ cat, selected, locked, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (locked) return;
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 60 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }).start();
  };

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={() => !locked && onPress(cat.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={locked ? 1 : 0.85}
        style={styles.cardTouch}
      >
        <BlurView
          intensity={selected ? 55 : 30}
          tint="dark"
          style={[
            styles.card,
            selected && styles.cardSelected,
            locked && styles.cardLocked,
          ]}
        >
          {selected && <View style={styles.cardGlow} />}
          <Text style={styles.cardEmoji}>{cat.emoji}</Text>
          <Text
            numberOfLines={2}
            style={[styles.cardLabel, selected && styles.cardLabelSelected]}
          >
            {cat.label}
          </Text>
          {locked && (
            <View style={styles.lockBadge}>
              <Lock size={10} color={COLORS.white}  />
              <Text style={styles.lockText}>PRO</Text>
            </View>
          )}
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Difficulty pill ──────────────────────────────────────────────────────────
function DiffPill({ item, selected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, speed: 60 }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        onPress={() => onPress(item.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        style={[
          styles.diffPill,
          selected && { backgroundColor: item.color, borderColor: item.color },
        ]}
      >
        <Text style={[styles.diffText, selected && styles.diffTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Player count chip ────────────────────────────────────────────────────────
function PlayerChip({ count, selected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 60 }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress(count)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        style={[styles.playerChip, selected && styles.playerChipSelected]}
      >
        <Text style={[styles.playerChipText, selected && styles.playerChipTextSelected]}>
          {count}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function SetupScreen({ navigation }) {
  const [category, setCategory] = useState('general');
  const [difficulty, setDifficulty] = useState('medium');
  const [playerCount, setPlayerCount] = useState(4);
  const [isPremium, setIsPremium] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    storage.getLastCategory().then(c => { if (c) setCategory(c); });
    storage.getSubscription().then(setIsPremium);
  }, []);

  const handleStart = async () => {
    await storage.setLastCategory(category);
    if (navigation) navigation.navigate('PlayerNames');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Game Setup</Text>
            <View style={styles.backBtn} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Category section ── */}
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.grid}>
              {CATEGORIES.map(cat => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  selected={category === cat.id}
                  locked={!cat.free && !isPremium}
                  onPress={setCategory}
                />
              ))}
            </View>

            {/* ── Difficulty section ── */}
            <Text style={styles.sectionLabel}>Difficulty</Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map(d => (
                <DiffPill
                  key={d.key}
                  item={d}
                  selected={difficulty === d.key}
                  onPress={setDifficulty}
                />
              ))}
            </View>

            {/* ── Player count section ── */}
            <Text style={styles.sectionLabel}>Players</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playerScroll}
              decelerationRate="fast"
            >
              {PLAYER_COUNTS.map(n => (
                <PlayerChip
                  key={n}
                  count={n}
                  selected={playerCount === n}
                  onPress={setPlayerCount}
                />
              ))}
            </ScrollView>

            {/* ── Start button ── */}
            <PillButton
              label="START GAME"
              onPress={handleStart}
              variant="yellow"
              style={styles.startBtn}
              textStyle={styles.startBtnText}
              icon={<ChevronRight size={18} color={COLORS.nearBlack} />}
            />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const CARD_SIZE = (width - SPACING.sm * 2 - SPACING.xs * 2) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  scroll: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 100,
  },

  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  // 3×3 grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  cardWrap: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  cardTouch: {
    flex: 1,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.28)',
    padding: SPACING.xs,
    gap: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  cardSelected: {
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(255,214,0,0.08)',
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(255,214,0,0.06)',
    borderRadius: 999,
  },
  cardEmoji: { fontSize: 30 },
  cardLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 15,
  },
  cardLabelSelected: {
    color: COLORS.yellow,
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.rose,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  lockText: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // Difficulty pills
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffPill: {
    paddingVertical: 11,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.35)',
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  diffText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },
  diffTextSelected: {
    color: COLORS.nearBlack,
    fontFamily: FONTS.bold,
  },

  // Player scroll
  playerScroll: {
    paddingVertical: 4,
    gap: 10,
    paddingRight: SPACING.sm,
  },
  playerChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.35)',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  playerChipSelected: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  playerChipText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  playerChipTextSelected: {
    color: COLORS.nearBlack,
  },

  // Start button
  startBtn: {
    marginTop: SPACING.md,
    width: '100%',
  },
  startBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    letterSpacing: 2,
  },
});
