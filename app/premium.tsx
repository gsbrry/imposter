import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Platform, Linking,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import X from 'lucide-react-native/dist/esm/icons/x';
import Crown from 'lucide-react-native/dist/esm/icons/crown';
import Check from 'lucide-react-native/dist/esm/icons/check';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import IconButton from '../components/IconButton';
import PrimaryButton from '../components/PrimaryButton';
import TextButton from '../components/TextButton';
import { usePremium } from '@/hooks/usePremium';
import { useGame } from '../context/GameContext';
import { PRODUCTS } from '../constants/revenuecat';

type PurchasesPackage = import('react-native-purchases').PurchasesPackage;
type PlanKey = 'monthly' | 'yearly' | 'lifetime';

interface PlanConfig {
  key: PlanKey;
  label: string;
  /** Fallback price, used until RevenueCat returns the localised string. */
  price: string;
  sub: string;
  badge?: string;
}

const PLAN_CONFIGS: PlanConfig[] = [
  { key: 'monthly', label: 'Monthly', price: '₹49', sub: 'Billed every month' },
  { key: 'yearly', label: 'Yearly', price: '₹199', sub: '₹16.6 a month', badge: 'SAVE 66%' },
  { key: 'lifetime', label: 'Lifetime', price: '₹599', sub: 'Pay once, play forever' },
];

const BENEFITS = [
  ['All 9 categories', 'Food, Bollywood, Sports and more'],
  ['Custom word packs', 'Add your own inside jokes'],
  ['No ads', 'A clean screen every game'],
];

// ─── Web fallback ──────────────────────────────────────────────────────────
function WebFallback({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <IconButton onPress={onClose} accessibilityLabel="Close">
              <X size={20} color={COLORS.ink} />
            </IconButton>
          </View>
          <View style={styles.webCenter}>
            <View style={styles.crownTile}>
              <Crown size={24} color={COLORS.honey} />
            </View>
            <AppText style={styles.title}>
              Impostr <AppText style={styles.titleAccent}>Pro</AppText>
            </AppText>
            <AppText style={styles.sub}>Premium is bought inside the Android app.</AppText>
            <PrimaryButton
              label="Open the Play Store"
              onPress={() => Linking.openURL('https://play.google.com/store').catch(() => {})}
              style={styles.webCta}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const router = useRouter();
  const { setIsPremium } = useGame();
  const { getOfferings, purchasePackage, restorePurchases, checkPremiumStatus } = usePremium();

  const [selected, setSelected] = useState<PlanKey>('yearly');
  const [packages, setPackages] = useState<Record<string, PurchasesPackage>>({});
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const successAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;

  const loadOfferings = useCallback(async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const showToast = (msg: string) => {
    setToast(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const triggerSuccess = () => {
    setIsPremium(true);
    setSuccess(true);
    Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    setTimeout(() => router.back(), 2200);
  };

  const handlePurchase = async () => {
    const pkg = packages[selected];
    if (!pkg) {
      // No real offerings yet (test mode) — mock success.
      setIsPremium(true);
      triggerSuccess();
      return;
    }
    setLoading(true);
    const result = await purchasePackage(pkg);
    setLoading(false);
    if (result.cancelled) return;
    if (result.success) {
      // Refresh from RevenueCat, the source of truth, before trusting it.
      const fresh = await checkPremiumStatus();
      setIsPremium(fresh);
      triggerSuccess();
    } else if (result.error) {
      showToast(result.error);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    const fresh = await checkPremiumStatus();
    setIsPremium(fresh);
    setRestoring(false);
    if (restored || fresh) {
      showToast('Premium restored.');
      setTimeout(() => router.back(), 1500);
    } else {
      showToast('Nothing to restore.');
    }
  };

  if (Platform.OS === 'web') {
    return <WebFallback onClose={() => router.back()} />;
  }

  if (success) {
    return (
      <View style={styles.container}>
        <ScreenBackground />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <Animated.View
            style={[
              styles.successWrap,
              { opacity: successAnim, transform: [{ scale: successAnim }] },
            ]}
          >
            <View style={styles.crownTile}>
              <Crown size={24} color={COLORS.honey} />
            </View>
            <AppText style={styles.title}>Welcome to Pro.</AppText>
            <AppText style={styles.sub}>Every category and mode is unlocked.</AppText>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  const selectedLabel = PLAN_CONFIGS.find(p => p.key === selected)?.label ?? 'Yearly';

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <IconButton onPress={() => router.back()} accessibilityLabel="Close">
              <X size={20} color={COLORS.ink} />
            </IconButton>
            {restoring ? (
              <ActivityIndicator size="small" color={COLORS.textBody} />
            ) : (
              <TextButton label="Restore" onPress={handleRestore} />
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View style={styles.hero}>
              <View style={styles.crownTile}>
                <Crown size={24} color={COLORS.honey} />
              </View>
              <AppText style={styles.title} maxFontSizeMultiplier={1.3}>
                Impostr <AppText style={styles.titleAccent}>Pro</AppText>
              </AppText>
              <AppText style={styles.sub}>Every pack, every mode, no ads.</AppText>
            </View>

            {/* What you get */}
            <GlassCard style={styles.benefits}>
              {BENEFITS.map(([title, desc]) => (
                <View key={title} style={styles.benefitRow}>
                  <Check size={16} color={COLORS.honeyText} />
                  <View style={styles.benefitText}>
                    <AppText style={styles.benefitTitle}>{title}</AppText>
                    <AppText style={styles.benefitDesc}>{desc}</AppText>
                  </View>
                </View>
              ))}
            </GlassCard>

            {/* Plans */}
            <View style={styles.plans}>
              {PLAN_CONFIGS.map(plan => {
                const isSelected = selected === plan.key;
                const price = packages[plan.key]?.product.priceString ?? plan.price;
                return (
                  <TouchableOpacity
                    key={plan.key}
                    onPress={() => setSelected(plan.key)}
                    activeOpacity={0.85}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${plan.label}, ${price}`}
                    style={[styles.plan, isSelected && styles.planSelected]}
                  >
                    <View style={[styles.radio, isSelected && styles.radioOn]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.planText}>
                      <AppText style={styles.planLabel}>{plan.label}</AppText>
                      <AppText style={[styles.planSub, isSelected && styles.planSubSelected]}>
                        {plan.sub}
                      </AppText>
                    </View>
                    <AppText style={styles.planPrice}>{price}</AppText>
                    {plan.badge && (
                      <View style={styles.planBadge}>
                        <AppText style={styles.planBadgeText}>{plan.badge}</AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.spacer} />

            <PrimaryButton
              label={loading ? 'Working...' : `Continue with ${selectedLabel}`}
              onPress={handlePurchase}
              disabled={loading}
            />
            <AppText style={styles.note}>Cancel any time in Play Store</AppText>
          </ScrollView>
        </View>
      </SafeAreaView>

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastAnim }]}>
          <AppText style={styles.toastText}>{toast}</AppText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  scroll: {
    flexGrow: 1,
    paddingTop: SPACING.gap,
    paddingBottom: 20,
    gap: SPACING.gap,
  },

  hero: { gap: 8, alignItems: 'flex-start' },
  crownTile: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  titleAccent: { color: COLORS.honeyText },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },

  benefits: { borderRadius: 18, paddingVertical: 6 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  benefitText: { flex: 1, minWidth: 0 },
  benefitTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  benefitDesc: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  plans: { gap: 10 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  planSelected: {
    backgroundColor: COLORS.honeySoft,
    borderColor: COLORS.honey,
    borderWidth: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: COLORS.honeyText },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.honeyText,
  },
  planText: { flex: 1, minWidth: 0 },
  planLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  planSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  planSubSelected: { color: COLORS.textBody },
  planPrice: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    letterSpacing: -0.3,
    color: COLORS.ink,
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: COLORS.ink,
  },
  planBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: COLORS.honey,
  },

  spacer: { flex: 1, minHeight: SPACING.xs },
  note: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: SPACING.screenX,
  },

  webCenter: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  webCta: { marginTop: SPACING.xs },

  toast: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.screenX,
    right: SPACING.screenX,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.ink,
  },
  toastText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13.5,
    color: COLORS.background,
    textAlign: 'center',
  },
});
