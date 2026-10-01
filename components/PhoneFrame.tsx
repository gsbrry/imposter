import { useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

/**
 * Keeps the mobile layout intact on desktop web by rendering the app inside a
 * centred, phone-width frame. On native, and on narrow browser windows, it is
 * a transparent pass-through so nothing about the phone experience changes.
 */

const FRAME_WIDTH = 420;
const FRAME_MAX_HEIGHT = 900;
// Below this the browser window is close enough to a phone to go full bleed.
const WIDE_BREAKPOINT = 700;

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= WIDE_BREAKPOINT;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // The page behind the frame, so the browser gutters match the app.
    document.body.style.backgroundColor = COLORS.nearBlack;
  }, []);

  if (!isWide) {
    return <View style={styles.fill}>{children}</View>;
  }

  const frameHeight = Math.min(height - SPACE_AROUND * 2, FRAME_MAX_HEIGHT);

  return (
    <View style={styles.backdrop}>
      <View style={styles.glow} pointerEvents="none" />
      <View style={[styles.frame, { width: FRAME_WIDTH, height: frameHeight }]}>
        {children}
      </View>
    </View>
  );
}

const SPACE_AROUND = 32;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.nearBlack,
  },
  // A soft yellow halo so the frame reads as deliberate rather than cropped.
  glow: {
    position: 'absolute',
    width: FRAME_WIDTH + 160,
    height: FRAME_WIDTH + 160,
    borderRadius: (FRAME_WIDTH + 160) / 2,
    backgroundColor: COLORS.yellowGlass,
    opacity: 0.5,
  },
  frame: {
    overflow: 'hidden',
    borderRadius: RADIUS.card + 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.violet,
  },
});
