/**
 * AddFuelScreen
 *
 * Screen for adding a new fuel product to the user's library.
 * Uses FuelProductForm component for form handling.
 * Shows toast notification on successful save.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Appbar, Snackbar } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { FuelProductForm } from '../../components/fuel/FuelProductForm';
import { FuelProductFormData } from '../../validation/schemas';
import { FuelProductRepository } from '../../database/repositories/FuelProductRepository';

type FuelStackParamList = {
  FuelLibrary: undefined;
  AddFuel: undefined;
};

type AddFuelScreenNavigationProp = NativeStackNavigationProp<FuelStackParamList, 'AddFuel'>;
type AddFuelScreenRouteProp = RouteProp<FuelStackParamList, 'AddFuel'>;

interface AddFuelScreenProps {
  navigation: AddFuelScreenNavigationProp;
  route: AddFuelScreenRouteProp;
}

export const AddFuelScreen: React.FC<AddFuelScreenProps> = ({ navigation }) => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSubmit = async (data: FuelProductFormData) => {
    try {
      // Create the product in database
      await FuelProductRepository.create({
        name: data.name,
        product_type: data.product_type,
        carbs_per_serving: data.carbs_per_serving,
        serving_size: data.serving_size,
        notes: data.notes,
        user_id: 1, // MVP: hardcoded user_id
      });

      // Show success message
      setSnackbarMessage('Produkt lagt til');
      setSnackbarVisible(true);

      // Navigate back to library after short delay to show toast
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Failed to create fuel product:', error);
      setSnackbarMessage('Kunne ikke lagre produkt. Prøv igjen.');
      setSnackbarVisible(true);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Legg til produkt" />
      </Appbar.Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <FuelProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  snackbar: {
    backgroundColor: '#1E88E5',
  },
});
