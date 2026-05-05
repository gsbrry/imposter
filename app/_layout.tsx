import { useEffect } from 'react';
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
import { GameProvider, useGame } from '../context/GameContext';
import { usePremium } from '@/hooks/usePremium';

SplashScreen.preventAutoHideAsync();

function RCInitialiser() {
  const { setIsPremium } = useGame();
  const { initRevenueCat, checkPremiumStatus } = usePremium();

  useEffect(() => {
    (async () => {
      await initRevenueCat();
      const premium = await checkPremiumStatus();
      setIsPremium(premium);
    })();
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
      <StatusBar style="light" />
    </GameProvider>
  );
}
