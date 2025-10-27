/**
 * ProgramProgressionScreen
 *
 * Displays progression graph for a program showing planned vs actual carb rates and discomfort.
 * Story 7.6: Progresjonsgraf per program
 *
 * Features:
 * - Victory Native chart with planned rate (dashed), actual rate (solid), and discomfort (dots)
 * - X-axis: Session number, Y-axis: Carb rate (g/hour) and discomfort level
 * - Only shows completed sessions
 * - Empty state for <2 completed sessions
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Appbar, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ProgramRepository, ProgressionDataPoint } from '../../database/repositories/ProgramRepository';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryLegend } from 'victory-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

type ProgramProgressionScreenProps = NativeStackScreenProps<RootStackParamList, 'ProgramProgression'>;

interface ChartData {
  x: number;
  y: number;
}

export const ProgramProgressionScreen: React.FC<ProgramProgressionScreenProps> = ({
  navigation,
  route,
}) => {
  const { programId } = route.params;

  const [loading, setLoading] = useState(true);
  const [progressionData, setProgressionData] = useState<ProgressionDataPoint[]>([]);

  useEffect(() => {
    loadProgressionData();
  }, [programId]);

  const loadProgressionData = async () => {
    try {
      setLoading(true);
      const data = await ProgramRepository.getProgressionData(programId);
      setProgressionData(data);
    } catch (error) {
      console.error('Failed to load progression data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for Victory Native
  const transformData = () => {
    const plannedData: ChartData[] = [];
    const actualData: ChartData[] = [];
    const discomfortData: ChartData[] = [];

    progressionData.forEach((point) => {
      // Planned rate (all sessions)
      plannedData.push({
        x: point.session_number,
        y: point.planned_rate,
      });

      // Actual rate (only completed sessions)
      if (point.is_completed && point.actual_rate !== null) {
        actualData.push({
          x: point.session_number,
          y: point.actual_rate,
        });
      }

      // Discomfort (only completed sessions with discomfort)
      if (point.is_completed && point.avg_discomfort !== null) {
        discomfortData.push({
          x: point.session_number,
          y: point.avg_discomfort,
        });
      }
    });

    return { plannedData, actualData, discomfortData };
  };

  const completedCount = progressionData.filter((p) => p.is_completed).length;

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Progresjon" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Laster progresjon...
          </Text>
        </View>
      </View>
    );
  }

  if (completedCount < 2) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Progresjon" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chart-line-variant" size={64} color="#ccc" />
          <Text variant="titleLarge" style={styles.emptyText}>
            Fullfør minst 2 økter
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Du har fullført {completedCount} av {progressionData.length} økter.
            {'\n'}Fullfør {2 - completedCount} til for å se progresjonsgrafen.
          </Text>
        </View>
      </View>
    );
  }

  const { plannedData, actualData, discomfortData } = transformData();

  // Find max values for axis scaling
  const maxRate = Math.max(
    ...plannedData.map((d) => d.y),
    ...actualData.map((d) => d.y),
    100
  );
  const maxDiscomfort = 5;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Progresjon" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Karb-rate og ubehag over tid
            </Text>

            <Text variant="bodySmall" style={styles.subtitle}>
              {completedCount} av {progressionData.length} økter fullført
            </Text>

            <View style={styles.chartContainer}>
              <VictoryChart
                width={SCREEN_WIDTH - 64}
                height={300}
                padding={{ top: 20, bottom: 50, left: 60, right: 60 }}
              >
                {/* X-Axis: Session number */}
                <VictoryAxis
                  label="Økt-nummer"
                  style={{
                    axisLabel: { fontSize: 12, padding: 30 },
                    tickLabels: { fontSize: 10 },
                  }}
                />

                {/* Y-Axis Left: Carb rate */}
                <VictoryAxis
                  dependentAxis
                  label="Karb-rate (g/t)"
                  domain={[0, maxRate * 1.1]}
                  style={{
                    axis: { stroke: '#2196F3' },
                    axisLabel: { fontSize: 12, padding: 40, fill: '#2196F3' },
                    tickLabels: { fontSize: 10, fill: '#2196F3' },
                  }}
                />

                {/* Y-Axis Right: Discomfort */}
                <VictoryAxis
                  dependentAxis
                  orientation="right"
                  label="Ubehag (1-5)"
                  domain={[0, maxDiscomfort]}
                  tickValues={[1, 2, 3, 4, 5]}
                  style={{
                    axis: { stroke: '#F44336' },
                    axisLabel: { fontSize: 12, padding: 40, fill: '#F44336' },
                    tickLabels: { fontSize: 10, fill: '#F44336' },
                  }}
                />

                {/* Planned rate (dashed gray line) */}
                <VictoryLine
                  data={plannedData}
                  style={{
                    data: {
                      stroke: '#888',
                      strokeWidth: 2,
                      strokeDasharray: '4,4',
                    },
                  }}
                />

                {/* Actual rate (solid blue line) */}
                {actualData.length > 0 && (
                  <VictoryLine
                    data={actualData}
                    style={{
                      data: {
                        stroke: '#2196F3',
                        strokeWidth: 3,
                      },
                    }}
                  />
                )}

                {/* Discomfort (red dots, scaled to rate axis) */}
                {discomfortData.length > 0 && (
                  <VictoryScatter
                    data={discomfortData.map((point) => ({
                      x: point.x,
                      y: (point.y / maxDiscomfort) * maxRate, // Scale to rate axis
                    }))}
                    size={(datum) => {
                      const discomfortLevel = (datum.y / maxRate) * maxDiscomfort;
                      return discomfortLevel * 4 + 4; // Size 8-24
                    }}
                    style={{
                      data: { fill: '#F44336', opacity: 0.7 },
                    }}
                  />
                )}

                {/* Legend */}
                <VictoryLegend
                  x={20}
                  y={5}
                  orientation="horizontal"
                  gutter={20}
                  style={{ labels: { fontSize: 10 } }}
                  data={[
                    { name: 'Planlagt', symbol: { fill: '#888', type: 'minus' } },
                    ...(actualData.length > 0
                      ? [{ name: 'Faktisk', symbol: { fill: '#2196F3', type: 'minus' } }]
                      : []),
                    ...(discomfortData.length > 0
                      ? [{ name: 'Ubehag', symbol: { fill: '#F44336', type: 'circle' } }]
                      : []),
                  ]}
                />
              </VictoryChart>
            </View>
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Oppsummering
            </Text>

            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.summaryText}>
                Fullført: {completedCount} av {progressionData.length} økter
              </Text>
            </View>

            {actualData.length > 0 && (
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="speedometer" size={20} color="#2196F3" />
                <Text variant="bodyMedium" style={styles.summaryText}>
                  Snitt faktisk rate: {Math.round(actualData.reduce((sum, d) => sum + d.y, 0) / actualData.length)}g/t
                </Text>
              </View>
            )}

            {discomfortData.length > 0 && (
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF9800" />
                <Text variant="bodyMedium" style={styles.summaryText}>
                  Ubehag i {discomfortData.length} økter
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryText: {
    flex: 1,
  },
});
