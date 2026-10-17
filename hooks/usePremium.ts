import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENTITLEMENT_ID, getUsableKey } from '@/constants/revenuecat';

// Dynamic imports so web bundle never resolves native RC modules
async function getPurchases() {
  const mod = await import('react-native-purchases');
  return mod.default;
}

const CACHE_KEY = 'IMPOSTR_PREMIUM_CACHE';

/**
 * The entitlement is checked against RevenueCat on every launch. The cached
 * answer is a fallback for one case only, a launch with no connection, and
 * it expires after this window so a lapsed or refunded subscription cannot
 * keep working indefinitely by staying offline. Long enough to cover an
 * evening's play after a daytime launch, short enough to be a grace period
 * rather than a licence.
 */
const OFFLINE_GRACE_MS = 6 * 60 * 60 * 1000;

type CustomerInfo = import('react-native-purchases').CustomerInfo;
type PurchasesPackage = import('react-native-purchases').PurchasesPackage;

function isPremiumActive(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

async function writeCache(premium: boolean, expiryDate: string | null = null) {
  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ isPremium: premium, cachedAt: Date.now(), expiryDate })
  );
}

export function usePremium() {
  const initRevenueCat = async () => {
    if (Platform.OS === 'web') return;
    try {
      const Purchases = await getPurchases();
      const { LOG_LEVEL } = await import('react-native-purchases');
      // Verbose logging is a debugging aid, not something to ship.
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
      const key = getUsableKey(Platform.OS);
      if (!key) {
        // Configuring with a missing or "test_" key makes the SDK show a
        // blocking dialog and close a release build. Run without purchases.
        console.warn(
          'RevenueCat has no production key for this platform. Purchases are ' +
            'disabled. Set EXPO_PUBLIC_RC_ANDROID_KEY / EXPO_PUBLIC_RC_IOS_KEY.'
        );
        return;
      }
      await Purchases.configure({ apiKey: key });
    } catch (e) {
      console.error('RevenueCat init failed:', e);
    }
  };

  const checkPremiumStatus = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
      const Purchases = await getPurchases();
      const info = await Purchases.getCustomerInfo();
      const premium = isPremiumActive(info);
      await writeCache(
        premium,
        info.entitlements.active[ENTITLEMENT_ID]?.expirationDate ?? null
      );
      return premium;
    } catch {
      // Only reached when the entitlement could not be fetched at all,
      // which in practice means the device is offline.
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const { isPremium, cachedAt } = JSON.parse(raw);
          if (Date.now() - cachedAt < OFFLINE_GRACE_MS) return isPremium;
        }
      } catch { /* ignore */ }
      return false;
    }
  };

  const getExpiryDate = async (): Promise<string | null> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const { expiryDate } = JSON.parse(raw);
        return expiryDate ?? null;
      }
    } catch { /* ignore */ }
    return null;
  };

  const getOfferings = async () => {
    if (Platform.OS === 'web') return null;
    try {
      const Purchases = await getPurchases();
      return await Purchases.getOfferings();
    } catch { return null; }
  };

  const purchasePackage = async (
    pkg: PurchasesPackage
  ): Promise<{ success: boolean; cancelled?: boolean; error?: string }> => {
    if (Platform.OS === 'web') return { success: false, error: 'Not available on web' };
    try {
      const Purchases = await getPurchases();
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const success = isPremiumActive(customerInfo);
      if (success) {
        await writeCache(
          true,
          customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate ?? null
        );
      }
      return { success };
    } catch (e: any) {
      if (e.userCancelled) return { success: false, cancelled: true };
      return { success: false, error: e.message ?? 'Purchase failed' };
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
      const Purchases = await getPurchases();
      const info = await Purchases.restorePurchases();
      const premium = isPremiumActive(info);
      await writeCache(premium);
      return premium;
    } catch { return false; }
  };

  return {
    initRevenueCat,
    checkPremiumStatus,
    getExpiryDate,
    getOfferings,
    purchasePackage,
    restorePurchases,
  };
}
