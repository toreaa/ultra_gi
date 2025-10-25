/**
 * Inspect Test Data Script
 *
 * Purpose: Display current state of test data in database (for verification)
 * Usage: Run this script to see what test data exists
 *
 * Run: npx ts-node scripts/inspectTestData.ts
 */

import { getDatabase } from '../src/database';

async function inspectTestData() {
  console.log('🔍 Inspecting GI Diary test data...\n');

  try {
    const db = await getDatabase();

    // ========================================================================
    // USERS
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('👥 USERS');
    console.log('════════════════════════════════════════════════════════');

    const users = await db.getAllAsync('SELECT * FROM users ORDER BY id');

    if (users.length === 0) {
      console.log('   ⚠️  No users found\n');
    } else {
      for (const user of users) {
        console.log(`   [${user.id}] ${user.primary_goal}`);
        console.log(`       GI Issue: ${user.primary_gi_issue}`);
        console.log(`       Weight: ${user.weight_kg}kg`);
        console.log(`       Onboarded: ${user.onboarded_at}`);
        console.log('');
      }
    }

    // ========================================================================
    // FUEL PRODUCTS
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('🍫 FUEL PRODUCTS');
    console.log('════════════════════════════════════════════════════════');

    const products = await db.getAllAsync(
      'SELECT * FROM fuel_products WHERE deleted_at IS NULL ORDER BY user_id, product_type, name'
    );

    if (products.length === 0) {
      console.log('   ⚠️  No fuel products found\n');
    } else {
      const groupedProducts = products.reduce((acc, product) => {
        if (!acc[product.user_id]) acc[product.user_id] = [];
        acc[product.user_id].push(product);
        return acc;
      }, {});

      for (const [userId, userProducts] of Object.entries(groupedProducts)) {
        console.log(`   User ${userId}: ${userProducts.length} products`);
        for (const product of userProducts) {
          console.log(`      • ${product.name} (${product.product_type}) - ${product.carbs_per_serving}g carbs`);
        }
        console.log('');
      }
    }

    // ========================================================================
    // USER PROGRAMS
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('📋 USER PROGRAM ENROLLMENTS');
    console.log('════════════════════════════════════════════════════════');

    const userPrograms = await db.getAllAsync(`
      SELECT
        up.user_id,
        up.program_id,
        p.name as program_name,
        up.status,
        up.started_at
      FROM user_programs up
      JOIN programs p ON p.id = up.program_id
      ORDER BY up.user_id, up.started_at DESC
    `);

    if (userPrograms.length === 0) {
      console.log('   ⚠️  No program enrollments found\n');
    } else {
      for (const enrollment of userPrograms) {
        console.log(`   User ${enrollment.user_id}: ${enrollment.program_name} (${enrollment.status})`);
        console.log(`      Started: ${enrollment.started_at}`);
      }
      console.log('');
    }

    // ========================================================================
    // SESSIONS SUMMARY
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('📊 SESSIONS SUMMARY');
    console.log('════════════════════════════════════════════════════════');

    const sessionSummary = await db.getAllAsync(`
      SELECT
        sl.user_id,
        sl.session_status,
        COUNT(*) as count,
        AVG(sl.duration_actual_minutes) as avg_duration
      FROM session_logs sl
      GROUP BY sl.user_id, sl.session_status
      ORDER BY sl.user_id, sl.session_status
    `);

    if (sessionSummary.length === 0) {
      console.log('   ⚠️  No sessions found\n');
    } else {
      for (const summary of sessionSummary) {
        console.log(
          `   User ${summary.user_id}: ${summary.count} ${summary.session_status} sessions (avg: ${Math.round(summary.avg_duration)}min)`
        );
      }
      console.log('');
    }

    // ========================================================================
    // DETAILED SESSION LIST
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('📝 DETAILED SESSION LIST');
    console.log('════════════════════════════════════════════════════════');

    const sessions = await db.getAllAsync(`
      SELECT
        sl.id,
        sl.user_id,
        sl.session_status,
        sl.started_at,
        sl.duration_actual_minutes,
        ps.week_number,
        ps.session_number,
        (SELECT COUNT(*) FROM session_events se WHERE se.session_log_id = sl.id) as event_count,
        (SELECT COUNT(*) FROM session_events se WHERE se.session_log_id = sl.id AND se.event_type = 'intake') as intake_count,
        (SELECT COUNT(*) FROM session_events se WHERE se.session_log_id = sl.id AND se.event_type = 'discomfort') as discomfort_count
      FROM session_logs sl
      LEFT JOIN planned_sessions pls ON pls.id = sl.planned_session_id
      LEFT JOIN program_sessions ps ON ps.id = pls.program_session_id
      ORDER BY sl.user_id, sl.started_at DESC
    `);

    if (sessions.length === 0) {
      console.log('   ⚠️  No sessions found\n');
    } else {
      let currentUserId = null;

      for (const session of sessions) {
        if (session.user_id !== currentUserId) {
          if (currentUserId !== null) console.log('');
          console.log(`   User ${session.user_id}:`);
          currentUserId = session.user_id;
        }

        const weekSession = session.week_number
          ? `Week ${session.week_number}, Session ${session.session_number}`
          : 'Spontaneous';

        const statusIcon = session.session_status === 'active' ? '🔴' : '✅';
        const duration = session.duration_actual_minutes ? `${session.duration_actual_minutes}min` : 'N/A';

        console.log(
          `      ${statusIcon} [${session.id}] ${weekSession} - ${duration} (${session.event_count} events: ${session.intake_count} intakes, ${session.discomfort_count} discomforts)`
        );
        console.log(`         Started: ${session.started_at}`);
      }
      console.log('');
    }

    // ========================================================================
    // ACTIVE SESSIONS (CRASH RECOVERY)
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('🔴 ACTIVE SESSIONS (Crash Recovery)');
    console.log('════════════════════════════════════════════════════════');

    const activeSessions = await db.getAllAsync(`
      SELECT
        sl.id,
        sl.user_id,
        sl.started_at,
        sl.duration_actual_minutes,
        (SELECT COUNT(*) FROM session_events se WHERE se.session_log_id = sl.id) as event_count,
        CAST((julianday('now') - julianday(sl.started_at)) * 24 AS INTEGER) as hours_ago
      FROM session_logs sl
      WHERE sl.session_status = 'active'
      ORDER BY sl.started_at DESC
    `);

    if (activeSessions.length === 0) {
      console.log('   ✅ No active sessions (good - no pending crash recovery)\n');
    } else {
      for (const session of activeSessions) {
        console.log(`   🔴 Session ${session.id} (User ${session.user_id})`);
        console.log(`      Started: ${session.started_at} (${session.hours_ago} hours ago)`);
        console.log(`      Duration: ${session.duration_actual_minutes || 0} minutes`);
        console.log(`      Events logged: ${session.event_count}`);
        console.log(`      Status: Can be recovered via RecoveryDialog`);
        console.log('');
      }
    }

    // Check metadata
    const metadata = await db.getFirstAsync(
      "SELECT value FROM app_metadata WHERE key = 'active_session_id'"
    );

    if (metadata) {
      console.log(`   📝 Metadata: active_session_id = ${metadata.value}`);
      console.log('');
    }

    // ========================================================================
    // STATISTICS
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('📈 STATISTICS');
    console.log('════════════════════════════════════════════════════════');

    const stats = {
      users: (await db.getFirstAsync('SELECT COUNT(*) as count FROM users')).count,
      fuelProducts: (await db.getFirstAsync('SELECT COUNT(*) as count FROM fuel_products WHERE deleted_at IS NULL')).count,
      programs: (await db.getFirstAsync('SELECT COUNT(*) as count FROM programs')).count,
      programSessions: (await db.getFirstAsync('SELECT COUNT(*) as count FROM program_sessions')).count,
      userPrograms: (await db.getFirstAsync('SELECT COUNT(*) as count FROM user_programs')).count,
      plannedSessions: (await db.getFirstAsync('SELECT COUNT(*) as count FROM planned_sessions')).count,
      sessionLogs: (await db.getFirstAsync('SELECT COUNT(*) as count FROM session_logs')).count,
      sessionEvents: (await db.getFirstAsync('SELECT COUNT(*) as count FROM session_events')).count,
      activeSessions: (await db.getFirstAsync("SELECT COUNT(*) as count FROM session_logs WHERE session_status = 'active'")).count,
    };

    console.log(`   Users: ${stats.users}`);
    console.log(`   Fuel Products: ${stats.fuelProducts}`);
    console.log(`   Programs: ${stats.programs}`);
    console.log(`   Program Sessions (templates): ${stats.programSessions}`);
    console.log(`   User Program Enrollments: ${stats.userPrograms}`);
    console.log(`   Planned Sessions: ${stats.plannedSessions}`);
    console.log(`   Session Logs: ${stats.sessionLogs} (${stats.activeSessions} active)`);
    console.log(`   Session Events: ${stats.sessionEvents}`);
    console.log('');

    // ========================================================================
    // DATA QUALITY CHECKS
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ DATA QUALITY CHECKS');
    console.log('════════════════════════════════════════════════════════');

    // Check 1: Orphaned session events
    const orphanedEvents = await db.getFirstAsync(`
      SELECT COUNT(*) as count
      FROM session_events se
      LEFT JOIN session_logs sl ON sl.id = se.session_log_id
      WHERE sl.id IS NULL
    `);

    if (orphanedEvents.count > 0) {
      console.log(`   ❌ WARNING: ${orphanedEvents.count} orphaned session events (no parent session_log)`);
    } else {
      console.log('   ✅ No orphaned session events');
    }

    // Check 2: Sessions with no events
    const emptySessions = await db.getFirstAsync(`
      SELECT COUNT(*) as count
      FROM session_logs sl
      WHERE sl.session_status = 'completed'
      AND NOT EXISTS (SELECT 1 FROM session_events se WHERE se.session_log_id = sl.id)
    `);

    if (emptySessions.count > 0) {
      console.log(`   ⚠️  INFO: ${emptySessions.count} completed sessions with no events`);
    } else {
      console.log('   ✅ All completed sessions have events');
    }

    // Check 3: Active sessions with metadata
    if (stats.activeSessions > 0) {
      if (metadata) {
        console.log(`   ✅ Active session metadata exists (active_session_id=${metadata.value})`);
      } else {
        console.log('   ⚠️  WARNING: Active session exists but no metadata (crash recovery may fail)');
      }
    } else {
      console.log('   ✅ No active sessions (no metadata needed)');
    }

    // Check 4: Fuel products for all users
    const usersWithoutProducts = await db.getFirstAsync(`
      SELECT COUNT(*) as count
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM fuel_products fp
        WHERE fp.user_id = u.id AND fp.deleted_at IS NULL
      )
    `);

    if (usersWithoutProducts.count > 0) {
      console.log(`   ⚠️  INFO: ${usersWithoutProducts.count} users have no fuel products`);
    } else {
      console.log('   ✅ All users have fuel products');
    }

    console.log('');

    // ========================================================================
    // SUMMARY & RECOMMENDATIONS
    // ========================================================================
    console.log('════════════════════════════════════════════════════════');
    console.log('🎯 SUMMARY & RECOMMENDATIONS');
    console.log('════════════════════════════════════════════════════════');

    if (stats.users === 0) {
      console.log('   ⚠️  No test data found');
      console.log('   💡 Run: npx ts-node scripts/setupTestData.ts');
    } else {
      console.log(`   ✅ Test data is populated (${stats.users} users, ${stats.sessionLogs} sessions)`);

      if (stats.activeSessions > 0) {
        console.log(`   🔴 ${stats.activeSessions} active session(s) - good for crash recovery testing`);
        console.log('   💡 Open app to see RecoveryDialog');
      }

      if (stats.sessionLogs > 5) {
        console.log('   📊 Rich data available - good for analysis features (Epic 7)');
      }

      if (stats.fuelProducts >= 5) {
        console.log('   🍫 Sufficient fuel products - good for planner testing (Epic 4)');
      }
    }

    console.log('');
    console.log('════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error inspecting test data:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  inspectTestData()
    .then(() => {
      console.log('✅ Done!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

export { inspectTestData };
