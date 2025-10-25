/**
 * ProgramStackNavigator
 *
 * Stack navigator for the Programs tab.
 * Contains:
 * - ProgramList (main screen)
 * - ProgramDetail (Story 3.3 - placeholder)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProgramListScreen } from '../screens/programs/ProgramListScreen';

export type ProgramStackParamList = {
  ProgramList: undefined;
  ProgramDetail: { programId: number };
};

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
      {/* ProgramDetail screen will be added in Story 3.3 */}
    </Stack.Navigator>
  );
}
