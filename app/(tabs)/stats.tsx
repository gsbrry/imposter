import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Animated,
} from 'react-native';
import { ChartBar as BarChart2, Ghost } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import { storage, Stats } from '../../utils/storage';
import { CATEGORIES } from '../../data/words';

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    storage.getStats().then(s => {
      setStats(s);
      Animated.parallel([
        Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  if (!stats) return null;

  const winRate = stats.gamesPlayed > 0
    ? Math.round(((stats.crewmatesWon + stats.impostersWon) / stats.gamesPlayed) * 100)
    : 0;

  const bestCatLabel = CATEGORIES.find(c => c.id === stats.bestCategory)?.label ?? '—';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <Text style={styles.label}>YOUR STATS</Text>
            <Text style={styles.title}>Performance</Text>
          </View>

          <View style={styles.grid}>
            <StatCard value={String(stats.gamesPlayed)} label="GAMES PLAYED" />
            <StatCard value={`${winRate}%`} label="WIN RATE" />
            <StatCard value={String(stats.gamesAsImposter)} label="AS IMPOSTER" />
            <StatCard value={String(stats.crewmatesWon)} label="CREW WINS" />
          </View>

          <GlassCard style={styles.bestCard}>
            <Text style={styles.bestLabel}>BEST CATEGORY</Text>
            <Text style={styles.bestValue}>{bestCatLabel}</Text>
          </GlassCard>

          {stats.gamesPlayed === 0 && (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ghost size={32} color={COLORS.textLabel} />
              </View>
              <Text style={styles.emptyText}>No games played yet</Text>
              <Text style={styles.emptySubtext}>Play a game to see your stats here</Text>
            </View>
          )}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <GlassCard style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: SPACING.md, paddingBottom: 100 },
  header: {
    marginBottom: SPACING.md,
  },
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
    gap: 12,
    marginBottom: SPACING.md,
  },
  statCard: {
    width: '47.5%',
    padding: SPACING.md,
    alignItems: 'center',
    gap: 6,
    minHeight: 110,
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: COLORS.yellow,
  },
  statLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bestCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    gap: 8,
  },
  bestLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  bestValue: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.yellow,
  },
  empty: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.textLabel,
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
