import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';

interface CategoryTileProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  count?: string;
  selected?: boolean;
  locked?: boolean;
  onPress: () => void;
}

/** 3-column category grid tile. Matches impostr.css `.cat` / `.cat.sel` / `.tile-ic`. */
export default function CategoryTile({ icon: Icon, label, count, selected, locked, onPress }: CategoryTileProps) {
  const iconColor = selected ? COLORS.onHoney : COLORS.honeyText;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.tile, selected && styles.tileSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!locked }}
      accessibilityLabel={locked ? `${label}, locked, premium` : label}
    >
      {locked && <Lock size={14} color={COLORS.textMuted} style={styles.lock} />}
      <View style={[styles.tileIcon, selected && styles.tileIconSelected]}>
        <Icon size={17} color={iconColor} strokeWidth={1.75} />
      </View>
      <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={2}>
        {label}
      </Text>
      {count && (
        <Text style={[styles.count, selected && styles.countSelected]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    padding: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    minHeight: 92,
    gap: 8,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tileSelected: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  lock: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
  },
  tileIconSelected: {
    backgroundColor: COLORS.honey,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12.5,
    lineHeight: 15,
    color: COLORS.ink,
  },
  nameSelected: {
    color: COLORS.background,
  },
  count: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  countSelected: {
    color: 'rgba(244,239,228,0.6)',
  },
});
