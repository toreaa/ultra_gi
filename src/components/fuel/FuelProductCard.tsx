/**
 * FuelProductCard Component
 *
 * Displays a fuel product (gel, drink, bar, food) as a Material Design card.
 * Shows product name, type icon, carbs, and optional serving size.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FuelProduct } from '../../database/repositories';

interface FuelProductCardProps {
  product: FuelProduct;
  onPress: () => void;
}

const typeIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  gel: 'flask',
  drink: 'cup',
  bar: 'food-apple',
  food: 'food',
};

const typeLabels: Record<string, string> = {
  gel: 'Gel',
  drink: 'Drikke',
  bar: 'Bar',
  food: 'Mat',
};

export const FuelProductCard: React.FC<FuelProductCardProps> = ({ product, onPress }) => {
  const icon = typeIcons[product.product_type] || 'help-circle';
  const typeLabel = typeLabels[product.product_type] || 'Ukjent';

  const subtitle = [
    `${product.carbs_per_serving}g karbs`,
    product.serving_size,
    typeLabel,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Card onPress={onPress} style={styles.card} mode="elevated">
      <Card.Title
        title={product.name}
        subtitle={subtitle}
        left={(props) => (
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color="#1E88E5"
            style={styles.icon}
          />
        )}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  icon: {
    marginLeft: 16,
  },
});
