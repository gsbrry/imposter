import React from 'react';
import {
  StyleSheet, StyleProp, TextStyle,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS } from '../constants/theme';

/** The small uppercase caption above a card. Matches impostr.css `.lab`. */
function SectionLabel({
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

/**
 * Memoised: rendered inside a .map() loop, so a parent re-render would
 * otherwise rebuild every item. Keep the props it receives stable.
 */
export default React.memo(SectionLabel);
