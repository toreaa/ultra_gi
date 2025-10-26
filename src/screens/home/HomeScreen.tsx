/**
 * HomeScreen
 *
 * Dashboard showing user's active programs.
 * Supports multiple active programs.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Appbar, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserPrograms } from '../../hooks/useUserPrograms';
import { usePausedPrograms } from '../../hooks/usePausedPrograms';
import { EmptyState } from '../../components/common/EmptyState';
import { ProgramRepository } from '../../database/repositories/ProgramRepository';
import { Program } from '../../types/database';
import { MainTabParamList, ProgramStackParamList } from '../../types/navigation';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<ProgramStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userPrograms, loading: activeLoading, error: activeError, refresh: refreshActive } = useUserPrograms();
  const { pausedPrograms, loading: pausedLoading, error: pausedError, refresh: refreshPaused } = usePausedPrograms();
  const [programDetails, setProgramDetails] = React.useState<Map<number, Program>>(new Map());

  const loading = activeLoading || pausedLoading;
  const error = activeError || pausedError;

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshActive();
      refreshPaused();
    }, [refreshActive, refreshPaused])
  );

  // Fetch program details for both active and paused programs
  React.useEffect(() => {
    const fetchProgramDetails = async () => {
      const details = new Map<number, Program>();
      const allPrograms = [...userPrograms, ...pausedPrograms];
      for (const userProgram of allPrograms) {
        try {
          const program = await ProgramRepository.getById(userProgram.program_id);
          if (program) {
            details.set(userProgram.program_id, program);
          }
        } catch (err) {
          console.error('Failed to load program details:', err);
        }
      }
      setProgramDetails(details);
    };

    if (userPrograms.length > 0 || pausedPrograms.length > 0) {
      fetchProgramDetails();
    }
  }, [userPrograms, pausedPrograms]);

  const handleResumeProgram = async (userProgramId: number) => {
    try {
      await ProgramRepository.resumeProgram(userProgramId);
      refreshActive();
      refreshPaused();
    } catch (err) {
      console.error('Failed to resume program:', err);
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
          <Appbar.Content title="Hjem" />
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
          <Appbar.Content title="Hjem" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            Kunne ikke laste aktive programmer. Prøv igjen senere.
          </Text>
        </View>
      </>
    );
  }

  if (userPrograms.length === 0 && pausedPrograms.length === 0) {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Hjem" />
        </Appbar.Header>
        <EmptyState
          icon="calendar-blank"
          message="Du har ingen aktive programmer. Start et program fra Programmer-fanen."
          actionLabel={undefined}
          onAction={undefined}
        />
      </>
    );
  }

  const renderProgramCard = (item: any, isPaused: boolean = false) => {
    const program = programDetails.get(item.program_id);
    return (
      <Card
        key={item.id}
        style={styles.card}
        mode="elevated"
        onPress={() => {
          navigation.navigate('Programs', {
            screen: 'ProgramDetail',
            params: { programId: item.program_id, userProgramId: item.id },
          });
        }}
      >
        <Card.Title
          title={program?.name || 'Laster...'}
          left={(props) => (
            <MaterialCommunityIcons
              name={isPaused ? 'pause-circle' : 'calendar-check'}
              size={24}
              color={isPaused ? '#FF9800' : '#1E88E5'}
              style={styles.icon}
            />
          )}
        />
        <Card.Content>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-start" size={16} color="#666" />
            <Text variant="bodySmall" style={styles.metaText}>
              Startet: {formatDate(item.started_at)}
            </Text>
          </View>

          {program && (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="calendar-range" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.metaText}>
                Varighet: {program.duration_weeks} {program.duration_weeks === 1 ? 'uke' : 'uker'}
              </Text>
            </View>
          )}

          <View style={styles.statusRow}>
            {isPaused ? (
              <Button
                mode="contained"
                icon="play-circle-outline"
                onPress={() => handleResumeProgram(item.id)}
                style={styles.resumeButton}
                compact
              >
                Gjenoppta
              </Button>
            ) : (
              <View style={styles.statusBadge}>
                <Text variant="labelSmall" style={styles.statusText}>
                  Aktiv
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Hjem" />
      </Appbar.Header>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {userPrograms.length > 0 && (
          <>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.headerText}>
                Mine aktive programmer
              </Text>
            </View>
            {userPrograms.map((item) => renderProgramCard(item, false))}
          </>
        )}

        {pausedPrograms.length > 0 && (
          <>
            <View style={[styles.header, userPrograms.length > 0 && styles.sectionSpacing]}>
              <Text variant="headlineSmall" style={styles.headerText}>
                Pausede programmer
              </Text>
            </View>
            {pausedPrograms.map((item) => renderProgramCard(item, true))}
          </>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  headerText: {
    fontWeight: '600',
    color: '#212121',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    marginLeft: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
  },
  statusRow: {
    marginTop: 8,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
});
