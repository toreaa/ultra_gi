/**
 * HomeScreen
 *
 * Dashboard showing user's active programs.
 * Supports multiple active programs.
 */

import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Appbar, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserPrograms } from '../../hooks/useUserPrograms';
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
  const { userPrograms, loading, error, refresh } = useUserPrograms();
  const [programDetails, setProgramDetails] = React.useState<Map<number, Program>>(new Map());

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Fetch program details for each user program
  React.useEffect(() => {
    const fetchProgramDetails = async () => {
      const details = new Map<number, Program>();
      for (const userProgram of userPrograms) {
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

    if (userPrograms.length > 0) {
      fetchProgramDetails();
    }
  }, [userPrograms]);

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

  if (userPrograms.length === 0) {
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

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Hjem" />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerText}>
            Mine aktive programmer
          </Text>
        </View>

        <FlatList
          data={userPrograms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const program = programDetails.get(item.program_id);
            return (
              <Card
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
                      name="calendar-check"
                      size={24}
                      color="#1E88E5"
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
                    <View style={styles.statusBadge}>
                      <Text variant="labelSmall" style={styles.statusText}>
                        Aktiv
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      </View>
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontWeight: '600',
    color: '#212121',
  },
  listContent: {
    paddingBottom: 16,
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
});
