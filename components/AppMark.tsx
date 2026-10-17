import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle, Ellipse } from 'react-native-svg';

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
          <Stop offset="0" stopColor="#FFD95A" />
          <Stop offset="0.55" stopColor="#F2B705" />
          <Stop offset="1" stopColor="#DE9E00" />
        </LinearGradient>
      </Defs>
      <Rect width={1024} height={1024} rx={230} fill={`url(#${id})`} />
      <Path
        d="M362 252h300a150 150 0 0 1 150 150v140a150 150 0 0 1-150 150H420l-118 92c-12 9-28 0-26-15l14-87A150 150 0 0 1 212 542V402a150 150 0 0 1 150-150z"
        fill="#1B1813"
      />
      <Circle cx={352} cy={472} r={56} fill="#F4EFE4" />
      <Circle cx={672} cy={472} r={56} fill="#F4EFE4" />
      <Circle cx={512} cy={472} r={62} fill="#F2B705" />
      <Ellipse cx={512} cy={472} rx={15} ry={42} fill="#1B1813" />
    </Svg>
  );
}
