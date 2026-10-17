import React from 'react';
import {
  Animated, TouchableOpacity, StyleSheet, StyleProp, ViewStyle,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS, RADIUS, SIZE, SPACING, SHADOW } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import { useAccessibility } from '../context/AccessibilityContext';

interface InkButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Solid ink/cream secondary action. Matches impostr.css `.btn-ink`. */
export default function InkButton({
  label, onPress, icon, disabled, style, accessibilityLabel,
}: InkButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  // Larger text grows the control with the label so nothing is clipped.
  const { textScale } = useAccessibility();

  return (
    <Animated.View style={[styles.shadowWrap, { transform: [{ scale }], opacity: disabled ? 0.4 : 1 }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[styles.button, { minHeight: SIZE.button * textScale }]}
      >
        {icon}
        <AppText style={styles.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{label}</AppText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: RADIUS.md,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  button: {
    minHeight: SIZE.button,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  text: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.background,
  },
});
