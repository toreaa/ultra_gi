/**
 * SessionTimeline Component
 *
 * Displays a chronological timeline of session events (intake and discomfort).
 * Story 7.1: Se fullført økt
 *
 * Features:
 * - Vertical timeline with connecting line
 * - Event icons (✓ for intake, ⚠️ for discomfort)
 * - Time offsets (HH:MM)
 * - Event descriptions
 * - Scrollable list
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SessionEvent, IntakeData, DiscomfortData } from '../../types/database';

interface SessionTimelineProps {
  events: SessionEvent[];
  showStartEnd?: boolean; // Show start/end markers
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  durationMinutes?: number;
}

interface TimelineItemData {
  id: string;
  type: 'start' | 'intake' | 'discomfort' | 'end';
  time: string; // HH:MM format
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
}

/**
 * Format seconds into HH:MM or MM:SS format
 */
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}:00`;
};

/**
 * Format duration in minutes to HH:MM:SS
 */
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

/**
 * Convert SessionEvent to TimelineItemData
 */
const eventToTimelineItem = (event: SessionEvent): TimelineItemData => {
  const time = formatTime(event.timestamp_offset_seconds);

  if (event.event_type === 'intake') {
    const data = JSON.parse(event.data_json) as IntakeData;
    return {
      id: event.id.toString(),
      type: 'intake',
      time,
      icon: 'check-circle',
      iconColor: '#4CAF50',
      title: data.product_name,
      subtitle: `${data.carbs_consumed}g karbs`,
    };
  }

  if (event.event_type === 'discomfort') {
    const data = JSON.parse(event.data_json) as DiscomfortData;
    const severityLabels = ['', 'Lett', 'Moderat', 'Alvorlig', 'Svært alvorlig', 'Ekstrem'];
    return {
      id: event.id.toString(),
      type: 'discomfort',
      time,
      icon: 'alert-circle',
      iconColor: '#FF9800',
      title: `Ubehag (${data.level}/5)`,
      subtitle: data.notes || severityLabels[data.level],
    };
  }

  // Default for unknown event types
  return {
    id: event.id.toString(),
    type: 'intake',
    time,
    icon: 'information',
    iconColor: '#666',
    title: event.event_type,
  };
};

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  events,
  showStartEnd = true,
  sessionStartTime,
  sessionEndTime,
  durationMinutes,
}) => {
  // Convert events to timeline items
  const timelineItems: TimelineItemData[] = [];

  // Add start marker
  if (showStartEnd) {
    timelineItems.push({
      id: 'start',
      type: 'start',
      time: '00:00',
      icon: 'play-circle',
      iconColor: '#1E88E5',
      title: 'Start',
    });
  }

  // Add events
  events.forEach((event) => {
    timelineItems.push(eventToTimelineItem(event));
  });

  // Add end marker
  if (showStartEnd && durationMinutes) {
    timelineItems.push({
      id: 'end',
      type: 'end',
      time: formatDuration(durationMinutes),
      icon: 'stop-circle',
      iconColor: '#F44336',
      title: 'Slutt',
    });
  }

  const renderTimelineItem = ({ item, index }: { item: TimelineItemData; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === timelineItems.length - 1;

    return (
      <View style={styles.timelineItemContainer}>
        {/* Timeline line (top) */}
        {!isFirst && <View style={styles.timelineLine} />}

        {/* Event content */}
        <View style={styles.eventRow}>
          {/* Time */}
          <View style={styles.timeColumn}>
            <Text variant="labelMedium" style={styles.timeText}>
              {item.time}
            </Text>
          </View>

          {/* Icon */}
          <View style={styles.iconColumn}>
            <View style={[styles.iconContainer, { borderColor: item.iconColor }]}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={20}
                color={item.iconColor}
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentColumn}>
            <Card style={styles.eventCard} mode="outlined">
              <Card.Content style={styles.eventCardContent}>
                <Text variant="bodyMedium" style={styles.eventTitle}>
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text variant="bodySmall" style={styles.eventSubtitle}>
                    {item.subtitle}
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Timeline line (bottom) */}
        {!isLast && <View style={styles.timelineLine} />}
      </View>
    );
  };

  if (timelineItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="timeline-clock-outline" size={48} color="#ccc" />
        <Text variant="bodyLarge" style={styles.emptyText}>
          Ingen hendelser i denne økten
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={timelineItems}
      renderItem={renderTimelineItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  timelineItemContainer: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 70, // Align with icon center
    width: 2,
    height: 24,
    backgroundColor: '#E0E0E0',
    zIndex: 0,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  timeColumn: {
    width: 50,
    paddingTop: 8,
  },
  timeText: {
    color: '#666',
    fontVariant: ['tabular-nums'],
  },
  iconColumn: {
    width: 40,
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
  },
  eventCardContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  eventTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  eventSubtitle: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
