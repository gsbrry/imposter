import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { Ghost, ChartBar as BarChart2, Settings2 } from 'lucide-react-native';

import { COLORS } from '../constants/theme';

// ── Screen imports ──────────────────────────────────────────────────────────
import HomeScreen from '../app/(tabs)/index';
import StatsScreen from '../app/(tabs)/stats';
import SettingsScreen from '../app/(tabs)/settings';
import SetupScreen from '../app/setup';
import PlayerNamesScreen from '../app/player-names';
import RevealScreen from '../app/reveal';
import ClueRoundScreen from '../app/clue-round';
import VoteScreen from '../app/vote';
import ResultScreen from '../app/result';

// ── Navigators ───────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  cardStyle: { backgroundColor: COLORS.nearBlack },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={SCREEN_OPTIONS}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="Setup"
        component={SetupScreen}
        options={{ animationEnabled: true, cardStyleInterpolator: slideFromRight }}
      />
      <HomeStack.Screen
        name="PlayerNames"
        component={PlayerNamesScreen}
        options={{ animationEnabled: true, cardStyleInterpolator: slideFromRight }}
      />
      <HomeStack.Screen
        name="Reveal"
        component={RevealScreen}
        options={{ animationEnabled: true, cardStyleInterpolator: slideFromRight }}
      />
      <HomeStack.Screen
        name="ClueRound"
        component={ClueRoundScreen}
        options={{ animationEnabled: true, cardStyleInterpolator: slideFromRight }}
      />
      <HomeStack.Screen
        name="Vote"
        component={VoteScreen}
        options={{ animationEnabled: true, cardStyleInterpolator: slideFromRight }}
      />
      <HomeStack.Screen
        name="Result"
        component={ResultScreen}
        options={{ animationEnabled: true, cardStyleInterpolator: slideFromRight }}
      />
    </HomeStack.Navigator>
  );
}

function TabBarBackground() {
  return <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer independent>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: TabBarBackground,
          tabBarActiveTintColor: COLORS.yellow,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ghost size={size} color={color}  />
            ),
          }}
        />
        <Tab.Screen
          name="StatsTab"
          component={StatsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <BarChart2 size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Settings2 size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function slideFromRight({ current, next, layouts }) {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });
  const opacity = next
    ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] })
    : 1;
  return {
    cardStyle: { transform: [{ translateX }], opacity },
  };
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopColor: 'rgba(124,58,237,0.2)',
    borderTopWidth: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 70,
  },
});
