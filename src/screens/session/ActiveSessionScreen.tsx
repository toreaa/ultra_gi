/**
 * ActiveSessionScreen
 *
 * Active workout session screen with running timer.
 * Story 5.1: Start økt-modus
 *
 * Features (MVP):
 * - Large HH:MM:SS timer display
 * - Start button to begin session
 * - Session info (planned vs spontaneous)
 * - Status badge (=â Aktiv)
 * - Placeholder buttons for future features (intake/discomfort logging, end session)
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, Appbar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SessionLogRepository } from '../../database/repositories/SessionLogRepository';
import { PlannedSessionRepository } from '../../database/repositories/PlannedSessionRepository';
import { SessionTimer } from '../../services/SessionTimer';
import { RootStackParamList } from '../../types/navigation';

type ActiveSessionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ActiveSession'
>;

export const ActiveSessionScreen: React.FC<ActiveSessionScreenProps> = ({
  navigation,
  route,
}) => {
  const { plannedSessionId } = route.params;

  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionLogId, setSessionLogId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plannedSessionInfo, setPlannedSessionInfo] = useState<string>('Spontan økt');

  const timerRef = useRef<SessionTimer | null>(null);

  useEffect(() => {
    // Load planned session info if available
    if (plannedSessionId) {
      loadPlannedSessionInfo();
    }

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, [plannedSessionId]);

  const loadPlannedSessionInfo = async () => {
    try {
      const plannedSession = await PlannedSessionRepository.getById(plannedSessionId!);
      if (plannedSession) {
        setPlannedSessionInfo(`Planlagt økt`);
      }
    } catch (err) {
      console.error('Failed to load planned session:', err);
    }
  };

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create session log in database
      const logId = await SessionLogRepository.create({
        user_id: 1, // Hardcoded for MVP
        planned_session_id: plannedSessionId,
        started_at: new Date().toISOString(),
        session_status: 'active',
      });

      setSessionLogId(logId);

      // Start timer
      const timer = new SessionTimer();
      await timer.start(logId, (elapsed) => {
        setElapsedSeconds(elapsed);
      });
      timerRef.current = timer;

      setSessionStarted(true);
      console.log(`Session started with log ID: ${logId}`);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Kunne ikke starte økten');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Økt-modus" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Økt-modus" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#B00020" />
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
            Gå tilbake
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Økt-modus" />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Session Info Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="titleMedium">{plannedSessionInfo}</Text>
              {sessionStarted && (
                <Chip icon="circle" textStyle={styles.activeChipText} style={styles.activeChip}>
                  Aktiv
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {!sessionStarted ? (
          /* Start Button */
          <View style={styles.startContainer}>
            <Button
              mode="contained"
              onPress={handleStartSession}
              icon="play"
              style={styles.startButton}
              contentStyle={styles.startButtonContent}
              labelStyle={styles.startButtonLabel}
            >
              START ØIKT
            </Button>
            <Text variant="bodySmall" style={styles.hint}>
              En foregrunnsvarsling vil holde økten aktiv
            </Text>
          </View>
        ) : (
          /* Active Session View */
          <>
            {/* Timer Display */}
            <Card style={styles.timerCard} mode="elevated">
              <Card.Content>
                <Text variant="labelLarge" style={styles.timerLabel}>
                  TID
                </Text>
                <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
              </Card.Content>
            </Card>

            {/* Action Buttons (Placeholder for MVP) */}
            <View style={styles.actionsContainer}>
              <Button
                mode="outlined"
                icon="food-apple"
                style={styles.actionButton}
                disabled
              >
                Logg inntak
              </Button>
              <Button
                mode="outlined"
                icon="alert"
                style={styles.actionButton}
                disabled
              >
                Logg ubehag
              </Button>
              <Button
                mode="contained"
                icon="stop"
                style={styles.endButton}
                buttonColor="#B00020"
                disabled
              >
                Avslutt økt
              </Button>
            </View>

            <Text variant="bodySmall" style={styles.placeholderNote}>
              Loggefunksjoner kommer i Story 5.3-5.5
            </Text>
          </>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    borderColor: '#B00020',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: '#4CAF50',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  startContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  startButton: {
    marginBottom: 16,
  },
  startButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  startButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hint: {
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  timerCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  timerLabel: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E88E5',
    fontVariant: ['tabular-nums'],
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  endButton: {
    marginTop: 16,
  },
  placeholderNote: {
    textAlign: 'center',
    color: '#999',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
