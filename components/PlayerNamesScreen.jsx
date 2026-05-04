import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Shuffle, ChevronRight, ChevronLeft, Check, CircleUser as UserCircle, Skull, Bot, Cat, Dog, Crown, Star, Ghost, Flame, Moon, Sun, Rocket, Diamond } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PillButton from './PillButton';
import { storage } from '../utils/storage';

// ── Avatar catalogue (mirrors PlayerAvatar.tsx) ──────────────────────────────
const ICONS = [
  UserCircle, Alien, Robot, Cat, Dog, Crown,
  Star, Ghost, Flame, Moon, Sun, Rocket, Diamond,
];
const AVATAR_COLORS = [
  COLORS.yellow,
  COLORS.rose,
  '#38BDF8', // sky
  '#34D399', // emerald
  '#FB923C', // orange
  '#A78BFA', // lavender (not our brand violet)
  '#F472B6', // pink
  '#4ADE80', // green
];

// ── Quick-fill name pool ─────────────────────────────────────────────────────
const QUICK_NAMES = [
  'Raj', 'Priya', 'Arjun', 'Meera', 'Rohan',
  'Ananya', 'Vikram', 'Divya', 'Kabir', 'Aisha',
  'Dev', 'Zara', 'Sam', 'Nora', 'Leo',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeDefaultPlayers(count, saved = []) {
  return Array.from({ length: count }, (_, i) => ({
    id: `player_${i}`,
    name: saved[i]?.name ?? '',
    iconIndex: i % ICONS.length,
  }));
}

function avatarColor(playerIndex) {
  return AVATAR_COLORS[playerIndex % AVATAR_COLORS.length];
}

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ value, onToggle, label }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 20] });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={styles.toggleWrap}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.track, value && styles.trackActive]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </View>
    </TouchableOpacity>
  );
}

// ── Single player row ────────────────────────────────────────────────────────
function PlayerRow({ player, index, useNumbers, onNameChange, onCycleIcon, inputRef }) {
  const color = avatarColor(index);
  const Icon = ICONS[player.iconIndex % ICONS.length];
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    slideAnim.setValue(30);
    Animated.spring(slideAnim, {
      toValue: 0,
      delay: index * 35,
      useNativeDriver: true,
      speed: 40,
      bounciness: 5,
    }).start();
  }, []);

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.8, useNativeDriver: true, speed: 80 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
    onCycleIcon(index);
  };

  return (
    <Animated.View
      style={[
        styles.rowWrap,
        { opacity: slideAnim.interpolate({ inputRange: [0, 30], outputRange: [1, 0] }), transform: [{ translateY: slideAnim }] },
      ]}
    >
      <BlurView intensity={25} tint="dark" style={styles.row}>
        {/* Avatar tap-to-cycle */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            activeOpacity={0.8}
            style={[styles.avatar, { borderColor: color + '70' }]}
          >
            <Icon size={26} color={color}  />
          </TouchableOpacity>
        </Animated.View>

        {/* Name or numbered label */}
        {useNumbers ? (
          <Text style={styles.numberedName}>Player {index + 1}</Text>
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={player.name}
            onChangeText={text => onNameChange(index, text)}
            placeholder={`Player ${index + 1}`}
            placeholderTextColor="rgba(255,255,255,0.2)"
            maxLength={18}
            returnKeyType="next"
            blurOnSubmit={false}
            selectionColor={COLORS.yellow}
          />
        )}

        {/* Filled indicator */}
        {!useNumbers && player.name.trim().length > 0 && (
          <Check size={16} color={COLORS.yellow}  />
        )}
      </BlurView>
    </Animated.View>
  );
}

// ── Quick-fill chip ──────────────────────────────────────────────────────────
function NameChip({ name, onPress, used }) {
  return (
    <TouchableOpacity
      onPress={() => !used && onPress(name)}
      activeOpacity={used ? 1 : 0.7}
      style={[styles.chip, used && styles.chipUsed]}
    >
      <Text style={[styles.chipText, used && styles.chipTextUsed]}>{name}</Text>
    </TouchableOpacity>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function PlayerNamesScreen({ navigation, route }) {
  const playerCount = route?.params?.playerCount ?? 4;

  const [useNumbers, setUseNumbers] = useState(false);
  const [players, setPlayers] = useState(() => makeDefaultPlayers(playerCount));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shuffleRotate = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef([]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    // Load saved names and fill in
    storage.getPlayers().then(saved => {
      setPlayers(makeDefaultPlayers(playerCount, saved));
    });
  }, [playerCount]);

  const updateName = useCallback((index, text) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name: text } : p));
  }, []);

  const cycleIcon = useCallback((index) => {
    setPlayers(prev => prev.map((p, i) =>
      i === index ? { ...p, iconIndex: (p.iconIndex + 1) % ICONS.length } : p
    ));
  }, []);

  const quickFill = useCallback((name) => {
    setPlayers(prev => {
      const idx = prev.findIndex(p => !p.name || !p.name.trim());
      if (idx < 0) return prev;
      return prev.map((p, i) => i === idx ? { ...p, name } : p);
    });
  }, []);

  const shuffle = () => {
    Animated.sequence([
      Animated.timing(shuffleRotate, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(shuffleRotate, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setPlayers(prev => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    const finalPlayers = players.map((p, i) => ({
      ...p,
      name: useNumbers ? `Player ${i + 1}` : (p.name.trim() || `Player ${i + 1}`),
    }));
    await storage.setPlayers(
      finalPlayers.map(p => ({ id: p.id, name: p.name, iconIndex: p.iconIndex }))
    );
    if (navigation) navigation.navigate('Reveal');
  };

  const usedNames = new Set(players.map(p => p.name.trim()).filter(Boolean));
  const spinDeg = shuffleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Players</Text>
              <Text style={styles.headerSub}>{playerCount} players</Text>
            </View>

            <Toggle
              value={useNumbers}
              onToggle={() => setUseNumbers(n => !n)}
              label="Auto"
            />
          </View>

          {/* ── Scrollable body ── */}
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* Player rows */}
            {players.map((player, index) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={index}
                useNumbers={useNumbers}
                onNameChange={updateName}
                onCycleIcon={cycleIcon}
                inputRef={el => { inputRefs.current[index] = el; }}
              />
            ))}

            {/* Quick-fill chips */}
            {!useNumbers && (
              <View style={styles.quickSection}>
                <Text style={styles.quickLabel}>Quick fill</Text>
                <View style={styles.chips}>
                  {QUICK_NAMES.map(name => (
                    <NameChip
                      key={name}
                      name={name}
                      onPress={quickFill}
                      used={usedNames.has(name)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Randomise order */}
            <TouchableOpacity
              style={styles.shuffleBtn}
              onPress={shuffle}
              activeOpacity={0.75}
            >
              <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
                <Shuffle size={18} color={COLORS.yellow}  />
              </Animated.View>
              <Text style={styles.shuffleText}>Randomise Order</Text>
            </TouchableOpacity>

            {/* CTA */}
            <PillButton
              label="Start Reveal"
              onPress={handleNext}
              variant="yellow"
              style={styles.nextBtn}
              textStyle={styles.nextBtnText}
              icon={<ChevronRight size={18} color={COLORS.nearBlack} />}
            />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.xs,
    paddingBottom: 12,
    gap: SPACING.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 1,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  toggleLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  trackActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },

  scroll: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 100,
  },

  // Player row
  rowWrap: { marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(124,58,237,0.06)',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
    height: 44,
    paddingHorizontal: 4,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  numberedName: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 4,
  },

  // Quick fill
  quickSection: {
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  quickLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    backgroundColor: 'rgba(124,58,237,0.1)',
  },
  chipUsed: {
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'transparent',
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  chipTextUsed: {
    color: 'rgba(255,255,255,0.2)',
  },

  // Shuffle
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.2)',
    backgroundColor: 'rgba(255,214,0,0.06)',
  },
  shuffleText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.yellow,
  },

  // CTA
  nextBtn: { marginTop: SPACING.xs },
  nextBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    letterSpacing: 1.5,
  },
});
