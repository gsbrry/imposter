import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Shuffle, ChevronRight, X, Users,
  CircleUser, Skull, Bot, Cat, Dog, Crown, Star, Ghost, Flame, Moon, Sun, Rocket, Diamond,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/PrimaryButton';
import { storage } from '../utils/storage';
import { shuffle as shuffleArray } from '../utils/shuffle';
import { useGame } from '../context/GameContext';
import HomeButton from '../components/HomeButton';

const ICON_COMPONENTS = [
  CircleUser, Skull, Bot, Cat, Dog, Crown, Star, Ghost,
  Flame, Moon, Sun, Rocket, Diamond,
];

export default function PlayerNamesScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const [useNumbers, setUseNumbers] = useState(false);
  const [players, setPlayers] = useState(game.players);
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    storage.getSavedPlayers().then(setSavedNames);
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const updateName = (index: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name } : p));
  };

  const updateIcon = (index: number) => {
    setPlayers(prev => prev.map((p, i) =>
      i === index ? { ...p, iconIndex: (p.iconIndex + 1) % ICON_COMPONENTS.length } : p
    ));
  };

  const handleShuffle = () => {
    setPlayers(prev => shuffleArray(prev));
  };

  const fillFromSaved = (name: string) => {
    const emptyIdx = players.findIndex(p => !p.name.trim() || p.name.trim().startsWith('Player '));
    if (emptyIdx >= 0) updateName(emptyIdx, name);
  };

  const deleteSavedName = async (name: string) => {
    await storage.removeSavedPlayer(name);
    setSavedNames(prev => prev.filter(n => n !== name));
  };

  const handleNext = async () => {
    const finalPlayers = players.map((p, i) => ({
      ...p,
      name: useNumbers ? `Player ${i + 1}` : p.name.trim() || `Player ${i + 1}`,
    }));
    const realNames = finalPlayers.map(p => p.name).filter(n => !n.startsWith('Player '));
    await storage.addSavedPlayers(realNames);
    await storage.setPlayers(finalPlayers.map(p => ({ id: p.id, name: p.name, iconIndex: p.iconIndex })));
    setGame(g => ({ ...g, players: finalPlayers }));
    router.push('/reveal');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <HomeButton />
            <View style={styles.headerCenter}>
              <Text style={styles.headerLabel}>STEP 3 OF 3</Text>
              <Text style={styles.title}>Players</Text>
            </View>
            <TouchableOpacity
              onPress={() => setUseNumbers(n => !n)}
              style={[styles.toggle, useNumbers && styles.toggleActive]}
            >
              <View style={[styles.toggleThumb, useNumbers && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {!useNumbers && savedNames.length > 0 && (
            <View style={styles.savedSection}>
              <View style={styles.savedHeader}>
                <Users size={12} color={COLORS.honey} />
                <Text style={styles.savedLabel}>SAVED PLAYERS</Text>
                <Text style={styles.savedHint}>tap to fill next empty slot</Text>
              </View>
              <FlatList
                data={savedNames}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                contentContainerStyle={styles.savedChipRow}
                renderItem={({ item }) => (
                  <View style={styles.savedChipWrap}>
                    <TouchableOpacity style={styles.savedChip} onPress={() => fillFromSaved(item)} activeOpacity={0.75}>
                      <Text style={styles.savedChipText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.savedChipDelete}
                      onPress={() => deleteSavedName(item)}
                      hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove saved name ${item}`}
                    >
                      <X size={9} color={COLORS.background} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          <View style={styles.playerList}>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <Avatar
                  name={player.name}
                  index={index}
                  icon={ICON_COMPONENTS[player.iconIndex % ICON_COMPONENTS.length]}
                  size={32}
                  onPress={() => updateIcon(index)}
                  accessibilityLabel={`Change icon for ${player.name || `Player ${index + 1}`}`}
                />
                {useNumbers ? (
                  <Text style={styles.numberName}>Player {index + 1}</Text>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={player.name}
                    onChangeText={text => updateName(index, text)}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor={COLORS.textFaint}
                    maxLength={20}
                  />
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle}>
            <Shuffle size={16} color={COLORS.honey} />
            <Text style={styles.shuffleText}>Randomise Order</Text>
          </TouchableOpacity>

          <PrimaryButton
            label="Start Reveal"
            onPress={handleNext}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerCenter: { alignItems: 'center' },
  headerLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.ink,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    padding: 3,
  },
  toggleActive: {
    backgroundColor: COLORS.honeySoft,
    borderColor: COLORS.honey,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    backgroundColor: COLORS.honey,
    alignSelf: 'flex-end',
  },

  savedSection: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  savedLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.honey,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  savedHint: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: COLORS.textFaint,
  },
  savedChipRow: { gap: 6, paddingRight: 4 },
  savedChipWrap: { position: 'relative' },
  savedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
  },
  savedChipText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.honey,
    paddingRight: 8,
  },
  savedChipDelete: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },

  playerList: {
    gap: 8,
    marginBottom: SPACING.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.ink,
    height: 40,
    paddingHorizontal: 8,
  },
  numberName: {
    flex: 1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.textMuted,
    paddingHorizontal: 8,
  },

  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  shuffleText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.honey,
  },
});
