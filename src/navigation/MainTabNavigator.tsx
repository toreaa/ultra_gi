import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { FuelStackNavigator } from './FuelStackNavigator';
import { ProgramStackNavigator } from './ProgramStackNavigator';
import { HomeScreen } from '../screens/home/HomeScreen';

export type MainTabParamList = {
  Home: undefined;
  Programs: undefined;
  Fuel: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Programs') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Fuel') {
            iconName = focused ? 'food-apple' : 'food-apple-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#757575',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Hjem' }}
      />
      <Tab.Screen
        name="Programs"
        component={ProgramStackNavigator}
        options={{ title: 'Programmer', headerShown: false }}
      />
      <Tab.Screen
        name="Fuel"
        component={FuelStackNavigator}
        options={{ title: 'Mitt Skafferi', headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Innstillinger' }}
      />
    </Tab.Navigator>
  );
}
