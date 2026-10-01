import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProvider, useGame } from '../context/GameContext';
import PhoneFrame from '@/components/PhoneFrame';
import { usePremium } from '@/hooks/usePremium';
import { ENTITLEMENT_ID } from '@/constants/revenuecat';
import type { CustomerInfo } from 'react-native-purchases';

const PREMIUM_CACHE_KEY = 'IMPOSTR_PREMIUM_CACHE';

SplashScreen.preventAutoHideAsync();

function RCInitialiser() {
  const { setIsPremium } = useGame();
  const { initRevenueCat, checkPremiumStatus } = usePremium();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let listenerRemover: (() => void) | undefined;

    (async () => {
      await initRevenueCat();
      const premium = await checkPremiumStatus();
      setIsPremium(premium);

      // Listen for any RC customer info changes (purchases, renewals, restores)
      try {
        const Purchases = (await import('react-native-purchases')).default;
        const onCustomerInfo = async (info: CustomerInfo) => {
          const active = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
          setIsPremium(active);
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
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <GameProvider>
      <RCInitialiser />
      <PhoneFrame>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0A1E' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="game-settings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="player-names" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="reveal" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="clue-round" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="vote" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="result" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="suggest" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </PhoneFrame>
      <StatusBar style="light" />
    </GameProvider>
  );
}
