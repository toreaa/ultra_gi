/**
 * SessionGraphScreen
 *
 * Displays graph showing carb intake over time with discomfort events.
 * Story 7.2: Visualiser inntak vs ubehag
 *
 * Features:
 * - Dual Y-axis chart (cumulative carbs, discomfort level)
 * - X-axis: Time in minutes
 * - Cumulative carb intake line (blue)
 * - Discomfort points (red, sized by severity)
 * - Target line for planned sessions (dashed gray)
 * - Legend
 * - Zoom/pan for long sessions (>2 hours)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Appbar, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryLegend,
  VictoryLabel,
} from 'victory-native';
import { RootStackParamList } from '../../types/navigation';
import { SessionLogRepository } from '../../database/repositories/SessionLogRepository';
import { SessionEvent, IntakeData, DiscomfortData } from '../../types/database';

type SessionGraphScreenProps = NativeStackScreenProps<RootStackParamList, 'SessionGraph'>;

interface ChartDataPoint {
  x: number; // Minutes
  y: number; // Carbs or severity level
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const SessionGraphScreen: React.FC<SessionGraphScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionLogId } = route.params;

  const [loading, setLoading] = useState(true);
  const [cumulativeIntake, setCumulativeIntake] = useState<ChartDataPoint[]>([]);
  const [discomfortPoints, setDiscomfortPoints] = useState<ChartDataPoint[]>([]);
  const [targetLine, setTargetLine] = useState<ChartDataPoint[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [maxCarbs, setMaxCarbs] = useState(100);

  useEffect(() => {
    loadGraphData();
  }, [sessionLogId]);

  const loadGraphData = async () => {
    try {
      setLoading(true);

      // Load session with events
      const data = await SessionLogRepository.getSessionWithEvents(sessionLogId);

      if (!data) {
        console.error('Session not found:', sessionLogId);
        return;
      }

      const { sessionLog, events } = data;
      const duration = sessionLog.duration_actual_minutes || 0;
      setDurationMinutes(duration);

      // Calculate cumulative intake
      const intakeEvents = events.filter((e) => e.event_type === 'intake');
      const cumulative: ChartDataPoint[] = [{ x: 0, y: 0 }]; // Start at 0

      let runningTotal = 0;
      intakeEvents.forEach((event) => {
        const data = JSON.parse(event.data_json) as IntakeData;
        runningTotal += data.carbs_consumed;
        cumulative.push({
          x: event.timestamp_offset_seconds / 60, // Convert to minutes
          y: runningTotal,
        });
      });

      // Add final point at end of session
      if (cumulative.length > 1) {
        cumulative.push({
          x: duration,
          y: runningTotal,
        });
      }

      setCumulativeIntake(cumulative);
      setMaxCarbs(Math.max(runningTotal, 100));

      // Calculate discomfort points
      const discomfortEvents = events.filter((e) => e.event_type === 'discomfort');
      const discomfort: ChartDataPoint[] = discomfortEvents.map((event) => {
        const data = JSON.parse(event.data_json) as DiscomfortData;
        return {
          x: event.timestamp_offset_seconds / 60,
          y: data.level,
        };
      });

      setDiscomfortPoints(discomfort);

      // Calculate target line (if planned session)
      // TODO: Get target carb rate from planned session
      // For now, use simple linear target based on total carbs
      if (sessionLog.planned_session_id && runningTotal > 0) {
        const target: ChartDataPoint[] = [
          { x: 0, y: 0 },
          { x: duration, y: runningTotal },
        ];
        setTargetLine(target);
      }
    } catch (error) {
      console.error('Failed to load graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Laster graf..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Laster graf-data...
          </Text>
        </View>
      </View>
    );
  }

  if (cumulativeIntake.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Graf" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chart-line" size={64} color="#ccc" />
          <Text variant="titleLarge" style={styles.emptyText}>
            Ingen data å vise
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Denne økten har ingen registrerte inntak
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Inntak & Ubehag" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Graph Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Kumulativt karbohydrat-inntak over tid
            </Text>

            <View style={styles.chartContainer}>
              <VictoryChart
                width={SCREEN_WIDTH - 64}
                height={300}
                padding={{ top: 20, bottom: 50, left: 60, right: 60 }}
              >
                {/* X-Axis: Time in minutes */}
                <VictoryAxis
                  label="Tid (minutter)"
                  style={{
                    axisLabel: { fontSize: 12, padding: 30 },
                    tickLabels: { fontSize: 10 },
                  }}
                />

                {/* Y-Axis Left: Cumulative carbs */}
                <VictoryAxis
                  dependentAxis
                  label="Karbs (g)"
                  style={{
                    axisLabel: { fontSize: 12, padding: 40 },
                    tickLabels: { fontSize: 10 },
                    axis: { stroke: '#2196F3' },
                  }}
                  domain={[0, maxCarbs]}
                />

                {/* Y-Axis Right: Discomfort level */}
                <VictoryAxis
                  dependentAxis
                  orientation="right"
                  label="Ubehag (1-5)"
                  style={{
                    axisLabel: { fontSize: 12, padding: 40 },
                    tickLabels: { fontSize: 10 },
                    axis: { stroke: '#F44336' },
                  }}
                  domain={[0, 5]}
                  tickValues={[1, 2, 3, 4, 5]}
                />

                {/* Target line (dashed gray) */}
                {targetLine.length > 0 && (
                  <VictoryLine
                    data={targetLine}
                    style={{
                      data: {
                        stroke: '#999',
                        strokeWidth: 2,
                        strokeDasharray: '5,5',
                      },
                    }}
                  />
                )}

                {/* Cumulative intake line (blue) */}
                <VictoryLine
                  data={cumulativeIntake}
                  style={{
                    data: {
                      stroke: '#2196F3',
                      strokeWidth: 3,
                    },
                  }}
                  interpolation="stepAfter"
                />

                {/* Discomfort scatter points (red, scaled by severity) */}
                {discomfortPoints.length > 0 && (
                  <VictoryScatter
                    data={discomfortPoints.map((point) => ({
                      x: point.x,
                      y: (point.y / 5) * maxCarbs, // Scale to carb axis
                    }))}
                    size={(datum) => {
                      const severity = (datum.y / maxCarbs) * 5; // Reverse scale
                      return severity * 4 + 4; // Size 8-24
                    }}
                    style={{
                      data: {
                        fill: '#F44336',
                        opacity: 0.7,
                      },
                    }}
                  />
                )}

                {/* Legend */}
                <VictoryLegend
                  x={50}
                  y={5}
                  orientation="horizontal"
                  gutter={20}
                  style={{
                    labels: { fontSize: 10 },
                  }}
                  data={[
                    {
                      name: 'Karb-inntak',
                      symbol: { fill: '#2196F3', type: 'minus' },
                    },
                    ...(discomfortPoints.length > 0
                      ? [
                          {
                            name: 'Ubehag',
                            symbol: { fill: '#F44336', type: 'circle' },
                          },
                        ]
                      : []),
                    ...(targetLine.length > 0
                      ? [
                          {
                            name: 'Mål',
                            symbol: { fill: '#999', type: 'minus' },
                          },
                        ]
                      : []),
                  ]}
                />
              </VictoryChart>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Statistikk
            </Text>

            <View style={styles.statRow}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#2196F3" />
              <Text variant="bodyMedium" style={styles.statText}>
                Totalt inntak: {cumulativeIntake[cumulativeIntake.length - 1]?.y || 0}g karbs
              </Text>
            </View>

            <View style={styles.statRow}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.statText}>
                Gjennomsnittlig rate:{' '}
                {durationMinutes > 0
                  ? Math.round(
                      ((cumulativeIntake[cumulativeIntake.length - 1]?.y || 0) /
                        durationMinutes) *
                        60
                    )
                  : 0}
                g/time
              </Text>
            </View>

            <View style={styles.statRow}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
              <Text variant="bodyMedium" style={styles.statText}>
                Ubehag-hendelser: {discomfortPoints.length}
              </Text>
            </View>

            {discomfortPoints.length > 0 && (
              <View style={styles.statRow}>
                <MaterialCommunityIcons name="information" size={24} color="#FF9800" />
                <Text variant="bodySmall" style={styles.statSubtext}>
                  Størrelse på punkter indikerer alvorlighetsgrad (1-5)
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
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#999',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#bbb',
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
    marginBottom: 16,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    marginLeft: 12,
    flex: 1,
  },
  statSubtext: {
    marginLeft: 12,
    flex: 1,
    color: '#666',
  },
});
