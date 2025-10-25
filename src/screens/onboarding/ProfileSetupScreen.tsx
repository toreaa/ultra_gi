import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'ProfileSetup'
>;

type ProfileSetupScreenRouteProp = RouteProp<OnboardingStackParamList, 'ProfileSetup'>;

interface ProfileSetupScreenProps {
  navigation: ProfileSetupScreenNavigationProp;
  route: ProfileSetupScreenRouteProp;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<{ name?: string; weight?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfile = useUserStore((state) => state.updateProfile);

  const validate = (): boolean => {
    const newErrors: { name?: string; weight?: string } = {};

    if (name && name.length > 50) {
      newErrors.name = 'Navn kan ikke være lengre enn 50 tegn';
    }

    if (weight) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 30 || weightNum > 200) {
        newErrors.weight = 'Vekt må være mellom 30 og 200 kg';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await updateProfile({
        name: name.trim() || undefined,
        weight_kg: weight ? parseFloat(weight) : undefined,
      });
      // Navigation will be handled automatically by App.tsx when onboardingCompleted changes
    } catch (error) {
      console.error('Failed to update profile:', error);
      setIsSubmitting(false);
      // TODO: Show error dialog to user
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      // Mark onboarding complete without profile data
      await updateProfile({});
      // Navigation will be handled automatically by App.tsx when onboardingCompleted changes
    } catch (error) {
      console.error('Failed to skip profile:', error);
      setIsSubmitting(false);
      // TODO: Show error dialog to user
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Din profil
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Valgfritt: Hjelp oss gi deg bedre anbefalinger
        </Text>

        <TextInput
          label="Navn"
          value={name}
          onChangeText={setName}
          placeholder="f.eks. Kari"
          error={!!errors.name}
          style={styles.input}
          mode="outlined"
        />
        {errors.name && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.name}
          </Text>
        )}

        <TextInput
          label="Vekt (kg)"
          value={weight}
          onChangeText={setWeight}
          placeholder="f.eks. 65"
          keyboardType="numeric"
          error={!!errors.weight}
          style={styles.input}
          mode="outlined"
        />
        {errors.weight && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.weight}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleComplete}
          style={styles.button}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Fullfør
        </Button>

        <Button
          mode="text"
          onPress={handleSkip}
          style={styles.button}
          disabled={isSubmitting}
        >
          Hopp over
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
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    color: '#666666',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
  },
  button: {
    marginVertical: 8,
  },
});
