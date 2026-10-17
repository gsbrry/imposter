import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, TextStyle, Platform, StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'yellow' | 'secondary' | 'ghost' | 'violet' | 'rose' | 'outline';
  style?: StyleProp<ViewStyle>;
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
    <Animated.View
      style={[
        isPrimary && styles.primaryShadow,
        { transform: [{ scale }], opacity: disabled ? 0.4 : 1 },
        style,
      ]}
    >
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
        ]}
      >
        {isSecondary && Platform.OS !== 'web' && (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        {!isGhost && (
          <LinearGradient
            pointerEvents="none"
            colors={isPrimary ? ['rgba(255,255,255,0.35)', 'transparent'] : [COLORS.glassSheen, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheen}
          />
        )}
        {icon}
        <Text style={[styles.text, { color: textColor }, isPrimary && styles.textPrimary, textStyle]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryShadow: {
    borderRadius: RADIUS.button,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    height: 56,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
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
