import React from 'react';
import { Tabs } from 'expo-router';
import { Ghost, ChartBar as BarChart2, Settings2 } from 'lucide-react-native';
import { COLORS, SHADOW } from '../../constants/theme';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassTabBarBackground, TabIcon } from '../../components/GlassTabBar';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { bottom: insets.bottom + 16 }],
        tabBarBackground: () => <GlassTabBarBackground />,
        tabBarActiveTintColor: COLORS.honeyText,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Ghost} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={BarChart2} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Settings2} color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: SHADOW.card.offsetY },
    shadowOpacity: SHADOW.card.opacity,
    shadowRadius: SHADOW.card.radius,
  },
});
