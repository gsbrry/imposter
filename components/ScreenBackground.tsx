import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle, Defs, Pattern, Rect, RadialGradient, Stop,
} from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { useContentSize } from './ContentSize';

/**
 * Cream page background with two blurred honey orbs and a faint dot
 * pattern, per impostr.css `.scr::before` / `.orb`. Without this behind a
 * glass layer, the glass looks flat — always render it behind GlassCard,
 * BottomSheet, and the tab bar.
 *
 * React Native has no CSS blur filter for plain Views, so each orb is an
 * SVG circle filled with a radial gradient that fades to transparent. That
 * reproduces the soft edge of the design's `filter: blur(38px)`.
 */
export default function ScreenBackground() {
  const { width, height } = useContentSize();

  // Sizes are a share of the width, matching the design's cqi units.
  const o1 = width * 0.66;
  const o2 = width * 0.76;
  const o3 = width * 0.44;
  // The dot pattern fades out over the top 55% of the screen.
  const dotsHeight = height * 0.55;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.base} />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbHoney" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={COLORS.orbHoney} stopOpacity={0.75} />
            <Stop offset="0.55" stopColor={COLORS.orbHoney} stopOpacity={0.38} />
            <Stop offset="1" stopColor={COLORS.orbHoney} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="orbCream" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={COLORS.orbCream} stopOpacity={0.85} />
            <Stop offset="0.55" stopColor={COLORS.orbCream} stopOpacity={0.42} />
            <Stop offset="1" stopColor={COLORS.orbCream} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="orbLight" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={COLORS.orbLight} stopOpacity={0.45} />
            <Stop offset="0.55" stopColor={COLORS.orbLight} stopOpacity={0.2} />
            <Stop offset="1" stopColor={COLORS.orbLight} stopOpacity={0} />
          </RadialGradient>
          <Pattern id="dots" width={14} height={14} patternUnits="userSpaceOnUse">
            <Circle cx={1.1} cy={1.1} r={1.1} fill={COLORS.dot} />
          </Pattern>
        </Defs>

        {/* Top right honey orb */}
        <Circle
          cx={width + width * 0.24 - o1 / 2}
          cy={-width * 0.2 + o1 / 2}
          r={o1 / 2}
          fill="url(#orbHoney)"
        />
        {/* Bottom left cream orb */}
        <Circle
          cx={-width * 0.26 + o2 / 2}
          cy={height + width * 0.26 - o2 / 2}
          r={o2 / 2}
          fill="url(#orbCream)"
        />
        {/* Soft centre highlight */}
        <Circle
          cx={width * 0.55 + o3 / 2}
          cy={height * 0.42 + o3 / 2}
          r={o3 / 2}
          fill="url(#orbLight)"
        />

        {/* Dot grid, top portion only */}
        <Rect x={0} y={0} width={width} height={dotsHeight} fill="url(#dots)" opacity={0.6} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
});
