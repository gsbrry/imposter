import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

// RevenueCat Paywall UI is native-only — guard for web
let RevenueCatUI: any = null;
if (Platform.OS !== 'web') {
  try {
    RevenueCatUI = require('react-native-purchases-ui').default;
  } catch { /* not available */ }
}

export default function PaywallScreen() {
  const router = useRouter();

  if (Platform.OS === 'web' || !RevenueCatUI) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          <View style={styles.center}>
            <Text style={styles.title}>Premium is available on Android</Text>
            <Text style={styles.sub}>Download the app to unlock all features.</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.push('/premium')} activeOpacity={0.85}>
              <Text style={styles.btnText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <X size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
        <RevenueCatUI.Paywall
          onPurchaseCompleted={() => router.back()}
          onRestoreCompleted={() => router.back()}
          onDismiss={() => router.back()}
        />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLabel,
    textAlign: 'center',
  },
  btn: {
    height: 52,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: COLORS.nearBlack,
  },
});
