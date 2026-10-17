import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, Animated, Easing, AccessibilityInfo, Platform,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS, SPACING, SHADOW } from '../constants/theme';
import ScreenBackground from './ScreenBackground';
import AppMark from './AppMark';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * In-app splash shown while fonts load. Matches design/screens/01-splash.html:
 * pulsing honey glow behind the mark, wordmark, tagline, indeterminate bar,
 * and the studio credit pinned near the bottom.
 */
export default function SplashScreen() {
  const pulse = useRef(new Animated.Value(0)).current;
  const load = useRef(new Animated.Value(0)).current;
  const reduceMotion = useRef(false);
  // Settings > Reduce motion stops the glow and the loader bar too.
  const { reduceMotion: prefersReduced } = useAccessibility();

  useEffect(() => {
    let cancelled = false;

    const start = () => {
      if (cancelled || reduceMotion.current) return;
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(load, { toValue: 1, duration: 2400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(load, { toValue: 0, duration: 2400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    };

    if (prefersReduced) {
      reduceMotion.current = true;
    } else {
      AccessibilityInfo.isReduceMotionEnabled()
        .then(enabled => { reduceMotion.current = enabled; start(); })
        .catch(start);
    }

    return () => { cancelled = true; };
  }, [load, pulse, prefersReduced]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glowOpacity = prefersReduced
    ? 0
    : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.18] });
  // scaleX of a full-width bar, so the loader runs on the UI thread during
  // startup, when the JS thread is busiest.
  const barScale = prefersReduced
    ? 0.4
    : load.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.78] });

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <View style={styles.center}>
        <View style={styles.markWrap}>
          <Animated.View
            pointerEvents="none"
            style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
          />
          <AppMark size={116} />
        </View>

        <View style={styles.text}>
          <AppText style={styles.title}>Impostr</AppText>
          <AppText style={styles.tagline}>One word. One liar. Find them.</AppText>
        </View>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { transform: [{ scaleX: barScale }] }]} />
        </View>
      </View>

      <AppText style={styles.credit}>GOOSEBERRY MEDIA</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 22,
  },
  markWrap: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    // Matches the drop-shadow on the mark in the design.
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 40,
    backgroundColor: COLORS.honey,
  },
  text: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 38,
    letterSpacing: -1,
    color: COLORS.ink,
  },
  tagline: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    color: COLORS.textBody,
  },
  barTrack: {
    width: 120,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: COLORS.divider,
  },
  barFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.honey,
    transformOrigin: 'left',
  },
  credit: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 36 : SPACING.lg,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
});
