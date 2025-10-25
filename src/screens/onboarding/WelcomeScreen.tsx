import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Welcome'
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Velkommen til GI Diary
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Tren magen din som du trener kroppen. GI Diary hjelper deg med strukturert
        mage-trening for optimal karbohydrat-toleranse.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Goals')}
        style={styles.button}
      >
        Kom i gang
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
  },
});
