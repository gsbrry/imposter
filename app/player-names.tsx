import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, Plus, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import StepHeader from '../components/StepHeader';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import { storage } from '../utils/storage';
import { useGame } from '../context/GameContext';
import { useWebFocusRing } from '../hooks/useWebFocusRing';

export default function PlayerNamesScreen() {
  const router = useRouter();
  const { game, setGame } = useGame();
  const [players, setPlayers] = useState(game.players);
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    storage.getSavedPlayers().then(setSavedNames);
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  const updateName = (index: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => (i === index ? { ...p, name } : p)));
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
      name: p.name.trim() || `Player ${i + 1}`,
    }));
    const realNames = finalPlayers.map(p => p.name).filter(n => !n.startsWith('Player '));
    await storage.addSavedPlayers(realNames);
    await storage.setPlayers(finalPlayers.map(p => ({ id: p.id, name: p.name, iconIndex: p.iconIndex })));
    setGame(g => ({ ...g, players: finalPlayers }));
    router.push('/reveal');
  };

  // Names already in the line-up do not need offering again.
  const unusedSaved = savedNames.filter(
    n => !players.some(p => p.name.trim().toLowerCase() === n.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <StepHeader step={3} label="Step 3 of 3" onBack={() => router.back()} />

          <View style={styles.heading}>
            <Text style={styles.title} maxFontSizeMultiplier={1.4}>Who is playing?</Text>
            <Text style={styles.sub}>Names are saved for next time.</Text>
          </View>

          <GlassCard style={styles.list}>
            {players.map((player, index) => (
              <PlayerRow
                key={player.id}
                name={player.name}
                index={index}
                showDivider={index > 0}
                onChangeName={text => updateName(index, text)}
              />
            ))}
          </GlassCard>

          {unusedSaved.length > 0 && (
            <View style={styles.recent}>
              <Text style={styles.label}>RECENT PLAYERS</Text>
              <View style={styles.chips}>
                {unusedSaved.map(name => (
                  <View key={name} style={styles.chipWrap}>
                    <Chip
                      label={name}
                      onPress={() => fillFromSaved(name)}
                      icon={<Plus size={15} color={COLORS.ink} />}
                      accessibilityLabel={`Add ${name} to the next empty slot`}
                    />
                    <TouchableOpacity
                      style={styles.chipDelete}
                      onPress={() => deleteSavedName(name)}
                      hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Forget saved name ${name}`}
                    >
                      <X size={9} color={COLORS.background} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.spacer} />

          <PrimaryButton
            label="Start game"
            onPress={handleNext}
            icon={<Play size={18} color={COLORS.onHoney} fill={COLORS.onHoney} />}
          />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PlayerRow({
  name, index, showDivider, onChangeName,
}: {
  name: string;
  index: number;
  showDivider: boolean;
  onChangeName: (text: string) => void;
}) {
  const focusRing = useWebFocusRing();

  return (
    <View>
      {showDivider && <View style={styles.divider} />}
      <View style={styles.row}>
        <Avatar name={name} index={index} size={34} />
        <TextInput
          style={[styles.input, focusRing.focusStyle]}
          onFocus={focusRing.onFocus}
          onBlur={focusRing.onBlur}
          value={name}
          onChangeText={onChangeName}
          placeholder={`Player ${index + 1}`}
          placeholderTextColor={COLORS.textFaint}
          maxLength={20}
          accessibilityLabel={`Name for player ${index + 1}`}
        />
        <Text style={styles.slot}>P{index + 1}</Text>
      </View>
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
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },

  list: { borderRadius: RADIUS.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 36,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
    padding: 0,
  },
  slot: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: COLORS.divider,
  },

  recent: { gap: 8 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipWrap: { position: 'relative' },
  chipDelete: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.background,
  },

  spacer: { flex: 1, minHeight: SPACING.sm },
});
