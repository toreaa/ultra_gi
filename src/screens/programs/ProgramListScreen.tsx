/**
 * ProgramListScreen
 *
 * Displays all available training programs.
 * Shows programs in a FlatList with loading/error/empty states.
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Appbar, Portal, Dialog, Button, Snackbar } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { usePrograms } from '../../hooks/usePrograms';
import { ProgramCard } from '../../components/program/ProgramCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Program } from '../../types/database';
import { ProgramRepository } from '../../database/repositories/ProgramRepository';

type ProgramStackParamList = {
  ProgramList: undefined;
  ProgramDetail: { programId: number };
};

type ProgramListScreenNavigationProp = NativeStackNavigationProp<ProgramStackParamList, 'ProgramList'>;

interface ProgramListScreenProps {
  navigation: ProgramListScreenNavigationProp;
}

export const ProgramListScreen: React.FC<ProgramListScreenProps> = ({ navigation }) => {
  const { programs, loading, error, refresh } = usePrograms();
  const tabNavigation = useNavigation<BottomTabNavigationProp<any>>();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // Refresh programs when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleProgramPress = (programId: number) => {
    // Navigation to ProgramDetail screen will be implemented in Story 3.3
    console.log('Program pressed:', programId);
    // navigation.navigate('ProgramDetail', { programId });
  };

  const handleStartPress = (program: Program) => {
    setSelectedProgram(program);
    setDialogVisible(true);
  };

  const handleConfirmStart = async () => {
    if (!selectedProgram) return;

    try {
      setIsStarting(true);
      await ProgramRepository.startProgram(selectedProgram.id, 1);
      setDialogVisible(false);
      setSnackbarMessage('Program startet!');
      setSnackbarVisible(true);

      // Navigate to Home tab after starting
      setTimeout(() => {
        tabNavigation.navigate('Home');
      }, 500);
    } catch (err) {
      console.error('Failed to start program:', err);
      setDialogVisible(false);
      setSnackbarMessage('Kunne ikke starte program. Prøv igjen.');
      setSnackbarVisible(true);
    } finally {
      setIsStarting(false);
      setSelectedProgram(null);
    }
  };

  const handleCancelStart = () => {
    setDialogVisible(false);
    setSelectedProgram(null);
  };

  if (loading) {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Programmer" />
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
          <Appbar.Content title="Programmer" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            Kunne ikke laste programmer. Prøv igjen senere.
          </Text>
        </View>
      </>
    );
  }

  if (programs.length === 0) {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Programmer" />
        </Appbar.Header>
        <EmptyState
          icon="calendar-blank"
          message="Ingen programmer tilgjengelige for øyeblikket."
          actionLabel={undefined}
          onAction={undefined}
        />
      </>
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Programmer" />
      </Appbar.Header>
      <View style={styles.container}>
        <FlatList
          data={programs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onPress={() => handleProgramPress(item.id)}
              onStartPress={() => handleStartPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={handleCancelStart}>
          <Dialog.Title>Start {selectedProgram?.name}?</Dialog.Title>
          <Dialog.Content>
            {selectedProgram && (
              <>
                <Text variant="bodyMedium" style={styles.dialogText}>
                  {selectedProgram.description}
                </Text>
                <View style={styles.dialogInfo}>
                  <Text variant="bodyMedium" style={styles.dialogInfoText}>
                    Varighet: {selectedProgram.duration_weeks} {selectedProgram.duration_weeks === 1 ? 'uke' : 'uker'}
                  </Text>
                  {selectedProgram.target_audience && (
                    <Text variant="bodyMedium" style={styles.dialogInfoText}>
                      Målgruppe: {selectedProgram.target_audience}
                    </Text>
                  )}
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelStart} disabled={isStarting}>
              Avbryt
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmStart}
              loading={isStarting}
              disabled={isStarting}
            >
              Start
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Success/Error Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
  listContent: {
    paddingVertical: 8,
  },
  dialogText: {
    marginBottom: 16,
    color: '#424242',
  },
  dialogInfo: {
    marginTop: 8,
  },
  dialogInfoText: {
    marginBottom: 4,
    color: '#666',
  },
});
