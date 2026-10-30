import React from 'react';
import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SIZE, BLUR, NATIVE_BLUR } from '../constants/theme';
import { useAccessibility } from '../context/AccessibilityContext';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  /** Required — icon-only buttons must always be announced to screen readers. */
  accessibilityLabel: string;
  size?: number;
  glass?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Icon-only touch target. Matches impostr.css `.iconbtn` / `.iconbtn.glass`.
 * Visual size is 40x40 per tokens.json `size.iconButton`; hitSlop pads the
 * actual touch target out to the 44x44 minimum.
 */
export default function IconButton({
  onPress, children, accessibilityLabel, size = SIZE.iconButton, glass = true, style,
}: IconButtonProps) {
  const { textScale } = useAccessibility();
  const visual = Math.round(size * textScale);
  // hitSlop tops the touch target up to the 44x44 minimum.
  const pad = Math.max(0, (44 - visual) / 2);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: pad, bottom: pad, left: pad, right: pad }}
      style={[styles.btn, { width: visual, height: visual }, style]}
    >
      {glass && NATIVE_BLUR && (
        <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
      )}
      {glass && <View style={[StyleSheet.absoluteFill, styles.fill]} />}
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: RADIUS.icon,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: COLORS.glassFill,
  },
});
