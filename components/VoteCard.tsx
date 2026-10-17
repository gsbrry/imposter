import React from 'react';
import {
  View, TouchableOpacity, StyleSheet,
} from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS } from '../constants/theme';
import Avatar from './Avatar';

interface VoteCardProps {
  name: string;
  avatarIndex: number;
  voteCount?: number;
  selected?: boolean;
  onPress?: () => void;
}

/** One cell in the 2-column vote grid. Matches impostr.css `.vcard` / `.vcard.sel`. */
export default function VoteCard({ name, avatarIndex, voteCount, selected, onPress }: VoteCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      accessibilityLabel={name}
    >
      {typeof voteCount === 'number' && voteCount > 0 && (
        <View style={styles.count}>
          <AppText style={styles.countText}>{voteCount}</AppText>
        </View>
      )}
      <Avatar name={name} index={avatarIndex} size={34} />
      <AppText style={styles.name} numberOfLines={1}>{name}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    minWidth: 0,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: COLORS.honey,
    backgroundColor: COLORS.honeySoft,
  },
  name: {
    flex: 1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  count: {
    position: 'absolute',
    top: 6,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.divider,
  },
  countText: {
    fontFamily: FONTS.displayBold,
    fontSize: 11,
    color: COLORS.textBody,
  },
});
