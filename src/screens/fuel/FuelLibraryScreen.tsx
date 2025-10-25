/**
 * FuelLibraryScreen
 *
 * Displays user's personal fuel library (skafferi).
 * Shows all fuel products grouped by type (gels, drinks, bars, food).
 * Includes empty state and FAB for adding new products.
 */

import React, { useMemo } from 'react';
import { View, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { FAB, Text, Appbar } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useFuelProducts } from '../../hooks/useFuelProducts';
import { FuelProductCard } from '../../components/fuel/FuelProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { FuelProduct } from '../../database/repositories';

type FuelStackParamList = {
  FuelLibrary: undefined;
  AddFuel: undefined;
  EditFuel: { productId: number };
};

type FuelLibraryScreenNavigationProp = NativeStackNavigationProp<FuelStackParamList, 'FuelLibrary'>;

interface FuelLibraryScreenProps {
  navigation: FuelLibraryScreenNavigationProp;
}

interface ProductSection {
  title: string;
  data: FuelProduct[];
}

const sectionTitles: Record<string, string> = {
  gel: 'Gels',
  drink: 'Drikker',
  bar: 'Bars',
  food: 'Mat',
};

export const FuelLibraryScreen: React.FC<FuelLibraryScreenProps> = ({ navigation }) => {
  const { products, loading, error, refresh } = useFuelProducts();

  // Refresh products when screen comes into focus (e.g., after adding a new product)
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Group products by type
  const groupedProducts = useMemo<ProductSection[]>(() => {
    const groups: Record<string, FuelProduct[]> = {
      gel: [],
      drink: [],
      bar: [],
      food: [],
    };

    products.forEach((product) => {
      if (groups[product.product_type]) {
        groups[product.product_type].push(product);
      }
    });

    // Sort products within each group alphabetically
    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => a.name.localeCompare(b.name, 'no'));
    });

    // Build sections array, filtering out empty sections
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([type, items]) => ({
        title: sectionTitles[type] || type,
        data: items,
      }));
  }, [products]);

  const handleProductPress = (productId: number) => {
    navigation.navigate('EditFuel', { productId });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddFuel');
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Mitt Skafferi" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Mitt Skafferi" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            Kunne ikke laste produkter. Prøv igjen senere.
          </Text>
        </View>
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Mitt Skafferi" />
        </Appbar.Header>
        <EmptyState
          icon="food-off"
          message="Ditt skafferi er tomt. Legg til dine første produkter!"
          actionLabel="Legg til produkt"
          onAction={handleAddProduct}
        />
        <FAB icon="plus" style={styles.fab} onPress={handleAddProduct} />
      </>
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Mitt Skafferi" />
      </Appbar.Header>
      <View style={styles.container}>
        <SectionList
          sections={groupedProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FuelProductCard
              product={item}
              onPress={() => handleProductPress(item.id)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text variant="titleMedium" style={styles.sectionHeader}>
              {section.title}
            </Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled
        />
        <FAB icon="plus" style={styles.fab} onPress={handleAddProduct} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  listContent: {
    paddingBottom: 80, // Space for FAB
  },
  sectionHeader: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1E88E5',
  },
});
