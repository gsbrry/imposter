import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProvider, useGame } from '../context/GameContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { initCrashReporting } from '@/utils/crashReporting';
import PhoneFrame from '@/components/PhoneFrame';
import AppSplash from '@/components/SplashScreen';
import { usePremium } from '@/hooks/usePremium';
import { storage } from '@/utils/storage';
import { ENTITLEMENT_ID } from '@/constants/revenuecat';
import { REVIEW_ACCESS_ENABLED } from '@/constants/reviewAccess';
import { COLORS } from '@/constants/theme';
import type { CustomerInfo } from 'react-native-purchases';

const PREMIUM_CACHE_KEY = 'IMPOSTR_PREMIUM_CACHE';

SplashScreen.preventAutoHideAsync();

// Before anything else, so a crash during startup is still captured.
// Does nothing in development or without a DSN.
initCrashReporting();

function RCInitialiser() {
  const { setIsPremium } = useGame();
  const { initRevenueCat, checkPremiumStatus } = usePremium();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let listenerRemover: (() => void) | undefined;

    (async () => {
      await initRevenueCat();
      // RevenueCat is asked on every launch; its answer is authoritative.
      const premium = await checkPremiumStatus();
      // The review unlock is a development aid and is never consulted in a
      // release build, so it cannot be used to bypass the paywall.
      const reviewUnlocked = REVIEW_ACCESS_ENABLED && (await storage.getReviewUnlock());
      setIsPremium(premium || reviewUnlocked);

      // Listen for any RC customer info changes (purchases, renewals, restores)
      try {
        const Purchases = (await import('react-native-purchases')).default;
        const onCustomerInfo = async (info: CustomerInfo) => {
          const active = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
          const unlocked = REVIEW_ACCESS_ENABLED && (await storage.getReviewUnlock());
          setIsPremium(active || unlocked);
          await AsyncStorage.setItem(
            PREMIUM_CACHE_KEY,
            JSON.stringify({ isPremium: active, cachedAt: Date.now() })
          );
        };
        Purchases.addCustomerInfoUpdateListener(onCustomerInfo);
        listenerRemover = () => Purchases.removeCustomerInfoUpdateListener(onCustomerInfo);
      } catch { /* not available in this environment */ }
    })();

    return () => { listenerRemover?.(); };
  }, []);

  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hand off from the native splash to our own, which keeps the
      // Honey and Cream look while the rest of the app mounts.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <AccessibilityProvider>
        <RCInitialiser />
        <PhoneFrame>
          {!fontsLoaded && !fontError ? (
            <AppSplash />
          ) : (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="setup" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="game-settings" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="player-names" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="reveal" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="who-starts" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="clue-round" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="vote" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="result" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
              <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
              <Stack.Screen name="suggest" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="report" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          )}
        </PhoneFrame>
        <StatusBar style="dark" />
        </AccessibilityProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
