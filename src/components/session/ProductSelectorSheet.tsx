/**
 * ProductSelectorSheet
 *
 * Bottom sheet for selecting fuel products during unplanned intake.
 * Displays user's Skafferi products with carbs info.
 */

import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Modal, Portal, Card, Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FuelProduct, FuelProductRepository } from '../../database/repositories/FuelProductRepository';

interface ProductSelectorSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectProduct: (product: FuelProduct) => void;
}

export const ProductSelectorSheet: React.FC<ProductSelectorSheetProps> = ({
  visible,
  onDismiss,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const loadedProducts = await FuelProductRepository.getAll();
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: FuelProduct) => {
    onSelectProduct(product);
    onDismiss();
  };

  const renderProduct = ({ item }: { item: FuelProduct }) => (
    <Card
      style={styles.productCard}
      mode="outlined"
      onPress={() => handleSelectProduct(item)}
    >
      <Card.Content>
        <View style={styles.productRow}>
          <MaterialCommunityIcons name="food-apple" size={32} color="#1E88E5" />
          <View style={styles.productInfo}>
            <Text variant="bodyLarge" style={styles.productName}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.productCarbs}>
              {item.carbs_per_serving}g karbohydrater
            </Text>
          </View>
          <IconButton icon="chevron-right" size={24} iconColor="#666" />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Velg produkt
          </Text>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={64} color="#666" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              Ingen produkter i skafferiet
            </Text>
            <Text variant="bodySmall" style={styles.emptyHint}>
              Legg til produkter i Skafferi-fanen først
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 100,
    borderRadius: 16,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: '600',
    color: '#212121',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyHint: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  productCarbs: {
    color: '#4CAF50',
    fontWeight: '500',
  },
});
