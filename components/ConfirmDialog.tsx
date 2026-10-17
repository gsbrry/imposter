import React, { useEffect } from 'react';
import {
  View, Pressable, StyleSheet, Platform, BackHandler,
} from 'react-native';
import { BlurView } from 'expo-blur';
import AppText from './AppText';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import GlassButton from './GlassButton';
import InkButton from './InkButton';

interface ConfirmDialogProps {
  visible: boolean;
  icon?: React.ReactNode;
  title: string;
  message: string;
  /** Left button: the safe way out. */
  cancelLabel: string;
  /** Right button: the action being confirmed. */
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Centred confirm dialog over a dark scrim. Matches design 32 Exit confirm.
 *
 * Rendered in the screen's own tree rather than a RN Modal, for the same
 * reason as BottomSheet: a Modal portals to the document root on web and
 * escapes the centred phone column. Android back cancels.
 */
export default function ConfirmDialog({
  visible, icon, title, message, cancelLabel, confirmLabel, onCancel, onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={[StyleSheet.absoluteFill, styles.dim]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      >
        {Platform.OS !== 'web' && (
          <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
        )}
      </Pressable>

      <View style={styles.shadow} pointerEvents="box-none">
        <View
          style={styles.dialog}
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel={`${title}. ${message}`}
        >
          {icon && <View style={styles.iconTile}>{icon}</View>}
          <AppText style={styles.title} maxFontSizeMultiplier={1.4}>{title}</AppText>
          <AppText style={styles.message}>{message}</AppText>
          <View style={styles.actions}>
            {/* The cancel label is the longer of the two, so it takes the
                larger share rather than being clipped. */}
            <GlassButton label={cancelLabel} onPress={onCancel} style={styles.cancel} />
            <InkButton label={confirmLabel} onPress={onConfirm} style={styles.confirm} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { backgroundColor: COLORS.scrim },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  dialog: {
    borderRadius: RADIUS.xl,
    padding: 20,
    gap: 12,
    backgroundColor: Platform.OS === 'web' ? COLORS.glassFillSolid : COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  message: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
    marginTop: -6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancel: { flex: 1.3 },
  confirm: { flex: 1 },
});
