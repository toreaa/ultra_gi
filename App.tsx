/**
 * GI Diary - Main Entry Point
 *
 * Handles:
 * - Database initialization
 * - Onboarding flow vs Main app routing
 * - Global providers (Navigation, Paper)
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { useUserStore } from './src/store/userStore';
import { initDatabase } from './src/database/index';

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

  // Main app with tab navigation
  return <MainTabNavigator />;
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
