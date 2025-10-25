import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../types/navigation';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { GoalsScreen } from '../screens/onboarding/GoalsScreen';
import { GIIssueScreen } from '../screens/onboarding/GIIssueScreen';
import { ProgramSuggestionScreen } from '../screens/onboarding/ProgramSuggestionScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { ProgressIndicator } from '../components/onboarding/ProgressIndicator';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const getProgressForRoute = (routeName: keyof OnboardingStackParamList): number => {
  const progress: Record<keyof OnboardingStackParamList, number> = {
    Welcome: 1,
    Goals: 2,
    GIIssue: 3,
    ProgramSuggestion: 4,
    ProfileSetup: 5,
  };
  return progress[routeName] || 1;
};

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: () => (
          <ProgressIndicator
            current={getProgressForRoute(route.name as keyof OnboardingStackParamList)}
            total={5}
          />
        ),
        headerBackVisible: false,
      })}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ title: 'Velkommen' }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Ditt mål' }}
      />
      <Stack.Screen
        name="GIIssue"
        component={GIIssueScreen}
        options={{ title: 'Mageutfordring' }}
      />
      <Stack.Screen
        name="ProgramSuggestion"
        component={ProgramSuggestionScreen}
        options={{ title: 'Anbefalt program' }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ title: 'Din profil' }}
      />
    </Stack.Navigator>
  );
}
