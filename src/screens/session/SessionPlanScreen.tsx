/**
 * SessionPlanScreen
 *
 * Shows session details and calculates carbohydrate requirements.
 * Entry point for session planning workflow (Epic 4).
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Appbar, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Program, ProgramSession } from '../../types/database';
import { ProgramRepository } from '../../database/repositories/ProgramRepository';
import { ProgramStackParamList } from '../../types/navigation';

type SessionPlanScreenProps = NativeStackScreenProps<
  ProgramStackParamList,
  'SessionPlan'
>;

export const SessionPlanScreen: React.FC<SessionPlanScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, programId } = route.params;

  const [session, setSession] = useState<ProgramSession | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionId, programId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load session details
      const sessionData = await ProgramRepository.getSessionById(sessionId);
      if (!sessionData) {
        setError('Økt ikke funnet');
        return;
      }
      setSession(sessionData);

      // Load program details
      const programData = await ProgramRepository.getById(programId);
      if (!programData) {
        setError('Program ikke funnet');
        return;
      }
      setProgram(programData);
    } catch (err) {
      console.error('Failed to load session data:', err);
      setError('Kunne ikke laste øktdata');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCarbs = (): number => {
    if (!session) return 0;
    return Math.round((session.duration_minutes / 60) * session.carb_rate_g_per_hour);
  };

  const handleCreatePlan = () => {
    navigation.navigate('FuelSelector', {
      sessionId,
      targetCarbs: calculateTotalCarbs(),
      durationMinutes: session!.duration_minutes,
    });
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Planlegg økt" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </>
    );
  }

  if (error || !session || !program) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Planlegg økt" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#B00020" />
          <Text variant="bodyLarge" style={styles.errorText}>
            {error || 'Økt ikke funnet'}
          </Text>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
            Gå tilbake
          </Button>
        </View>
      </>
    );
  }

  const totalCarbs = calculateTotalCarbs();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Planlegg økt" />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Session Info Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Title
            title="Øktinformasjon"
            left={(props) => (
              <MaterialCommunityIcons {...props} name="information" color="#1E88E5" />
            )}
          />
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="run" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Program:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {program.name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-range" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Økt:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                Uke {session.week_number}, Økt {session.session_number}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Varighet:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {session.duration_minutes} min
              </Text>
            </View>

            {session.intensity_zone && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="speedometer" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Intensitet:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {session.intensity_zone}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="fire" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Mål:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {session.carb_rate_g_per_hour}g/t
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Carb Calculation Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Title
            title="Karbohydratbehov"
            left={(props) => (
              <MaterialCommunityIcons {...props} name="food-apple" color="#4CAF50" />
            )}
          />
          <Card.Content>
            <View style={styles.carbHighlight}>
              <Text variant="displaySmall" style={styles.carbNumber}>
                {totalCarbs}g
              </Text>
            </View>
            <Text variant="bodyLarge" style={styles.carbDescription}>
              Du trenger ca. {totalCarbs}g karbohydrater for denne økten
            </Text>
            <Text variant="bodySmall" style={styles.carbFormula}>
              Beregning: ({session.duration_minutes} min / 60) × {session.carb_rate_g_per_hour}g/t
            </Text>
          </Card.Content>
        </Card>

        {/* Action Button */}
        <Button
          mode="contained"
          onPress={handleCreatePlan}
          icon="clipboard-list"
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
        >
          Lag plan
        </Button>
      </ScrollView>
    </>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#666',
    width: 90,
  },
  infoValue: {
    flex: 1,
    color: '#212121',
  },
  carbHighlight: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 16,
  },
  carbNumber: {
    fontWeight: '700',
    color: '#2E7D32',
  },
  carbDescription: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#212121',
  },
  carbFormula: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  actionButton: {
    marginTop: 8,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
});
