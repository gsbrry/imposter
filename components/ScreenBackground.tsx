import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

/**
 * Cream page background with two blurred honey orbs and a faint dot
 * pattern, per impostr.css `.scr::before` / `.orb`. Without this behind a
 * glass layer, the glass looks flat — always render it behind GlassCard,
 * BottomSheet, and the tab bar.
 */
export default function ScreenBackground() {
  const { width, height } = useWindowDimensions();

  const o1 = width * 0.66;
  const o2 = width * 0.76;
  const o3 = width * 0.44;
  // CSS fades the dot pattern out after the top 55% of the screen.
  const dotsHeight = height * 0.55;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.base, { backgroundColor: COLORS.background }]} />

      <View
        style={[
          styles.orb,
          {
            width: o1, height: o1, borderRadius: o1 / 2,
            backgroundColor: COLORS.orbHoney, top: -width * 0.2, right: -width * 0.24,
            opacity: 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          {
            width: o2, height: o2, borderRadius: o2 / 2,
            backgroundColor: COLORS.orbCream, bottom: -width * 0.26, left: -width * 0.26,
            opacity: 0.7,
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          {
            width: o3, height: o3, borderRadius: o3 / 2,
            backgroundColor: COLORS.orbLight, top: '42%', left: '55%',
            opacity: 0.7,
          },
        ]}
      />

      <View style={[styles.dotsClip, { height: dotsHeight }]}>
        <Svg width={width} height={dotsHeight}>
          <Defs>
            <Pattern id="dots" width={14} height={14} patternUnits="userSpaceOnUse">
              <Circle cx={1.1} cy={1.1} r={1.1} fill={COLORS.dot} />
            </Pattern>
          </Defs>
          <Rect x={0} y={0} width={width} height={dotsHeight} fill="url(#dots)" />
        </Svg>
        <LinearGradient
          colors={['transparent', COLORS.background]}
          start={{ x: 0, y: 0.6 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    // RN has no CSS blur filter for plain Views — the soft edge comes from
    // low opacity + large radius instead, which reads the same on a phone.
  },
  dotsClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
