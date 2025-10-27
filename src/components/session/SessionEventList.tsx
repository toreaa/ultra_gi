/**
 * SessionEventList
 *
 * Displays a scrollable list of session events (intake, discomfort, notes).
 * Shows most recent events at the top, max 5 visible.
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SessionEvent, IntakeEventData } from '../../database/repositories/SessionEventRepository';

interface SessionEventListProps {
  events: SessionEvent[];
}

export const SessionEventList: React.FC<SessionEventListProps> = ({ events }) => {
  if (events.length === 0) {
    return null; // Don't show anything if no events
  }

  // Reverse events to show most recent first
  const sortedEvents = [...events].reverse();

  const formatTime = (offsetSeconds: number): string => {
    const hours = Math.floor(offsetSeconds / 3600);
    const minutes = Math.floor((offsetSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const renderEvent = ({ item }: { item: SessionEvent }) => {
    const timeText = formatTime(item.timestamp_offset_seconds);

    if (item.event_type === 'intake') {
      const data = JSON.parse(item.data_json) as IntakeEventData;
      return (
        <View style={styles.eventItem}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          <Text variant="bodyMedium" style={styles.eventText}>
            {timeText} - {data.product_name} ({data.carbs_consumed}g)
          </Text>
        </View>
      );
    }

    if (item.event_type === 'discomfort') {
      return (
        <View style={styles.eventItem}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#FF9800" />
          <Text variant="bodyMedium" style={styles.eventText}>
            {timeText} - Ubehag registrert
          </Text>
        </View>
      );
    }

    if (item.event_type === 'note') {
      return (
        <View style={styles.eventItem}>
          <MaterialCommunityIcons name="note-text" size={20} color="#1E88E5" />
          <Text variant="bodyMedium" style={styles.eventText}>
            {timeText} - Notat
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Title
        title="Hendelser"
        titleVariant="titleMedium"
        left={(props) => (
          <MaterialCommunityIcons {...props} name="history" color="#666" />
        )}
      />
      <Card.Content>
        <FlatList
          data={sortedEvents.slice(0, 5)} // Max 5 visible
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={sortedEvents.length > 5}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
        {sortedEvents.length > 5 && (
          <Text variant="bodySmall" style={styles.moreText}>
            +{sortedEvents.length - 5} flere hendelser
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  list: {
    maxHeight: 200,
  },
  listContent: {
    paddingVertical: 4,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  eventText: {
    marginLeft: 12,
    color: '#212121',
    flex: 1,
  },
  moreText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
