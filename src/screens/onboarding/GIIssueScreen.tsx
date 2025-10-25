import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, RadioButton, TextInput, Button, HelperText } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../types/navigation';

type GIIssueScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'GIIssue'
>;

type GIIssueScreenRouteProp = RouteProp<OnboardingStackParamList, 'GIIssue'>;

interface GIIssueScreenProps {
  navigation: GIIssueScreenNavigationProp;
  route: GIIssueScreenRouteProp;
}

const GI_ISSUES = [
  { label: 'Kvalme', value: 'kvalme' },
  { label: 'Kramper', value: 'kramper' },
  { label: 'Oppblåsthet', value: 'oppblåsthet' },
  { label: 'Diaré', value: 'diaré' },
  { label: 'Annet', value: 'annet' },
];

export const GIIssueScreen: React.FC<GIIssueScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [otherText, setOtherText] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleComplete = () => {
    if (!selectedIssue) {
      setHasError(true);
      return;
    }

    if (selectedIssue === 'annet' && otherText.trim().length < 3) {
      setHasError(true);
      return;
    }

    setHasError(false);

    const giIssue = selectedIssue === 'annet' ? otherText.trim() : selectedIssue;

    // Navigate to ProgramSuggestion with goal and giIssue
    navigation.navigate('ProgramSuggestion', {
      goal: route.params.goal,
      giIssue,
    });
  };

  const handleIssueChange = (value: string) => {
    setSelectedIssue(value);
    if (hasError) {
      setHasError(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Hva er din største mageutfordring?
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          Velg det problemet du opplever oftest under lange økter.
        </Text>

        <RadioButton.Group onValueChange={handleIssueChange} value={selectedIssue}>
          {GI_ISSUES.map((issue) => (
            <View key={issue.value} style={styles.radioItem}>
              <RadioButton.Item
                label={issue.label}
                value={issue.value}
                mode="android"
              />
            </View>
          ))}
        </RadioButton.Group>

        {selectedIssue === 'annet' && (
          <TextInput
            mode="outlined"
            label="Beskriv problemet"
            placeholder="f.eks. sure oppstøt"
            value={otherText}
            onChangeText={setOtherText}
            style={styles.otherInput}
            error={hasError && otherText.trim().length < 3}
          />
        )}

        <HelperText type="error" visible={hasError}>
          {!selectedIssue
            ? 'Vennligst velg et alternativ'
            : 'Beskrivelsen må være minst 3 tegn'}
        </HelperText>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Tilbake
          </Button>
          <Button
            mode="contained"
            onPress={handleComplete}
            style={styles.button}
            disabled={
              !selectedIssue ||
              (selectedIssue === 'annet' && otherText.trim().length < 3)
            }
          >
            Fullfør
          </Button>
        </View>
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
  title: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 24,
    color: '#666666',
  },
  radioItem: {
    marginBottom: 8,
  },
  otherInput: {
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
