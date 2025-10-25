/**
 * EditFuelScreen
 *
 * Screen for editing and deleting existing fuel products.
 * Uses FuelProductForm component with initialValues for editing.
 * Includes delete confirmation dialog and toast notifications.
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Appbar, Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { FuelProductForm } from '../../components/fuel/FuelProductForm';
import { FuelProductFormData } from '../../validation/schemas';
import { FuelProductRepository, FuelProduct } from '../../database/repositories/FuelProductRepository';

type FuelStackParamList = {
  FuelLibrary: undefined;
  AddFuel: undefined;
  EditFuel: { productId: number };
};

type EditFuelScreenNavigationProp = NativeStackNavigationProp<FuelStackParamList, 'EditFuel'>;
type EditFuelScreenRouteProp = RouteProp<FuelStackParamList, 'EditFuel'>;

interface EditFuelScreenProps {
  navigation: EditFuelScreenNavigationProp;
  route: EditFuelScreenRouteProp;
}

export const EditFuelScreen: React.FC<EditFuelScreenProps> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<FuelProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await FuelProductRepository.getById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load fuel product:', error);
      setSnackbarMessage('Kunne ikke laste produkt');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: FuelProductFormData) => {
    try {
      await FuelProductRepository.update(productId, {
        name: data.name,
        product_type: data.product_type,
        carbs_per_serving: data.carbs_per_serving,
        serving_size: data.serving_size,
        notes: data.notes,
      });

      // Show success message
      setSnackbarMessage('Produkt oppdatert');
      setSnackbarVisible(true);

      // Navigate back to library after short delay to show toast
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Failed to update fuel product:', error);
      setSnackbarMessage('Kunne ikke oppdatere produkt. Prøv igjen.');
      setSnackbarVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      await FuelProductRepository.softDelete(productId);
      setShowDeleteDialog(false);

      // Show success message
      setSnackbarMessage('Produkt slettet');
      setSnackbarVisible(true);

      // Navigate back to library after short delay to show toast
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Failed to delete fuel product:', error);
      setShowDeleteDialog(false);
      setSnackbarMessage('Kunne ikke slette produkt. Prøv igjen.');
      setSnackbarVisible(true);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="Rediger produkt" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="Rediger produkt" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            Produktet ble ikke funnet.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Rediger produkt" />
      </Appbar.Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <FuelProductForm
          initialValues={{
            name: product.name,
            product_type: product.product_type,
            carbs_per_serving: product.carbs_per_serving,
            serving_size: product.serving_size || '',
            notes: product.notes || '',
          }}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          submitLabel="Lagre endringer"
        />

        <Button
          mode="outlined"
          textColor="#D32F2F"
          style={styles.deleteButton}
          onPress={() => setShowDeleteDialog(true)}
        >
          Slett produkt
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Slett {product.name}?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Dette produktet vil bli fjernet fra ditt skafferi. Tidligere loggede økter påvirkes
              ikke.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Avbryt</Button>
            <Button textColor="#D32F2F" onPress={handleDelete}>
              Slett
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 16,
    marginHorizontal: 16,
    borderColor: '#D32F2F',
  },
  snackbar: {
    backgroundColor: '#1E88E5',
  },
});
