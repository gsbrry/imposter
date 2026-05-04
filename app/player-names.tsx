import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, FlatList, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shuffle, ChevronRight, X, Users } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PlayerAvatar, { ICON_COMPONENTS } from '../components/PlayerAvatar';
import PillButton from '../components/PillButton';
import { storage } from '../utils/storage';
import { useGame } from '../context/GameContext';
import HomeButton from '../components/HomeButton';

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

  const shuffle = () => {
    setPlayers(prev => [...prev].sort(() => Math.random() - 0.5));
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
                <Users size={12} color={COLORS.yellow} />
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
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <X size={9} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          <View style={styles.playerList}>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <PlayerAvatar
                  iconIndex={player.iconIndex}
                  playerIndex={index}
                  size={32}
                  onPress={() => updateIcon(index)}
                />
                {useNumbers ? (
                  <Text style={styles.numberName}>Player {index + 1}</Text>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={player.name}
                    onChangeText={text => updateName(index, text)}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={20}
                  />
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.shuffleBtn} onPress={shuffle}>
            <Shuffle size={16} color={COLORS.yellow} />
            <Text style={styles.shuffleText}>Randomise Order</Text>
          </TouchableOpacity>

          <PillButton
            label="Start Reveal"
            onPress={handleNext}
            variant="yellow"
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerCenter: { alignItems: 'center' },
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
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    padding: 3,
  },
  toggleActive: {
    backgroundColor: COLORS.yellowGlass,
    borderColor: COLORS.yellow,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    backgroundColor: COLORS.yellow,
    alignSelf: 'flex-end',
  },

  savedSection: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
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
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  savedHint: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  savedChipRow: { gap: 6, paddingRight: 4 },
  savedChipWrap: { position: 'relative' },
  savedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
  },
  savedChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.yellow,
    paddingRight: 8,
  },
  savedChipDelete: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(6,4,18,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  playerList: {
    gap: 8,
    marginBottom: SPACING.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
    height: 40,
    paddingHorizontal: 8,
  },
  numberName: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.textLabel,
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
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.yellow,
  },
});
