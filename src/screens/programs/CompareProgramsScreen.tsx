/**
 * CompareProgramsScreen
 *
 * Compare 2-3 programs side by side with progression graphs and statistics.
 * Story 7.7: Sammenlign programmer
 *
 * Features:
 * - Multi-select program list (checkboxes)
 * - Multi-series Victory Native chart (discomfort progression)
 * - Comparison table with aggregate statistics
 * - Insight card identifying best performing program
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Appbar, Card, ActivityIndicator, Checkbox, Button, DataTable } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ProgramRepository, ProgramComparisonData } from '../../database/repositories/ProgramRepository';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend } from 'victory-native';
import { Program } from '../../types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800'];

type CompareProgramsScreenProps = NativeStackScreenProps<RootStackParamList, 'ComparePrograms'>;

interface ProgramOption {
  program: Program;
  selected: boolean;
}

export const CompareProgramsScreen: React.FC<CompareProgramsScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [comparisonData, setComparisonData] = useState<ProgramComparisonData[]>([]);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const allPrograms = await ProgramRepository.getAll();

      // Filter programs with ≥50% completion
      const eligiblePrograms: ProgramOption[] = [];

      for (const program of allPrograms) {
        const progression = await ProgramRepository.getProgressionData(program.id);
        const completedCount = progression.filter((p) => p.is_completed).length;
        const completionRate = progression.length > 0 ? (completedCount / progression.length) * 100 : 0;

        if (completionRate >= 50) {
          eligiblePrograms.push({ program, selected: false });
        }
      }

      setProgramOptions(eligiblePrograms);
    } catch (error) {
      console.error('Failed to load programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgramSelection = (index: number) => {
    const updated = [...programOptions];
    const currentlySelected = updated.filter((p) => p.selected).length;

    // Allow deselection
    if (updated[index].selected) {
      updated[index].selected = false;
      setProgramOptions(updated);
      return;
    }

    // Limit to 3 selections
    if (currentlySelected >= 3) {
      return;
    }

    updated[index].selected = true;
    setProgramOptions(updated);
  };

  const handleCompare = async () => {
    try {
      setComparing(true);
      const selectedPrograms = programOptions.filter((p) => p.selected);
      const programIds = selectedPrograms.map((p) => p.program.id);

      const data = await ProgramRepository.getComparisonData(programIds);
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to compare programs:', error);
    } finally {
      setComparing(false);
    }
  };

  const resetSelection = () => {
    setProgramOptions(programOptions.map((p) => ({ ...p, selected: false })));
    setComparisonData([]);
  };

  // Find best program (lowest average discomfort)
  const getBestProgram = (): ProgramComparisonData | null => {
    if (comparisonData.length === 0) return null;

    const programsWithDiscomfort = comparisonData.filter((p) => p.avg_discomfort !== null);
    if (programsWithDiscomfort.length === 0) return null;

    return programsWithDiscomfort.reduce((best, current) => {
      if (best.avg_discomfort === null) return current;
      if (current.avg_discomfort === null) return best;
      return current.avg_discomfort < best.avg_discomfort ? current : best;
    });
  };

  const selectedCount = programOptions.filter((p) => p.selected).length;
  const canCompare = selectedCount >= 2 && selectedCount <= 3;

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Sammenlign programmer" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Laster programmer...
          </Text>
        </View>
      </View>
    );
  }

  if (programOptions.length < 2) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Sammenlign programmer" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-compare" size={64} color="#ccc" />
          <Text variant="titleLarge" style={styles.emptyText}>
            Ikke nok programmer
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Du trenger minst 2 programmer med ≥50% gjennomføring for å sammenligne.
          </Text>
        </View>
      </View>
    );
  }

  // If comparison is active, show comparison view
  if (comparisonData.length > 0) {
    const bestProgram = getBestProgram();
    const maxSessions = Math.max(...comparisonData.map((p) => p.total_sessions));

    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={resetSelection} />
          <Appbar.Content title="Sammenligning" />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Insight Card */}
          {bestProgram && (
            <Card style={[styles.card, styles.insightCard]}>
              <Card.Content>
                <View style={styles.insightHeader}>
                  <MaterialCommunityIcons name="trophy" size={32} color="#FFC107" />
                  <Text variant="titleMedium" style={styles.insightTitle}>
                    Beste program
                  </Text>
                </View>
                <Text variant="bodyLarge" style={styles.insightText}>
                  <Text style={styles.boldText}>{bestProgram.program_name}</Text> hadde lavest
                  gjennomsnittlig ubehag ({bestProgram.avg_discomfort?.toFixed(1) || 'N/A'}/5)
                  {bestProgram.success_rate >= 50 && (
                    <Text> og {bestProgram.success_rate.toFixed(0)}% suksessrate</Text>
                  )}
                  .
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Multi-series Chart */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Ubehag-progresjon
              </Text>
              <Text variant="bodySmall" style={styles.subtitle}>
                Sammenligning av ubehagsnivå over tid
              </Text>

              <View style={styles.chartContainer}>
                <VictoryChart
                  width={SCREEN_WIDTH - 64}
                  height={300}
                  padding={{ top: 40, bottom: 50, left: 60, right: 40 }}
                >
                  <VictoryAxis
                    label="Økt-nummer"
                    style={{
                      axisLabel: { fontSize: 12, padding: 30 },
                      tickLabels: { fontSize: 10 },
                    }}
                    domain={[1, maxSessions]}
                  />

                  <VictoryAxis
                    dependentAxis
                    label="Ubehag (1-5)"
                    domain={[0, 5]}
                    tickValues={[1, 2, 3, 4, 5]}
                    style={{
                      axisLabel: { fontSize: 12, padding: 40 },
                      tickLabels: { fontSize: 10 },
                    }}
                  />

                  {comparisonData.map((program, index) => {
                    const discomfortData = program.progression
                      .filter((p) => p.is_completed && p.avg_discomfort !== null)
                      .map((p) => ({
                        x: p.session_number,
                        y: p.avg_discomfort!,
                      }));

                    return (
                      <VictoryLine
                        key={program.program_id}
                        data={discomfortData}
                        style={{
                          data: {
                            stroke: CHART_COLORS[index],
                            strokeWidth: 3,
                          },
                        }}
                      />
                    );
                  })}

                  <VictoryLegend
                    x={20}
                    y={5}
                    orientation="horizontal"
                    gutter={15}
                    style={{ labels: { fontSize: 9 } }}
                    data={comparisonData.map((program, index) => ({
                      name: program.program_name.substring(0, 20),
                      symbol: { fill: CHART_COLORS[index], type: 'minus' },
                    }))}
                  />
                </VictoryChart>
              </View>
            </Card.Content>
          </Card>

          {/* Comparison Table */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Statistikk
              </Text>

              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Program</DataTable.Title>
                  <DataTable.Title numeric>Økter</DataTable.Title>
                  <DataTable.Title numeric>Ubehag</DataTable.Title>
                  <DataTable.Title numeric>Rate (g/t)</DataTable.Title>
                  <DataTable.Title numeric>Suksess</DataTable.Title>
                </DataTable.Header>

                {comparisonData.map((program, index) => (
                  <DataTable.Row key={program.program_id}>
                    <DataTable.Cell>
                      <View style={styles.programNameCell}>
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: CHART_COLORS[index] },
                          ]}
                        />
                        <Text variant="bodySmall" numberOfLines={1}>
                          {program.program_name}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodySmall">
                        {program.completed_sessions}/{program.total_sessions}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodySmall">
                        {program.avg_discomfort !== null
                          ? program.avg_discomfort.toFixed(1)
                          : '-'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodySmall">
                        {program.avg_carb_rate > 0 ? Math.round(program.avg_carb_rate) : '-'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodySmall">{program.success_rate.toFixed(0)}%</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>

              <View style={styles.tableFooter}>
                <Text variant="bodySmall" style={styles.tableNote}>
                  Ubehag: Gjennomsnitt 1-5 | Rate: Karb-rate g/t | Suksess: % økter uten ubehag
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Button mode="outlined" onPress={resetSelection} style={styles.resetButton}>
            Velg andre programmer
          </Button>
        </ScrollView>
      </View>
    );
  }

  // Selection view
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Sammenlign programmer" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Velg 2-3 programmer å sammenligne
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              {selectedCount} av 3 valgt
            </Text>

            {programOptions.map((option, index) => {
              const { program, selected } = option;

              return (
                <View key={program.id} style={styles.checkboxRow}>
                  <Checkbox.Item
                    label={program.name}
                    status={selected ? 'checked' : 'unchecked'}
                    onPress={() => toggleProgramSelection(index)}
                    disabled={!selected && selectedCount >= 3}
                    labelStyle={styles.checkboxLabel}
                  />
                  <Text variant="bodySmall" style={styles.programDescription}>
                    {program.description || 'Ingen beskrivelse'}
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleCompare}
          disabled={!canCompare || comparing}
          loading={comparing}
          style={styles.compareButton}
          icon="file-compare"
        >
          {comparing ? 'Sammenligner...' : 'Sammenlign'}
        </Button>

        {!canCompare && selectedCount < 2 && (
          <Text variant="bodySmall" style={styles.helpText}>
            Velg minst 2 programmer for å sammenligne
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  checkboxRow: {
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  programDescription: {
    color: '#999',
    marginLeft: 40,
    marginTop: -8,
  },
  compareButton: {
    marginBottom: 8,
  },
  resetButton: {
    marginBottom: 16,
  },
  helpText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 8,
  },
  insightCard: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FFC107',
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  insightTitle: {
    fontWeight: 'bold',
    color: '#F57C00',
  },
  insightText: {
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 8,
  },
  programNameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tableFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tableNote: {
    color: '#999',
    fontStyle: 'italic',
  },
});
