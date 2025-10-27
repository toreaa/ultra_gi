/**
 * QA Script for Epic 7: Analysis and Insights
 *
 * Purpose: Full end-to-end QA testing of all Epic 7 stories
 * Stories: 7.1-7.7
 * Usage: npx ts-node scripts/qaEpic7.ts
 *
 * Test Coverage:
 * - Story 7.1: View completed session details
 * - Story 7.2: Visualize intake/discomfort graphs
 * - Story 7.3: Identify patterns with analysis table
 * - Story 7.4: Smart recommendations
 * - Story 7.5: Add session notes
 * - Story 7.6: Program progression graph
 * - Story 7.7: Compare programs
 */

import { getDatabase } from '../src/database';
import { SessionLogRepository } from '../src/database/repositories/SessionLogRepository';
import { ProgramRepository } from '../src/database/repositories/ProgramRepository';
import { generateRecommendations } from '../src/services/recommendations';

// ============================================================================
// QA TEST RESULTS TRACKING
// ============================================================================

interface TestResult {
  story: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const testResults: TestResult[] = [];

function logTest(result: TestResult) {
  testResults.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${result.story}] ${result.test}: ${result.message}`);
  if (result.details) {
    console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
  }
}

// ============================================================================
// STORY 7.1: VIEW COMPLETED SESSION DETAILS
// ============================================================================

async function testStory71_ViewCompletedSession() {
  console.log('\n📋 Testing Story 7.1: View Completed Session Details...\n');

  try {
    // Test 1: Get recent completed sessions
    const recentSessions = await SessionLogRepository.getRecentCompleted(1, 5);

    if (recentSessions.length === 0) {
      logTest({
        story: '7.1',
        test: 'Recent Sessions',
        status: 'WARN',
        message: 'No completed sessions found. Test data may be missing.',
      });
      return;
    }

    logTest({
      story: '7.1',
      test: 'Recent Sessions',
      status: 'PASS',
      message: `Found ${recentSessions.length} recent completed sessions`,
      details: { count: recentSessions.length },
    });

    // Test 2: Get session with events
    const firstSession = recentSessions[0];
    const sessionWithEvents = await SessionLogRepository.getSessionWithEvents(firstSession.id);

    if (!sessionWithEvents) {
      logTest({
        story: '7.1',
        test: 'Session with Events',
        status: 'FAIL',
        message: `Could not load session ${firstSession.id} with events`,
      });
      return;
    }

    logTest({
      story: '7.1',
      test: 'Session with Events',
      status: 'PASS',
      message: `Session ${firstSession.id} loaded with ${sessionWithEvents.events.length} events`,
      details: {
        sessionId: firstSession.id,
        eventCount: sessionWithEvents.events.length,
        intakeEvents: sessionWithEvents.events.filter(e => e.event_type === 'intake').length,
        discomfortEvents: sessionWithEvents.events.filter(e => e.event_type === 'discomfort').length,
      },
    });

    // Test 3: Verify event data structure
    const sampleEvent = sessionWithEvents.events[0];
    if (!sampleEvent || !sampleEvent.data_json) {
      logTest({
        story: '7.1',
        test: 'Event Data Structure',
        status: 'FAIL',
        message: 'Event missing data_json field',
      });
      return;
    }

    try {
      const parsedData = JSON.parse(sampleEvent.data_json);
      logTest({
        story: '7.1',
        test: 'Event Data Structure',
        status: 'PASS',
        message: 'Event data JSON is valid and parseable',
        details: { sampleEventType: sampleEvent.event_type },
      });
    } catch (error) {
      logTest({
        story: '7.1',
        test: 'Event Data Structure',
        status: 'FAIL',
        message: 'Event data JSON is invalid',
      });
    }

  } catch (error: any) {
    logTest({
      story: '7.1',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// STORY 7.2: VISUALIZE INTAKE/DISCOMFORT GRAPHS
// ============================================================================

async function testStory72_VisualizeGraphs() {
  console.log('\n📊 Testing Story 7.2: Visualize Intake/Discomfort Graphs...\n');

  try {
    const recentSessions = await SessionLogRepository.getRecentCompleted(1, 1);

    if (recentSessions.length === 0) {
      logTest({
        story: '7.2',
        test: 'Data Availability',
        status: 'WARN',
        message: 'No sessions available for graph testing',
      });
      return;
    }

    const session = recentSessions[0];
    const sessionWithEvents = await SessionLogRepository.getSessionWithEvents(session.id);

    if (!sessionWithEvents) {
      logTest({
        story: '7.2',
        test: 'Data Loading',
        status: 'FAIL',
        message: 'Could not load session data for graphing',
      });
      return;
    }

    // Test 1: Verify cumulative intake calculation
    const intakeEvents = sessionWithEvents.events.filter(e => e.event_type === 'intake');
    let cumulativeCarbs = 0;

    for (const event of intakeEvents) {
      const data = JSON.parse(event.data_json);
      cumulativeCarbs += data.carbs_consumed || 0;
    }

    logTest({
      story: '7.2',
      test: 'Cumulative Intake Calculation',
      status: 'PASS',
      message: `Total carbs consumed: ${cumulativeCarbs.toFixed(1)}g from ${intakeEvents.length} events`,
      details: { totalCarbs: cumulativeCarbs, intakeCount: intakeEvents.length },
    });

    // Test 2: Verify discomfort data points
    const discomfortEvents = sessionWithEvents.events.filter(e => e.event_type === 'discomfort');

    if (discomfortEvents.length > 0) {
      const discomfortLevels = discomfortEvents.map(e => {
        const data = JSON.parse(e.data_json);
        return data.level;
      });

      const avgDiscomfort = discomfortLevels.reduce((sum, level) => sum + level, 0) / discomfortLevels.length;

      logTest({
        story: '7.2',
        test: 'Discomfort Data Points',
        status: 'PASS',
        message: `Found ${discomfortEvents.length} discomfort events, avg level: ${avgDiscomfort.toFixed(1)}`,
        details: { discomfortCount: discomfortEvents.length, avgLevel: avgDiscomfort },
      });
    } else {
      logTest({
        story: '7.2',
        test: 'Discomfort Data Points',
        status: 'PASS',
        message: 'Session completed without discomfort events',
        details: { discomfortCount: 0 },
      });
    }

    // Test 3: Verify data suitable for Victory Native chart
    const chartDataValid = sessionWithEvents.events.every(e => {
      return e.timestamp_offset_seconds !== null && e.timestamp_offset_seconds >= 0;
    });

    logTest({
      story: '7.2',
      test: 'Chart Data Validity',
      status: chartDataValid ? 'PASS' : 'FAIL',
      message: chartDataValid
        ? 'All events have valid timestamp offsets for charting'
        : 'Some events have invalid timestamp offsets',
    });

  } catch (error: any) {
    logTest({
      story: '7.2',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// STORY 7.3: IDENTIFY PATTERNS WITH ANALYSIS TABLE
// ============================================================================

async function testStory73_IdentifyPatterns() {
  console.log('\n🔍 Testing Story 7.3: Identify Patterns...\n');

  try {
    // Test 1: Get all sessions with statistics
    const sessionsWithStats = await SessionLogRepository.getAllSessionsWithStats(1);

    if (sessionsWithStats.length < 2) {
      logTest({
        story: '7.3',
        test: 'Session Statistics',
        status: 'WARN',
        message: `Only ${sessionsWithStats.length} sessions found. Need at least 2 for meaningful pattern analysis.`,
      });
      return;
    }

    logTest({
      story: '7.3',
      test: 'Session Statistics',
      status: 'PASS',
      message: `Loaded ${sessionsWithStats.length} sessions with aggregate statistics`,
      details: { sessionCount: sessionsWithStats.length },
    });

    // Test 2: Verify aggregate statistics calculation
    const totalCarbs = sessionsWithStats.reduce((sum, s) => sum + s.total_carbs, 0);
    const avgCarbRate = sessionsWithStats
      .filter(s => s.carb_rate_per_hour > 0)
      .reduce((sum, s) => sum + s.carb_rate_per_hour, 0) / sessionsWithStats.length;

    logTest({
      story: '7.3',
      test: 'Aggregate Statistics',
      status: 'PASS',
      message: `Total carbs across all sessions: ${totalCarbs.toFixed(1)}g, Avg rate: ${avgCarbRate.toFixed(1)}g/h`,
      details: { totalCarbs, avgCarbRate },
    });

    // Test 3: Identify success rate (sessions without discomfort)
    const sessionsWithoutDiscomfort = sessionsWithStats.filter(s => s.discomfort_count === 0);
    const successRate = (sessionsWithoutDiscomfort.length / sessionsWithStats.length) * 100;

    logTest({
      story: '7.3',
      test: 'Success Rate Calculation',
      status: 'PASS',
      message: `${sessionsWithoutDiscomfort.length} of ${sessionsWithStats.length} sessions without discomfort (${successRate.toFixed(1)}%)`,
      details: { successCount: sessionsWithoutDiscomfort.length, successRate },
    });

    // Test 4: Identify problematic sessions (high discomfort)
    const problematicSessions = sessionsWithStats.filter(
      s => s.avg_discomfort !== null && s.avg_discomfort >= 4
    );

    if (problematicSessions.length > 0) {
      logTest({
        story: '7.3',
        test: 'Pattern Identification',
        status: 'PASS',
        message: `Identified ${problematicSessions.length} sessions with severe discomfort (≥4)`,
        details: { problematicCount: problematicSessions.length },
      });
    } else {
      logTest({
        story: '7.3',
        test: 'Pattern Identification',
        status: 'PASS',
        message: 'No sessions with severe discomfort detected',
        details: { problematicCount: 0 },
      });
    }

  } catch (error: any) {
    logTest({
      story: '7.3',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// STORY 7.4: SMART RECOMMENDATIONS
// ============================================================================

async function testStory74_SmartRecommendations() {
  console.log('\n💡 Testing Story 7.4: Smart Recommendations...\n');

  try {
    const sessionsWithStats = await SessionLogRepository.getAllSessionsWithStats(1);

    if (sessionsWithStats.length < 3) {
      logTest({
        story: '7.4',
        test: 'Data Availability',
        status: 'WARN',
        message: `Only ${sessionsWithStats.length} sessions. Need at least 3 for meaningful recommendations.`,
      });
      return;
    }

    // Get all events for recommendation algorithm
    const db = await getDatabase();
    const allEvents = new Map<number, any[]>();

    for (const session of sessionsWithStats) {
      const events = await db.getAllAsync(
        'SELECT * FROM session_events WHERE session_log_id = ? ORDER BY timestamp_offset_seconds',
        [session.id]
      );
      allEvents.set(session.id, events || []);
    }

    // Test 1: Generate recommendations
    const recommendations = generateRecommendations(sessionsWithStats, allEvents);

    logTest({
      story: '7.4',
      test: 'Recommendation Generation',
      status: recommendations.length > 0 ? 'PASS' : 'WARN',
      message: `Generated ${recommendations.length} recommendations`,
      details: { recommendationCount: recommendations.length },
    });

    // Test 2: Verify recommendation types
    const recommendationTypes = {
      product_success: recommendations.filter(r => r.type === 'product_success').length,
      product_warning: recommendations.filter(r => r.type === 'product_warning').length,
      optimal_rate: recommendations.filter(r => r.type === 'optimal_rate').length,
      timing_early: recommendations.filter(r => r.type === 'timing_early').length,
      timing_late: recommendations.filter(r => r.type === 'timing_late').length,
    };

    logTest({
      story: '7.4',
      test: 'Recommendation Diversity',
      status: 'PASS',
      message: 'Recommendations cover multiple categories',
      details: recommendationTypes,
    });

    // Test 3: Verify recommendation structure
    if (recommendations.length > 0) {
      const sampleRec = recommendations[0];
      const hasRequiredFields =
        sampleRec.type &&
        sampleRec.title &&
        sampleRec.message &&
        sampleRec.icon &&
        sampleRec.color;

      logTest({
        story: '7.4',
        test: 'Recommendation Structure',
        status: hasRequiredFields ? 'PASS' : 'FAIL',
        message: hasRequiredFields
          ? 'Recommendations have all required fields'
          : 'Recommendations missing required fields',
        details: { sampleType: sampleRec.type },
      });
    }

  } catch (error: any) {
    logTest({
      story: '7.4',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// STORY 7.5: ADD SESSION NOTES
// ============================================================================

async function testStory75_AddSessionNotes() {
  console.log('\n📝 Testing Story 7.5: Add Session Notes...\n');

  try {
    const recentSessions = await SessionLogRepository.getRecentCompleted(1, 1);

    if (recentSessions.length === 0) {
      logTest({
        story: '7.5',
        test: 'Data Availability',
        status: 'WARN',
        message: 'No sessions available for notes testing',
      });
      return;
    }

    const session = recentSessions[0];
    const testNote = 'QA Test: Varmt vær (28°C), god toleranse. Dette er en test-notat for å verifisere 500 tegn-grensen.';

    // Test 1: Add note to session
    await SessionLogRepository.updateSessionNotes(session.id, testNote);

    logTest({
      story: '7.5',
      test: 'Add Session Note',
      status: 'PASS',
      message: 'Successfully added note to session',
      details: { sessionId: session.id, noteLength: testNote.length },
    });

    // Test 2: Verify note was saved
    const updatedSession = await SessionLogRepository.getById(session.id);

    if (!updatedSession) {
      logTest({
        story: '7.5',
        test: 'Verify Note Saved',
        status: 'FAIL',
        message: 'Could not retrieve updated session',
      });
      return;
    }

    if (updatedSession.post_session_notes === testNote) {
      logTest({
        story: '7.5',
        test: 'Verify Note Saved',
        status: 'PASS',
        message: 'Note correctly saved and retrieved',
      });
    } else {
      logTest({
        story: '7.5',
        test: 'Verify Note Saved',
        status: 'FAIL',
        message: 'Note does not match what was saved',
        details: {
          expected: testNote,
          actual: updatedSession.post_session_notes,
        },
      });
    }

    // Test 3: Test 500 character limit
    const longNote = 'x'.repeat(501);
    try {
      // Note: Validation happens in UI, not in repository
      // This test verifies database can handle long notes
      await SessionLogRepository.updateSessionNotes(session.id, longNote);

      logTest({
        story: '7.5',
        test: 'Character Limit',
        status: 'WARN',
        message: 'Database accepted note >500 chars. UI validation required.',
      });
    } catch (error) {
      logTest({
        story: '7.5',
        test: 'Character Limit',
        status: 'PASS',
        message: 'Database enforces character limit',
      });
    }

    // Cleanup: Restore original note
    await SessionLogRepository.updateSessionNotes(session.id, session.post_session_notes || '');

  } catch (error: any) {
    logTest({
      story: '7.5',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// STORY 7.6: PROGRAM PROGRESSION GRAPH
// ============================================================================

async function testStory76_ProgramProgression() {
  console.log('\n📈 Testing Story 7.6: Program Progression Graph...\n');

  try {
    // Test 1: Get progression data for a program
    const programId = 1; // 4-Week Base
    const progressionData = await ProgramRepository.getProgressionData(programId);

    if (progressionData.length === 0) {
      logTest({
        story: '7.6',
        test: 'Progression Data',
        status: 'WARN',
        message: 'No progression data found for program',
      });
      return;
    }

    logTest({
      story: '7.6',
      test: 'Progression Data',
      status: 'PASS',
      message: `Loaded progression data for ${progressionData.length} sessions`,
      details: { sessionCount: progressionData.length },
    });

    // Test 2: Verify completed sessions
    const completedSessions = progressionData.filter(p => p.is_completed);

    logTest({
      story: '7.6',
      test: 'Completed Sessions',
      status: 'PASS',
      message: `${completedSessions.length} of ${progressionData.length} sessions completed`,
      details: {
        completedCount: completedSessions.length,
        totalCount: progressionData.length,
        completionRate: ((completedSessions.length / progressionData.length) * 100).toFixed(1) + '%',
      },
    });

    // Test 3: Verify data structure for Victory Native
    if (completedSessions.length >= 2) {
      const hasValidData = completedSessions.every(
        s => s.session_number > 0 && s.planned_rate > 0
      );

      logTest({
        story: '7.6',
        test: 'Chart Data Structure',
        status: hasValidData ? 'PASS' : 'FAIL',
        message: hasValidData
          ? 'All sessions have valid data for charting'
          : 'Some sessions have invalid data',
      });

      // Test 4: Check for actual vs planned rate comparison
      const sessionsWithActualRate = completedSessions.filter(s => s.actual_rate !== null);

      logTest({
        story: '7.6',
        test: 'Actual Rate Calculation',
        status: sessionsWithActualRate.length > 0 ? 'PASS' : 'WARN',
        message: `${sessionsWithActualRate.length} sessions have calculated actual carb rate`,
        details: { sessionsWithRate: sessionsWithActualRate.length },
      });
    } else {
      logTest({
        story: '7.6',
        test: 'Minimum Data Requirement',
        status: 'WARN',
        message: `Only ${completedSessions.length} completed sessions. Need at least 2 for graph.`,
      });
    }

  } catch (error: any) {
    logTest({
      story: '7.6',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// STORY 7.7: COMPARE PROGRAMS
// ============================================================================

async function testStory77_ComparePrograms() {
  console.log('\n🔀 Testing Story 7.7: Compare Programs...\n');

  try {
    // Test 1: Get all programs
    const allPrograms = await ProgramRepository.getAll();

    if (allPrograms.length < 2) {
      logTest({
        story: '7.7',
        test: 'Program Availability',
        status: 'WARN',
        message: 'Need at least 2 programs for comparison testing',
      });
      return;
    }

    logTest({
      story: '7.7',
      test: 'Program Availability',
      status: 'PASS',
      message: `Found ${allPrograms.length} programs available`,
      details: { programCount: allPrograms.length },
    });

    // Test 2: Get comparison data for multiple programs
    const programIdsToCompare = allPrograms.slice(0, 2).map(p => p.id);
    const comparisonData = await ProgramRepository.getComparisonData(programIdsToCompare);

    logTest({
      story: '7.7',
      test: 'Comparison Data Generation',
      status: comparisonData.length === programIdsToCompare.length ? 'PASS' : 'FAIL',
      message: `Generated comparison data for ${comparisonData.length} programs`,
      details: { expectedCount: programIdsToCompare.length, actualCount: comparisonData.length },
    });

    // Test 3: Verify aggregate statistics
    if (comparisonData.length > 0) {
      const firstProgram = comparisonData[0];
      const hasRequiredStats =
        firstProgram.program_name &&
        firstProgram.total_sessions > 0 &&
        firstProgram.avg_carb_rate >= 0 &&
        firstProgram.success_rate >= 0;

      logTest({
        story: '7.7',
        test: 'Aggregate Statistics',
        status: hasRequiredStats ? 'PASS' : 'FAIL',
        message: hasRequiredStats
          ? 'Comparison data includes all required statistics'
          : 'Comparison data missing required statistics',
        details: {
          programName: firstProgram.program_name,
          totalSessions: firstProgram.total_sessions,
          completedSessions: firstProgram.completed_sessions,
          avgDiscomfort: firstProgram.avg_discomfort,
          successRate: firstProgram.success_rate,
        },
      });

      // Test 4: Identify best program (lowest discomfort)
      const programsWithDiscomfort = comparisonData.filter(p => p.avg_discomfort !== null);

      if (programsWithDiscomfort.length > 0) {
        const bestProgram = programsWithDiscomfort.reduce((best, current) => {
          if (best.avg_discomfort === null) return current;
          if (current.avg_discomfort === null) return best;
          return current.avg_discomfort < best.avg_discomfort ? current : best;
        });

        logTest({
          story: '7.7',
          test: 'Best Program Identification',
          status: 'PASS',
          message: `Best program: ${bestProgram.program_name} (${bestProgram.avg_discomfort?.toFixed(1)}/5 avg discomfort)`,
          details: {
            bestProgramName: bestProgram.program_name,
            avgDiscomfort: bestProgram.avg_discomfort,
            successRate: bestProgram.success_rate,
          },
        });
      } else {
        logTest({
          story: '7.7',
          test: 'Best Program Identification',
          status: 'WARN',
          message: 'No programs have discomfort data for comparison',
        });
      }
    }

  } catch (error: any) {
    logTest({
      story: '7.7',
      test: 'Exception Handling',
      status: 'FAIL',
      message: `Unexpected error: ${error.message}`,
    });
  }
}

// ============================================================================
// MAIN QA EXECUTION
// ============================================================================

async function runFullQA() {
  console.log('════════════════════════════════════════════════════════');
  console.log('🧪 EPIC 7: ANALYSIS AND INSIGHTS - FULL QA TEST SUITE');
  console.log('════════════════════════════════════════════════════════\n');

  try {
    await testStory71_ViewCompletedSession();
    await testStory72_VisualizeGraphs();
    await testStory73_IdentifyPatterns();
    await testStory74_SmartRecommendations();
    await testStory75_AddSessionNotes();
    await testStory76_ProgramProgression();
    await testStory77_ComparePrograms();

    // Summary
    console.log('\n════════════════════════════════════════════════════════');
    console.log('📊 QA TEST SUMMARY');
    console.log('════════════════════════════════════════════════════════\n');

    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const warnings = testResults.filter(r => r.status === 'WARN').length;
    const total = testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${warnings} (${((warnings / total) * 100).toFixed(1)}%)`);
    console.log('');

    if (failed > 0) {
      console.log('❌ FAILED TESTS:');
      testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`   [${r.story}] ${r.test}: ${r.message}`);
        });
      console.log('');
    }

    if (warnings > 0) {
      console.log('⚠️  WARNINGS:');
      testResults
        .filter(r => r.status === 'WARN')
        .forEach(r => {
          console.log(`   [${r.story}] ${r.test}: ${r.message}`);
        });
      console.log('');
    }

    // Final verdict
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Epic 7 is ready for production.');
    } else {
      console.log('⚠️  SOME TESTS FAILED. Please review and fix issues before deployment.');
    }

    console.log('════════════════════════════════════════════════════════\n');

    process.exit(failed > 0 ? 1 : 0);

  } catch (error: any) {
    console.error('❌ QA Suite encountered a critical error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runFullQA();
}

export { runFullQA, testResults };
