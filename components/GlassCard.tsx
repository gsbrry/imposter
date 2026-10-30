import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, BLUR, SHADOW, NATIVE_BLUR } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The base floating-glass surface: light blur, pale warm fill, bright
 * 1px border, radius 20. Matches impostr.css `.glass`. Always sits over
 * ScreenBackground's orbs — a glass fill over a flat cream page looks dull.
 *
 * Android never gets the real BlurView (see NATIVE_BLUR) — it uses the
 * solid fallback fill instead, same as web always has.
 */
function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={styles.shadowWrap}>
      <View style={[styles.card, Platform.OS === 'android' && styles.cardPlain, style]}>
        {NATIVE_BLUR && (
          <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: RADIUS.lg,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: SHADOW.card.offsetY },
    shadowOpacity: SHADOW.card.opacity,
    shadowRadius: SHADOW.card.radius,
    elevation: SHADOW.card.elevation,
  },
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  // The opaque stand-in for the blur, same fill the web build already uses.
  cardPlain: {
    backgroundColor: COLORS.glassFillSolid,
  },
});

/**
 * Memoised: rendered inside a .map() loop, so a parent re-render would
 * otherwise rebuild every item. Keep the props it receives stable.
 */
export default React.memo(GlassCard);
