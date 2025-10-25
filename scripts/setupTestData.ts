/**
 * Test Data Setup Script
 *
 * Purpose: Populate database with realistic test data for development and testing
 * Usage: Run this script after database initialization to seed test data
 *
 * Test Personas:
 * 1. New User (Maria) - Just completed onboarding, no sessions
 * 2. Active User (Erik) - Has completed program, multiple sessions
 * 3. Advanced User (Kari) - Multiple programs, rich data for analysis
 *
 * Run: npx ts-node scripts/setupTestData.ts
 */

import { getDatabase } from '../src/database';

// ============================================================================
// TEST PERSONAS
// ============================================================================

export const TEST_USERS = {
  NEW_USER: {
    id: 1,
    primary_goal: 'Sub-3 maraton Oslo 2025',
    primary_gi_issue: 'Kvalme',
    weight_kg: 75,
    onboarded_at: '2025-10-20T10:00:00Z',
  },
  ACTIVE_USER: {
    id: 2,
    primary_goal: 'Ultraløp 100km',
    primary_gi_issue: 'Kramper',
    weight_kg: 68,
    onboarded_at: '2025-09-15T08:00:00Z',
  },
  ADVANCED_USER: {
    id: 3,
    primary_goal: 'Ironman trening',
    primary_gi_issue: 'Oppblåsthet',
    weight_kg: 72,
    onboarded_at: '2025-08-01T09:00:00Z',
  },
};

// ============================================================================
// FUEL PRODUCTS (Realistic Norwegian Products)
// ============================================================================

export const TEST_FUEL_PRODUCTS = [
  {
    id: 1,
    user_id: 1,
    name: 'Maurten Gel 100',
    product_type: 'gel',
    carbs_per_serving: 25,
    serving_size: '1 pakke (40g)',
    notes: 'Enkelt å fordøye, ingen mageproblemer',
  },
  {
    id: 2,
    user_id: 1,
    name: 'Maurten Drink Mix 320',
    product_type: 'drink',
    carbs_per_serving: 80,
    serving_size: '500ml',
    notes: 'Blandes med 500ml vann',
  },
  {
    id: 3,
    user_id: 1,
    name: 'Banan',
    product_type: 'food',
    carbs_per_serving: 27,
    serving_size: '1 stk (ca. 120g)',
    notes: 'Naturlig alternativ',
  },
  {
    id: 4,
    user_id: 1,
    name: 'SiS Energy Gel',
    product_type: 'gel',
    carbs_per_serving: 22,
    serving_size: '1 pakke (60ml)',
    notes: null,
  },
  {
    id: 5,
    user_id: 1,
    name: 'Energy Bar',
    product_type: 'bar',
    carbs_per_serving: 40,
    serving_size: '1 bar (65g)',
    notes: 'Passer godt før økten',
  },
  {
    id: 6,
    user_id: 1,
    name: 'Dextro Energy Tablets',
    product_type: 'food',
    carbs_per_serving: 15,
    serving_size: '3 tabletter',
    notes: 'Rask energi',
  },
  {
    id: 7,
    user_id: 1,
    name: 'PowerBar PowerGel',
    product_type: 'gel',
    carbs_per_serving: 27,
    serving_size: '1 pakke (41g)',
    notes: 'Med koffein',
  },
  {
    id: 8,
    user_id: 1,
    name: 'Honning',
    product_type: 'food',
    carbs_per_serving: 17,
    serving_size: '1 ss (20g)',
    notes: 'Naturlig sukker',
  },
];

// ============================================================================
// PROGRAM SESSIONS (4-Week Base Program)
// ============================================================================

export const TEST_PROGRAM_SESSIONS = [
  // Week 1
  { id: 1, program_id: 1, week_number: 1, session_number: 1, duration_planned_minutes: 75, carb_rate_g_per_hour: 30 },
  { id: 2, program_id: 1, week_number: 1, session_number: 2, duration_planned_minutes: 90, carb_rate_g_per_hour: 30 },

  // Week 2
  { id: 3, program_id: 1, week_number: 2, session_number: 1, duration_planned_minutes: 75, carb_rate_g_per_hour: 40 },
  { id: 4, program_id: 1, week_number: 2, session_number: 2, duration_planned_minutes: 90, carb_rate_g_per_hour: 40 },

  // Week 3
  { id: 5, program_id: 1, week_number: 3, session_number: 1, duration_planned_minutes: 90, carb_rate_g_per_hour: 50 },
  { id: 6, program_id: 1, week_number: 3, session_number: 2, duration_planned_minutes: 120, carb_rate_g_per_hour: 50 },

  // Week 4
  { id: 7, program_id: 1, week_number: 4, session_number: 1, duration_planned_minutes: 90, carb_rate_g_per_hour: 60 },
  { id: 8, program_id: 1, week_number: 4, session_number: 2, duration_planned_minutes: 120, carb_rate_g_per_hour: 60 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate realistic fuel plan based on target carbs and duration
 */
function generateFuelPlan(targetCarbs: number, durationMinutes: number): any {
  const items = [];
  let remainingCarbs = targetCarbs;

  // Prioritize gels (easy to consume during run)
  const gelCarbs = 25;
  const gelQuantity = Math.floor(remainingCarbs / gelCarbs);

  if (gelQuantity > 0) {
    const interval = Math.floor(durationMinutes / (gelQuantity + 1));
    const timings = Array.from({ length: gelQuantity }, (_, i) => (i + 1) * interval);

    items.push({
      fuel_product_id: 1, // Maurten Gel
      product_name: 'Maurten Gel 100',
      quantity: gelQuantity,
      timing_minutes: timings,
      carbs_total: gelCarbs * gelQuantity,
    });

    remainingCarbs -= gelCarbs * gelQuantity;
  }

  // Add drink mix if remaining carbs
  if (remainingCarbs > 20) {
    items.push({
      fuel_product_id: 2, // Maurten Drink Mix
      product_name: 'Maurten Drink Mix 320',
      quantity: 1,
      timing_minutes: [Math.floor(durationMinutes / 2)],
      carbs_total: 80,
    });
  }

  return {
    items,
    total_carbs: items.reduce((sum, item) => sum + item.carbs_total, 0),
    target_carbs: targetCarbs,
  };
}

/**
 * Generate realistic session events (intakes + discomforts)
 */
function generateSessionEvents(
  sessionLogId: number,
  fuelPlan: any,
  durationMinutes: number,
  discomfortLevel: number // 0 = none, 1-5 = severity
): any[] {
  const events = [];
  let eventId = 1;

  // Add intake events based on fuel plan
  for (const item of fuelPlan.items) {
    for (let i = 0; i < item.timing_minutes.length; i++) {
      const timingMinutes = item.timing_minutes[i];
      const offsetSeconds = timingMinutes * 60 + Math.floor(Math.random() * 120 - 60); // ±1 min variance

      events.push({
        id: eventId++,
        session_log_id: sessionLogId,
        event_type: 'intake',
        timestamp_offset_seconds: offsetSeconds,
        actual_timestamp: null, // Will be calculated from session start
        data_json: JSON.stringify({
          fuel_product_id: item.fuel_product_id,
          product_name: item.product_name,
          quantity: 1,
          carbs_consumed: item.carbs_total / item.quantity,
          was_planned: true,
        }),
      });
    }
  }

  // Add discomfort events based on severity
  if (discomfortLevel > 0) {
    const discomfortCount = Math.floor(Math.random() * discomfortLevel) + 1;
    const discomfortTypes = ['nausea', 'cramps', 'bloating', 'diarrhea'];

    for (let i = 0; i < discomfortCount; i++) {
      const offsetMinutes = Math.floor(Math.random() * durationMinutes);
      const offsetSeconds = offsetMinutes * 60;

      events.push({
        id: eventId++,
        session_log_id: sessionLogId,
        event_type: 'discomfort',
        timestamp_offset_seconds: offsetSeconds,
        actual_timestamp: null,
        data_json: JSON.stringify({
          level: Math.min(discomfortLevel, 5),
          type: discomfortTypes[Math.floor(Math.random() * discomfortTypes.length)],
          notes: i === 0 ? 'Oppstod plutselig' : null,
        }),
      });
    }
  }

  // Sort by timestamp
  events.sort((a, b) => a.timestamp_offset_seconds - b.timestamp_offset_seconds);

  return events;
}

// ============================================================================
// DATABASE POPULATION FUNCTIONS
// ============================================================================

/**
 * Create test users
 */
async function createTestUsers(db: any) {
  console.log('📝 Creating test users...');

  for (const user of Object.values(TEST_USERS)) {
    await db.runAsync(
      `INSERT INTO users (id, primary_goal, primary_gi_issue, weight_kg, onboarded_at, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [user.id, user.primary_goal, user.primary_gi_issue, user.weight_kg, user.onboarded_at]
    );
  }

  console.log(`✅ Created ${Object.keys(TEST_USERS).length} test users`);
}

/**
 * Create test fuel products
 */
async function createTestFuelProducts(db: any) {
  console.log('📝 Creating test fuel products...');

  for (const product of TEST_FUEL_PRODUCTS) {
    await db.runAsync(
      `INSERT INTO fuel_products (id, user_id, name, product_type, carbs_per_serving, serving_size, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        product.id,
        product.user_id,
        product.name,
        product.product_type,
        product.carbs_per_serving,
        product.serving_size,
        product.notes,
      ]
    );
  }

  console.log(`✅ Created ${TEST_FUEL_PRODUCTS.length} test fuel products`);
}

/**
 * Create test program sessions (already seeded in migration, but can add more)
 */
async function createTestProgramSessions(db: any) {
  console.log('📝 Verifying program sessions...');

  const count = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM program_sessions WHERE program_id = 1'
  );

  if (count.count === 0) {
    console.log('⚠️  No program sessions found. Running migration first...');
    return;
  }

  console.log(`✅ Found ${count.count} program sessions for 4-Week Base`);
}

/**
 * Create user program enrollment
 */
async function enrollUserInProgram(db: any, userId: number, programId: number, status: string = 'active') {
  console.log(`📝 Enrolling user ${userId} in program ${programId}...`);

  await db.runAsync(
    `INSERT INTO user_programs (user_id, program_id, started_at, status, created_at)
     VALUES (?, ?, datetime('now', '-2 weeks'), ?, datetime('now'))`,
    [userId, programId, status]
  );

  console.log(`✅ User ${userId} enrolled in program ${programId} (${status})`);
}

/**
 * Create completed session with realistic data
 */
async function createCompletedSession(
  db: any,
  userId: number,
  programSessionId: number,
  weekAgo: number = 0,
  discomfortLevel: number = 0
) {
  console.log(`📝 Creating completed session (program_session_id: ${programSessionId})...`);

  // Get program session details
  const programSession = await db.getFirstAsync(
    'SELECT * FROM program_sessions WHERE id = ?',
    [programSessionId]
  );

  if (!programSession) {
    console.error(`❌ Program session ${programSessionId} not found`);
    return;
  }

  const targetCarbs = Math.floor((programSession.carb_rate_g_per_hour * programSession.duration_planned_minutes) / 60);
  const fuelPlan = generateFuelPlan(targetCarbs, programSession.duration_planned_minutes);

  // Create planned session
  const plannedSessionResult = await db.runAsync(
    `INSERT INTO planned_sessions (user_id, program_session_id, scheduled_for, fuel_plan_json, created_at)
     VALUES (?, ?, datetime('now', '-${weekAgo} weeks'), ?, datetime('now', '-${weekAgo} weeks'))`,
    [userId, programSessionId, JSON.stringify(fuelPlan)]
  );

  const plannedSessionId = plannedSessionResult.lastInsertRowId;

  // Create session log
  const startedAt = new Date();
  startedAt.setDate(startedAt.getDate() - (weekAgo * 7));
  startedAt.setHours(10, 0, 0, 0);

  const endedAt = new Date(startedAt);
  endedAt.setMinutes(endedAt.getMinutes() + programSession.duration_planned_minutes);

  const sessionLogResult = await db.runAsync(
    `INSERT INTO session_logs (
      user_id, planned_session_id, started_at, ended_at,
      duration_actual_minutes, session_status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'completed', ?)`,
    [
      userId,
      plannedSessionId,
      startedAt.toISOString(),
      endedAt.toISOString(),
      programSession.duration_planned_minutes,
      startedAt.toISOString(),
    ]
  );

  const sessionLogId = sessionLogResult.lastInsertRowId;

  // Create session events
  const events = generateSessionEvents(
    sessionLogId,
    fuelPlan,
    programSession.duration_planned_minutes,
    discomfortLevel
  );

  for (const event of events) {
    const actualTimestamp = new Date(startedAt);
    actualTimestamp.setSeconds(actualTimestamp.getSeconds() + event.timestamp_offset_seconds);

    await db.runAsync(
      `INSERT INTO session_events (
        session_log_id, event_type, timestamp_offset_seconds, actual_timestamp, data_json, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [
        event.session_log_id,
        event.event_type,
        event.timestamp_offset_seconds,
        actualTimestamp.toISOString(),
        event.data_json,
      ]
    );
  }

  console.log(
    `✅ Created session ${sessionLogId} with ${events.length} events (${events.filter(e => e.event_type === 'intake').length} intakes, ${events.filter(e => e.event_type === 'discomfort').length} discomforts)`
  );
}

/**
 * Create active session (for testing crash recovery)
 */
async function createActiveSession(db: any, userId: number, programSessionId: number) {
  console.log(`📝 Creating active session (for crash recovery testing)...`);

  const programSession = await db.getFirstAsync(
    'SELECT * FROM program_sessions WHERE id = ?',
    [programSessionId]
  );

  const targetCarbs = Math.floor((programSession.carb_rate_g_per_hour * programSession.duration_planned_minutes) / 60);
  const fuelPlan = generateFuelPlan(targetCarbs, programSession.duration_planned_minutes);

  // Create planned session
  const plannedSessionResult = await db.runAsync(
    `INSERT INTO planned_sessions (user_id, program_session_id, scheduled_for, fuel_plan_json, created_at)
     VALUES (?, ?, datetime('now'), ?, datetime('now'))`,
    [userId, programSessionId, JSON.stringify(fuelPlan)]
  );

  const plannedSessionId = plannedSessionResult.lastInsertRowId;

  // Create active session (started 2 hours ago)
  const startedAt = new Date();
  startedAt.setHours(startedAt.getHours() - 2);

  const sessionLogResult = await db.runAsync(
    `INSERT INTO session_logs (
      user_id, planned_session_id, started_at, duration_actual_minutes, session_status, created_at
    ) VALUES (?, ?, ?, ?, 'active', ?)`,
    [userId, plannedSessionId, startedAt.toISOString(), 120, startedAt.toISOString()]
  );

  const sessionLogId = sessionLogResult.lastInsertRowId;

  // Add some events (simulate partial completion)
  const partialEvents = generateSessionEvents(sessionLogId, fuelPlan, 120, 1).slice(0, 8);

  for (const event of partialEvents) {
    const actualTimestamp = new Date(startedAt);
    actualTimestamp.setSeconds(actualTimestamp.getSeconds() + event.timestamp_offset_seconds);

    await db.runAsync(
      `INSERT INTO session_events (
        session_log_id, event_type, timestamp_offset_seconds, actual_timestamp, data_json, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [
        event.session_log_id,
        event.event_type,
        event.timestamp_offset_seconds,
        actualTimestamp.toISOString(),
        event.data_json,
      ]
    );
  }

  // Set metadata for crash recovery
  await db.runAsync(
    `INSERT INTO app_metadata (key, value, updated_at)
     VALUES ('active_session_id', ?, datetime('now'))`,
    [sessionLogId.toString()]
  );

  console.log(`✅ Created active session ${sessionLogId} with ${partialEvents.length} events (for crash recovery testing)`);
}

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================

export async function setupTestData() {
  console.log('🚀 Setting up test data for GI Diary...\n');

  try {
    const db = await getDatabase();

    // 1. Create test users
    await createTestUsers(db);
    console.log('');

    // 2. Create test fuel products
    await createTestFuelProducts(db);
    console.log('');

    // 3. Verify program sessions (seeded in migration)
    await createTestProgramSessions(db);
    console.log('');

    // 4. Enroll users in programs
    await enrollUserInProgram(db, TEST_USERS.NEW_USER.id, 1, 'active');
    await enrollUserInProgram(db, TEST_USERS.ACTIVE_USER.id, 1, 'active');
    await enrollUserInProgram(db, TEST_USERS.ADVANCED_USER.id, 1, 'completed');
    console.log('');

    // 5. Create completed sessions for ACTIVE_USER (Erik)
    console.log('📝 Creating completed sessions for Erik (Active User)...');

    // Week 1 sessions (2 weeks ago) - Low discomfort
    await createCompletedSession(db, TEST_USERS.ACTIVE_USER.id, 1, 2, 1); // Week 1, Session 1
    await createCompletedSession(db, TEST_USERS.ACTIVE_USER.id, 2, 2, 2); // Week 1, Session 2

    // Week 2 sessions (1 week ago) - Moderate discomfort
    await createCompletedSession(db, TEST_USERS.ACTIVE_USER.id, 3, 1, 2); // Week 2, Session 1
    await createCompletedSession(db, TEST_USERS.ACTIVE_USER.id, 4, 1, 3); // Week 2, Session 2

    console.log('');

    // 6. Create completed sessions for ADVANCED_USER (Kari) - Full program
    console.log('📝 Creating completed sessions for Kari (Advanced User)...');

    // Week 1
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 1, 4, 1);
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 2, 4, 1);

    // Week 2
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 3, 3, 2);
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 4, 3, 2);

    // Week 3
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 5, 2, 3);
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 6, 2, 2);

    // Week 4
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 7, 1, 1);
    await createCompletedSession(db, TEST_USERS.ADVANCED_USER.id, 8, 1, 1);

    console.log('');

    // 7. Create active session for NEW_USER (Maria) - For crash recovery testing
    console.log('📝 Creating active session for Maria (New User) - Crash recovery test...');
    await createActiveSession(db, TEST_USERS.NEW_USER.id, 1);
    console.log('');

    // Summary
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ TEST DATA SETUP COMPLETE!\n');
    console.log('📊 Summary:');
    console.log('   • 3 test users created');
    console.log('   • 8 fuel products created');
    console.log('   • Maria (New User): 1 active session (crash recovery test)');
    console.log('   • Erik (Active User): 4 completed sessions');
    console.log('   • Kari (Advanced User): 8 completed sessions (full program)');
    console.log('');
    console.log('🎯 Test Scenarios Available:');
    console.log('   1. Onboarding flow (use Maria)');
    console.log('   2. Crash recovery (Maria has active session)');
    console.log('   3. Session analysis (Erik has 4 sessions)');
    console.log('   4. Program progression (Kari completed full program)');
    console.log('   5. Fuel library (8 products available)');
    console.log('');
    console.log('🔐 Login as:');
    console.log('   • Maria (ID: 1) - New user with active session');
    console.log('   • Erik (ID: 2) - Active user with history');
    console.log('   • Kari (ID: 3) - Advanced user with full data');
    console.log('════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  setupTestData()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
