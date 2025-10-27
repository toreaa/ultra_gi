/**
 * DiscomfortModal
 *
 * Modal for logging discomfort during active session.
 * Features 1-5 severity scale, optional symptom type, and notes.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, Text, Button, TextInput, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DiscomfortModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (severity: number, symptom?: string, notes?: string) => void;
}

const SEVERITY_LEVELS = [
  { level: 1, label: 'Veldig lett', color: '#FFB74D' },
  { level: 2, label: 'Lett', color: '#FF9800' },
  { level: 3, label: 'Moderat', color: '#FF6F00' },
  { level: 4, label: 'Kraftig', color: '#E65100' },
  { level: 5, label: 'Veldig kraftig', color: '#BF360C' },
];

const SYMPTOM_TYPES = [
  'Kvalme',
  'Kramper',
  'Oppblåsthet',
  'Diaré',
  'Annet',
];

export const DiscomfortModal: React.FC<DiscomfortModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [symptom, setSymptom] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSubmit = () => {
    if (selectedSeverity) {
      onSubmit(
        selectedSeverity,
        symptom || undefined,
        notes || undefined
      );
      // Reset form
      setSelectedSeverity(null);
      setSymptom('');
      setNotes('');
      onDismiss();
    }
  };

  const handleCancel = () => {
    // Reset form on cancel
    setSelectedSeverity(null);
    setSymptom('');
    setNotes('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="alert-circle" size={28} color="#FF6F00" />
          <Text variant="titleLarge" style={styles.title}>
            Logg ubehag
          </Text>
        </View>

        {/* Severity Scale */}
        <Text variant="bodyMedium" style={styles.sectionLabel}>
          Alvorlighetsgrad *
        </Text>
        <View style={styles.severityRow}>
          {SEVERITY_LEVELS.map(({ level, label, color }) => (
            <View key={level} style={styles.severityItem}>
              <Button
                mode={selectedSeverity === level ? 'contained' : 'outlined'}
                onPress={() => setSelectedSeverity(level)}
                style={[
                  styles.severityButton,
                  selectedSeverity === level && { backgroundColor: color },
                ]}
                contentStyle={styles.severityButtonContent}
                labelStyle={styles.severityLabel}
              >
                {level}
              </Button>
              <Text variant="bodySmall" style={styles.severityLabelText}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* Symptom Type Dropdown */}
        <Text variant="bodyMedium" style={styles.sectionLabel}>
          Type (valgfritt)
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.symptomButton}
              contentStyle={styles.symptomButtonContent}
            >
              {symptom || 'Velg type'}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSymptom('');
              setMenuVisible(false);
            }}
            title="(Ingen)"
          />
          {SYMPTOM_TYPES.map((type) => (
            <Menu.Item
              key={type}
              onPress={() => {
                setSymptom(type);
                setMenuVisible(false);
              }}
              title={type}
            />
          ))}
        </Menu>

        {/* Notes */}
        <Text variant="bodyMedium" style={styles.sectionLabel}>
          Notater (valgfritt)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholder="F.eks. 'Oppstod 10 min etter gel'"
          style={styles.notesInput}
          mode="outlined"
        />

        {/* Actions */}
        <View style={styles.actions}>
          <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
            Avbryt
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!selectedSeverity}
            style={styles.submitButton}
          >
            Logg ubehag
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 12,
    fontWeight: '600',
    color: '#212121',
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
    fontWeight: '500',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  severityItem: {
    flex: 1,
    alignItems: 'center',
  },
  severityButton: {
    width: '100%',
    borderRadius: 8,
  },
  severityButtonContent: {
    paddingVertical: 8,
  },
  severityLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  severityLabelText: {
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
  symptomButton: {
    marginBottom: 8,
  },
  symptomButtonContent: {
    paddingVertical: 8,
  },
  notesInput: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6F00',
  },
});
