/**
 * ProgramStackNavigator
 *
 * Stack navigator for the Programs tab.
 * Contains:
 * - ProgramList (main screen)
 * - ProgramDetail (Story 3.3)
 * - SessionPlan (Story 4.1)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProgramListScreen } from '../screens/programs/ProgramListScreen';
import { ProgramDetailScreen } from '../screens/programs/ProgramDetailScreen';
import { SessionPlanScreen } from '../screens/session/SessionPlanScreen';
import { FuelSelectorScreen } from '../screens/session/FuelSelectorScreen';
import { ProgramStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ProgramStackParamList>();

export function ProgramStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We use custom Appbar in screens
      }}
    >
      <Stack.Screen
        name="ProgramList"
        component={ProgramListScreen}
        options={{ title: 'Programmer' }}
      />
      <Stack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
        options={{ title: 'Programdetaljer' }}
      />
      <Stack.Screen
        name="SessionPlan"
        component={SessionPlanScreen}
        options={{ title: 'Planlegg økt' }}
      />
      <Stack.Screen
        name="FuelSelector"
        component={FuelSelectorScreen}
        options={{ title: 'Velg produkter' }}
      />
    </Stack.Navigator>
  );
}
