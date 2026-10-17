import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle, Ellipse } from 'react-native-svg';
import { COLORS } from '../constants/theme';

/**
 * The Impostr app mark: a speech bubble whose middle dot is a watching eye.
 * Ported from the MARK() helper in design/assets/screens.js, on the same
 * 1024x1024 grid so the proportions match the exported icon files.
 */
export default function AppMark({ size = 40 }: { size?: number }) {
  const id = `mark${size}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor={COLORS.honeyLight} />
          <Stop offset="0.55" stopColor={COLORS.honey} />
          <Stop offset="1" stopColor={COLORS.honeyDeep} />
        </LinearGradient>
      </Defs>
      <Rect width={1024} height={1024} rx={230} fill={`url(#${id})`} />
      <Path
        d="M362 252h300a150 150 0 0 1 150 150v140a150 150 0 0 1-150 150H420l-118 92c-12 9-28 0-26-15l14-87A150 150 0 0 1 212 542V402a150 150 0 0 1 150-150z"
        fill={COLORS.ink}
      />
      <Circle cx={352} cy={472} r={56} fill={COLORS.background} />
      <Circle cx={672} cy={472} r={56} fill={COLORS.background} />
      <Circle cx={512} cy={472} r={62} fill={COLORS.honey} />
      <Ellipse cx={512} cy={472} rx={15} ry={42} fill={COLORS.ink} />
    </Svg>
  );
}
