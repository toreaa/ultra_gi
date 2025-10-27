/**
 * SessionDetailScreen
 *
 * Displays detailed view of a completed session with timeline and statistics.
 * Story 7.1: Se fullført økt
 *
 * Features:
 * - Session header (date, duration, program, status)
 * - Event timeline (SessionTimeline component)
 * - Summary statistics (total carbs, intake count, discomfort count, carb rate)
 * - Action buttons: "Se graf" (Story 7.2 placeholder), "Legg til notater"
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Appbar, Card, Button, ActivityIndicator, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { SessionLogRepository } from '../../database/repositories/SessionLogRepository';
import { SessionLog, SessionEvent, IntakeData, DiscomfortData } from '../../types/database';
import { SessionTimeline } from '../../components/session/SessionTimeline';

type SessionDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

interface SessionSummary {
  intakeCount: number;
  discomfortCount: number;
  totalCarbs: number;
  carbRate: number; // g/hour
}

export const SessionDetailScreen: React.FC<SessionDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionLogId } = route.params;

  const [loading, setLoading] = useState(true);
  const [sessionLog, setSessionLog] = useState<SessionLog | null>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionLogId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);

      // Load session with events
      const data = await SessionLogRepository.getSessionWithEvents(sessionLogId);

      if (!data) {
        console.error('Session not found:', sessionLogId);
        return;
      }

      setSessionLog(data.sessionLog);
      setEvents(data.events);
      setNotes(data.sessionLog.post_session_notes || '');

      // Calculate summary statistics
      const summaryStats = calculateSummary(data.events, data.sessionLog.duration_actual_minutes || 0);
      setSummary(summaryStats);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate summary statistics from events
   */
  const calculateSummary = (eventList: SessionEvent[], durationMinutes: number): SessionSummary => {
    let intakeCount = 0;
    let discomfortCount = 0;
    let totalCarbs = 0;

    eventList.forEach((event) => {
      if (event.event_type === 'intake') {
        intakeCount++;
        const data = JSON.parse(event.data_json) as IntakeData;
        totalCarbs += data.carbs_consumed;
      } else if (event.event_type === 'discomfort') {
        discomfortCount++;
      }
    });

    const carbRate = durationMinutes > 0 ? (totalCarbs / (durationMinutes / 60)) : 0;

    return {
      intakeCount,
      discomfortCount,
      totalCarbs,
      carbRate: Math.round(carbRate),
    };
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
   * Format date to Norwegian format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Save post-session notes (Story 7.5)
   * Max 500 characters
   */
  const handleSaveNotes = async () => {
    if (!notes.trim()) {
      setNotesError('Notater kan ikke være tomme');
      return;
    }

    if (notes.length > 500) {
      setNotesError('Notater kan ikke være lengre enn 500 tegn');
      return;
    }

    try {
      setSavingNotes(true);
      setNotesError(null);
      await SessionLogRepository.updateNotes(sessionLogId, notes);
      setShowNotesInput(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
      setNotesError('Kunne ikke lagre notater. Prøv igjen.');
    } finally {
      setSavingNotes(false);
    }
  };

  /**
   * Handle notes text change with character limit
   */
  const handleNotesChange = (text: string) => {
    if (text.length <= 500) {
      setNotes(text);
      setNotesError(null);
    } else {
      setNotesError('Maks 500 tegn');
    }
  };

  /**
   * Navigate to graph screen (Story 7.2)
   */
  const handleViewGraph = () => {
    navigation.navigate('SessionGraph', { sessionLogId });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Laster økt..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Laster økt-data...
          </Text>
        </View>
      </View>
    );
  }

  if (!sessionLog || !summary) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Økt ikke funnet" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
          <Text variant="titleLarge" style={styles.errorText}>
            Kunne ikke laste økt-data
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Gå tilbake
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Økt-detaljer" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Session Header Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text variant="titleLarge" style={styles.dateText}>
                  {formatDate(sessionLog.started_at)}
                </Text>
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                  <Text variant="labelSmall" style={styles.statusText}>
                    Fullført
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="timer" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.metaText}>
                Varighet: {formatDuration(sessionLog.duration_actual_minutes || 0)}
              </Text>
            </View>

            {sessionLog.planned_session_id && (
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.metaText}>
                  Planlagt økt (ID: {sessionLog.planned_session_id})
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Summary Statistics Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Oppsummering
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="food-apple" size={32} color="#4CAF50" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {summary.intakeCount}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Inntak
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="chart-line" size={32} color="#1E88E5" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {summary.totalCarbs}g
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Totalt karbs
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="speedometer" size={32} color="#9C27B0" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {summary.carbRate}g/t
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Karb-rate
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="alert-circle" size={32} color="#FF9800" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {summary.discomfortCount}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Ubehag
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Timeline Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Tidslinje
            </Text>
          </Card.Content>
          <View style={styles.timelineContainer}>
            <SessionTimeline
              events={events}
              showStartEnd={true}
              durationMinutes={sessionLog.duration_actual_minutes}
            />
          </View>
        </Card>

        {/* Notes Card (Story 7.5) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Notater
            </Text>

            {showNotesInput || notes ? (
              <>
                <TextInput
                  mode="outlined"
                  placeholder="f.eks. Varmt vær (28°C), lite søvn"
                  value={notes}
                  onChangeText={handleNotesChange}
                  multiline
                  numberOfLines={4}
                  style={styles.notesInput}
                  error={!!notesError}
                />
                <View style={styles.notesMetaRow}>
                  <Text variant="bodySmall" style={styles.charCounter}>
                    {notes.length}/500 tegn
                  </Text>
                  {notesError && (
                    <Text variant="bodySmall" style={styles.errorText}>
                      {notesError}
                    </Text>
                  )}
                </View>
                <View style={styles.notesActions}>
                  <Button
                    mode="contained"
                    onPress={handleSaveNotes}
                    loading={savingNotes}
                    disabled={!notes.trim() || !!notesError}
                  >
                    Lagre notater
                  </Button>
                  {showNotesInput && (
                    <Button mode="text" onPress={() => {
                      setShowNotesInput(false);
                      setNotesError(null);
                      setNotes(sessionLog?.post_session_notes || '');
                    }}>
                      Avbryt
                    </Button>
                  )}
                </View>
              </>
            ) : (
              <Button
                mode="outlined"
                icon="note-plus"
                onPress={() => setShowNotesInput(true)}
                style={styles.addNotesButton}
              >
                Legg til notater
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleViewGraph}
            icon="chart-line"
            style={styles.actionButton}
          >
            Se graf
          </Button>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#F44336',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
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
  timelineContainer: {
    height: 300,
  },
  notesInput: {
    marginBottom: 8,
  },
  notesMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  charCounter: {
    color: '#666',
  },
  errorText: {
    color: '#F44336',
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  addNotesButton: {
    marginTop: 8,
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});
