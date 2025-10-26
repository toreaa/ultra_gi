/**
 * ProgramDetailScreen
 *
 * Shows detailed overview of a program with sessions grouped by week.
 * Displays program header, description, and all training sessions.
 */

import React, { useState, useEffect } from 'react';
import { View, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Appbar, Button, Snackbar, Card, Chip } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Program, ProgramSession, UserProgram } from '../../types/database';
import { ProgramRepository } from '../../database/repositories/ProgramRepository';
import { SessionLogRepository, CompletedSessionData } from '../../database/repositories/SessionLogRepository';
import { SessionCard, SessionStatus } from '../../components/program/SessionCard';
import { ProgramStackParamList } from '../../types/navigation';

type ProgramDetailScreenProps = NativeStackScreenProps<
  ProgramStackParamList,
  'ProgramDetail'
>;

interface WeekSection {
  week: number;
  data: ProgramSession[];
}

export const ProgramDetailScreen: React.FC<ProgramDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { programId, userProgramId } = route.params;

  const [program, setProgram] = useState<Program | null>(null);
  const [userProgram, setUserProgram] = useState<UserProgram | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Map<number, CompletedSessionData>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadProgramDetails();
  }, [programId]);

  const loadProgramDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load program details
      const programData = await ProgramRepository.getById(programId);
      if (!programData) {
        setError('Program ikke funnet');
        return;
      }
      setProgram(programData);

      // Load user program status (if started)
      const userProgramData = await ProgramRepository.getUserProgram(1, programId);
      setUserProgram(userProgramData);

      // Load program sessions
      const sessionsData = await ProgramRepository.getProgramSessions(programId);
      setSessions(sessionsData);

      // Load completed sessions
      const completed = await SessionLogRepository.getCompletedByProgram(programId, userProgramId);
      const completedMap = new Map<number, CompletedSessionData>();
      completed.forEach((item) => {
        if (item.log_id) {
          completedMap.set(item.program_session_id, item);
        }
      });
      setCompletedSessions(completedMap);
    } catch (err) {
      console.error('Failed to load program details:', err);
      setError('Kunne ikke laste programdetaljer');
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = (sessionId: number): SessionStatus => {
    if (completedSessions.has(sessionId)) {
      return 'completed';
    }
    // TODO: Check for planned sessions when Epic 4 is implemented
    return 'not_done';
  };

  const groupSessionsByWeek = (): WeekSection[] => {
    const grouped = new Map<number, ProgramSession[]>();

    sessions.forEach((session) => {
      const week = session.week_number;
      if (!grouped.has(week)) {
        grouped.set(week, []);
      }
      grouped.get(week)!.push(session);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([week, data]) => ({
        week,
        data: data.sort((a, b) => a.session_number - b.session_number),
      }));
  };

  const handleSessionPress = (sessionId: number) => {
    // TODO: Navigate to SessionPlan when Epic 4 is implemented
    setSnackbarMessage('Planlegging kommer i Epic 4');
    setSnackbarVisible(true);
  };

  const handleStartProgram = async () => {
    try {
      await ProgramRepository.startProgram(programId, 1);
      setSnackbarMessage('Program startet!');
      setSnackbarVisible(true);
      loadProgramDetails(); // Reload to show updated status
    } catch (err) {
      console.error('Failed to start program:', err);
      setSnackbarMessage('Kunne ikke starte program');
      setSnackbarVisible(true);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Laster..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </>
    );
  }

  if (error || !program) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Feil" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error || 'Program ikke funnet'}
          </Text>
        </View>
      </>
    );
  }

  const weekSections = groupSessionsByWeek();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={program.name} />
      </Appbar.Header>

      <SectionList
        sections={weekSections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <View style={styles.weekHeader}>
            <Text variant="titleMedium" style={styles.weekTitle}>
              Uke {section.week}
            </Text>
          </View>
        )}
        renderItem={({ item, section }) => {
          const sessionNumber = item.session_number;
          return (
            <SessionCard
              session={item}
              sessionNumber={sessionNumber}
              status={getSessionStatus(item.id)}
              onPress={() => handleSessionPress(item.id)}
            />
          );
        }}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Program Status */}
            <View style={styles.statusRow}>
              <Chip
                icon={userProgram ? 'check-circle' : 'circle-outline'}
                style={[
                  styles.statusChip,
                  userProgram ? styles.statusActive : styles.statusInactive,
                ]}
              >
                {userProgram ? 'Aktiv' : 'Ikke startet'}
              </Chip>
              {userProgram && (
                <Text variant="bodySmall" style={styles.startDate}>
                  Startet {formatDate(userProgram.started_at)}
                </Text>
              )}
            </View>

            {/* Program Description */}
            {program.description && (
              <Card style={styles.descriptionCard} mode="outlined">
                <Card.Content>
                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Om programmet
                  </Text>
                  <Text variant="bodyMedium">{program.description}</Text>

                  {program.target_audience && (
                    <>
                      <Text variant="titleSmall" style={[styles.sectionTitle, styles.marginTop]}>
                        Målgruppe
                      </Text>
                      <Text variant="bodyMedium">{program.target_audience}</Text>
                    </>
                  )}

                  {program.research_source && (
                    <>
                      <Text variant="titleSmall" style={[styles.sectionTitle, styles.marginTop]}>
                        Forskningsgrunnlag
                      </Text>
                      <Text variant="bodySmall" style={styles.research}>
                        {program.research_source}
                      </Text>
                    </>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Start Program Button */}
            {!userProgram && (
              <Button
                mode="contained"
                onPress={handleStartProgram}
                style={styles.startButton}
                icon="play"
              >
                Start program
              </Button>
            )}

            {/* Sessions Header */}
            <Text variant="titleMedium" style={styles.sessionsHeader}>
              Økter ({sessions.length} økter over {program.duration_weeks} uker)
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        stickySectionHeadersEnabled={false}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
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
    color: '#D32F2F',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusChip: {
    marginRight: 12,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInactive: {
    backgroundColor: '#F5F5F5',
  },
  startDate: {
    color: '#666',
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 16,
  },
  research: {
    fontStyle: 'italic',
    color: '#666',
  },
  startButton: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sessionsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  weekHeader: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekTitle: {
    fontWeight: '600',
    color: '#1976D2',
  },
});
