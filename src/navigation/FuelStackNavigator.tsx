/**
 * FuelStackNavigator
 *
 * Stack navigator for the Fuel tab.
 * Contains:
 * - FuelLibrary (main screen)
 * - AddFuel (Story 2.2)
 * - EditFuel (Story 2.3 - placeholder)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FuelLibraryScreen } from '../screens/fuel/FuelLibraryScreen';
import { AddFuelScreen } from '../screens/fuel/AddFuelScreen';
import { EditFuelScreen } from '../screens/fuel/EditFuelScreen';

export type FuelStackParamList = {
  FuelLibrary: undefined;
  AddFuel: undefined;
  EditFuel: { productId: number };
};

const Stack = createNativeStackNavigator<FuelStackParamList>();

export function FuelStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We use custom Appbar in screens
      }}
    >
      <Stack.Screen
        name="FuelLibrary"
        component={FuelLibraryScreen}
        options={{ title: 'Mitt Skafferi' }}
      />
      <Stack.Screen
        name="AddFuel"
        component={AddFuelScreen}
        options={{ title: 'Legg til produkt' }}
      />
      <Stack.Screen
        name="EditFuel"
        component={EditFuelScreen}
        options={{ title: 'Rediger produkt' }}
      />
    </Stack.Navigator>
  );
}
