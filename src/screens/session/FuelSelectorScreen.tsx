/**
 * FuelSelectorScreen
 *
 * Allows users to select and adjust fuel products for a session.
 * Generates initial plan using greedy algorithm, allows manual adjustments.
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Appbar, Card, Button, IconButton, ProgressBar, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FuelProduct, FuelProductRepository } from '../../database/repositories/FuelProductRepository';
import { PlannedSessionRepository } from '../../database/repositories/PlannedSessionRepository';
import { FuelPlan, FuelPlanItem } from '../../types/fuelPlan';
import { generateFuelPlan, generateTiming, recalculatePlan } from '../../services/fuelPlanner';
import { ProgramStackParamList } from '../../types/navigation';

type FuelSelectorScreenProps = NativeStackScreenProps<
  ProgramStackParamList,
  'FuelSelector'
>;

export const FuelSelectorScreen: React.FC<FuelSelectorScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, targetCarbs, durationMinutes } = route.params;

  const [plan, setPlan] = useState<FuelPlan>({
    items: [],
    total_carbs: 0,
    target_carbs: targetCarbs,
    percentage: 0,
  });
  const [availableProducts, setAvailableProducts] = useState<FuelProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadProductsAndGeneratePlan();
  }, []);

  const loadProductsAndGeneratePlan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's fuel products
      const products = await FuelProductRepository.getAll();
      setAvailableProducts(products);

      // Generate initial plan if products available
      if (products.length > 0) {
        const initialPlan = generateFuelPlan(targetCarbs, durationMinutes, products);
        setPlan(initialPlan);
      }
    } catch (err) {
      console.error('Failed to load fuel products:', err);
      setError('Kunne ikke laste produkter');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const updated = plan.items.map(item => {
      if (item.fuel_product_id === productId) {
        const newQuantity = Math.max(0, Math.min(5, item.quantity + delta));
        const newCarbs = newQuantity * item.carbs_per_serving;
        const newTiming = newQuantity > 0
          ? generateTiming(durationMinutes, newQuantity)
          : [];

        return {
          ...item,
          quantity: newQuantity,
          carbs_total: newCarbs,
          timing_minutes: newTiming,
        };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with 0 quantity

    setPlan(recalculatePlan(updated, targetCarbs));
  };

  const handleAddProduct = (product: FuelProduct) => {
    const existing = plan.items.find(item => item.fuel_product_id === product.id);
    if (existing) {
      handleQuantityChange(product.id, 1);
    } else {
      const newItem: FuelPlanItem = {
        fuel_product_id: product.id,
        product_name: product.name,
        quantity: 1,
        carbs_per_serving: product.carbs_per_serving,
        timing_minutes: generateTiming(durationMinutes, 1),
        carbs_total: product.carbs_per_serving,
      };
      setPlan(recalculatePlan([...plan.items, newItem], targetCarbs));
    }
  };

  const handleConfirmPlan = async () => {
    try {
      // Save plan to database
      const plannedSessionId = await PlannedSessionRepository.create({
        user_id: 1, // Hardcoded for MVP
        program_session_id: sessionId,
        planned_date: new Date().toISOString(),
        fuel_plan_json: JSON.stringify(plan.items),
      });

      // Show success snackbar
      setSnackbarMessage('✓ Plan lagret!');
      setSnackbarVisible(true);

      // Show dialog: "Start økten nå?"
      Alert.alert(
        'Start økten nå?',
        'Vil du starte økten med denne planen?',
        [
          {
            text: 'Senere',
            style: 'cancel',
            onPress: () => {
              // Navigate back to ProgramDetail
              navigation.goBack();
            },
          },
          {
            text: 'Start økt',
            onPress: () => {
              // Try to navigate to SessionActive (Epic 5)
              // If not implemented, show placeholder
              try {
                // @ts-ignore - SessionActive may not exist yet
                navigation.navigate('SessionActive', { sessionId: plannedSessionId });
              } catch (error) {
                // Epic 5 not implemented yet - show placeholder
                setSnackbarMessage('Økt-modus kommer i Epic 5');
                setSnackbarVisible(true);
                setTimeout(() => navigation.goBack(), 1500);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save planned session:', error);
      setSnackbarMessage('Kunne ikke lagre plan');
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Velg produkter" />
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
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Velg produkter" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#B00020" />
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
            Gå tilbake
          </Button>
        </View>
      </>
    );
  }

  // Empty skafferi edge case
  if (availableProducts.length === 0) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Velg produkter" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="food-off" size={80} color="#666" />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Tomt skafferi
          </Text>
          <Text variant="bodyMedium" style={styles.emptyMessage}>
            Du har ingen produkter i skafferiet. Legg til produkter for å lage en plan.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.emptyButton}
            icon="arrow-left"
          >
            Gå tilbake
          </Button>
        </View>
      </>
    );
  }

  const availableForAdding = availableProducts.filter(
    p => !plan.items.find(item => item.fuel_product_id === p.id)
  );

  const getProgressColor = () => {
    if (plan.percentage >= 90 && plan.percentage <= 110) return '#4CAF50'; // Green - good
    if (plan.percentage >= 80 && plan.percentage <= 120) return '#FF9800'; // Orange - acceptable
    return '#B00020'; // Red - problematic
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Velg produkter" />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Title
            title="Sammendrag"
            left={(props) => (
              <MaterialCommunityIcons {...props} name="chart-box" color="#1E88E5" />
            )}
          />
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Totalt:
              </Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {plan.total_carbs}g ({plan.percentage}%)
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Mål:
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {plan.target_carbs}g
              </Text>
            </View>
            <ProgressBar
              progress={Math.min(plan.percentage / 100, 1.5)}
              color={getProgressColor()}
              style={styles.progressBar}
            />
            {(plan.percentage < 90 || plan.percentage > 110) && (
              <Text variant="bodySmall" style={styles.warningText}>
                {plan.percentage < 90
                  ? '⚠️ Under anbefalt mengde (90-110%)'
                  : '⚠️ Over anbefalt mengde (90-110%)'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Plan Items */}
        {plan.items.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Din plan
            </Text>
            {plan.items.map(item => (
              <Card key={item.fuel_product_id} style={styles.card} mode="outlined">
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text variant="titleMedium">{item.product_name}</Text>
                      <Text variant="bodyMedium" style={styles.itemCarbs}>
                        {item.carbs_total}g ({item.quantity} × {item.carbs_per_serving}g)
                      </Text>
                      <Text variant="bodySmall" style={styles.itemTiming}>
                        📍 Timing: {item.timing_minutes.join(', ')} min
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemControls}>
                    <IconButton
                      icon="minus-circle"
                      size={32}
                      iconColor="#666"
                      onPress={() => handleQuantityChange(item.fuel_product_id, -1)}
                      disabled={item.quantity <= 0}
                    />
                    <Text variant="headlineMedium" style={styles.quantityText}>
                      {item.quantity}
                    </Text>
                    <IconButton
                      icon="plus-circle"
                      size={32}
                      iconColor="#1E88E5"
                      onPress={() => handleQuantityChange(item.fuel_product_id, 1)}
                      disabled={item.quantity >= 5}
                    />
                    <IconButton
                      icon="delete"
                      size={28}
                      iconColor="#B00020"
                      onPress={() => handleQuantityChange(item.fuel_product_id, -item.quantity)}
                      style={styles.deleteButton}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Available Products (not in plan) */}
        {availableForAdding.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Legg til produkter
            </Text>
            {availableForAdding.map(product => (
              <Card
                key={product.id}
                style={styles.card}
                mode="outlined"
                onPress={() => handleAddProduct(product)}
              >
                <Card.Content>
                  <View style={styles.productRow}>
                    <View style={styles.productInfo}>
                      <Text variant="bodyLarge">{product.name}</Text>
                      <Text variant="bodySmall" style={styles.productCarbs}>
                        {product.carbs_per_serving}g per porsjon
                      </Text>
                    </View>
                    <IconButton icon="plus-circle" size={28} iconColor="#4CAF50" />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Confirm Button */}
        <Button
          mode="contained"
          onPress={handleConfirmPlan}
          icon="check"
          style={styles.confirmButton}
          contentStyle={styles.confirmButtonContent}
          disabled={plan.items.length === 0}
        >
          Bekreft plan
        </Button>
      </ScrollView>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    borderColor: '#B00020',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '600',
    color: '#212121',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#212121',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 12,
  },
  warningText: {
    color: '#FF9800',
    marginTop: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemCarbs: {
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  itemTiming: {
    color: '#666',
    marginTop: 4,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quantityText: {
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productCarbs: {
    color: '#666',
    marginTop: 4,
  },
  confirmButton: {
    marginTop: 16,
  },
  confirmButtonContent: {
    paddingVertical: 8,
  },
});
