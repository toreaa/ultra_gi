/**
 * SessionCard
 *
 * Displays a single training session with status indicator.
 * Shows duration, carb rate, intensity zone, and completion status.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgramSession } from '../../types/database';

export type SessionStatus = 'completed' | 'planned' | 'not_done';

interface SessionCardProps {
  session: ProgramSession;
  sessionNumber: number; // Display number (e.g., "Økt 1")
  status: SessionStatus;
  onPress: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  sessionNumber,
  status,
  onPress,
}) => {
  const getStatusIcon = (): { name: string; color: string } => {
    switch (status) {
      case 'completed':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'planned':
        return { name: 'clock-outline', color: '#FF9800' };
      case 'not_done':
      default:
        return { name: 'circle-outline', color: '#9E9E9E' };
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'completed':
        return 'Fullført';
      case 'planned':
        return 'Planlagt';
      case 'not_done':
      default:
        return 'Ikke gjort';
    }
  };

  const icon = getStatusIcon();

  return (
    <Card style={styles.card} onPress={onPress} mode="outlined">
      <Card.Content style={styles.content}>
        <MaterialCommunityIcons
          name={icon.name as any}
          size={24}
          color={icon.color}
          style={styles.icon}
        />

        <Text variant="titleMedium" style={styles.title}>
          Økt {sessionNumber}
        </Text>

        <Text variant="bodyMedium" style={styles.details}>
          {session.duration_minutes} min @ {session.carb_rate_g_per_hour}g/t
          {session.intensity_zone && ` - ${session.intensity_zone}`}
        </Text>

        <Text variant="bodySmall" style={[styles.status, { color: icon.color }]}>
          {getStatusText()}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  details: {
    flex: 2,
    color: '#666',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
});
