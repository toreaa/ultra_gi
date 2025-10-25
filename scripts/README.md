# Test Data Scripts

This directory contains scripts for setting up and managing realistic test data for GI Diary development and testing.

---

## 📋 Available Scripts

### 1. `setupTestData.ts`
**Purpose:** Populate database with comprehensive test data

**Features:**
- Creates 3 test user personas (Maria, Erik, Kari)
- Creates 8 realistic fuel products (Norwegian brands)
- Enrolls users in programs
- Generates completed sessions with realistic events
- Creates active session for crash recovery testing

**Usage:**
```bash
npx ts-node scripts/setupTestData.ts
```

**Test Data Created:**

| User | ID | Persona | Data |
|------|-----|---------|------|
| Maria | 1 | New User | 1 active session (crash recovery test) |
| Erik | 2 | Active User | 4 completed sessions (Week 1-2) |
| Kari | 3 | Advanced User | 8 completed sessions (full 4-week program) |

---

### 2. `clearTestData.ts`
**Purpose:** Remove all test data from database

**Usage:**
```bash
npx ts-node scripts/clearTestData.ts
```

**What it deletes:**
- All session events
- All session logs
- All planned sessions
- All user program enrollments
- All fuel products
- All users
- Active session metadata

**Note:** Does NOT delete program definitions or program_sessions (those are seed data from migrations)

---

## 🎯 Test Personas

### 👤 Maria (ID: 1) - New User
**Profile:**
- Goal: "Sub-3 maraton Oslo 2025"
- GI Issue: Kvalme (nausea)
- Weight: 75kg
- Onboarded: 2025-10-20

**Data:**
- ✅ 1 active session (started 2 hours ago)
- ✅ 8 events logged
- ✅ Has metadata for crash recovery
- 🎯 **Use for:** Crash recovery testing, onboarding flow

**Test Scenarios:**
1. Open app → Should see RecoveryDialog
2. Tap "Fortsett" → Resume active session
3. Tap "Forkast" → Abandon session

---

### 👤 Erik (ID: 2) - Active User
**Profile:**
- Goal: "Ultraløp 100km"
- GI Issue: Kramper (cramps)
- Weight: 68kg
- Onboarded: 2025-09-15

**Data:**
- ✅ 4 completed sessions (Week 1-2 of program)
- ✅ Low to moderate discomfort (1-3/5)
- ✅ Consistent fuel intake
- 🎯 **Use for:** Session analysis, pattern identification

**Test Scenarios:**
1. View program progression (Story 7.6)
2. Analyze session patterns (Story 7.3)
3. View session detail (Story 7.1)
4. Continue program (Week 3)

---

### 👤 Kari (ID: 3) - Advanced User
**Profile:**
- Goal: "Ironman trening"
- GI Issue: Oppblåsthet (bloating)
- Weight: 72kg
- Onboarded: 2025-08-01

**Data:**
- ✅ 8 completed sessions (full 4-week program)
- ✅ Program status: 'completed'
- ✅ Rich discomfort data (escalates then improves)
- ✅ Perfect for progression visualization
- 🎯 **Use for:** Program comparison, recommendations, full analysis

**Test Scenarios:**
1. Compare programs (Story 7.7)
2. View program progression (full data)
3. Get smart recommendations (Story 7.4)
4. Start new program (multi-program support)

---

## 🧪 Test Fuel Products

All test users have access to these 8 realistic fuel products:

| ID | Name | Type | Carbs | Notes |
|----|------|------|-------|-------|
| 1 | Maurten Gel 100 | gel | 25g | Most used in test data |
| 2 | Maurten Drink Mix 320 | drink | 80g | 500ml serving |
| 3 | Banan | food | 27g | Natural alternative |
| 4 | SiS Energy Gel | gel | 22g | - |
| 5 | Energy Bar | bar | 40g | Pre-workout |
| 6 | Dextro Energy Tablets | food | 15g | Quick energy |
| 7 | PowerBar PowerGel | gel | 27g | With caffeine |
| 8 | Honning | food | 17g | Natural sugar |

---

## 📊 Sample Data Examples

### Completed Session Example (Erik, Week 1, Session 1)
```json
{
  "session": {
    "duration": 75,
    "target_carbs": 38,
    "actual_carbs": 75,
    "status": "completed"
  },
  "events": [
    { "type": "intake", "time": "00:25", "product": "Maurten Gel 100", "carbs": 25 },
    { "type": "intake", "time": "00:50", "product": "Maurten Gel 100", "carbs": 25 },
    { "type": "discomfort", "time": "00:55", "level": 2, "type": "nausea" },
    { "type": "intake", "time": "01:10", "product": "Maurten Gel 100", "carbs": 25 }
  ]
}
```

### Active Session Example (Maria)
```json
{
  "session": {
    "started_at": "2 hours ago",
    "status": "active",
    "events_logged": 8,
    "can_recover": true
  },
  "metadata": {
    "active_session_id": "1",
    "last_auto_save": "10 seconds ago"
  }
}
```

---

## 🔄 Workflow Examples

### Development Workflow
```bash
# 1. Initial setup
npx ts-node scripts/setupTestData.ts

# 2. Develop features using test data
# ... code ...

# 3. Clear and reset if needed
npx ts-node scripts/clearTestData.ts
npx ts-node scripts/setupTestData.ts
```

### Testing Workflow
```bash
# 1. Setup test data
npx ts-node scripts/setupTestData.ts

# 2. Run tests
npm test

# 3. Clear after tests
npx ts-node scripts/clearTestData.ts
```

### QA Workflow
```bash
# 1. Setup fresh test data
npx ts-node scripts/clearTestData.ts
npx ts-node scripts/setupTestData.ts

# 2. Execute test scenarios (manual or automated)
# ... test ...

# 3. Keep data for inspection
# (don't clear until bugs are fixed)
```

---

## 🛠️ Customization

### Adding Custom Test Data

You can modify `setupTestData.ts` to add your own test data:

```typescript
// Example: Add a new test user
const MY_USER = {
  id: 4,
  primary_goal: 'My custom goal',
  primary_gi_issue: 'Kvalme',
  weight_kg: 70,
  onboarded_at: new Date().toISOString(),
};

// Then use it in setupTestData()
await createTestUsers(db, [MY_USER]);
```

### Creating Specific Test Scenarios

```typescript
// Example: Create session with severe discomfort
await createCompletedSession(
  db,
  TEST_USERS.NEW_USER.id,
  1, // program_session_id
  0, // weeks ago (today)
  5  // discomfort level (severe)
);
```

---

## 🧪 Integration with Tests

### Jest Example
```typescript
// test/setup.ts
import { setupTestData, clearTestData } from '../scripts/setupTestData';

beforeAll(async () => {
  await setupTestData();
});

afterAll(async () => {
  await clearTestData();
});
```

### Detox Example
```typescript
// e2e/init.js
const { setupTestData } = require('../scripts/setupTestData');

beforeAll(async () => {
  await setupTestData();
});
```

---

## 📝 Notes

### Database State
- Scripts assume migrations have been run (`runMigrations()` called)
- Programs and program_sessions should already exist from seed data
- Scripts ONLY populate user-specific data (users, fuel products, sessions)

### ID Management
- Test users use IDs 1-3 (hardcoded for consistency)
- Fuel products use IDs 1-8
- Session IDs are auto-generated (sequential)

### Realistic Data
- Session events include natural variance (±1 min for intakes)
- Discomfort levels escalate realistically (low → moderate → low)
- Fuel plans are generated using same algorithm as production code
- Timestamps use realistic dates (weeks ago)

### Performance
- `setupTestData.ts` takes ~2-5 seconds to run
- Creates ~100+ database records
- Can be run multiple times (clears existing test users first)

---

## 🐛 Troubleshooting

### "User already exists" error
**Solution:** Run `clearTestData.ts` first

### "Program session not found" error
**Solution:** Ensure migrations have been run (seed data should exist)

### "Database locked" error
**Solution:** Close any open database connections or restart dev server

### Empty fuel library
**Problem:** User ID doesn't match test data
**Solution:** Ensure you're querying with correct user_id (1, 2, or 3)

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npx ts-node scripts/setupTestData.ts` | Setup all test data |
| `npx ts-node scripts/clearTestData.ts` | Clear all test data |
| `npm run setup-test-data` | Alias (if added to package.json) |

---

## 📚 Related Documentation

- **Test Scenarios:** `docs/testing/epic-5-test-scenarios.md`
- **QA Review:** `docs/QA_REVIEW.md`
- **Database Schema:** `src/database/migrationRunner.ts`
- **Architecture:** `docs/architecture/ARCHITECT_REVIEW.md`

---

**Created by:** Quinn (QA) 🎯
**Last Updated:** 2025-10-24
**Version:** 1.0
