/**
 * NextIntakeCard
 *
 * Displays the next planned intake for an active session.
 * Shows product name, timing info, and carbs amount.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface NextIntake {
  product_name: string;
  timing_minute: number;
  carbs_per_serving: number;
  fuel_product_id: number;
}

interface NextIntakeCardProps {
  nextIntake: NextIntake | null;
  elapsedMinutes: number;
}

export const NextIntakeCard: React.FC<NextIntakeCardProps> = ({
  nextIntake,
  elapsedMinutes,
}) => {
  if (!nextIntake) {
    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              Ingen flere planlagte inntak
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const minutesUntil = nextIntake.timing_minute - elapsedMinutes;
  const isReady = Math.abs(minutesUntil) <= 2; // Within ±2 minutes

  const getTimingText = () => {
    if (isReady) {
      return 'KLART NÅ';
    }
    if (minutesUntil > 0) {
      return `om ${minutesUntil} min`;
    }
    return `${Math.abs(minutesUntil)} min siden`;
  };

  const getTimingColor = () => {
    if (isReady) return '#4CAF50'; // Green - ready now
    if (minutesUntil < 0) return '#FF9800'; // Orange - overdue
    return '#666'; // Gray - future
  };

  return (
    <Card style={[styles.card, isReady && styles.readyCard]} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="labelMedium" style={styles.label}>
            Neste inntak
          </Text>
          <View style={[styles.timingBadge, isReady && styles.readyBadge]}>
            <Text
              variant="labelSmall"
              style={[styles.timingText, { color: getTimingColor() }]}
            >
              {getTimingText()}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <MaterialCommunityIcons
            name="food-apple"
            size={40}
            color="#1E88E5"
            style={styles.icon}
          />
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.productName}>
              {nextIntake.product_name}
            </Text>
            <Text variant="bodyMedium" style={styles.carbs}>
              {nextIntake.carbs_per_serving}g karbohydrater
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  readyCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#666',
    textTransform: 'uppercase',
  },
  timingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  readyBadge: {
    backgroundColor: '#E8F5E9',
  },
  timingText: {
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  carbs: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    marginLeft: 12,
    color: '#666',
  },
});
