import React from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, RADIUS, SIZE, SPACING, BLUR } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Glass secondary action. Matches impostr.css `.btn-glass`. */
export default function GlassButton({
  label, onPress, icon, disabled, style, accessibilityLabel,
}: GlassButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: disabled ? 0.4 : 1 }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.button}
      >
        {Platform.OS !== 'web' && (
          <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
        {icon}
        <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: SIZE.button,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  text: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.ink,
  },
});
