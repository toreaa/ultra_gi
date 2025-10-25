# Epic 5: Session Mode - Test Scenarios

**Epic:** EPIC-5 "Økt-modus" (Session Mode)
**Priority:** P0 (CRITICAL)
**Test Type:** Functional, Integration, Performance, Reliability
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## Test Overview

Epic 5 is the **CRITICAL PATH** for GI Diary's value proposition. These test scenarios validate:
1. ✅ Background timer reliability (2-4 hours)
2. ✅ Crash recovery system (Winston's implementation)
3. ✅ Quick logging (<5 seconds per action)
4. ✅ Notification delivery while backgrounded
5. ✅ Data integrity and transaction safety

---

## Story 5.1: Start Session Mode

### Test Scenario 5.1.1: Start Planned Session (Happy Path)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have a planned session for today (Program: 4-Week Base, Week 1, Session 1, Target: 75min @ 30g/t)
**And** I am on the Dashboard screen
**When** I tap the "Start økt" button
**Then** I should see the Active Session Screen
**And** the timer should display "00:00:00"
**And** the timer should increment to "00:00:01" after 1 second
**And** the session log should be created in database with status='active'
**And** I should see "Neste: Maurten Gel om 25 min" (first planned intake)
**And** notifications should be scheduled for 25min, 50min, 75min
**And** auto-save should start (metadata: active_session_id stored)

**Test Data:**
- Program: 4-Week Base (id=1)
- Session: Week 1, Session 1
- Duration: 75 minutes
- Target: 30g/t
- Fuel plan: 3x Maurten Gel (25g each) at 25, 50, 75 min

**Expected Database State:**
```sql
-- session_logs table
INSERT INTO session_logs (
  id: 1,
  user_id: 1,
  planned_session_id: 1,
  started_at: '2025-10-24T10:00:00Z',
  session_status: 'active',
  duration_actual_minutes: NULL,
  ended_at: NULL
)

-- app_metadata table
INSERT INTO app_metadata (
  key: 'active_session_id',
  value: '1',
  updated_at: '2025-10-24T10:00:00Z'
)
```

---

### Test Scenario 5.1.2: Start Spontaneous Session (No Plan)
**Priority:** P1 (High)
**Type:** Functional

**Given** I am on the Dashboard screen
**And** I have NOT planned a session for today
**When** I tap "Meny" → "Start spontan økt"
**Then** I should see the Active Session Screen
**And** I should see "Uplanlagt økt" label
**And** I should NOT see "Neste inntak" section (no plan)
**And** the timer should start at "00:00:00"
**And** NO notifications should be scheduled
**And** the session log should be created with planned_session_id=NULL

**Expected Database State:**
```sql
INSERT INTO session_logs (
  id: 1,
  user_id: 1,
  planned_session_id: NULL,  -- Spontaneous
  started_at: '2025-10-24T10:00:00Z',
  session_status: 'active'
)
```

---

### Test Scenario 5.1.3: Prevent Duplicate Active Sessions (Error Case)
**Priority:** P0 (Critical)
**Type:** Validation

**Given** I have an active session running (started 30 minutes ago)
**And** I navigate back to the Dashboard
**When** I tap "Start økt" button again
**Then** I should see the RecoveryDialog
**And** the dialog should display "Du har en pågående økt fra 30min siden med X loggede hendelser. Vil du fortsette?"
**And** I should see three buttons: [Fortsett] [Forkast] [Senere]
**When** I tap "Fortsett"
**Then** I should return to the Active Session Screen
**And** the timer should resume at 00:30:XX

**Expected Behavior:**
- PREVENT creating duplicate active sessions
- Show recovery dialog instead
- Allow user to resume or discard

---

### Test Scenario 5.1.4: Timer Accuracy Test (30 minutes)
**Priority:** P0 (Critical)
**Type:** Performance

**Given** I have started a session
**When** 30 minutes (1800 seconds) elapse in real time
**Then** the timer should display between "00:29:50" and "00:30:10" (±10 seconds acceptable)
**And** the auto-save should have run 60 times (every 30s)
**And** the database should have duration_actual_minutes=30

**Acceptance Criteria:**
- Timer accuracy: ±10 seconds over 30 minutes
- Auto-save frequency: Every 30 seconds (±5s)
- UI update frequency: Every 1 second

---

### Test Scenario 5.1.5: Background Timer Test (4 hours) **POC REQUIRED**
**Priority:** P0 (BLOCKER)
**Type:** Performance, Reliability

**Given** I have started a session
**And** the app is in the foreground
**When** I press the Home button (app goes to background)
**And** I wait 4 hours
**And** I reopen the app
**Then** the timer should display between "03:59:30" and "04:00:30" (±30s acceptable for 4hr)
**And** the session should still be status='active'
**And** all auto-saves should have completed (480 saves over 4 hours)
**And** battery drain should be <40% (10%/hour × 4 hours)

**Test Environment:**
- Device: Physical Android device (NOT emulator)
- Android version: 10, 11, 12+ (test all)
- Battery optimization: Enabled (realistic scenario)
- Background: App fully backgrounded (not force-quit)

**Success Criteria:**
✅ Timer accuracy: ±30 seconds over 4 hours
✅ Battery drain: <10% per hour
✅ Auto-save reliability: 100% (no missed saves)
✅ App does not crash or get killed by OS

**Failure Conditions:**
❌ Timer stops or resets
❌ Battery drain >10%/hour
❌ App killed by OS battery optimization
❌ Missing auto-saves (data loss risk)

**BLOCKER:** If this test fails, Epic 5 CANNOT proceed until architecture is revised.

---

### Test Scenario 5.1.6: Auto-Save Integrity Test
**Priority:** P0 (Critical)
**Type:** Reliability

**Given** I have started a session
**When** the session has been running for 5 minutes
**Then** auto-save should have run 10 times (every 30s)
**And** the database should show:
```sql
SELECT duration_actual_minutes FROM session_logs WHERE id = 1;
-- Expected: 5

SELECT value FROM app_metadata WHERE key = 'active_session_id';
-- Expected: '1'
```
**And** if I query session_logs, I should see duration_actual_minutes=5 (not NULL)

---

## Story 5.2: Intake Notifications

### Test Scenario 5.2.1: Schedule Notifications for Planned Session
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have a fuel plan with 3 intakes at 25, 50, 75 minutes
**And** I start the session at 10:00:00
**When** the session starts
**Then** 3 notifications should be scheduled:
1. Trigger: 25 minutes (10:25:00) - "⏰ Tid for inntak: Maurten Gel (25g)"
2. Trigger: 50 minutes (10:50:00) - "⏰ Tid for inntak: Maurten Gel (25g)"
3. Trigger: 75 minutes (11:15:00) - "⏰ Tid for inntak: Banan (30g)"

**Verification:**
```typescript
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
expect(scheduled.length).toBe(3);
expect(scheduled[0].trigger.seconds).toBe(1500); // 25 min
expect(scheduled[1].trigger.seconds).toBe(3000); // 50 min
expect(scheduled[2].trigger.seconds).toBe(4500); // 75 min
```

---

### Test Scenario 5.2.2: Notification Delivery While Backgrounded
**Priority:** P0 (Critical)
**Type:** Integration

**Given** I have started a session with planned intake at 25 minutes
**And** the app is running in the foreground
**When** I press Home button (app goes to background)
**And** 25 minutes elapse
**Then** I should receive a notification with:
- Title: "⏰ Tid for inntak"
- Body: "Maurten Gel (25g)"
- Sound: ✅ Plays
- Vibration: ✅ Vibrates (pattern: [0, 250, 250, 250])

**Test Environment:**
- Device: Physical Android device
- Notifications permission: Granted
- Do Not Disturb: Disabled

---

### Test Scenario 5.2.3: Notification Tap Opens Active Session
**Priority:** P1 (High)
**Type:** Integration

**Given** I have an active session running
**And** the app is backgrounded
**When** I receive a notification "⏰ Tid for inntak: Maurten Gel (25g)"
**And** I tap the notification
**Then** the app should open
**And** I should see the Active Session Screen (not Dashboard)
**And** the timer should still be running
**And** I should see the "INNTAK" button ready to log

---

### Test Scenario 5.2.4: No Notifications for Spontaneous Sessions
**Priority:** P1 (High)
**Type:** Functional

**Given** I start a spontaneous session (no plan)
**When** the session starts
**Then** NO notifications should be scheduled
**And** `Notifications.getAllScheduledNotificationsAsync()` should return []

---

### Test Scenario 5.2.5: Permission Denied Handling
**Priority:** P2 (Medium)
**Type:** Error Handling

**Given** I am starting my first session
**When** the app requests notification permission
**And** I tap "Don't Allow"
**Then** I should see an alert: "Notifications disabled - Enable to get intake reminders"
**And** the session should start anyway (no crash)
**And** NO notifications should be scheduled
**And** I should still be able to log intakes manually

---

## Story 5.3: Log Intake

### Test Scenario 5.3.1: Quick Log Planned Intake (<5 seconds)
**Priority:** P0 (Critical)
**Type:** Performance, Usability

**Given** I have an active session with planned intake (Maurten Gel at 25 min)
**And** 25 minutes have elapsed (timer shows 00:25:15)
**When** I tap the "INNTAK" button
**Then** within 2 seconds:
- ✅ A toast should appear: "✓ Maurten Gel logget (25g)"
- ✅ The event should be saved to database
- ✅ The event should appear in the event list: "00:25 - ✓ Maurten Gel (25g)"
- ✅ "Neste inntak" should update to show next planned item

**Performance Target:**
- Action completion time: <2 seconds (STRICT requirement: <5s)
- Database write time: <50ms
- UI update time: <100ms

**Expected Database State:**
```sql
INSERT INTO session_events (
  session_log_id: 1,
  event_type: 'intake',
  timestamp_offset_seconds: 1515,  -- 25:15 in seconds
  actual_timestamp: '2025-10-24T10:25:15Z',
  data_json: '{
    "fuel_product_id": 1,
    "product_name": "Maurten Gel 100",
    "quantity": 1,
    "carbs_consumed": 25,
    "was_planned": true
  }'
)
```

---

### Test Scenario 5.3.2: Ad-Hoc Intake (No Plan)
**Priority:** P1 (High)
**Type:** Functional

**Given** I have an active session (spontaneous, no plan)
**And** the timer shows 00:45:30
**When** I tap the "INNTAK" button
**Then** I should see a quick-select modal with my fuel products:
- Maurten Gel 100 (25g)
- Maurten Drink Mix 320 (80g)
- Banan (30g)
- Energy Bar (40g)
**When** I tap "Maurten Gel 100"
**Then** the modal should close
**And** I should see a toast: "✓ Maurten Gel 100 logget (25g)"
**And** the event should be saved with was_planned=false

**Expected Database State:**
```sql
data_json: '{
  "fuel_product_id": 1,
  "product_name": "Maurten Gel 100",
  "quantity": 1,
  "carbs_consumed": 25,
  "was_planned": false  -- Ad-hoc intake
}'
```

---

### Test Scenario 5.3.3: Multiple Intakes in Quick Succession
**Priority:** P1 (High)
**Type:** Concurrency

**Given** I have an active session
**And** the timer shows 01:00:00
**When** I tap "INNTAK" button (logs Maurten Gel at 01:00:00)
**And** immediately tap "INNTAK" button again (logs another Gel at 01:00:03)
**Then** both events should be saved correctly
**And** I should see two separate entries in the event list:
- "01:00 - ✓ Maurten Gel (25g)"
- "01:00 - ✓ Maurten Gel (25g)"

**Database Validation:**
```sql
SELECT COUNT(*) FROM session_events WHERE session_log_id = 1 AND event_type = 'intake';
-- Expected: 2

SELECT timestamp_offset_seconds FROM session_events WHERE session_log_id = 1 ORDER BY id;
-- Expected: [3600, 3603] (3 seconds apart)
```

**Concurrency Test:**
- Validate no race conditions
- Validate no lost writes
- Validate correct timestamp ordering

---

### Test Scenario 5.3.4: Event List Display
**Priority:** P2 (Medium)
**Type:** UI/UX

**Given** I have logged 5 intake events during my session
**When** I view the Active Session Screen
**Then** I should see a scrollable event list at the bottom of the screen
**And** the events should be ordered newest-first:
```
01:30 - ✓ Maurten Gel (25g)
01:00 - ✓ Banan (30g)
00:50 - ✓ Maurten Gel (25g)
00:25 - ✓ Maurten Gel (25g)
00:15 - ✓ Energy Bar (40g)
```
**And** the list should scroll smoothly without lag

---

### Test Scenario 5.3.5: Undo Intake (Accidental Tap)
**Priority:** P2 (Medium)
**Type:** Usability

**Given** I have an active session
**And** I accidentally tap the "INNTAK" button
**When** the toast appears "✓ Maurten Gel logget (25g)"
**Then** the toast should include an "Undo" button
**And** the toast should remain visible for 5 seconds
**When** I tap "Undo" within 5 seconds
**Then** the event should be deleted from database
**And** the event should disappear from the event list
**And** I should see a confirmation toast: "Inntak fjernet"

**Note:** This feature is RECOMMENDED (not in current AC) - adds to usability

---

## Story 5.4: Log Discomfort

### Test Scenario 5.4.1: Quick Log Discomfort (1-5 Scale)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have an active session
**And** the timer shows 01:05:30
**And** I am experiencing nausea
**When** I tap the "UBEHAG" button (red/orange)
**Then** I should see a quick-select modal with 5 large buttons: [1] [2] [3] [4] [5]
**When** I tap "3"
**Then** the modal should close immediately
**And** I should see a toast: "✓ Ubehag logget (nivå 3)"
**And** the event should be saved to database

**Expected Database State:**
```sql
INSERT INTO session_events (
  session_log_id: 1,
  event_type: 'discomfort',
  timestamp_offset_seconds: 3930,  -- 1:05:30
  actual_timestamp: '2025-10-24T11:05:30Z',
  data_json: '{
    "level": 3,
    "type": null,
    "notes": null
  }'
)
```

**Performance Target:**
- Action completion: <3 seconds (from button tap to saved)

---

### Test Scenario 5.4.2: Log Discomfort with Type and Notes
**Priority:** P1 (High)
**Type:** Functional

**Given** I have tapped the "UBEHAG" button
**And** the quick-select modal is open
**When** I tap "4" (level)
**And** I select "Kvalme" from the type dropdown (optional)
**And** I type "Oppstod etter gel" in the notes field (optional)
**And** I tap "Lagre"
**Then** the event should be saved with all details

**Expected Database State:**
```sql
data_json: '{
  "level": 4,
  "type": "nausea",
  "notes": "Oppstod etter gel"
}'
```

---

### Test Scenario 5.4.3: Discomfort Display in Event List
**Priority:** P2 (Medium)
**Type:** UI/UX

**Given** I have logged discomfort (level 3, type: Kvalme)
**When** I view the Active Session Screen
**Then** I should see the event in the list:
- "01:05 - ⚠️ Ubehag (3/5) - Kvalme"
**And** the event should have a warning icon (⚠️)
**And** the event should use a distinct color (red/orange)

---

### Test Scenario 5.4.4: Multiple Discomfort Events (Pattern Tracking)
**Priority:** P1 (High)
**Type:** Functional

**Given** I have an active session
**When** I log discomfort at:
- 00:30 - Level 2 (Kvalme)
- 01:00 - Level 3 (Kvalme)
- 01:15 - Level 4 (Kvalme)
**Then** all 3 events should be saved
**And** the event list should show all 3 entries
**And** the pattern should be visible (escalating discomfort)

**Analytics Note:** This data will be used in Epic 7 (Analysis) to identify patterns

---

## Story 5.5: End Session

### Test Scenario 5.5.1: End Session (Happy Path)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have an active session running for 75 minutes
**And** I have logged 8 events (5 intakes, 3 discomforts)
**When** I tap "Avslutt økt" button in the header
**Then** I should see a confirmation dialog:
```
Avslutt økt?

Timer: 01:15:23
Inntak: 5 hendelser
Ubehag: 3 hendelser

[Avbryt] [Avslutt]
```
**When** I tap "Avslutt"
**Then** the timer should stop immediately
**And** all scheduled notifications should be cancelled
**And** the background timer task should be unregistered
**And** Winston's `clearActiveSessionMetadata()` should be called
**And** I should navigate to SessionSummaryScreen

**Expected Database State:**
```sql
UPDATE session_logs SET
  ended_at = '2025-10-24T11:15:23Z',
  duration_actual_minutes = 75,
  session_status = 'completed'
WHERE id = 1;

-- app_metadata cleanup
DELETE FROM app_metadata WHERE key = 'active_session_id';
```

---

### Test Scenario 5.5.2: Session Summary Screen
**Priority:** P1 (High)
**Type:** UI/UX

**Given** I have just ended a session (75 min, 5 intakes, 3 discomforts)
**When** I view the SessionSummaryScreen
**Then** I should see:
- ✅ "Økt fullført!" header
- ✅ Total tid: "1t 15min"
- ✅ Inntak: "5 hendelser"
- ✅ Ubehag: "3 hendelser"
- ✅ Total karbs: "125g" (calculated from intakes)
- ✅ Gj.snitt karb-rate: "40g/t" (calculated)
- ✅ Button: "Se analyse" (navigates to Story 7.1)
- ✅ Button: "Legg til notater" (navigates to Story 7.5)
- ✅ Button: "Tilbake til dashboard"

---

### Test Scenario 5.5.3: Verify Cleanup After End Session
**Priority:** P0 (Critical)
**Type:** Reliability

**Given** I have just ended a session
**When** I query the database for active sessions
**Then** I should get 0 results:
```sql
SELECT COUNT(*) FROM session_logs WHERE session_status = 'active';
-- Expected: 0
```
**And** the app_metadata should have no active_session_id:
```sql
SELECT * FROM app_metadata WHERE key = 'active_session_id';
-- Expected: No rows
```
**And** no scheduled notifications should exist:
```typescript
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
expect(scheduled.length).toBe(0);
```

---

### Test Scenario 5.5.4: Cancel End Session
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have an active session running
**When** I tap "Avslutt økt"
**And** the confirmation dialog appears
**And** I tap "Avbryt"
**Then** the dialog should close
**And** the session should continue running
**And** the timer should still be incrementing
**And** the session_status should remain 'active'

---

### Test Scenario 5.5.5: End Session with Unsaved Auto-Save
**Priority:** P1 (High)
**Type:** Data Integrity

**Given** I have an active session running
**And** the last auto-save was 20 seconds ago (next save in 10s)
**When** I tap "Avslutt økt"
**And** I confirm
**Then** the session should wait for the final auto-save to complete
**Or** the session should trigger a final save immediately before ending
**And** the duration_actual_minutes should be accurate (not 20 seconds behind)

**Validation:**
```sql
SELECT duration_actual_minutes FROM session_logs WHERE id = 1;
-- Should match actual elapsed time (not off by 20 seconds)
```

---

## Crash Recovery Test Scenarios (Winston's System)

### Test Scenario 5.CR.1: App Crash During Active Session
**Priority:** P0 (CRITICAL)
**Type:** Reliability, Integration

**Given** I have an active session running for 2 hours and 15 minutes
**And** I have logged 12 events (8 intakes, 4 discomforts)
**And** the last auto-save completed 10 seconds ago
**When** I force-quit the app (simulate crash)
**And** I wait 30 seconds
**And** I reopen the app
**Then** I should immediately see the RecoveryDialog
**And** the dialog should display:
```
Gjenopprett økt?

Du har en pågående økt fra 2t 15min siden med 12 loggede hendelser. Vil du fortsette?

📊 12 hendelser logget

[Senere] [Forkast] [Fortsett]
```

**When** I tap "Fortsett"
**Then** I should navigate to ActiveSessionScreen
**And** the timer should resume at approximately 02:15:30 (within 30 seconds)
**And** all 12 events should be visible in the event list
**And** the fuel plan should be restored (if planned session)
**And** auto-save should resume

**Database Validation:**
```sql
-- Session should still be active
SELECT session_status FROM session_logs WHERE id = 1;
-- Expected: 'active'

-- All events should be preserved
SELECT COUNT(*) FROM session_events WHERE session_log_id = 1;
-- Expected: 12

-- Metadata should exist
SELECT value FROM app_metadata WHERE key = 'active_session_id';
-- Expected: '1'
```

---

### Test Scenario 5.CR.2: Discard Recovered Session
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a recoverable session from 2 hours ago
**And** the RecoveryDialog is displayed
**When** I tap "Forkast"
**Then** I should see a confirmation dialog: "Er du sikker? Data vil gå tapt."
**When** I confirm
**Then** the session should be marked as 'abandoned'
**And** I should navigate to the Dashboard
**And** the app_metadata should be cleared

**Expected Database State:**
```sql
UPDATE session_logs SET
  session_status = 'abandoned',
  ended_at = datetime('now'),
  post_session_notes = 'Session abandoned by user'
WHERE id = 1;

DELETE FROM app_metadata WHERE key = 'active_session_id';
```

---

### Test Scenario 5.CR.3: Dismiss Recovery (Later)
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have a recoverable session
**And** the RecoveryDialog is displayed
**When** I tap "Senere"
**Then** the dialog should close
**And** I should navigate to the Dashboard (normal app flow)
**And** the session should remain status='active' (not abandoned)
**And** the next time I open the app, the RecoveryDialog should appear again

---

### Test Scenario 5.CR.4: Recovery After Out-of-Memory Kill
**Priority:** P0 (Critical)
**Type:** Reliability

**Given** I have an active session running for 3 hours
**And** the device is low on memory
**When** the OS kills the app due to memory pressure (not user action)
**And** I reopen the app after 1 hour
**Then** I should see the RecoveryDialog
**And** the elapsed time should show "4t 0min siden" (includes time app was closed)
**And** the option to recover should still be available

**Validation:**
- Session should be recoverable even after OS kill
- Elapsed time calculation should account for time app was closed
- All auto-saved data (every 30s) should be preserved

---

### Test Scenario 5.CR.5: Recovery Window Expiration (24 hours)
**Priority:** P2 (Medium)
**Type:** Business Logic

**Given** I have an active session from 25 hours ago (abandoned accidentally)
**When** I open the app
**Then** I should NOT see the RecoveryDialog
**And** the session should be automatically marked as 'abandoned'
**And** the post_session_notes should say "Session abandoned - recovery window expired"

**Business Rule:**
- Sessions older than 24 hours are considered unrecoverable
- Prevents cluttering UI with very old sessions

---

### Test Scenario 5.CR.6: Auto-Save Frequency Test
**Priority:** P0 (Critical)
**Type:** Performance

**Given** I have an active session
**When** I let the session run for 10 minutes (600 seconds)
**Then** auto-save should have run exactly 20 times (every 30 seconds)
**And** I should be able to verify in logs or metrics

**Validation Method:**
```typescript
// In development, add counter
let autoSaveCount = 0;
export async function autoSaveSessionState(id: number, elapsed: number) {
  autoSaveCount++;
  console.log(`Auto-save #${autoSaveCount} at ${elapsed}s`);
  // ... save logic
}
```

**Expected Output:**
```
Auto-save #1 at 30s
Auto-save #2 at 60s
...
Auto-save #20 at 600s
```

---

### Test Scenario 5.CR.7: Concurrent Auto-Save and Manual Logging
**Priority:** P1 (High)
**Type:** Concurrency, Data Integrity

**Given** I have an active session
**And** auto-save is scheduled to run in 2 seconds
**When** I tap "INNTAK" button (manual log)
**And** the auto-save runs simultaneously (race condition)
**Then** both operations should complete successfully
**And** no data should be lost
**And** no database lock errors should occur

**Database Validation:**
```sql
-- Event should be saved
SELECT COUNT(*) FROM session_events WHERE session_log_id = 1 AND event_type = 'intake';
-- Expected: 1

-- Auto-save should have updated duration
SELECT duration_actual_minutes FROM session_logs WHERE id = 1;
-- Expected: correct value (not NULL or 0)
```

**Technical Notes:**
- Test uses SQLite transaction isolation
- Both writes should use separate transactions
- No deadlocks should occur

---

## Performance Benchmarks

### Benchmark 5.P.1: Database Write Performance
**Target:** <50ms per write (per PRD)

**Test:**
```typescript
const start = performance.now();
await sessionManager.logIntake(productId, quantity);
const duration = performance.now() - start;
expect(duration).toBeLessThan(50); // ms
```

**Runs:**
- 100 consecutive writes
- Average: <50ms
- 95th percentile: <80ms

---

### Benchmark 5.P.2: UI Responsiveness
**Target:** <100ms for UI updates

**Test:**
- Tap "INNTAK" button
- Measure time until toast appears
- Target: <100ms

**Tool:** React DevTools Profiler or manual timestamp logging

---

### Benchmark 5.P.3: Event List Scrolling (100+ events)
**Target:** 60 FPS scrolling

**Test:**
- Create session with 100 logged events
- Scroll event list from top to bottom
- Measure FPS using React Native Performance Monitor

**Acceptance:**
- Average FPS: >55
- No dropped frames during scroll

---

## Integration Test Scenarios

### Integration 5.I.1: Full Session Lifecycle
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I am a user with a planned session (75 min @ 30g/t)
**When** I execute the following flow:
1. Start session (Story 5.1)
2. Receive notification at 25 min (Story 5.2)
3. Log intake at 25 min (Story 5.3)
4. Receive notification at 50 min (Story 5.2)
5. Log intake at 50 min (Story 5.3)
6. Log discomfort at 55 min, level 2 (Story 5.4)
7. Receive notification at 75 min (Story 5.2)
8. Log intake at 75 min (Story 5.3)
9. End session (Story 5.5)

**Then** I should see the SessionSummaryScreen showing:
- Duration: 1t 15min
- Intakes: 3 events
- Discomfort: 1 event
- Total carbs: 75g

**Database Validation:**
```sql
SELECT session_status, duration_actual_minutes FROM session_logs WHERE id = 1;
-- Expected: ('completed', 75)

SELECT COUNT(*) FROM session_events WHERE session_log_id = 1;
-- Expected: 4 (3 intakes + 1 discomfort)
```

---

### Integration 5.I.2: Background + Crash + Recovery
**Priority:** P0 (Critical)
**Type:** End-to-End, Reliability

**Given** I start a session
**And** the session runs for 1 hour in foreground
**When** I background the app for 1 hour
**And** I force-quit the app (simulate crash)
**And** I reopen the app after 30 minutes
**Then** I should see RecoveryDialog showing "2t 30min siden"
**When** I tap "Fortsett"
**Then** the timer should resume at approximately 02:30:00
**And** all logged events should be present

---

## Test Data Requirements

### Test User Profile
```json
{
  "id": 1,
  "primary_goal": "Sub-3 maraton Oslo 2025",
  "primary_gi_issue": "Kvalme",
  "weight_kg": 75,
  "onboarded_at": "2025-10-20T10:00:00Z"
}
```

### Test Fuel Products
```json
[
  { "id": 1, "name": "Maurten Gel 100", "carbs_per_serving": 25, "product_type": "gel" },
  { "id": 2, "name": "Maurten Drink Mix 320", "carbs_per_serving": 80, "product_type": "drink" },
  { "id": 3, "name": "Banan", "carbs_per_serving": 30, "product_type": "food" },
  { "id": 4, "name": "Energy Bar", "carbs_per_serving": 40, "product_type": "bar" }
]
```

### Test Program Session
```json
{
  "id": 1,
  "program_id": 1,
  "week_number": 1,
  "session_number": 1,
  "duration_planned_minutes": 75,
  "carb_rate_g_per_hour": 30
}
```

### Test Fuel Plan
```json
{
  "items": [
    { "fuel_product_id": 1, "quantity": 3, "timing_minutes": [25, 50, 75], "carbs_total": 75 }
  ],
  "total_carbs": 75,
  "target_carbs": 75,
  "match_percentage": 100
}
```

---

## Automation Recommendations

### High Priority (Automate First)
1. ✅ Test Scenario 5.1.1: Start Planned Session
2. ✅ Test Scenario 5.3.1: Quick Log Intake
3. ✅ Test Scenario 5.4.1: Log Discomfort
4. ✅ Test Scenario 5.5.1: End Session
5. ✅ Test Scenario 5.CR.1: Crash Recovery

### Medium Priority
6. Test Scenario 5.2.1: Schedule Notifications
7. Test Scenario 5.3.3: Multiple Intakes
8. Benchmark 5.P.1: Database Write Performance

### Manual Testing Required
- Test Scenario 5.1.5: **4-hour background timer** (CANNOT be automated reliably)
- Test Scenario 5.2.2: Notification delivery (requires physical device)
- Test Scenario 5.CR.4: Out-of-memory kill (OS behavior)

---

## Test Execution Order

### Phase 1: Core Functionality (Day 1-2)
1. Start session (5.1.1, 5.1.2)
2. Log intake (5.3.1, 5.3.2)
3. Log discomfort (5.4.1)
4. End session (5.5.1)

**Exit Criteria:** Basic session lifecycle works

---

### Phase 2: Critical POC (Day 3-4)
5. **Background timer test (5.1.5)** - BLOCKER
6. Crash recovery (5.CR.1, 5.CR.2)
7. Auto-save frequency (5.CR.6)

**Exit Criteria:** Epic 5 approved for implementation

---

### Phase 3: Integration (Day 5-6)
8. Notifications (5.2.1, 5.2.2, 5.2.3)
9. Full lifecycle (5.I.1)
10. Background + Crash + Recovery (5.I.2)

**Exit Criteria:** All stories integrated and working

---

### Phase 4: Performance & Edge Cases (Day 7)
11. Performance benchmarks (5.P.1, 5.P.2, 5.P.3)
12. Edge cases (5.1.3, 5.3.5, 5.5.5)
13. Concurrency (5.3.3, 5.CR.7)

**Exit Criteria:** Epic 5 ready for production

---

## Test Environment Setup

### Required Devices
- ✅ Physical Android device (Android 10+)
- ✅ Emulator for quick iteration (NOT for POC)

### Required Permissions
- ✅ NOTIFICATIONS (expo-notifications)
- ✅ SCHEDULE_EXACT_ALARM (Android 12+)
- ✅ REQUEST_IGNORE_BATTERY_OPTIMIZATIONS (optional, for testing)

### Test Data Setup Script
```typescript
// scripts/setupTestData.ts
async function setupTestData() {
  await createTestUser();
  await createTestFuelProducts();
  await createTestProgram();
  await createTestProgramSession();
  console.log('✅ Test data ready');
}
```

---

## Success Criteria

### Epic 5 Approved for Production IF:
✅ All P0 test scenarios pass
✅ Background timer POC succeeds (4 hours)
✅ Crash recovery works 100% of the time
✅ Performance targets met (<5s per action)
✅ Battery drain <10%/hour
✅ No data loss in any scenario
✅ Integration tests pass (5.I.1, 5.I.2)

### Epic 5 BLOCKED IF:
❌ Background timer fails (app killed by OS)
❌ Crash recovery fails (data loss)
❌ Battery drain >10%/hour
❌ Performance targets missed (>5s per action)

---

## Sign-off

**QA Lead:** Quinn 🎯
**Test Plan Status:** ✅ COMPLETE
**Total Test Scenarios:** 40+
**Critical Scenarios:** 15
**Estimated Test Execution Time:** 7 days (including 4-hour POC)
**Next Action:** Execute Phase 1 tests after Epic 5 implementation begins

---

_"Epic 5 is the CRITICAL PATH. These test scenarios ensure we validate every aspect of the session mode before releasing to users. The background timer POC is MANDATORY - do not proceed without it."_

_— Quinn, Senior QA Engineer_
