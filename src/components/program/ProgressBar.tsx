/**
 * ProgressBar
 *
 * Displays program progression with visual progress bar and text summary.
 * Shows completed vs total sessions and current week information.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar as PaperProgressBar, Card } from 'react-native-paper';

interface ProgressBarProps {
  completed: number;
  total: number;
  currentWeek?: number;
  totalWeeks?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  currentWeek,
  totalWeeks,
}) => {
  const progressPercent = total > 0 ? completed / total : 0;
  const isCompleted = progressPercent === 1;

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.headerRow}>
          <Text variant="titleSmall" style={styles.title}>
            Progresjon
          </Text>
          {isCompleted && (
            <Text variant="titleSmall" style={styles.completedBadge}>
              🎉 Fullført!
            </Text>
          )}
        </View>

        <PaperProgressBar
          progress={progressPercent}
          color={isCompleted ? '#4CAF50' : '#1E88E5'}
          style={styles.progressBar}
        />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text variant="bodyMedium" style={styles.statValue}>
              {completed} av {total}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              økter fullført
            </Text>
          </View>

          {currentWeek !== undefined && totalWeeks !== undefined && (
            <View style={styles.stat}>
              <Text variant="bodyMedium" style={styles.statValue}>
                Uke {currentWeek} av {totalWeeks}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                gjeldende uke
              </Text>
            </View>
          )}

          <View style={styles.stat}>
            <Text variant="bodyMedium" style={styles.statValue}>
              {Math.round(progressPercent * 100)}%
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              fullført
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  completedBadge: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
});
