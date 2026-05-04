import React from 'react';
import { Tabs } from 'expo-router';
import { Ghost, ChartBar as BarChart2, Settings2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.tabBg]} />
        ),
        tabBarActiveTintColor: COLORS.yellow,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ghost size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings2 size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopColor: 'rgba(255,214,0,0.1)',
    borderTopWidth: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 70,
  },
  tabBg: {
    backgroundColor: 'rgba(6,4,18,0.92)',
  },
});
