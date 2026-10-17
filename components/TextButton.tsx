import React from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface TextButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

/**
 * Plain text action, no fill or border. Matches impostr.css `.btn-text`.
 * Visual height stays 40px per the design; hitSlop pads the actual touch
 * target out to the 44x44 minimum.
 */
export default function TextButton({
  label, onPress, disabled, style, textStyle, accessibilityLabel,
}: TextButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={{ top: 2, bottom: 2, left: 8, right: 8 }}
      style={[styles.button, { opacity: disabled ? 0.4 : 1 }, style]}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.textBody,
  },
});
