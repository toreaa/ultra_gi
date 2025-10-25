import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';

type GoalsScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Goals'
>;

interface GoalsScreenProps {
  navigation: GoalsScreenNavigationProp;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const [goal, setGoal] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleNext = () => {
    const trimmedGoal = goal.trim();
    if (trimmedGoal.length < 5 || trimmedGoal.length > 200) {
      setHasError(true);
      return;
    }
    setHasError(false);
    navigation.navigate('GIIssue', { goal: trimmedGoal });
  };

  const handleGoalChange = (text: string) => {
    setGoal(text);
    const trimmed = text.trim();
    if (hasError && trimmed.length >= 5 && trimmed.length <= 200) {
      setHasError(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Hva er målet ditt?
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          Fortell oss hva du trener mot, så vi kan gi deg best mulig veiledning.
        </Text>

        <TextInput
          mode="outlined"
          label="Ditt mål"
          placeholder="f.eks. Sub-3 maraton Oslo 2025"
          value={goal}
          onChangeText={handleGoalChange}
          multiline
          numberOfLines={3}
          error={hasError}
          style={styles.input}
        />

        <HelperText type="error" visible={hasError}>
          {goal.trim().length > 200
            ? 'Målet kan være maks 200 tegn'
            : 'Målet må være mellom 5 og 200 tegn'}
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
            onPress={handleNext}
            style={styles.button}
            disabled={goal.trim().length < 5}
          >
            Neste
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
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
