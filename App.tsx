/**
 * GI Diary - Main Entry Point
 *
 * Handles:
 * - Database initialization
 * - Onboarding flow vs Main app routing
 * - Global providers (Navigation, Paper)
 * - Root-level screens (ActiveSession, etc.)
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { ActiveSessionScreen } from './src/screens/session/ActiveSessionScreen';
import { SessionSummaryScreen } from './src/screens/session/SessionSummaryScreen';
import { useUserStore } from './src/store/userStore';
import { initDatabase } from './src/database/index';
import { RootStackParamList } from './src/types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { onboardingCompleted, isLoading, initialize } = useUserStore();

  useEffect(() => {
    async function setup() {
      try {
        // Initialize database
        await initDatabase();

        // Initialize user state
        await initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    }

    setup();
  }, [initialize]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    return <OnboardingNavigator />;
  }

  // Main app with root stack navigator
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={MainTabNavigator} />
      <RootStack.Screen name="ActiveSession" component={ActiveSessionScreen} />
      <RootStack.Screen name="SessionSummary" component={SessionSummaryScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
