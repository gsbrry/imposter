import React, { useCallback, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated,
} from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  Users, Check, Eye, Trophy,
  Brain, Car, House, UtensilsCrossed, Clapperboard, PawPrint, Briefcase, PartyPopper,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import SectionLabel from '../../components/SectionLabel';
import TimerRing from '../../components/TimerRing';
import { storage, Stats } from '../../utils/storage';
import { CATEGORIES, CategoryIcon } from '../../data/words';

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

/** The headline above the win rate, so the number carries a meaning. */
function rankFor(winRate: number, gamesPlayed: number): string {
  if (gamesPlayed === 0) return 'No games yet';
  if (winRate >= 75) return 'Master reader';
  if (winRate >= 60) return 'Sharp detective';
  if (winRate >= 40) return 'Holding your own';
  return 'Easily fooled';
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  // Re-read on focus so a game that just finished is already counted.
  useFocusEffect(
    useCallback(() => {
      storage.getStats().then(s => {
        setStats(s);
        entryAnim.setValue(0);
        entryY.setValue(16);
        Animated.parallel([
          Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    }, [entryAnim, entryY])
  );

  if (!stats) return null;

  const played = stats.gamesPlayed;
  const winRate = played > 0 ? Math.round((stats.crewmatesWon / played) * 100) : 0;

  const bestCategory = CATEGORIES.find(c => c.id === stats.bestCategory);
  const bestWins = stats.categoryWins[stats.bestCategory] ?? 0;
  const BestIcon = bestCategory ? CATEGORY_ICONS[bestCategory.icon] : Brain;
  const bestRate = played > 0 ? Math.round((bestWins / played) * 100) : 0;

  const tiles = [
    { label: 'Games played', value: String(played), Icon: Users },
    { label: 'Crew wins', value: String(stats.crewmatesWon), Icon: Check },
    { label: 'As imposter', value: String(stats.gamesAsImposter), Icon: Eye },
    { label: 'Imposter wins', value: String(stats.impostersWon), Icon: Trophy },
  ];

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <SectionLabel>Your stats</SectionLabel>
            <AppText style={styles.title} maxFontSizeMultiplier={1.4}>Performance</AppText>
          </View>

          {/* Win rate */}
          <GlassCard style={styles.rateCard}>
            <View style={styles.ringWrap}>
              <TimerRing size={92} progress={winRate / 100} strokeWidth={9}>
                <AppText style={styles.ringValue}>{winRate}%</AppText>
              </TimerRing>
            </View>
            <View style={styles.rateText}>
              <SectionLabel>Win rate</SectionLabel>
              <AppText style={styles.rateTitle} numberOfLines={2}>
                {rankFor(winRate, played)}
              </AppText>
              <AppText style={styles.rateSub}>
                {played === 0
                  ? 'Play a game to start the count.'
                  : `Across ${played} game${played === 1 ? '' : 's'} on this phone.`}
              </AppText>
            </View>
          </GlassCard>

          {/* Counters */}
          <View style={styles.grid}>
            {tiles.map(({ label, value, Icon }) => (
              <View key={label} style={styles.cell}>
                <GlassCard style={styles.statCard}>
                  <Icon size={16} color={COLORS.honeyText} />
                  <AppText style={styles.statValue}>{value}</AppText>
                  <SectionLabel>{label}</SectionLabel>
                </GlassCard>
              </View>
            ))}
          </View>

          {/* Best category */}
          <GlassCard style={styles.bestCard}>
            <View style={styles.bestTile}>
              <BestIcon size={17} color={COLORS.honeyText} />
            </View>
            <View style={styles.bestText}>
              <SectionLabel>Best category</SectionLabel>
              <AppText style={styles.bestValue} numberOfLines={1}>
                {bestCategory ? `${bestCategory.label} · ${bestRate}% wins` : 'Not enough games yet'}
              </AppText>
            </View>
          </GlassCard>
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
    gap: SPACING.gap,
  },

  header: { gap: 2 },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },

  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.cardPadding,
    borderRadius: 22,
  },
  ringWrap: { width: 92, height: 92 },
  ringValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  rateText: { flex: 1, minWidth: 0, gap: 4 },
  rateTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  rateSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12.5,
    lineHeight: 17,
    color: COLORS.textBody,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  cell: {
    // Two across, accounting for the 8px gap. The width lives on the
    // wrapper because GlassCard's shadow layer sits above its own style.
    width: '48.5%',
  },
  statCard: {
    gap: 4,
    padding: 14,
    borderRadius: 18,
  },
  statValue: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: COLORS.ink,
  },

  bestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
  },
  bestTile: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
  },
  bestText: { flex: 1, minWidth: 0, gap: 1 },
  bestValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13.5,
    color: COLORS.ink,
  },
});
