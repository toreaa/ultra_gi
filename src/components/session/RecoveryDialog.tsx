/**
 * RecoveryDialog Component
 *
 * Modal dialog shown on app startup if a recoverable session is detected
 * Provides options to: Continue, Discard, or Dismiss
 */

import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Text, Button } from 'react-native-paper';

interface RecoveryDialogProps {
  visible: boolean;
  message: string;
  eventCount: number;
  onRecover: () => void;
  onDiscard: () => void;
  onDismiss: () => void;
}

export const RecoveryDialog: FC<RecoveryDialogProps> = ({
  visible,
  message,
  eventCount,
  onRecover,
  onDiscard,
  onDismiss,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Icon icon="restore" />
        <Dialog.Title>Gjenopprett økt?</Dialog.Title>

        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>

          {eventCount > 0 && (
            <View style={styles.statsContainer}>
              <Text variant="bodySmall" style={styles.statsText}>
                📊 {eventCount} hendelser logget
              </Text>
            </View>
          )}

          <Text variant="bodySmall" style={styles.warningText}>
            Hvis du forkaster økten, går dataene tapt.
          </Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onDismiss} textColor="#666">
            Senere
          </Button>
          <Button onPress={onDiscard} textColor="#D32F2F">
            Forkast
          </Button>
          <Button onPress={onRecover} mode="contained">
            Fortsett
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statsText: {
    color: '#666',
  },
  warningText: {
    marginTop: 12,
    color: '#D32F2F',
    fontStyle: 'italic',
  },
});
