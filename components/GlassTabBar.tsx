import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, SHADOW, BLUR } from '../constants/theme';
import { useTabBarHidden } from './TabBarVisibility';

export interface TabConfig {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
}

/**
 * Floating glass tab bar. Matches impostr.css `.tabbar.glass` / `.tab` /
 * `.tab.on`: a 64px pill inset 16px from each edge, each tab showing its
 * icon above its label and the active one sitting on a lighter pill.
 *
 * This is a full custom tabBar rather than tabBarIcon + tabBarLabel so the
 * active pill can wrap the icon and label together, which the default
 * fixed-height icon slot will not do.
 */
export default function GlassTabBar({ state, descriptors, navigation, tabs }: BottomTabBarProps & { tabs: TabConfig[] }) {
  const insets = useSafeAreaInsets();
  const hidden = useTabBarHidden();

  if (hidden) return null;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 16 }]}>
      <View style={styles.bar}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, styles.fill]} />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const tab = tabs[index];
            if (!tab) return null;
            const { Icon, label } = tab;
            const color = focused ? COLORS.honeyText : COLORS.textMuted;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                style={styles.tabSlot}
              >
                <View style={[styles.tab, focused && styles.tabOn]}>
                  <Icon size={20} color={color} />
                  <Text style={[styles.label, { color }]} numberOfLines={1}>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  bar: {
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: SHADOW.card.offsetY },
    shadowOpacity: SHADOW.card.opacity,
    shadowRadius: SHADOW.card.radius,
    elevation: SHADOW.card.elevation,
  },
  fill: {
    backgroundColor: Platform.OS === 'web' ? COLORS.glassFillSolid : COLORS.glassFillStrong,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  tabSlot: {
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tabOn: {
    backgroundColor: COLORS.glassFillStrong,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
  },
});
