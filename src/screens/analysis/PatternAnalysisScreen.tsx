/**
 * PatternAnalysisScreen
 *
 * Displays analysis table with all completed sessions and statistics.
 * Story 7.3: Identifiser mønstre
 *
 * Features:
 * - Aggregate statistics (total sessions, avg carb rate, success rate, severe discomfort count)
 * - Sortable table columns (date, duration, carb rate, discomfort)
 * - Row highlighting for sessions with zero discomfort (green) or severe discomfort (red)
 * - Tap row to navigate to SessionDetail
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Appbar, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { SessionLogRepository, SessionWithStats } from '../../database/repositories/SessionLogRepository';
import { SessionEvent } from '../../types/database';
import { generateRecommendations, Recommendation } from '../../services/recommendations';
import { RecommendationCard } from '../../components/analysis/RecommendationCard';

type PatternAnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'PatternAnalysis'>;

type SortField = 'date' | 'duration' | 'carbRate' | 'discomfort';
type SortDirection = 'asc' | 'desc';

interface AggregateStats {
  totalSessions: number;
  avgCarbRate: number;
  successRate: number; // % sessions with zero discomfort
  severeDiscomfortCount: number; // Sessions with avg_discomfort >= 4
}

export const PatternAnalysisScreen: React.FC<PatternAnalysisScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [sortedSessions, setSortedSessions] = useState<SessionWithStats[]>([]);
  const [aggregateStats, setAggregateStats] = useState<AggregateStats | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [allEvents, setAllEvents] = useState<Map<number, SessionEvent[]>>(new Map());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      applySorting();
    }
  }, [sessions, sortField, sortDirection]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // User ID is hardcoded to 1 for MVP
      const data = await SessionLogRepository.getAllSessionsWithStats(1);
      setSessions(data);

      // Load events for each session (needed for recommendations)
      const eventsMap = new Map<number, SessionEvent[]>();
      for (const session of data) {
        const sessionData = await SessionLogRepository.getSessionWithEvents(session.id);
        if (sessionData) {
          eventsMap.set(session.id, sessionData.events);
        }
      }
      setAllEvents(eventsMap);

      // Calculate aggregate statistics
      const stats = calculateAggregateStats(data);
      setAggregateStats(stats);

      // Generate recommendations
      const recs = generateRecommendations(data, eventsMap);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate aggregate statistics from sessions
   */
  const calculateAggregateStats = (sessionList: SessionWithStats[]): AggregateStats => {
    if (sessionList.length === 0) {
      return {
        totalSessions: 0,
        avgCarbRate: 0,
        successRate: 0,
        severeDiscomfortCount: 0,
      };
    }

    const totalSessions = sessionList.length;

    // Average carb rate (only non-zero rates)
    const validRates = sessionList
      .map((s) => s.carb_rate_per_hour)
      .filter((rate) => rate > 0);
    const avgCarbRate = validRates.length > 0
      ? validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length
      : 0;

    // Success rate: % sessions with zero discomfort
    const sessionsWithNoDiscomfort = sessionList.filter(
      (s) => s.discomfort_count === 0
    ).length;
    const successRate = (sessionsWithNoDiscomfort / totalSessions) * 100;

    // Severe discomfort count: Sessions with avg_discomfort >= 4
    const severeDiscomfortCount = sessionList.filter(
      (s) => s.avg_discomfort !== null && s.avg_discomfort >= 4
    ).length;

    return {
      totalSessions,
      avgCarbRate: Math.round(avgCarbRate),
      successRate: Math.round(successRate),
      severeDiscomfortCount,
    };
  };

  /**
   * Apply current sorting to sessions
   */
  const applySorting = () => {
    const sorted = [...sessions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
          break;
        case 'duration':
          comparison = a.duration_actual_minutes - b.duration_actual_minutes;
          break;
        case 'carbRate':
          comparison = a.carb_rate_per_hour - b.carb_rate_per_hour;
          break;
        case 'discomfort':
          comparison = (a.avg_discomfort || 0) - (b.avg_discomfort || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setSortedSessions(sorted);
  };

  /**
   * Toggle sort field and direction
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  /**
   * Format date to Norwegian short format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  /**
   * Format duration in minutes to HH:MM
   */
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  /**
   * Get row background color based on discomfort
   */
  const getRowBackgroundColor = (session: SessionWithStats): string => {
    if (session.discomfort_count === 0) {
      return '#E8F5E9'; // Light green for no discomfort
    }
    if (session.avg_discomfort !== null && session.avg_discomfort >= 4) {
      return '#FFEBEE'; // Light red for severe discomfort
    }
    return '#FFFFFF'; // Default white
  };

  /**
   * Get status icon for session
   */
  const getStatusIcon = (session: SessionWithStats) => {
    if (session.discomfort_count === 0) {
      return <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />;
    }
    if (session.avg_discomfort !== null && session.avg_discomfort >= 4) {
      return <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />;
    }
    return <MaterialCommunityIcons name="information" size={20} color="#FF9800" />;
  };

  /**
   * Navigate to session detail
   */
  const handleRowPress = (sessionId: number) => {
    navigation.navigate('SessionDetail', { sessionLogId: sessionId });
  };

  /**
   * Render sort icon for column header
   */
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <MaterialCommunityIcons name="unfold-more-horizontal" size={16} color="#999" />;
    }
    return (
      <MaterialCommunityIcons
        name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
        size={16}
        color="#1E88E5"
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Mønstre" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Laster økter...
          </Text>
        </View>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Mønstre" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chart-box-outline" size={64} color="#ccc" />
          <Text variant="titleLarge" style={styles.emptyText}>
            Ingen fullførte økter ennå
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Fullfør noen økter for å se mønstre og statistikk
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Mønstre" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Aggregate Statistics Card */}
        {aggregateStats && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Oppsummering
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="calendar-check" size={28} color="#1E88E5" />
                  <Text variant="headlineMedium" style={styles.statValue}>
                    {aggregateStats.totalSessions}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Økter
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="speedometer" size={28} color="#9C27B0" />
                  <Text variant="headlineMedium" style={styles.statValue}>
                    {aggregateStats.avgCarbRate}g/t
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Snitt karb-rate
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="check-circle" size={28} color="#4CAF50" />
                  <Text variant="headlineMedium" style={styles.statValue}>
                    {aggregateStats.successRate}%
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Ingen ubehag
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="alert-circle" size={28} color="#F44336" />
                  <Text variant="headlineMedium" style={styles.statValue}>
                    {aggregateStats.severeDiscomfortCount}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Alvorlig ubehag
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recommendations Section (Story 7.4) */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Anbefalinger
            </Text>
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </View>
        )}

        {/* Analysis Table */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Alle økter
            </Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <TouchableOpacity
                style={[styles.headerCell, styles.statusColumn]}
                onPress={() => handleSort('discomfort')}
              >
                <Text variant="labelMedium" style={styles.headerText}>
                  Status
                </Text>
                {renderSortIcon('discomfort')}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, styles.dateColumn]}
                onPress={() => handleSort('date')}
              >
                <Text variant="labelMedium" style={styles.headerText}>
                  Dato
                </Text>
                {renderSortIcon('date')}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, styles.durationColumn]}
                onPress={() => handleSort('duration')}
              >
                <Text variant="labelMedium" style={styles.headerText}>
                  Varighet
                </Text>
                {renderSortIcon('duration')}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, styles.carbRateColumn]}
                onPress={() => handleSort('carbRate')}
              >
                <Text variant="labelMedium" style={styles.headerText}>
                  Karb-rate
                </Text>
                {renderSortIcon('carbRate')}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, styles.discomfortColumn]}
                onPress={() => handleSort('discomfort')}
              >
                <Text variant="labelMedium" style={styles.headerText}>
                  Ubehag
                </Text>
                {renderSortIcon('discomfort')}
              </TouchableOpacity>
            </View>

            {/* Table Rows */}
            {sortedSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.tableRow,
                  { backgroundColor: getRowBackgroundColor(session) },
                ]}
                onPress={() => handleRowPress(session.id)}
              >
                <View style={[styles.cell, styles.statusColumn]}>
                  {getStatusIcon(session)}
                </View>

                <View style={[styles.cell, styles.dateColumn]}>
                  <Text variant="bodyMedium">{formatDate(session.started_at)}</Text>
                </View>

                <View style={[styles.cell, styles.durationColumn]}>
                  <Text variant="bodyMedium">{formatDuration(session.duration_actual_minutes)}</Text>
                </View>

                <View style={[styles.cell, styles.carbRateColumn]}>
                  <Text variant="bodyMedium">
                    {Math.round(session.carb_rate_per_hour)}g/t
                  </Text>
                </View>

                <View style={[styles.cell, styles.discomfortColumn]}>
                  <Text variant="bodyMedium">
                    {session.discomfort_count === 0
                      ? '-'
                      : `${session.discomfort_count} (${session.avg_discomfort?.toFixed(1) || '-'})`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Legend */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Legende
            </Text>

            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E8F5E9' }]} />
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.legendText}>
                Ingen ubehag (suksess)
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFFFFF' }]} />
              <MaterialCommunityIcons name="information" size={20} color="#FF9800" />
              <Text variant="bodyMedium" style={styles.legendText}>
                Moderat ubehag (nivå 1-3)
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFEBEE' }]} />
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />
              <Text variant="bodyMedium" style={styles.legendText}>
                Alvorlig ubehag (nivå 4-5)
              </Text>
            </View>
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
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#1E88E5',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusColumn: {
    width: '12%',
  },
  dateColumn: {
    width: '22%',
  },
  durationColumn: {
    width: '18%',
  },
  carbRateColumn: {
    width: '20%',
  },
  discomfortColumn: {
    width: '28%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  legendText: {
    flex: 1,
    color: '#666',
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
