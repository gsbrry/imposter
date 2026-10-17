import React from 'react';
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SPACING, BLUR, SHADOW } from '../constants/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Glass sheet anchored to the bottom of the screen. Matches impostr.css
 * `.sheet` (glass-hi fill, radius 34) over `.dim` (dark blurred scrim).
 */
export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.dim} onPress={onClose}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={15} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
      </Pressable>
      <View style={styles.sheetShadow} pointerEvents="box-none">
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.handle} />
          {children}
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrim,
  },
  sheetShadow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: RADIUS.sheet,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
  },
  sheet: {
    borderRadius: RADIUS.sheet,
    backgroundColor: COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    gap: SPACING.sm,
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
