import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'yellow' | 'secondary' | 'ghost' | 'violet' | 'rose' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function PillButton({
  label, onPress, variant = 'yellow', style, textStyle, disabled, icon,
}: PillButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 80, bounciness: 4 }).start();
  };

  const isPrimary = variant === 'yellow';
  const isSecondary = variant === 'secondary' || variant === 'violet' || variant === 'rose';
  const isGhost = variant === 'ghost' || variant === 'outline';

  const bg = isPrimary
    ? COLORS.yellow
    : isGhost
    ? 'transparent'
    : COLORS.glass;

  const textColor = isPrimary ? COLORS.nearBlack : COLORS.white;

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.4 : 1 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          styles.button,
          { backgroundColor: bg },
          (isGhost || isSecondary) && styles.bordered,
          style,
        ]}
      >
        {icon}
        <Text style={[styles.text, { color: textColor }, isPrimary && styles.textPrimary, textStyle]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  bordered: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  textPrimary: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
