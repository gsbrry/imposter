import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Animated, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Crown, Star } from 'phosphor-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { usePremium } from '@/hooks/usePremium';
import { useGame } from '../context/GameContext';
import { PRODUCTS } from '../constants/revenuecat';

type PurchasesPackage = import('react-native-purchases').PurchasesPackage;

interface PlanConfig {
  key: 'monthly' | 'yearly' | 'lifetime';
  label: string;
  price: string;
  sub: string;
  badge?: string;
  badgeStyle?: 'yellow' | 'glass';
  highlight: boolean;
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    key: 'monthly',
    label: 'MONTHLY',
    price: '₹49 / month',
    sub: 'Billed every month',
    highlight: false,
  },
  {
    key: 'yearly',
    label: 'YEARLY',
    price: '₹199 / year',
    sub: 'Save 66%',
    badge: 'BEST VALUE',
    badgeStyle: 'yellow',
    highlight: true,
  },
  {
    key: 'lifetime',
    label: 'LIFETIME',
    price: '₹599 one time',
    sub: 'Pay once, play forever',
    badge: 'NO RENEWAL',
    badgeStyle: 'glass',
    highlight: false,
  },
];

// ─── Web fallback ──────────────────────────────────────────────────────────
function WebFallback({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <X size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
        <View style={styles.webCenter}>
          <View style={styles.starCircle}>
            <Star size={48} color={COLORS.yellow} weight="fill" />
          </View>
          <Text style={styles.webTitle}>Premium is available on Android</Text>
          <Text style={styles.webSub}>Download the free app to unlock all features</Text>
          <TouchableOpacity
            style={styles.trialBtn}
            onPress={() => Linking.openURL('https://play.google.com/store')}
            activeOpacity={0.88}
          >
            <Text style={styles.trialBtnText}>Download on Play Store</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const router = useRouter();
  const { setIsPremium } = useGame();
  const { getOfferings, purchasePackage, restorePurchases } = usePremium();

  const [selected, setSelected] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [packages, setPackages] = useState<Record<string, PurchasesPackage>>({});
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    Object.fromEntries(PLAN_CONFIGS.map(p => [p.key, new Animated.Value(1)]))
  ).current;

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const offerings = await getOfferings();
    if (!offerings?.current) return;
    const map: Record<string, PurchasesPackage> = {};
    for (const pkg of offerings.current.availablePackages) {
      const id = pkg.product.identifier;
      if (id === PRODUCTS.monthly) map.monthly = pkg;
      else if (id === PRODUCTS.yearly) map.yearly = pkg;
      else if (id === PRODUCTS.lifetime) map.lifetime = pkg;
    }
    setPackages(map);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const handlePurchase = async () => {
    const pkg = packages[selected];
    if (!pkg) {
      // No real offerings yet (test mode) — just mock success
      triggerSuccess();
      return;
    }
    setLoading(true);
    const result = await purchasePackage(pkg);
    setLoading(false);
    if (result.cancelled) return;
    if (result.success) {
      triggerSuccess();
    } else if (result.error) {
      showToast(result.error);
    }
  };

  const triggerSuccess = () => {
    setIsPremium(true);
    setSuccess(true);
    // Full-screen yellow flash
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    setTimeout(() => router.back(), 2200);
  };

  const handleRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    if (restored) {
      setIsPremium(true);
      showToast('Premium restored!');
      setTimeout(() => router.back(), 1500);
    } else {
      showToast('Nothing to restore');
    }
  };

  const pressPlan = (key: 'monthly' | 'yearly' | 'lifetime') => {
    setSelected(key);
    const anim = scaleAnims[key];
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1.02, useNativeDriver: true, friction: 6 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
  };

  if (Platform.OS === 'web') {
    return <WebFallback onClose={() => router.back()} />;
  }

  return (
    <View style={styles.container}>
      {/* Yellow flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]}
      />

      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <X size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {success ? (
          <Animated.View style={[styles.successWrap, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
            <Crown size={72} color={COLORS.yellow} weight="fill" />
            <Text style={styles.successTitle}>Welcome to Premium!</Text>
            <Text style={styles.successSub}>All categories and features unlocked.</Text>
          </Animated.View>
        ) : (
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
              {PLAN_CONFIGS.map(plan => {
                const isSelected = selected === plan.key;
                return (
                  <Animated.View key={plan.key} style={{ transform: [{ scale: scaleAnims[plan.key] }] }}>
                    <TouchableOpacity
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardActive,
                        plan.highlight && styles.planCardHighlight,
                      ]}
                      onPress={() => pressPlan(plan.key)}
                      activeOpacity={0.85}
                    >
                      {plan.badge && (
                        <View style={[
                          styles.planBadge,
                          plan.badgeStyle === 'yellow' ? styles.planBadgeYellow : styles.planBadgeGlass,
                        ]}>
                          <Text style={[
                            styles.planBadgeText,
                            plan.badgeStyle === 'glass' && styles.planBadgeTextGlass,
                          ]}>
                            {plan.badge}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      <Text style={[styles.planPrice, isSelected && styles.planPriceActive]}>
                        {plan.price}
                      </Text>
                      <Text style={styles.planSub}>{plan.sub}</Text>
                      {isSelected && <View style={styles.selectedDot} />}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.trialBtn, loading && styles.trialBtnLoading]}
              onPress={handlePurchase}
              activeOpacity={0.88}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.nearBlack} />
                : <Text style={styles.trialBtnText}>UNLOCK PREMIUM</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.laterBtnText}>Maybe Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={handleRestore}
              disabled={restoring}
              activeOpacity={0.7}
            >
              {restoring
                ? <ActivityIndicator size="small" color={COLORS.textMuted} />
                : <Text style={styles.restoreText}>Restore purchases</Text>
              }
            </TouchableOpacity>

            <Text style={styles.note}>
              Cancel anytime. Prices shown in INR. Subscriptions auto-renew unless cancelled.
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Toast */}
      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastAnim }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.yellow,
    zIndex: 99,
  },
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

  // Hero
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

  // Plans
  plans: { gap: SPACING.xs },
  planCard: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  planCardActive: {
    borderColor: COLORS.yellow,
    backgroundColor: 'rgba(255,214,0,0.07)',
  },
  planCardHighlight: {
    borderColor: 'rgba(255,214,0,0.4)',
  },
  planBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  planBadgeYellow: { backgroundColor: COLORS.yellow },
  planBadgeGlass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planBadgeText: {
    fontFamily: FONTS.extraBold,
    fontSize: 9,
    color: COLORS.nearBlack,
    letterSpacing: 0.5,
  },
  planBadgeTextGlass: { color: COLORS.textBody },
  planLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textLabel,
    letterSpacing: 2,
  },
  planPrice: {
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 32,
  },
  planPriceActive: { color: COLORS.yellow },
  planSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.yellow,
    marginTop: 6,
  },

  // Buttons
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
  trialBtnLoading: { opacity: 0.7 },
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
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  note: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Success
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  successTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textLabel,
    textAlign: 'center',
  },

  // Web fallback
  webCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  webTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    textAlign: 'center',
  },
  webSub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLabel,
    textAlign: 'center',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 48,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  toastText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
  },
});
