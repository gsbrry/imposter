import React from 'react';
import { Tabs } from 'expo-router';
import { Play, ChartBar as BarChart2, Settings2 } from 'lucide-react-native';
import GlassTabBar, { TabConfig } from '../../components/GlassTabBar';
import { TabBarVisibilityProvider } from '../../components/TabBarVisibility';

// Order matches the Tabs.Screen order below.
const TABS: TabConfig[] = [
  { Icon: Play, label: 'Play' },
  { Icon: BarChart2, label: 'Stats' },
  { Icon: Settings2, label: 'Settings' },
];

export default function TabLayout() {
  return (
    <TabBarVisibilityProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={props => <GlassTabBar {...props} tabs={TABS} />}
      >
        <Tabs.Screen name="index" options={{ title: 'Play' }} />
        <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
