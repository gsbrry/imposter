import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface PillProps {
  label: string;
  icon?: React.ReactNode;
  /** 'honey' is the tinted variant (.pill.g), 'glass' the default (.pill). */
  tone?: 'glass' | 'honey';
  style?: StyleProp<ViewStyle>;
}

/** Small read-only status pill. Matches impostr.css `.pill` / `.pill.g`. */
export default function Pill({ label, icon, tone = 'glass', style }: PillProps) {
  const honey = tone === 'honey';
  return (
    <View style={[styles.pill, honey && styles.pillHoney, style]}>
      {icon}
      <Text style={[styles.label, honey && styles.labelHoney]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  pillHoney: {
    backgroundColor: COLORS.honeySoft,
    borderColor: 'transparent',
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11.5,
    color: COLORS.textBody,
  },
  labelHoney: {
    color: COLORS.honeyText,
  },
});
