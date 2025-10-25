/**
 * ProgramCard Component
 *
 * Displays a training program as a Material Design card.
 * Shows program name, description, duration, target audience, and action button.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Button, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Program } from '../../types/database';

interface ProgramCardProps {
  program: Program;
  onPress: () => void;
  onStartPress?: () => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onPress, onStartPress }) => {
  const handleStartPress = (e: any) => {
    e.stopPropagation();
    onStartPress?.();
  };

  return (
    <Card onPress={onPress} style={styles.card} mode="elevated">
      <Card.Title
        title={program.name}
        left={(props) => (
          <MaterialCommunityIcons
            name="calendar"
            size={24}
            color="#1E88E5"
            style={styles.icon}
          />
        )}
      />
      <Card.Content>
        {program.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {program.description}
          </Text>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-range" size={16} color="#666" />
            <Text variant="bodySmall" style={styles.metaText}>
              {program.duration_weeks} {program.duration_weeks === 1 ? 'uke' : 'uker'}
            </Text>
          </View>

          {program.target_audience && (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="account-group" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.metaText}>
                {program.target_audience}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          onPress={onStartPress ? handleStartPress : onPress}
          buttonColor="#1E88E5"
          textColor="#FFFFFF"
        >
          Start program
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    marginLeft: 16,
  },
  description: {
    marginBottom: 12,
    color: '#424242',
  },
  metaContainer: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
