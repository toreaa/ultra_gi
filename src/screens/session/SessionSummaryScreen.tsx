/**
 * SessionSummaryScreen
 *
 * Displays summary after completing a workout session.
 * Story 5.5: Avslutt økt
 *
 * Features:
 * - Show total duration (HH:MM:SS)
 * - Display intake and discomfort event counts
 * - Show total carbs consumed
 * - Navigate to analysis (Epic 7 placeholder)
 * - Add optional session notes
 * - Return to dashboard
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Appbar, ActivityIndicator, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SessionLogRepository } from '../../database/repositories/SessionLogRepository';
import { getSessionSummary } from '../../services/sessionManager';
import { RootStackParamList } from '../../types/navigation';

type SessionSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SessionSummary'
>;

export const SessionSummaryScreen: React.FC<SessionSummaryScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionLogId } = route.params;

  const [loading, setLoading] = useState(true);
  const [sessionLog, setSessionLog] = useState<any>(null);
  const [summary, setSummary] = useState<{
    intakeCount: number;
    discomfortCount: number;
    totalCarbs: number;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, [sessionLogId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);

      // Load session log
      const log = await SessionLogRepository.getById(sessionLogId);
      setSessionLog(log);

      // Load session summary
      const summaryData = await getSessionSummary(sessionLogId);
      setSummary(summaryData);

      // Load existing notes if any
      if (log?.post_session_notes) {
        setNotes(log.post_session_notes);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}t ${mins}min`;
  };

  const formatDetailedDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0; // We only store minutes, so seconds are 0
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;

    try {
      setSavingNotes(true);
      await SessionLogRepository.updateNotes(sessionLogId, notes);
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleViewAnalysis = () => {
    // TODO: Navigate to Epic 7 analysis screen
    // For now, show a placeholder message
    console.log('Navigate to analysis for session:', sessionLogId);
    // navigation.navigate('SessionAnalysis', { sessionLogId });
  };

  const handleBackToDashboard = () => {
    // Navigate back to Main tab (Dashboard) - replace to prevent back navigation to active session
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Laster økt-oppsummering...
        </Text>
      </View>
    );
  }

  if (!sessionLog || !summary) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
        <Text variant="titleLarge" style={styles.errorText}>
          Kunne ikke laste økt-data
        </Text>
        <Button mode="contained" onPress={handleBackToDashboard}>
          Tilbake til dashboard
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Økt fullført" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Success Header */}
        <Card style={styles.successCard}>
          <Card.Content style={styles.successContent}>
            <Text variant="displaySmall" style={styles.successEmoji}>
              🎉
            </Text>
            <Text variant="headlineMedium" style={styles.successTitle}>
              Økt fullført!
            </Text>
          </Card.Content>
        </Card>

        {/* Duration Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="timer" size={32} color="#1E88E5" />
              <View style={styles.statContent}>
                <Text variant="labelMedium" style={styles.statLabel}>
                  Total tid
                </Text>
                <Text variant="headlineLarge" style={styles.statValue}>
                  {formatDetailedDuration(sessionLog.duration_actual_minutes || 0)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Events Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Hendelser
            </Text>

            <View style={styles.eventRow}>
              <MaterialCommunityIcons name="food-apple" size={24} color="#4CAF50" />
              <Text variant="bodyLarge" style={styles.eventText}>
                {summary.intakeCount} inntak
              </Text>
              <Text variant="bodyMedium" style={styles.eventDetail}>
                ({summary.totalCarbs}g karbo)
              </Text>
            </View>

            <View style={styles.eventRow}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#FF9800" />
              <Text variant="bodyLarge" style={styles.eventText}>
                {summary.discomfortCount} ubehag
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Notes Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Notater (valgfritt)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Legg til notater om økten..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
            {notes.trim() !== (sessionLog.post_session_notes || '') && (
              <Button
                mode="contained"
                onPress={handleSaveNotes}
                loading={savingNotes}
                style={styles.saveNotesButton}
              >
                Lagre notater
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleViewAnalysis}
            style={styles.actionButton}
            icon="chart-line"
            disabled
          >
            Se analyse (kommer snart)
          </Button>

          <Button
            mode="contained"
            onPress={handleBackToDashboard}
            style={styles.actionButton}
            icon="home"
          >
            Tilbake til dashboard
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  successCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  successTitle: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 16,
    flex: 1,
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventText: {
    marginLeft: 12,
    flex: 1,
  },
  eventDetail: {
    color: '#666',
  },
  notesInput: {
    marginBottom: 12,
  },
  saveNotesButton: {
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
