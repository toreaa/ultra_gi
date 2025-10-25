/**
 * EmptyState Component
 *
 * Reusable component for displaying empty state messages.
 * Used when lists or collections have no data.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={80} color="#BDBDBD" style={styles.icon} />
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 24,
    maxWidth: 300,
  },
  button: {
    marginTop: 8,
  },
});
