import React from 'react';
import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface GlassIconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function GlassIconButton({ onPress, children, size = 36, style }: GlassIconButtonProps) {
  return (
    <View style={[styles.shadowWrap, { borderRadius: size / 2 }, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}
      >
        {Platform.OS !== 'web' && (
          <BlurView intensity={75} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          pointerEvents="none"
          colors={[COLORS.glassSheen, 'transparent']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btn: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
