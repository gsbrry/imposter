import React from 'react';
import { Tabs } from 'expo-router';
import { Ghost, ChartBar as BarChart2, Settings2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

function TabIcon({ Icon, color, size, focused }: { Icon: typeof Ghost; color: string; size: number; focused: boolean }) {
  return (
    <View style={[styles.iconSlot, focused && styles.iconSlotActive]}>
      <Icon size={size} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { bottom: insets.bottom + 16 }],
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {Platform.OS !== 'web' && (
              <BlurView intensity={85} tint="dark" style={[StyleSheet.absoluteFill, styles.blurShape]} />
            )}
            <View style={[StyleSheet.absoluteFill, styles.tabBg]} />
            <LinearGradient
              pointerEvents="none"
              colors={[COLORS.glassSheen, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.sheen}
            />
          </View>
        ),
        tabBarActiveTintColor: COLORS.yellow,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
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
    left: 24,
    right: 24,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  blurShape: {
    borderRadius: 32,
  },
  tabBg: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(21,23,26,0.92)' : 'rgba(21,23,26,0.6)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  iconSlot: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotActive: {
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
  },
});
