import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import IconButton from './IconButton';

interface StepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  label?: string;
  decrementAccessibilityLabel?: string;
  incrementAccessibilityLabel?: string;
}

/** Matches impostr.css `.stepper` / `.big-num`. */
export default function Stepper({
  value, onDecrement, onIncrement, min, max, label,
  decrementAccessibilityLabel = 'Decrease',
  incrementAccessibilityLabel = 'Increase',
}: StepperProps) {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <View style={styles.row}>
      <IconButton
        onPress={onDecrement}
        accessibilityLabel={decrementAccessibilityLabel}
        style={atMin ? styles.disabled : undefined}
      >
        <Minus size={24} color={atMin ? COLORS.textFaint : COLORS.ink} />
      </IconButton>

      <View style={styles.center}>
        <Text style={styles.number}>{value}</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>

      <IconButton
        onPress={onIncrement}
        accessibilityLabel={incrementAccessibilityLabel}
        style={atMax ? styles.disabled : undefined}
      >
        <Plus size={24} color={atMax ? COLORS.textFaint : COLORS.honey} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: { alignItems: 'center', gap: 2 },
  number: {
    fontFamily: FONTS.displayBold,
    fontSize: 56,
    lineHeight: 60,
    color: COLORS.ink,
    letterSpacing: -1,
  },
  label: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  disabled: { opacity: 0.4 },
});
