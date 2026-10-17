import React, { useEffect } from 'react';
import {
  View, Pressable, StyleSheet, Platform, BackHandler, useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, BLUR, SHADOW } from '../constants/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Glass sheet anchored to the bottom of the screen. Matches impostr.css
 * `.sheet` (glass-hi fill, radius 34) over `.dim` (dark blurred scrim).
 *
 * Rendered in the screen's own tree rather than in a RN Modal: a Modal
 * portals to the document root on web, which would break out of the
 * centred phone-width column. Android back is handled explicitly here
 * since that is the one thing Modal would have given us for free.
 */
export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={[StyleSheet.absoluteFill, styles.dim]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        {Platform.OS !== 'web' && (
          <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
        )}
      </Pressable>

      <View style={[styles.shadow, { bottom: Math.max(insets.bottom, 8), maxHeight: height * 0.85 }]}>
        <View style={styles.sheet}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: COLORS.scrim,
  },
  shadow: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: RADIUS.sheet,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
  },
  sheet: {
    borderRadius: RADIUS.sheet,
    backgroundColor: Platform.OS === 'web' ? COLORS.glassFillSolid : COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    gap: SPACING.gap,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 8,
  },
});
