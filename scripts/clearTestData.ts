/**
 * Clear Test Data Script
 *
 * Purpose: Remove all test data from database (useful for resetting)
 * Usage: Run this script to clear test data and start fresh
 *
 * Run: npx ts-node scripts/clearTestData.ts
 */

import { getDatabase } from '../src/database';

export async function clearTestData() {
  console.log('🗑️  Clearing test data from GI Diary database...\n');

  try {
    const db = await getDatabase();

    // Delete in reverse order of foreign key dependencies
    console.log('📝 Deleting session_events...');
    const eventsResult = await db.runAsync('DELETE FROM session_events');
    console.log(`   ✅ Deleted ${eventsResult.changes} events`);

    console.log('📝 Deleting session_logs...');
    const logsResult = await db.runAsync('DELETE FROM session_logs');
    console.log(`   ✅ Deleted ${logsResult.changes} session logs`);

    console.log('📝 Deleting planned_sessions...');
    const plannedResult = await db.runAsync('DELETE FROM planned_sessions');
    console.log(`   ✅ Deleted ${plannedResult.changes} planned sessions`);

    console.log('📝 Deleting user_programs...');
    const userProgramsResult = await db.runAsync('DELETE FROM user_programs');
    console.log(`   ✅ Deleted ${userProgramsResult.changes} user programs`);

    console.log('📝 Deleting fuel_products...');
    const productsResult = await db.runAsync('DELETE FROM fuel_products');
    console.log(`   ✅ Deleted ${productsResult.changes} fuel products`);

    console.log('📝 Clearing app_metadata (active sessions)...');
    const metadataResult = await db.runAsync("DELETE FROM app_metadata WHERE key = 'active_session_id'");
    console.log(`   ✅ Deleted ${metadataResult.changes} metadata entries`);

    console.log('📝 Deleting users...');
    const usersResult = await db.runAsync('DELETE FROM users');
    console.log(`   ✅ Deleted ${usersResult.changes} users`);

    console.log('');
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ TEST DATA CLEARED SUCCESSFULLY!');
    console.log('');
    console.log('📊 Total records deleted:');
    console.log(`   • ${eventsResult.changes} session events`);
    console.log(`   • ${logsResult.changes} session logs`);
    console.log(`   • ${plannedResult.changes} planned sessions`);
    console.log(`   • ${userProgramsResult.changes} user program enrollments`);
    console.log(`   • ${productsResult.changes} fuel products`);
    console.log(`   • ${metadataResult.changes} metadata entries`);
    console.log(`   • ${usersResult.changes} users`);
    console.log('');
    console.log('🔄 To repopulate test data, run:');
    console.log('   npx ts-node scripts/setupTestData.ts');
    console.log('════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  clearTestData()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
