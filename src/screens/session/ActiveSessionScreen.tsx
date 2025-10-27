/**
 * ActiveSessionScreen
 *
 * Active workout session screen with running timer, intake and discomfort logging.
 * Story 5.1: Start økt-modus
 * Story 5.3: Log intake
 * Story 5.4: Log discomfort
 * Story 5.5: Avslutt økt
 *
 * Features:
 * - Large HH:MM:SS timer display
 * - Start button to begin session
 * - Session info (planned vs spontaneous)
 * - Status badge (🟢 Aktiv)
 * - Intake logging (planned quick log + unplanned product selector)
 * - Discomfort logging (1-5 severity scale with optional symptom/notes)
 * - Next intake card (shows upcoming planned intake)
 * - Event log (displays intake and discomfort events)
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, Appbar, ActivityIndicator, Snackbar, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SessionLogRepository } from '../../database/repositories/SessionLogRepository';
import { PlannedSessionRepository } from '../../database/repositories/PlannedSessionRepository';
import { SessionEventRepository } from '../../database/repositories/SessionEventRepository';
import type { IntakeEventData, DiscomfortEventData } from '../../database/repositories/SessionEventRepository';
import { FuelProduct } from '../../database/repositories/FuelProductRepository';
import { SessionTimer } from '../../services/SessionTimer';
import { endSession, getSessionSummary } from '../../services/sessionManager';
import { RootStackParamList } from '../../types/navigation';
import { FuelPlanItem } from '../../types/fuelPlan';
import { NextIntakeCard, NextIntake } from '../../components/session/NextIntakeCard';
import { SessionEventList } from '../../components/session/SessionEventList';
import { ProductSelectorSheet } from '../../components/session/ProductSelectorSheet';
import { DiscomfortModal } from '../../components/session/DiscomfortModal';

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

  // Fuel plan state
  const [fuelPlan, setFuelPlan] = useState<FuelPlanItem[]>([]);
  const [nextIntake, setNextIntake] = useState<NextIntake | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // Product selector state
  const [productSelectorVisible, setProductSelectorVisible] = useState(false);

  // Discomfort modal state
  const [discomfortModalVisible, setDiscomfortModalVisible] = useState(false);

  // End session dialog state (Story 5.5)
  const [endSessionDialogVisible, setEndSessionDialogVisible] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const timerRef = useRef<SessionTimer | null>(null);

  useEffect(() => {
    // Load planned session info and fuel plan if available
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

  useEffect(() => {
    // Update next intake when timer changes or events are logged
    if (sessionStarted && fuelPlan.length > 0) {
      updateNextIntake();
    }
  }, [elapsedSeconds, events, fuelPlan, sessionStarted]);

  const loadPlannedSessionInfo = async () => {
    try {
      const plannedSession = await PlannedSessionRepository.getById(plannedSessionId!);
      if (plannedSession) {
        setPlannedSessionInfo(`Planlagt økt`);

        // Parse fuel plan from JSON
        if (plannedSession.fuel_plan_json) {
          const plan = JSON.parse(plannedSession.fuel_plan_json) as FuelPlanItem[];
          setFuelPlan(plan);
        }
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

  /**
   * Calculate next planned intake based on elapsed time and logged events
   */
  const updateNextIntake = () => {
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    // Get all logged intake timing_minutes (filter to intake events only)
    const intakeEvents = events.filter(e => e.event_type === 'intake');
    const loggedTimings = intakeEvents
      .map(e => {
        const data = JSON.parse(e.data_json) as IntakeEventData;
        return data.timing_minute;
      })
      .filter(t => t !== undefined);

    // Flatten all timing_minutes from fuel plan
    const allTimings: Array<{ timing: number; item: FuelPlanItem }> = [];
    fuelPlan.forEach(item => {
      item.timing_minutes.forEach(timing => {
        allTimings.push({ timing, item });
      });
    });

    // Sort by timing
    allTimings.sort((a, b) => a.timing - b.timing);

    // Find next unlogged intake (within ±2 minutes window or future)
    for (const { timing, item } of allTimings) {
      if (!loggedTimings.includes(timing) && timing >= elapsedMinutes - 2) {
        setNextIntake({
          product_name: item.product_name,
          timing_minute: timing,
          carbs_per_serving: item.carbs_per_serving,
          fuel_product_id: item.fuel_product_id,
        });
        return;
      }
    }

    // No more planned intakes
    setNextIntake(null);
  };

  /**
   * Handle intake button tap - Quick log if planned, product selector if unplanned
   */
  const handleLogIntake = () => {
    if (nextIntake) {
      // Quick log planned intake
      logPlannedIntake(nextIntake);
    } else {
      // Show product selector for unplanned intake
      setProductSelectorVisible(true);
    }
  };

  /**
   * Log planned intake (quick log)
   */
  const logPlannedIntake = async (intake: NextIntake) => {
    if (!sessionLogId) return;

    try {
      const intakeData: IntakeEventData = {
        fuel_product_id: intake.fuel_product_id,
        product_name: intake.product_name,
        quantity: 1,
        carbs_consumed: intake.carbs_per_serving,
        was_planned: true,
        timing_minute: intake.timing_minute,
      };

      await SessionEventRepository.createIntakeEvent(
        sessionLogId,
        elapsedSeconds,
        intakeData
      );

      // Reload events
      await reloadEvents();

      // Show success snackbar
      setSnackbarMessage(`✓ ${intake.product_name} loggført (${intake.carbs_per_serving}g)`);
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to log intake:', err);
      setSnackbarMessage('Kunne ikke logge inntak');
      setSnackbarVisible(true);
    }
  };

  /**
   * Log unplanned intake from product selector
   */
  const handleSelectProduct = async (product: FuelProduct) => {
    if (!sessionLogId) return;

    try {
      const intakeData: IntakeEventData = {
        fuel_product_id: product.id,
        product_name: product.name,
        quantity: 1,
        carbs_consumed: product.carbs_per_serving,
        was_planned: false,
      };

      await SessionEventRepository.createIntakeEvent(
        sessionLogId,
        elapsedSeconds,
        intakeData
      );

      // Reload events
      await reloadEvents();

      // Show success snackbar
      setSnackbarMessage(`✓ ${product.name} loggført (${product.carbs_per_serving}g)`);
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to log unplanned intake:', err);
      setSnackbarMessage('Kunne ikke logge inntak');
      setSnackbarVisible(true);
    }
  };

  /**
   * Log discomfort event from modal
   */
  const handleLogDiscomfort = async (
    severity: number,
    symptom?: string,
    notes?: string
  ) => {
    if (!sessionLogId) return;

    try {
      const discomfortData: DiscomfortEventData = {
        severity,
        symptom,
        notes,
      };

      await SessionEventRepository.createDiscomfortEvent(
        sessionLogId,
        elapsedSeconds,
        discomfortData
      );

      // Reload all events
      await reloadEvents();

      // Show success snackbar
      setSnackbarMessage(`✓ Ubehag logget (nivå ${severity})`);
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to log discomfort:', err);
      setSnackbarMessage('Kunne ikke logge ubehag');
      setSnackbarVisible(true);
    }
  };

  /**
   * Reload all events from database (intake, discomfort, notes)
   */
  const reloadEvents = async () => {
    if (!sessionLogId) return;

    try {
      const allEvents = await SessionEventRepository.getEventsBySession(sessionLogId);
      setEvents(allEvents);
    } catch (err) {
      console.error('Failed to reload events:', err);
    }
  };

  /**
   * Handle end session button tap - Show confirmation dialog (Story 5.5 AC2)
   */
  const handleEndSessionRequest = () => {
    setEndSessionDialogVisible(true);
  };

  /**
   * Confirm and end the session (Story 5.5 AC3)
   */
  const handleConfirmEndSession = async () => {
    if (!sessionLogId) return;

    try {
      setEndingSession(true);

      // Stop the timer
      if (timerRef.current) {
        timerRef.current.stop();
      }

      // End the session in database
      await endSession(sessionLogId, elapsedSeconds);

      // Close dialog
      setEndSessionDialogVisible(false);

      // Navigate to session summary (Story 5.5 AC4)
      navigation.replace('SessionSummary', { sessionLogId });
    } catch (err) {
      console.error('Failed to end session:', err);
      setSnackbarMessage('Kunne ikke avslutte økten');
      setSnackbarVisible(true);
      setEndingSession(false);
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
        {sessionStarted && (
          <Appbar.Action
            icon="stop-circle-outline"
            onPress={handleEndSessionRequest}
            color="#B00020"
          />
        )}
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

            {/* Next Intake Card (Story 5.3 AC1) */}
            {fuelPlan.length > 0 && (
              <NextIntakeCard
                nextIntake={nextIntake}
                elapsedMinutes={Math.floor(elapsedSeconds / 60)}
              />
            )}

            {/* Intake Button (Story 5.3 AC2-3) */}
            <Button
              mode="contained"
              icon="food-apple"
              onPress={handleLogIntake}
              style={styles.intakeButton}
              contentStyle={styles.intakeButtonContent}
              labelStyle={styles.intakeButtonLabel}
            >
              INNTAK
            </Button>

            {/* Event Log (Story 5.3 AC4, Story 5.4 AC4) */}
            {events.length > 0 && <SessionEventList events={events} />}

            {/* Discomfort Button (Story 5.4 AC1) */}
            <Button
              mode="outlined"
              icon="alert"
              onPress={() => setDiscomfortModalVisible(true)}
              style={styles.discomfortButton}
              contentStyle={styles.discomfortButtonContent}
              labelStyle={styles.discomfortButtonLabel}
              buttonColor="#FF6F00"
            >
              LOGG UBEHAG
            </Button>
          </>
        )}
      </ScrollView>

      {/* Product Selector Sheet (Story 5.3 AC3) */}
      <ProductSelectorSheet
        visible={productSelectorVisible}
        onDismiss={() => setProductSelectorVisible(false)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Discomfort Modal (Story 5.4 AC2-3) */}
      <DiscomfortModal
        visible={discomfortModalVisible}
        onDismiss={() => setDiscomfortModalVisible(false)}
        onSubmit={handleLogDiscomfort}
      />

      {/* End Session Confirmation Dialog (Story 5.5 AC2) */}
      <Portal>
        <Dialog
          visible={endSessionDialogVisible}
          onDismiss={() => !endingSession && setEndSessionDialogVisible(false)}
        >
          <Dialog.Title>Avslutt økt?</Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <Text variant="headlineMedium" style={styles.dialogTimer}>
                {formatTime(elapsedSeconds)}
              </Text>
              <Text variant="bodyLarge" style={styles.dialogSummary}>
                {events.filter(e => e.event_type === 'intake').length} inntak,{' '}
                {events.filter(e => e.event_type === 'discomfort').length} ubehag
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEndSessionDialogVisible(false)} disabled={endingSession}>
              Avbryt
            </Button>
            <Button
              onPress={handleConfirmEndSession}
              loading={endingSession}
              disabled={endingSession}
              textColor="#B00020"
            >
              Avslutt
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for feedback (Story 5.3 AC2, Story 5.4 AC3) */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
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
  intakeButton: {
    marginBottom: 16,
  },
  intakeButtonContent: {
    paddingVertical: 16,
  },
  intakeButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  discomfortButton: {
    marginBottom: 16,
    borderColor: '#FF6F00',
  },
  discomfortButtonContent: {
    paddingVertical: 16,
  },
  discomfortButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  dialogContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dialogTimer: {
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 12,
  },
  dialogSummary: {
    color: '#666',
  },
});
