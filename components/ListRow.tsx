import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface ListRowProps {
  /** The 34x34 honey tile on the left. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Toggle, chevron, button — whatever sits at the right edge. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * One row inside a settings-style card. Matches impostr.css `.list-row`
 * with the `.tile-ic` leading tile.
 */
export default function ListRow({
  icon, title, description, trailing, onPress, accessibilityLabel, style,
}: ListRowProps) {
  const body = (
    <>
      {icon && <View style={styles.tile}>{icon}</View>}
      <View style={styles.text}>
        <AppText style={styles.title} numberOfLines={1}>{title}</AppText>
        {description && <AppText style={styles.description} numberOfLines={2}>{description}</AppText>}
      </View>
      {trailing}
    </>
  );

  if (!onPress) return <View style={[styles.row, style]}>{body}</View>;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={[styles.row, style]}
    >
      {body}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    // Keeps every row a comfortable touch target.
    minHeight: 56,
  },
  tile: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
  },
  text: { flex: 1, minWidth: 0, gap: 1 },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  description: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11.5,
    lineHeight: 15,
    color: COLORS.textMuted,
  },
});

export const listRowStyles = StyleSheet.create({
  /** Hairline between rows inside the same card. */
  divider: {
    height: 1,
    marginHorizontal: SPACING.cardPadding,
    backgroundColor: COLORS.divider,
  },
});
