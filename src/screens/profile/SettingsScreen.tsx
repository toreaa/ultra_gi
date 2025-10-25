import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List } from 'react-native-paper';

export const SettingsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Innstillinger
        </Text>

        <List.Section>
          <List.Subheader>Profil</List.Subheader>
          <List.Item
            title="Rediger profil"
            description="Oppdater navn og vekt"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            onPress={() => {
              // TODO: Navigate to EditProfileScreen (future story)
              console.log('Edit profile - coming soon');
            }}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Om</List.Subheader>
          <List.Item
            title="Versjon"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
        </List.Section>
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
  },
  title: {
    padding: 24,
  },
});
