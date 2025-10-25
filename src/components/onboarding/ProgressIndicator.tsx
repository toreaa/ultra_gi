import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < current && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>
      <Text variant="bodySmall" style={styles.text}>
        {current}/{total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginRight: 12,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#1E88E5',
  },
  text: {
    color: '#666666',
    minWidth: 30,
  },
});
