import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleUser as UserCircle, Skull, Bot, Cat, Dog, Crown, Star, Ghost, Flame, Moon, Sun, Rocket, Diamond } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const ICON_COMPONENTS = [
  UserCircle, Skull, Bot, Cat, Dog, Crown, Star, Ghost,
  Flame, Moon, Sun, Rocket, Diamond,
];

interface PlayerAvatarProps {
  iconIndex: number;
  playerIndex: number;
  size?: number;
  onPress?: () => void;
}

export default function PlayerAvatar({ iconIndex, playerIndex, size = 40, onPress }: PlayerAvatarProps) {
  const safeIndex = iconIndex % ICON_COMPONENTS.length;
  const Icon = ICON_COMPONENTS[safeIndex];

  const content = (
    <View style={[styles.container, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]}>
      <Icon size={size} color={COLORS.yellow} />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,214,0,0.06)',
  },
});

export { ICON_COMPONENTS };
