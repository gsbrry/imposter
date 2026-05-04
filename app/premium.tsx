import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Star, Check, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import PillButton from '../components/PillButton';

const FEATURES = [
  'All 9 word categories',
  'Ad-free experience',
  'Custom word lists',
  'Full stats & history',
  'Priority category voting',
];

export default function PremiumScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color="rgba(255,255,255,0.5)"  />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Star size={56} color={COLORS.yellow}  />
            <Text style={styles.heroTitle}>Go Premium</Text>
            <Text style={styles.heroSub}>Unlock the full Impostr experience</Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map(f => (
              <View key={f} style={styles.featureRow}>
                <Check size={18} color={COLORS.yellow}  />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            <GlassCard style={styles.planCardBest}>
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planPeriod}>Yearly</Text>
              <Text style={styles.planPrice}>₹199</Text>
              <Text style={styles.planPriceSub}>per year</Text>
              <PillButton
                label="Get Yearly"
                onPress={() => {}}
                variant="yellow"
                style={styles.planBtn}
              />
            </GlassCard>

            <GlassCard style={styles.planCard}>
              <Text style={styles.planPeriod}>Monthly</Text>
              <Text style={styles.planPrice}>₹49</Text>
              <Text style={styles.planPriceSub}>per month</Text>
              <PillButton
                label="Get Monthly"
                onPress={() => {}}
                variant="outline"
                style={styles.planBtn}
              />
            </GlassCard>
          </View>

          <Text style={styles.note}>
            To set up payments, export this project and integrate RevenueCat with your App Store / Play Store credentials.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: SPACING.sm,
    zIndex: 10,
    padding: 8,
  },
  scroll: { padding: SPACING.sm, paddingTop: 64, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  heroTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.white,
  },
  heroSub: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  features: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
  },
  plans: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  planCard: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
  },
  planCardBest: {
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(255,214,0,0.06)',
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center' as const,
    gap: 4,
  },
  bestBadge: {
    backgroundColor: COLORS.yellow,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  bestBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.nearBlack,
    letterSpacing: 0.5,
  },
  planPeriod: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  planPrice: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.white,
  },
  planPriceSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: SPACING.xs,
  },
  planBtn: { width: '100%', height: 44 },
  note: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
