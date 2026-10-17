import React from 'react';
import {
  StyleSheet, StyleProp, TextStyle,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS } from '../constants/theme';

/** The small uppercase caption above a card. Matches impostr.css `.lab`. */
export default function SectionLabel({
  children, style,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}) {
  return <AppText style={[styles.label, style]}>{children.toUpperCase()}</AppText>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
});
