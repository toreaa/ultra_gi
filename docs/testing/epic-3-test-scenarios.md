# Epic 3: Gut Training Programs - Test Scenarios

**Epic:** EPIC-3 "Mage-treningsprogrammer"
**Priority:** P0 (Must-Have)
**Test Type:** Functional, Data Visualization, Multi-Program Support, Progression Tracking
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## Test Overview

Epic 3 validates the structured program system - the CORE METHODOLOGY that makes GI Diary effective. These test scenarios ensure:
1. ✅ Program browsing and selection works smoothly
2. ✅ Users can start and manage programs
3. ✅ Program details display correctly (sessions, weeks, intensity)
4. ✅ Progression tracking motivates users (progress bars, completion %)
5. ✅ Multi-program support allows experimentation
6. ✅ Program status updates correctly (active, completed, paused)

---

## Story 3.1: Program List

### Test Scenario 3.1.1: Access Program List from Navigation
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have completed onboarding
**And** I am on the MainApp
**When** I navigate to "Programmer" from main navigation
**Then** I should see the ProgramListScreen
**And** I should see screen title: "Programmer"
**And** I should see a list of available programs

**Navigation Path:** Dashboard → Programmer

---

### Test Scenario 3.1.2: Display Program Cards
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am on ProgramListScreen
**And** the database contains "4-Week Base Carb Training" program
**Then** I should see a program card displaying:
- Programnavn: "4-Week Base Carb Training"
- Kort beskrivelse: "Progressive carbohydrate tolerance training..."
- Varighet: "4 uker, 2 økter/uke" (8 total sessions)
- Intensitetsnivå: "Starter 30g/t → 60g/t"
- Target audience: "Endurance athletes new to carb training"
- "Start program" button (or "Se detaljer" if already started)

---

### Test Scenario 3.1.3: Calculate Session Count from Database
**Priority:** P1 (High)
**Type:** Data Validation

**Given** the "4-Week Base Carb Training" program has 8 sessions in program_sessions table
**When** the ProgramListScreen loads
**Then** the program card should display: "4 uker, 2 økter/uke"
**And** session count should be calculated dynamically from database

**Database Query:**
```sql
SELECT COUNT(*) FROM program_sessions WHERE program_id = 1;
-- Expected: 8
```

**Calculation:**
```typescript
const sessionsPerWeek = totalSessions / durationWeeks; // 8 / 4 = 2
```

---

### Test Scenario 3.1.4: Tap Program Card to View Details
**Priority:** P0 (Critical)
**Type:** Navigation

**Given** I am viewing ProgramListScreen
**When** I tap on "4-Week Base Carb Training" program card
**Then** I should navigate to ProgramDetailScreen (Story 3.3)
**And** I should see detailed information about the program

---

### Test Scenario 3.1.5: Start Program from List
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am viewing ProgramListScreen
**And** I have NOT started "4-Week Base Carb Training"
**When** I tap "Start program" button on the program card
**Then** I should see a confirmation dialog (Story 3.2)

---

### Test Scenario 3.1.6: Multiple Programs in List
**Priority:** P2 (Medium)
**Type:** Functional

**Given** the database contains 3 programs:
1. "4-Week Base Carb Training" (4 weeks, 8 sessions)
2. "6-Week Advanced Protocol" (6 weeks, 12 sessions)
3. "2-Week Heat Training" (2 weeks, 4 sessions)
**When** I view ProgramListScreen
**Then** all 3 programs should be displayed as cards
**And** each card should show correct duration and session count
**And** programs should be ordered by created_at DESC (newest first)

---

### Test Scenario 3.1.7: Program Already Started (Badge)
**Priority:** P1 (High)
**Type:** UI State

**Given** I have already started "4-Week Base Carb Training"
**When** I view ProgramListScreen
**Then** the program card should show:
- Badge: "Aktiv" or "Påbegynt"
- Button text changed from "Start program" to "Se progresjon" or "Fortsett"
**And** tapping the card should navigate to ProgramDetailScreen

---

### Test Scenario 3.1.8: Empty Program List (Unlikely Edge Case)
**Priority:** P3 (Low)
**Type:** Edge Case

**Given** the database contains NO active programs (is_active = 0 for all)
**When** I navigate to ProgramListScreen
**Then** I should see an empty state:
- Icon: Clipboard or program icon
- Message: "Ingen programmer tilgjengelig"
- Optional: Contact support message

**Note:** This is unlikely in production but should be handled gracefully

---

## Story 3.2: Start Program

### Test Scenario 3.2.1: Start Program - Confirmation Dialog
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am on ProgramListScreen
**And** I have NOT started "4-Week Base Carb Training"
**When** I tap "Start program" button
**Then** I should see a confirmation dialog with:
- Title: "Start 4-Week Base Carb Training?"
- Message: "Dette programmet varer 4 uker og har 8 økter. Du kan starte økter når du ønsker."
- Buttons: "Avbryt" | "Start program"

---

### Test Scenario 3.2.2: Confirm Start Program
**Priority:** P0 (Critical)
**Type:** Integration

**Given** I am viewing the start program confirmation dialog
**When** I tap "Start program"
**Then** a record should be created in user_programs table
**And** I should navigate to ProgramDetailScreen (Story 3.3)
**And** I should see toast: "✓ Program startet!"

**Expected Database State:**
```sql
SELECT * FROM user_programs WHERE user_id = 1 AND program_id = 1;
-- Expected result:
-- id: 1
-- user_id: 1
-- program_id: 1
-- started_at: <current timestamp>
-- completed_at: NULL
-- status: 'active'
```

---

### Test Scenario 3.2.3: Cancel Start Program
**Priority:** P1 (High)
**Type:** Functional

**Given** I am viewing the start program confirmation dialog
**When** I tap "Avbryt"
**Then** the dialog should close
**And** I should remain on ProgramListScreen
**And** NO record should be created in user_programs
**And** the program should NOT be started

---

### Test Scenario 3.2.4: Start Program from Detail Screen
**Priority:** P1 (High)
**Type:** Navigation

**Given** I am viewing ProgramDetailScreen for a program I haven't started
**And** I see "Start program" button
**When** I tap "Start program"
**Then** I should see the same confirmation dialog as Story 3.2.1
**And** the same behavior should occur (create user_programs record)

---

### Test Scenario 3.2.5: Start Multiple Programs (Multi-Program Support)
**Priority:** P1 (High)
**Type:** Multi-Program (Story 3.5)

**Given** I have already started "4-Week Base Carb Training"
**And** it has status='active' in user_programs
**When** I start a second program "6-Week Advanced Protocol"
**Then** both programs should have status='active'
**And** I should be able to progress in both programs simultaneously
**And** the Dashboard should show both active programs

**Expected Database State:**
```sql
SELECT COUNT(*) FROM user_programs WHERE user_id = 1 AND status = 'active';
-- Expected: 2
```

---

### Test Scenario 3.2.6: Start Same Program Twice (Duplicate Prevention)
**Priority:** P2 (Medium)
**Type:** Validation

**Given** I have already started "4-Week Base Carb Training"
**And** the program is active
**When** I try to start the same program again
**Then** I should see a different dialog:
- Title: "Program allerede startet"
- Message: "Du har allerede startet dette programmet. Vil du se din progresjon?"
- Buttons: "Avbryt" | "Se progresjon"
**When** I tap "Se progresjon"
**Then** I should navigate to ProgramDetailScreen for my active program

---

## Story 3.3: Program Detail

### Test Scenario 3.3.1: View Program Detail for Not Started Program
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have NOT started "4-Week Base Carb Training"
**When** I navigate to ProgramDetailScreen for this program
**Then** I should see:

**Header:**
- Programnavn: "4-Week Base Carb Training"
- Status badge: "Ikke startet"
- "Start program" button (prominent)

**Content:**
- Beskrivelse: "Progressive carbohydrate tolerance training..."
- Forskningskilde: "Based on Jeukendrup (2014) gut training protocols"

**Sessions (grouped by week):**
- **Uke 1:**
  - Økt 1: "60 min @ 30g/t - Zone 2" [○ Ikke gjort]
  - Økt 2: "60 min @ 30g/t - Zone 2" [○ Ikke gjort]
- **Uke 2:**
  - Økt 1: "75 min @ 45g/t - Zone 2-3" [○ Ikke gjort]
  - Økt 2: "75 min @ 45g/t - Zone 2-3" [○ Ikke gjort]
- **Uke 3:**
  - Økt 1: "90 min @ 60g/t - Zone 2-3" [○ Ikke gjort]
  - Økt 2: "90 min @ 60g/t - Zone 2-3" [○ Ikke gjort]
- **Uke 4:**
  - Økt 1: "120 min @ 60g/t - Zone 2-3" [○ Ikke gjort]
  - Økt 2: "120 min @ 60g/t - Zone 2-3" [○ Ikke gjort]

---

### Test Scenario 3.3.2: View Program Detail for Active Program
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have started "4-Week Base Carb Training"
**And** I have completed 3 out of 8 sessions
**When** I navigate to ProgramDetailScreen
**Then** I should see:

**Header:**
- Programnavn: "4-Week Base Carb Training"
- Status badge: "Aktiv"
- Start dato: "Startet 20. okt 2025"
- Progresjon: "Uke 2 av 4" (from Story 3.4)
- Progress bar: 37.5% filled (3/8 sessions)

**Sessions with Status:**
- **Uke 1:**
  - Økt 1: [✅ Fullført - 20. okt]
  - Økt 2: [✅ Fullført - 22. okt]
- **Uke 2:**
  - Økt 1: [✅ Fullført - 24. okt]
  - Økt 2: [○ Ikke gjort]
- **Uke 3-4:**
  - All sessions: [○ Ikke gjort]

---

### Test Scenario 3.3.3: Session Grouping by Week
**Priority:** P1 (High)
**Type:** Data Organization

**Given** I am viewing ProgramDetailScreen
**Then** sessions should be grouped by week_number
**And** each week should have a section header: "Uke 1", "Uke 2", etc.
**And** sessions within each week should be ordered by session_number
**And** each week section should be collapsible (optional UI enhancement)

---

### Test Scenario 3.3.4: Session Card Display Format
**Priority:** P1 (High)
**Type:** UI Validation

**Given** I am viewing a session card for "Økt 1, Uke 2"
**Then** the card should display:
- Session identifier: "Økt 1"
- Duration: "75 min"
- Carb rate: "@ 45g/t"
- Intensity zone: "Zone 2-3"
- Status icon: [✅ Fullført] or [⏳ Planlagt] or [○ Ikke gjort]
- Optional: Notes: "Increase duration and carb rate"

**Format:** "75 min @ 45g/t - Zone 2-3"

---

### Test Scenario 3.3.5: Tap Session to Plan (Navigation to Epic 4)
**Priority:** P0 (Critical)
**Type:** Integration

**Given** I am viewing ProgramDetailScreen
**And** I see "Uke 1, Økt 1" with status [○ Ikke gjort]
**When** I tap on the session card
**Then** I should see "Plan økt" button or navigation option
**When** I tap "Plan økt"
**Then** I should navigate to Session Planning Screen (Epic 4)
**And** the session details should be passed to the planner

**Expected:** Integration point with Epic 4 (fuel planning)

---

### Test Scenario 3.3.6: Completed Session Shows Completion Date
**Priority:** P1 (High)
**Type:** UI State

**Given** I have completed "Uke 1, Økt 1" on October 20, 2025
**When** I view ProgramDetailScreen
**Then** the session card should display:
- Status icon: [✅ Fullført]
- Completion text: "Fullført 20. okt"
**And** the card should have a visual indicator (green border or background)

---

### Test Scenario 3.3.7: Planned Session Shows Planning Status
**Priority:** P1 (High)
**Type:** UI State

**Given** I have planned "Uke 2, Økt 1" (created planned_session record)
**But** I have NOT yet completed the session
**When** I view ProgramDetailScreen
**Then** the session card should display:
- Status icon: [⏳ Planlagt]
- Optional: Planned date: "Planlagt for 24. okt"
**And** the card should have a visual indicator (yellow/orange accent)

---

### Test Scenario 3.3.8: Research Source Link (Optional)
**Priority:** P3 (Low)
**Type:** Enhancement

**Given** I am viewing ProgramDetailScreen
**And** the program has a research_source: "Based on Jeukendrup (2014)..."
**When** I tap on the research source text
**Then** I should see expanded information or external link (optional)
**Or** the text should be displayed as informational only (MVP)

---

## Story 3.4: Program Progression

### Test Scenario 3.4.1: Progress Bar Display
**Priority:** P0 (Critical)
**Type:** Data Visualization

**Given** I have started "4-Week Base Carb Training" (8 sessions total)
**And** I have completed 3 sessions
**When** I view ProgramDetailScreen
**Then** I should see a progress bar at the top
**And** the bar should be 37.5% filled (3/8)
**And** the bar should use visual colors:
- Filled portion: Green (#4CAF50)
- Unfilled portion: Light gray (#E0E0E0)

---

### Test Scenario 3.4.2: Progress Text Display
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have completed 3 out of 8 sessions
**When** I view ProgramDetailScreen
**Then** I should see progress text: "3 av 8 økter fullført"
**And** I should see week progress: "Uke 2 av 4"

**Calculation:**
```typescript
const progressText = `${completedSessions} av ${totalSessions} økter fullført`;
const currentWeek = Math.ceil(completedSessions / (totalSessions / durationWeeks));
const weekText = `Uke ${currentWeek} av ${durationWeeks}`;
```

---

### Test Scenario 3.4.3: Current Week Calculation
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Test Cases:**

| Program | Total Sessions | Completed | Sessions/Week | Current Week |
|---------|---------------|-----------|---------------|--------------|
| 4-Week Base | 8 | 0 | 2 | Uke 1 av 4 |
| 4-Week Base | 8 | 1 | 2 | Uke 1 av 4 |
| 4-Week Base | 8 | 2 | 2 | Uke 1 av 4 |
| 4-Week Base | 8 | 3 | 2 | Uke 2 av 4 |
| 4-Week Base | 8 | 4 | 2 | Uke 2 av 4 |
| 4-Week Base | 8 | 5 | 2 | Uke 3 av 4 |
| 4-Week Base | 8 | 8 | 2 | Uke 4 av 4 |

**Algorithm:**
```typescript
const sessionsPerWeek = totalSessions / durationWeeks; // 8 / 4 = 2
const currentWeek = Math.ceil(completedSessions / sessionsPerWeek);
// Ensure week is at least 1 and at most durationWeeks
const displayWeek = Math.max(1, Math.min(currentWeek, durationWeeks));
```

---

### Test Scenario 3.4.4: Progress Bar Updates Dynamically
**Priority:** P1 (High)
**Type:** Dynamic Update

**Given** I have completed 2 sessions (25% progress)
**And** I am viewing ProgramDetailScreen
**When** I complete session 3 (from another screen)
**And** I return to ProgramDetailScreen
**Then** the progress bar should update to 37.5% (3/8)
**And** the progress text should update to "3 av 8 økter fullført"
**And** the week text should update to "Uke 2 av 4"

**Expected:** Progress updates reflect database state

---

### Test Scenario 3.4.5: Session Status Icons
**Priority:** P0 (Critical)
**Type:** UI State

**Given** I am viewing ProgramDetailScreen with mixed session states
**Then** each session should display the correct status icon:

| Status | Icon | Visual |
|--------|------|--------|
| Fullført | ✅ | Green checkmark |
| Planlagt | ⏳ | Yellow/orange hourglass |
| Ikke gjort | ○ | Gray circle outline |

**Test Coverage:**
- Session with session_status='completed' → ✅
- Session with planned_session but no session_log → ⏳
- Session with no planned_session → ○

---

### Test Scenario 3.4.6: Program Completion (100%)
**Priority:** P1 (High)
**Type:** Milestone

**Given** I have completed all 8 sessions in "4-Week Base Carb Training"
**When** I view ProgramDetailScreen
**Then** I should see:
- Progress bar: 100% filled (green)
- Progress text: "8 av 8 økter fullført"
- Badge/medal icon: "🎉" or trophy
- Celebration text: "Program fullført!"
- Button: "Se resultater" (navigates to Epic 7 progression graph)
- Program status updated to 'completed' in database

**Expected Database State:**
```sql
UPDATE user_programs
SET status = 'completed', completed_at = datetime('now')
WHERE id = 1;
```

---

### Test Scenario 3.4.7: "Se resultater" Navigation
**Priority:** P2 (Medium)
**Type:** Integration

**Given** I have completed the program (100%)
**And** I see the "Se resultater" button
**When** I tap "Se resultater"
**Then** I should navigate to Epic 7 progression graph (Story 7.6)
**And** I should see a graph of my progression through the program

**Note:** This is a future integration with Epic 7

---

### Test Scenario 3.4.8: Zero Progress (No Sessions Completed)
**Priority:** P1 (High)
**Type:** Edge Case

**Given** I have started a program
**But** I have NOT completed any sessions
**When** I view ProgramDetailScreen
**Then** I should see:
- Progress bar: 0% filled (empty)
- Progress text: "0 av 8 økter fullført"
- Week text: "Uke 1 av 4"
**And** all sessions should have status [○ Ikke gjort]

---

## Story 3.5: Multi-Program Support

### Test Scenario 3.5.1: Start Multiple Programs Simultaneously
**Priority:** P1 (High)
**Type:** Multi-Program

**Given** I have already started "4-Week Base Carb Training"
**When** I navigate to ProgramListScreen
**And** I start "6-Week Advanced Protocol"
**Then** both programs should be active
**And** I should have 2 records in user_programs with status='active'

**Expected Database State:**
```sql
SELECT program_id, status FROM user_programs WHERE user_id = 1;
-- Expected results:
-- program_id: 1, status: 'active' (4-Week Base)
-- program_id: 2, status: 'active' (6-Week Advanced)
```

---

### Test Scenario 3.5.2: Dashboard Shows All Active Programs
**Priority:** P1 (High)
**Type:** UI State

**Given** I have 2 active programs:
- "4-Week Base Carb Training" (3/8 sessions completed)
- "6-Week Advanced Protocol" (1/12 sessions completed)
**When** I view the Dashboard
**Then** I should see both programs displayed as cards
**And** each card should show:
- Program name
- Progress: "3 av 8 økter" / "1 av 12 økter"
- Mini progress bar
- "Fortsett" button

---

### Test Scenario 3.5.3: Progression Tracked Separately per Program
**Priority:** P0 (Critical)
**Type:** Data Integrity

**Given** I have 2 active programs
**When** I complete session 4 in "4-Week Base" (first program)
**Then** only "4-Week Base" progress should update to 4/8 (50%)
**And** "6-Week Advanced" progress should remain unchanged (1/12)

**Expected:** Progression is isolated per program, no cross-contamination

---

### Test Scenario 3.5.4: Pause Program
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have an active program "4-Week Base Carb Training"
**And** I am viewing ProgramDetailScreen
**When** I tap "⋯" menu (or "Innstillinger" button)
**And** I select "Pause program"
**Then** I should see a confirmation dialog:
- Title: "Pause program?"
- Message: "Progresjonen din blir lagret. Du kan fortsette senere."
- Buttons: "Avbryt" | "Pause"
**When** I confirm
**Then** the program status should be updated to 'paused'
**And** the program should NO LONGER appear in "active programs" on Dashboard
**And** the program should appear in "Paused" section (if implemented)

**Expected Database State:**
```sql
UPDATE user_programs SET status = 'paused' WHERE id = 1;
```

---

### Test Scenario 3.5.5: Resume Paused Program
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have a paused program "4-Week Base Carb Training"
**And** I am viewing ProgramDetailScreen
**When** I tap "Fortsett program" button
**Then** the program status should be updated to 'active'
**And** the program should reappear in "active programs" on Dashboard
**And** my previous progression (e.g., 3/8 sessions) should be preserved

---

### Test Scenario 3.5.6: Limit Active Programs (Recommendation)
**Priority:** P3 (Low)
**Type:** UX Guidance

**Given** I have 3 active programs
**When** I try to start a 4th program
**Then** I should see a warning dialog:
- Title: "Anbefaling"
- Message: "Du har allerede 3 aktive programmer. Vi anbefaler å fokusere på 1-2 programmer om gangen for best resultat."
- Buttons: "Avbryt" | "Start likevel"
**When** I tap "Start likevel"
**Then** the 4th program should start successfully

**Rationale:** Recommend focus, but don't hard-block (user freedom)

---

### Test Scenario 3.5.7: Complete One Program While Another is Active
**Priority:** P1 (High)
**Type:** Multi-Program

**Given** I have 2 active programs:
- "4-Week Base" (7/8 sessions completed)
- "6-Week Advanced" (3/12 sessions completed)
**When** I complete session 8 in "4-Week Base"
**Then** "4-Week Base" should be marked as 'completed'
**And** "6-Week Advanced" should remain 'active'
**And** Dashboard should show:
- "4-Week Base" with 🎉 badge and "Se resultater" button
- "6-Week Advanced" with progress bar and "Fortsett" button

---

## Integration Test Scenarios

### Integration 3.I.1: Full Program Selection Flow
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I am a user with no active programs
**When** I execute the following flow:
1. Navigate to "Programmer"
2. View "4-Week Base Carb Training" card
3. Tap "Start program"
4. Confirm in dialog
5. View ProgramDetailScreen
6. See 8 sessions grouped by 4 weeks
7. All sessions have status [○ Ikke gjort]

**Then** the database should contain:
- 1 active program in user_programs
- 8 sessions in program_sessions
- Progress: 0/8 (0%)

---

### Integration 3.I.2: Program → Plan → Complete → Progress
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I have started "4-Week Base Carb Training"
**When** I execute the following flow:
1. View ProgramDetailScreen → See session 1 [○ Ikke gjort]
2. Tap session 1 → Navigate to Planning (Epic 4)
3. Plan session → Create planned_session record
4. Return to ProgramDetailScreen → See session 1 [⏳ Planlagt]
5. Complete session (Epic 5) → Create session_log with status='completed'
6. Return to ProgramDetailScreen → See session 1 [✅ Fullført]
7. Progress bar updates to 12.5% (1/8)

**Database Validation:**
```sql
-- Planned session created
SELECT COUNT(*) FROM planned_sessions WHERE program_session_id = 1;
-- Expected: 1

-- Session completed
SELECT COUNT(*) FROM session_logs WHERE planned_session_id = 1 AND session_status = 'completed';
-- Expected: 1
```

---

### Integration 3.I.3: Multi-Program Progression
**Priority:** P1 (High)
**Type:** End-to-End

**Given** I have 2 active programs
**When** I:
1. Complete session 1 in Program A
2. Complete session 1 in Program B
3. Complete session 2 in Program A
4. View Dashboard
**Then** I should see:
- Program A: 2/8 sessions (25%)
- Program B: 1/12 sessions (8.3%)
**And** each program's progression should be tracked separately

---

## Performance Benchmarks

### Benchmark 3.P.1: Program List Query Performance
**Target:** <50ms for 10 programs

**Test:**
```typescript
const start = performance.now();
const programs = await ProgramRepository.getAll();
const duration = performance.now() - start;
expect(duration).toBeLessThan(50); // ms
```

---

### Benchmark 3.P.2: Program Detail Query Performance
**Target:** <100ms for program with 12 sessions

**Test:**
```typescript
const start = performance.now();
const details = await ProgramRepository.getDetails(programId);
const sessions = await ProgramRepository.getSessions(programId);
const duration = performance.now() - start;
expect(duration).toBeLessThan(100); // ms
```

---

### Benchmark 3.P.3: Progress Calculation Performance
**Target:** <10ms for progress calculation

**Test:**
```typescript
const start = performance.now();
const progress = calculateProgress(completedSessions, totalSessions);
const duration = performance.now() - start;
expect(duration).toBeLessThan(10); // ms
```

---

## Edge Cases & Error Handling

### Edge Case 3.E.1: Program with Odd Number of Sessions
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** a program has 9 sessions over 3 weeks (3 per week)
**And** I have completed 5 sessions
**When** I calculate current week
**Then** currentWeek should be: Math.ceil(5 / 3) = 2
**And** progress text should show: "Uke 2 av 3"

---

### Edge Case 3.E.2: Complete All Sessions Out of Order
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I have completed sessions in order: 8, 1, 5, 3, 2, 4, 6, 7 (random)
**When** I view ProgramDetailScreen
**Then** all sessions should have status [✅ Fullført]
**And** progress should be 100%
**And** program should be marked as 'completed'

**Expected:** Order of completion doesn't matter, only count

---

### Edge Case 3.E.3: Program Status Inconsistency (Data Integrity)
**Priority:** P1 (High)
**Type:** Data Validation

**Given** a program has status='active' in user_programs
**But** all 8 sessions are marked as completed
**When** the app loads ProgramDetailScreen
**Then** the app should detect the inconsistency
**And** auto-update status to 'completed'
**And** set completed_at timestamp

**Validation Query:**
```sql
-- Check for inconsistency
SELECT up.id, up.status, COUNT(sl.id) as completed
FROM user_programs up
JOIN program_sessions ps ON ps.program_id = up.program_id
LEFT JOIN planned_sessions pls ON pls.program_session_id = ps.id
LEFT JOIN session_logs sl ON sl.planned_session_id = pls.id AND sl.session_status = 'completed'
WHERE up.status = 'active'
GROUP BY up.id
HAVING completed = (SELECT COUNT(*) FROM program_sessions WHERE program_id = up.program_id);
-- If results exist, auto-update status to 'completed'
```

---

### Edge Case 3.E.4: Delete Completed Session (Regression)
**Priority:** P2 (Medium)
**Type:** Data Integrity

**Given** I have completed 5 sessions (62.5% progress)
**When** I delete/undo session 3 (hypothetical feature)
**Then** progress should recalculate to 4 sessions (50%)
**And** current week should recalculate
**And** program completion status should revert from 'completed' to 'active' if needed

**Note:** Deletion of sessions is not in current scope, but test ensures system handles it gracefully

---

## Test Data Requirements

### Test Programs
```json
[
  {
    "id": 1,
    "name": "4-Week Base Carb Training",
    "description": "Progressive carbohydrate tolerance training...",
    "duration_weeks": 4,
    "target_audience": "Endurance athletes new to carb training",
    "research_source": "Based on Jeukendrup (2014) gut training protocols",
    "is_active": 1
  },
  {
    "id": 2,
    "name": "6-Week Advanced Protocol",
    "description": "Advanced carb training for experienced athletes...",
    "duration_weeks": 6,
    "target_audience": "Experienced endurance athletes",
    "is_active": 1
  }
]
```

### Test Program Sessions (4-Week Base)
```json
[
  { "program_id": 1, "week_number": 1, "session_number": 1, "duration_minutes": 60, "carb_rate_g_per_hour": 30 },
  { "program_id": 1, "week_number": 1, "session_number": 2, "duration_minutes": 60, "carb_rate_g_per_hour": 30 },
  { "program_id": 1, "week_number": 2, "session_number": 1, "duration_minutes": 75, "carb_rate_g_per_hour": 45 },
  { "program_id": 1, "week_number": 2, "session_number": 2, "duration_minutes": 75, "carb_rate_g_per_hour": 45 },
  { "program_id": 1, "week_number": 3, "session_number": 1, "duration_minutes": 90, "carb_rate_g_per_hour": 60 },
  { "program_id": 1, "week_number": 3, "session_number": 2, "duration_minutes": 90, "carb_rate_g_per_hour": 60 },
  { "program_id": 1, "week_number": 4, "session_number": 1, "duration_minutes": 120, "carb_rate_g_per_hour": 60 },
  { "program_id": 1, "week_number": 4, "session_number": 2, "duration_minutes": 120, "carb_rate_g_per_hour": 60 }
]
```

---

## Automation Recommendations

### High Priority (Automate First)
1. ✅ Program listing and display (3.1.2, 3.1.6)
2. ✅ Start program flow (3.2.1, 3.2.2)
3. ✅ Progress calculation (3.4.2, 3.4.3)
4. ✅ Multi-program support (3.5.1, 3.5.3)
5. ✅ Integration tests (3.I.1, 3.I.2)

### Medium Priority
6. Session grouping (3.3.3)
7. Status icons (3.4.5)
8. Pause/resume (3.5.4, 3.5.5)
9. Edge cases (3.E.1 - 3.E.4)

### Manual Testing Required
- UI/UX validation (progress bars, badges, icons)
- Visual progression display
- Celebration animation at 100%
- Dashboard layout with multiple programs

---

## Test Execution Order

### Phase 1: Basic Program Flow (Day 1)
1. View program list (3.1.1, 3.1.2)
2. Start program (3.2.1, 3.2.2)
3. View program detail (3.3.1, 3.3.2)

**Exit Criteria:** Basic program selection and viewing works

---

### Phase 2: Progression Tracking (Day 2)
4. Progress bar display (3.4.1, 3.4.2)
5. Current week calculation (3.4.3)
6. Session status icons (3.4.5)
7. Program completion (3.4.6)

**Exit Criteria:** Progression tracking works correctly

---

### Phase 3: Multi-Program Support (Day 3)
8. Start multiple programs (3.5.1)
9. Dashboard display (3.5.2)
10. Separate progression (3.5.3)
11. Pause/resume (3.5.4, 3.5.5)

**Exit Criteria:** Multi-program functionality works

---

### Phase 4: Integration & Edge Cases (Day 4)
12. Integration tests (3.I.1, 3.I.2, 3.I.3)
13. Performance tests (3.P.1, 3.P.2, 3.P.3)
14. Edge cases (3.E.1 - 3.E.4)

**Exit Criteria:** Epic 3 ready for production

---

## Success Criteria

### Epic 3 Approved for Production IF:
✅ Program listing displays all programs correctly
✅ Program start flow works (confirmation, database insert)
✅ Program detail shows sessions grouped by week
✅ Progression tracking works (progress bar, current week, completion %)
✅ Session status icons display correctly (completed, planned, not done)
✅ Multi-program support allows 2+ active programs
✅ Progression tracked separately per program (no cross-contamination)
✅ Program completion detected and celebrated (100% badge)
✅ Pause/resume functionality works (optional for MVP)
✅ Performance meets targets (<100ms for detail screen)
✅ Integration with Epic 4 (session planning) works

### Epic 3 BLOCKED IF:
❌ Program data fails to load or display
❌ Start program creates duplicate or invalid records
❌ Progression calculation is incorrect
❌ Sessions not grouped by week correctly
❌ Multi-program causes data corruption or mixing
❌ Progress bar does not update dynamically
❌ Performance is unacceptable (>500ms for detail screen)

---

## Sign-off

**QA Lead:** Quinn 🎯
**Test Plan Status:** ✅ COMPLETE
**Total Test Scenarios:** 45+
**Critical Scenarios:** 18
**Estimated Test Execution Time:** 4 days
**Next Action:** Execute Phase 1 tests after Epic 3 implementation begins

---

_"Programs are the structured backbone of GI Diary. These tests ensure users can reliably follow, track, and complete their gut training programs with confidence and motivation."_

_— Quinn, Senior QA Engineer_
