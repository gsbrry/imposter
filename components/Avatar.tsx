import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZE } from '../constants/theme';

interface AvatarProps {
  /** Player name — its first letter is the avatar content. */
  name: string;
  /** Cycles through the 6-colour avatar palette. */
  index: number;
  size?: number;
  /** Optional icon override, for screens that still show a chosen icon
   *  instead of an initial. */
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/**
 * A coloured rounded-square avatar. Matches impostr.css `.av` / `.a1`-`.a6`:
 * 34x34 at radius 11 by default, background cycling through the 6-colour
 * avatar palette, ink-coloured initial.
 */
export default function Avatar({
  name, index, size = SIZE.avatar, icon: Icon, onPress, accessibilityLabel,
}: AvatarProps) {
  const bg = COLORS.avatars[index % COLORS.avatars.length];
  const radius = Math.round(size * 0.32);
  const fontSize = Math.max(10, Math.round(size * 0.4));
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  const content = (
    <View style={[styles.square, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>
      {Icon ? (
        <Icon size={Math.round(size * 0.55)} color={COLORS.ink} />
      ) : (
        <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
      )}
    </View>
  );

  if (onPress) {
    const pad = Math.max(0, (44 - size) / 2);
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `Avatar for ${name}`}
        hitSlop={{ top: pad, bottom: pad, left: pad, right: pad }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: FONTS.displayBold,
    color: COLORS.ink,
  },
});
