import React from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Matches impostr.css `.chip` / `.chip.on`. */
export default function Chip({ label, selected, onPress, icon, style, accessibilityLabel }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.chip, selected && styles.chipOn, style]}
    >
      {icon}
      <Text style={[styles.label, selected && styles.labelOn]}>{label}</Text>
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
