import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../types/navigation';
import { getDatabase } from '../../database';
import { ProgramRepository } from '../../database/repositories/ProgramRepository';
import { useUserStore } from '../../store/userStore';
import {
  getRecommendedProgram,
  getProgramStartIntensity,
  type ProgramRecommendation,
} from '../../services/programRecommendation';

type ProgramSuggestionScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'ProgramSuggestion'
>;

type ProgramSuggestionScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  'ProgramSuggestion'
>;

interface ProgramSuggestionScreenProps {
  navigation: ProgramSuggestionScreenNavigationProp;
  route: ProgramSuggestionScreenRouteProp;
}

export const ProgramSuggestionScreen: React.FC<ProgramSuggestionScreenProps> = ({
  navigation,
  route,
}) => {
  const { goal, giIssue } = route.params;
  const [recommendation, setRecommendation] = useState<ProgramRecommendation | null>(null);
  const [startIntensity, setStartIntensity] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, [giIssue]);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();

      const rec = await getRecommendedProgram(db, giIssue);
      setRecommendation(rec);

      const intensity = await getProgramStartIntensity(db, rec.program.id);
      setStartIntensity(intensity);
    } catch (error) {
      console.error('Failed to load program recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const handleStartProgram = async () => {
    if (!recommendation) return;

    try {
      setIsStarting(true);
      const db = await getDatabase();

      // Create user with onboarding data
      await completeOnboarding({
        primary_goal: route.params.goal,
        primary_gi_issue: route.params.giIssue,
      });

      // Start the program in database
      await ProgramRepository.startProgram(recommendation.program.id, 1);

      // Navigate to ProfileSetup (final onboarding step)
      navigation.navigate('ProfileSetup');
    } catch (error) {
      console.error('Failed to start program:', error);
      setIsStarting(false);
      // TODO: Show error dialog to user
    }
  };

  const handleViewAllPrograms = () => {
    // TODO: Navigate to ProgramListScreen (Epic 3)
    // For now, this is a placeholder
    console.log('View all programs - coming in Epic 3');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Finner beste program for deg...
        </Text>
      </View>
    );
  }

  if (!recommendation) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="headlineSmall">Kunne ikke laste program</Text>
        <Button mode="contained" onPress={loadRecommendation} style={styles.retryButton}>
          Prøv igjen
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Anbefalt program for deg
        </Text>

        <Card style={styles.card}>
          <Card.Title title={recommendation.program.name} titleVariant="titleLarge" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.description}>
              {recommendation.program.description}
            </Text>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Varighet:
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {recommendation.program.duration_weeks} uker, 2 økter per uke
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Start-intensitet:
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {startIntensity}g/t
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Hvorfor dette programmet?" titleVariant="titleMedium" />
          <Card.Content>
            <Text variant="bodyMedium">{recommendation.reasoning}</Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleStartProgram}
          style={styles.button}
          disabled={isStarting}
          loading={isStarting}
        >
          Start dette programmet
        </Button>

        <Button
          mode="outlined"
          onPress={handleViewAllPrograms}
          style={styles.button}
          disabled={isStarting}
        >
          Se alle programmer
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  retryButton: {
    marginTop: 16,
  },
  title: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666666',
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: '500',
  },
  button: {
    marginVertical: 8,
  },
});
