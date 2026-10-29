import React from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import AppText from './AppText';
import Minus from 'lucide-react-native/dist/esm/icons/minus';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
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
        size={44}
        glass={false}
        onPress={onDecrement}
        accessibilityLabel={decrementAccessibilityLabel}
        style={[styles.minusFill, atMin && styles.disabled]}
      >
        <Minus size={22} color={atMin ? COLORS.textFaint : COLORS.ink} />
      </IconButton>

      <View style={styles.center}>
        <AppText style={styles.number}>{value}</AppText>
        {label && <AppText style={styles.label}>{label}</AppText>}
      </View>

      <IconButton
        size={44}
        glass={false}
        onPress={onIncrement}
        accessibilityLabel={incrementAccessibilityLabel}
        style={[styles.plusFill, atMax && styles.disabled]}
      >
        <Plus size={22} color={COLORS.onHoney} />
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
  // Filled circles so the buttons read clearly against the card, instead of
  // a faint icon over translucent glass — the `+` especially was reported
  // as hard to see.
  minusFill: {
    backgroundColor: COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  plusFill: {
    backgroundColor: COLORS.honey,
  },
  disabled: { opacity: 0.4 },
});
