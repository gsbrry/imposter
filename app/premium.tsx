import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Star } from 'phosphor-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function PremiumScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly'>('yearly');
  const monthlyScale = useRef(new Animated.Value(1)).current;
  const yearlyScale = useRef(new Animated.Value(1)).current;

  const pressPlan = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    const anim = plan === 'monthly' ? monthlyScale : yearlyScale;
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <X size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.starCircle}>
              <Star size={48} color={COLORS.yellow} weight="fill" />
            </View>
            <Text style={styles.heroLabel}>UNLOCK ALL CATEGORIES</Text>
            <Text style={styles.heroTitle}>Go Premium</Text>
            <Text style={styles.heroSub}>
              Play with all 9 categories, no ads, add custom words
            </Text>
          </View>

          {/* Plan cards */}
          <View style={styles.plans}>
            {/* Yearly */}
            <Animated.View style={{ flex: 1, transform: [{ scale: yearlyScale }] }}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
                onPress={() => pressPlan('yearly')}
                activeOpacity={0.85}
              >
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>BEST VALUE</Text>
                </View>
                <Text style={styles.planPeriodLabel}>YEARLY</Text>
                <Text style={styles.planPrice}>₹199</Text>
                <Text style={styles.planPriceSub}>per year</Text>
                {selectedPlan === 'yearly' && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            </Animated.View>

            {/* Monthly */}
            <Animated.View style={{ flex: 1, transform: [{ scale: monthlyScale }] }}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
                onPress={() => pressPlan('monthly')}
                activeOpacity={0.85}
              >
                <Text style={styles.planPeriodLabel}>MONTHLY</Text>
                <Text style={styles.planPrice}>₹49</Text>
                <Text style={styles.planPriceSub}>per month</Text>
                {selectedPlan === 'monthly' && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.trialBtn} activeOpacity={0.88}>
            <Text style={styles.trialBtnText}>START FREE TRIAL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.laterBtnText}>Maybe Later</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Cancel anytime. Prices shown in INR. To enable payments, integrate RevenueCat with your App Store / Play Store credentials.
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
    left: SPACING.sm,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: SPACING.md,
    paddingTop: 72,
    paddingBottom: 48,
    gap: SPACING.sm,
  },

  hero: {
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  starCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 4,
  },
  heroLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: 'rgba(255,214,0,0.7)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.white,
  },
  heroSub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLabel,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: SPACING.sm,
  },

  plans: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  planCard: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
    minHeight: 148,
    justifyContent: 'center',
  },
  planCardActive: {
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(255,214,0,0.07)',
  },
  bestBadge: {
    backgroundColor: COLORS.yellow,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  bestBadgeText: {
    fontFamily: FONTS.extraBold,
    fontSize: 9,
    color: COLORS.nearBlack,
    letterSpacing: 0.5,
  },
  planPeriodLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  planPrice: {
    fontFamily: FONTS.extraBold,
    fontSize: 34,
    color: COLORS.white,
    lineHeight: 40,
  },
  planPriceSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.yellow,
    marginTop: 6,
  },

  trialBtn: {
    height: 56,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  trialBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.nearBlack,
    letterSpacing: 1,
  },
  laterBtn: {
    height: 48,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.textLabel,
  },
  note: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
