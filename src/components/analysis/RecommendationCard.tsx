/**
 * RecommendationCard
 *
 * Displays a single recommendation with icon, title, message, and optional details.
 * Story 7.4: Smarte anbefalinger
 *
 * Features:
 * - Color-coded based on recommendation type
 * - Expandable "Lær mer" section for detailed explanation
 * - Icon representation
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Recommendation } from '../../services/recommendations';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card style={[styles.card, { borderLeftColor: recommendation.color, borderLeftWidth: 4 }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${recommendation.color}20` }]}>
            <MaterialCommunityIcons
              name={recommendation.icon as any}
              size={24}
              color={recommendation.color}
            />
          </View>
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {recommendation.title}
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {recommendation.message}
            </Text>
          </View>
        </View>

        {recommendation.details && (
          <>
            {showDetails && (
              <View style={styles.detailsContainer}>
                <Text variant="bodySmall" style={styles.details}>
                  {recommendation.details}
                </Text>
              </View>
            )}
            <Button
              mode="text"
              onPress={() => setShowDetails(!showDetails)}
              style={styles.learnMoreButton}
              compact
            >
              {showDetails ? 'Skjul detaljer' : 'Lær mer'}
            </Button>
          </>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#666',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  details: {
    color: '#666',
    lineHeight: 20,
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
