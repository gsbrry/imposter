import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, BLUR } from '../constants/theme';

/** Frosted pill background for the floating tab bar. Matches impostr.css `.tabbar.glass`. */
export function GlassTabBarBackground() {
  return (
    <View style={styles.wrap}>
      {Platform.OS !== 'web' && (
        <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.fill]} />
    </View>
  );
}

interface TabIconProps {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  size: number;
  focused: boolean;
}

/** Per-tab icon with the active pill. Matches impostr.css `.tab` / `.tab.on`. */
export function TabIcon({ Icon, color, size, focused }: TabIconProps) {
  return (
    <View style={[styles.iconSlot, focused && styles.iconSlotActive]}>
      <Icon size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  fill: {
    backgroundColor: COLORS.glassFillStrong,
  },
  iconSlot: {
    width: 44,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotActive: {
    backgroundColor: COLORS.glassFillStrong,
  },
});
