import React from 'react';
import {
  TouchableOpacity, StyleSheet, StyleProp, ViewStyle,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS } from '../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  /** Passed back to onPress, so the parent can use one stable handler. */
  value?: string;
  onPress?: (value: string) => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Matches impostr.css `.chip` / `.chip.on`. */
function Chip({ label, selected, value, onPress, icon, style, accessibilityLabel }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress && (() => onPress(value ?? label))}
      disabled={!onPress}
      activeOpacity={0.75}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
      style={[styles.chip, selected && styles.chipOn, style]}
    >
      {icon}
      <AppText style={[styles.label, selected && styles.labelOn]}>{label}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.glassFillStrong,
  },
  chipOn: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12.5,
    color: COLORS.ink,
  },
  labelOn: {
    color: COLORS.background,
  },
});

/**
 * Memoised: rendered inside a .map() loop, so a parent re-render would
 * otherwise rebuild every item. Keep the props it receives stable.
 */
export default React.memo(Chip);
