import React from 'react';
import {
  View, TouchableOpacity, StyleSheet,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS, SHADOW } from '../constants/theme';

interface SegmentedOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Matches impostr.css `.seg` / `.seg button` / `.seg button.on`. */
export default function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map(opt => {
        const active = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <AppText style={[styles.label, active && styles.labelActive]}>{opt.label}</AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  segment: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.ink,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textBody,
  },
  labelActive: {
    color: COLORS.background,
  },
});
