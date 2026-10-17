import React from 'react';
import {
  View, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import IconButton from '../components/IconButton';

// RevenueCat Paywall UI is native-only — guard for web
let RevenueCatUI: any = null;
if (Platform.OS !== 'web') {
  try {
    RevenueCatUI = require('react-native-purchases-ui').default;
  } catch { /* not available */ }
}

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'web' || !RevenueCatUI) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <IconButton
            onPress={() => router.back()}
            style={[styles.closeBtn, { top: insets.top + 12 }]}
            accessibilityLabel="Close"
          >
            <X size={20} color={COLORS.textFaint} />
          </IconButton>
          <View style={styles.center}>
            <AppText style={styles.title}>Premium is available on Android</AppText>
            <AppText style={styles.sub}>Download the app to unlock all features.</AppText>
            <TouchableOpacity style={styles.btn} onPress={() => router.push('/premium')} activeOpacity={0.85}>
              <AppText style={styles.btnText}>View Plans</AppText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <IconButton
          onPress={() => router.back()}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          accessibilityLabel="Close"
        >
          <X size={20} color={COLORS.textFaint} />
        </IconButton>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    left: SPACING.sm,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  btn: {
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.honey,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 15,
    color: COLORS.ink,
  },
});
