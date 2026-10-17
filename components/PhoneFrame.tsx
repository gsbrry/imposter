import { useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';
import ScreenBackground from './ScreenBackground';
import { ContentSizeProvider } from './ContentSize';

/**
 * Keeps the one-handed layout intact on anything wider than a phone.
 *
 * Phones and narrow browser windows pass straight through. A tablet, or a
 * desktop browser, gets the app as a centred column on the cream page with
 * the honey orbs behind it, matching the tablet captures in
 * design/store/play-store. A full-width tablet layout would leave the
 * reveal card and the vote grid stranded in white space, and the game is
 * played by passing one device round either way.
 */

/** Android's own small-tablet threshold, in dp. */
const TABLET_BREAKPOINT = 600;
/** Android's 10-inch threshold, sw720dp, and desktop browsers. */
const LARGE_TABLET_BREAKPOINT = 720;

const COLUMN_WIDTH_TABLET = 460;
const COLUMN_WIDTH_LARGE = 520;

const SPACE_AROUND = 32;
/** On web the column is framed; on a tablet it fills the height. */
const FRAME_MAX_HEIGHT = 900;

export function columnWidthFor(width: number): number | null {
  if (width < TABLET_BREAKPOINT) return null;
  return width >= LARGE_TABLET_BREAKPOINT ? COLUMN_WIDTH_LARGE : COLUMN_WIDTH_TABLET;
}

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const columnWidth = columnWidthFor(width);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // The page behind the column, so the browser gutters match the app.
    document.body.style.backgroundColor = COLORS.background;
  }, []);

  if (columnWidth === null) {
    return <View style={styles.fill}>{children}</View>;
  }

  // On web the column keeps a rounded frame and sits in from the edges. On
  // a tablet it runs the full height, so the status bar and the system
  // navigation still belong to the app.
  const framed = Platform.OS === 'web';
  const columnHeight = framed
    ? Math.min(height - SPACE_AROUND * 2, FRAME_MAX_HEIGHT)
    : height;

  return (
    <View style={styles.backdrop}>
      <ScreenBackground />
      <View
        style={[
          styles.column,
          { width: columnWidth, height: columnHeight },
          framed && styles.framed,
        ]}
      >
        <ContentSizeProvider width={columnWidth} height={columnHeight}>
          {children}
        </ContentSizeProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  column: {
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  framed: {
    borderRadius: RADIUS.lg + 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
});
