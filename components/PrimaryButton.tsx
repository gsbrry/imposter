import React from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, GRADIENTS, RADIUS, SIZE, SHADOW, SPACING } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  /** Play-style icons lead the label; "next" arrows trail it. */
  iconPosition?: 'leading' | 'trailing';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * The one honey-gradient action per screen. Matches impostr.css `.btn-gold`.
 */
export default function PrimaryButton({
  label, onPress, icon, iconPosition = 'leading', disabled, style, accessibilityLabel,
}: PrimaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();

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
        style={styles.touchable}
      >
        <LinearGradient
          colors={GRADIENTS.honeyButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.fill}
        >
          {iconPosition === 'leading' && icon}
          <Text style={styles.text}>{label}</Text>
          {iconPosition === 'trailing' && icon}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: RADIUS.md,
    shadowColor: SHADOW.honeyButton.color,
    shadowOffset: { width: 0, height: SHADOW.honeyButton.offsetY },
    shadowOpacity: SHADOW.honeyButton.opacity,
    shadowRadius: SHADOW.honeyButton.radius,
    elevation: SHADOW.honeyButton.elevation,
  },
  touchable: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  fill: {
    minHeight: SIZE.button,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  text: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.onHoney,
  },
});
