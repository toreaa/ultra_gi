# Epic 1: Onboarding - Test Scenarios

**Epic:** EPIC-1 "Onboarding og Profiloppsett"
**Priority:** P0 (Must-Have)
**Test Type:** Functional, User Flow, Data Validation
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## Test Overview

Epic 1 validates the onboarding experience - the FIRST IMPRESSION for all new users. These test scenarios ensure:
1. ✅ Simple 3-step wizard completion (<2 minutes)
2. ✅ User goal and GI issue captured correctly
3. ✅ Intelligent program recommendation based on user input
4. ✅ Optional profile setup with validation
5. ✅ Smooth transition to main app
6. ✅ Onboarding shows only once (persistence)

---

## Story 1.1: Welcome Wizard

### Test Scenario 1.1.1: First App Launch Shows Welcome Screen
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am launching the app for the first time
**And** I have never completed onboarding before
**When** the app loads
**Then** I should see the WelcomeScreen (Screen 1/3)
**And** I should see app branding (icon, "GI Diary" title)
**And** I should see welcome text explaining the app's purpose
**And** I should see a "Kom i gang" button
**And** I should see a progress indicator showing "1/3"

**Navigation Path:** App Launch → WelcomeScreen

---

### Test Scenario 1.1.2: Navigate Through Wizard (Happy Path)
**Priority:** P0 (Critical)
**Type:** User Flow

**Given** I am on the WelcomeScreen
**When** I tap "Kom i gang"
**Then** I should navigate to GoalsScreen (Screen 2/3)
**And** I should see progress indicator showing "2/3"
**And** I should see a text input for my goal
**And** I should see placeholder text "f.eks. Sub-3 maraton Oslo 2025"
**And** I should see "Neste" button (disabled initially)
**And** I should see "Tilbake" button

**When** I enter goal: "Sub-3:30 maraton Oslo 2025"
**Then** "Neste" button should become enabled
**When** I tap "Neste"
**Then** I should navigate to GIIssueScreen (Screen 3/3)
**And** I should see progress indicator showing "3/3"
**And** I should see 5 radio button options:
- Kvalme
- Kramper
- Oppblåsthet
- Diaré
- Annet (with text input)
**And** I should see "Fullfør" button (disabled initially)
**And** I should see "Tilbake" button

---

### Test Scenario 1.1.3: Back Navigation Works Correctly
**Priority:** P1 (High)
**Type:** Navigation

**Given** I am on the GIIssueScreen (Screen 3/3)
**When** I tap "Tilbake"
**Then** I should navigate back to GoalsScreen (Screen 2/3)
**And** my previously entered goal should still be visible
**When** I tap "Tilbake" again
**Then** I should navigate back to WelcomeScreen (Screen 1/3)
**When** I tap "Kom i gang" again
**Then** I should navigate to GoalsScreen
**And** my goal input should be preserved (not cleared)

**Expected:** State persists during wizard navigation

---

### Test Scenario 1.1.4: Goal Input Validation
**Priority:** P1 (High)
**Type:** Validation

**Given** I am on the GoalsScreen
**When** I enter a goal with 4 characters: "Test"
**Then** "Neste" button should remain disabled
**And** I should see validation error: "Minst 5 tegn påkrevd"

**When** I enter a valid goal (5+ characters): "Sub-3 maraton"
**Then** the validation error should disappear
**And** "Neste" button should become enabled

**When** I clear the text input
**Then** "Neste" button should become disabled again

**Validation Rule:** Minimum 5 characters, maximum 200 characters

---

### Test Scenario 1.1.5: Select GI Issue - All Options
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am on the GIIssueScreen
**Test each option:**

**Test 1.5.1: Select "Kvalme"**
**When** I select the "Kvalme" radio button
**Then** "Fullfør" button should become enabled
**And** no additional text input should appear

**Test 1.5.2: Select "Kramper"**
**When** I select the "Kramper" radio button
**Then** "Fullfør" button should become enabled

**Test 1.5.3: Select "Oppblåsthet"**
**When** I select the "Oppblåsthet" radio button
**Then** "Fullfør" button should become enabled

**Test 1.5.4: Select "Diaré"**
**When** I select the "Diaré" radio button
**Then** "Fullfør" button should become enabled

**Test 1.5.5: Select "Annet" with custom text**
**When** I select the "Annet" radio button
**Then** a text input field should appear below
**And** "Fullfør" button should become enabled
**When** I enter custom text: "Halsbrann"
**Then** the custom text should be saved as my GI issue

---

### Test Scenario 1.1.6: GI Issue Validation - Required Field
**Priority:** P1 (High)
**Type:** Validation

**Given** I am on the GIIssueScreen
**And** I have not selected any option
**Then** "Fullfør" button should be disabled
**When** I select "Kvalme"
**Then** "Fullfør" button should become enabled
**When** I deselect "Kvalme" (if possible)
**Then** "Fullfør" button should become disabled again

---

### Test Scenario 1.1.7: Complete Wizard and Save to Database
**Priority:** P0 (Critical)
**Type:** Integration

**Given** I have completed all 3 wizard screens
**And** I have entered goal: "Sub-3 maraton Oslo 2025"
**And** I have selected GI issue: "Kvalme"
**When** I tap "Fullfør" on GIIssueScreen
**Then** my data should be saved to the users table
**And** I should navigate to ProgramSuggestionScreen (Story 1.2)

**Expected Database State:**
```sql
SELECT * FROM users WHERE id = 1;
-- Expected result:
-- id: 1
-- name: 'User' (placeholder)
-- primary_goal: 'Sub-3 maraton Oslo 2025'
-- primary_gi_issue: 'Kvalme'
-- onboarded_at: <current timestamp>
-- created_at: <current timestamp>
```

---

### Test Scenario 1.1.8: Crash During Wizard (Recovery)
**Priority:** P1 (High)
**Type:** Reliability

**Given** I am on the GoalsScreen (Screen 2/3)
**And** I have entered my goal: "Sub-3 maraton Oslo 2025"
**When** I force-quit the app (simulate crash)
**And** I reopen the app
**Then** I should see the onboarding wizard again (not main app)
**And** the wizard should start from the beginning (WelcomeScreen)
**And** my progress should NOT be saved (expected behavior for incomplete onboarding)

**Rationale:** Onboarding must be completed in one session for data integrity

---

## Story 1.2: Program Suggestion

### Test Scenario 1.2.1: Program Suggestion Based on Kvalme
**Priority:** P0 (Critical)
**Type:** Algorithm Validation

**Given** I have completed the wizard with GI issue: "Kvalme"
**When** the ProgramSuggestionScreen loads
**Then** I should see recommended program: "4-Week Base Carb Training"
**And** I should see program details:
- Name: "4-Week Base Carb Training"
- Description: "Progressive carbohydrate tolerance training starting at 30g/hr..."
- Duration: "4 uker, 2 økter per uke"
- Start intensity: "Starter på 30g/t"
**And** I should see "Hvorfor dette programmet?" section
**And** the reasoning should contain: "starter med lav intensitet" or "reduserer sjansen for kvalme"
**And** I should see "Start dette programmet" button
**And** I should see "Se alle programmer" button

---

### Test Scenario 1.2.2: Program Suggestion for All GI Issues
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Test each GI issue type:**

| GI Issue | Recommended Program | Reasoning Contains |
|----------|-------------------|-------------------|
| Kvalme | 4-Week Base Carb Training | "lav intensitet", "kvalme" |
| Kramper | 4-Week Base Carb Training | "bygge toleranse", "kramper" |
| Oppblåsthet | 4-Week Base Carb Training | "gradvis", "oppblåsthet" |
| Diaré | 4-Week Base Carb Training | "forsiktig", "fordøyelsessystemet" |
| Annet | 4-Week Base Carb Training | "trygt utgangspunkt" |

**Validation:** For MVP, all GI issues map to the same program, but reasoning is customized

---

### Test Scenario 1.2.3: Start Recommended Program
**Priority:** P0 (Critical)
**Type:** Integration

**Given** I am on the ProgramSuggestionScreen
**And** the recommended program is "4-Week Base Carb Training"
**When** I tap "Start dette programmet"
**Then** a record should be created in user_programs table
**And** I should navigate to ProfileSetupScreen (Story 1.3)

**Expected Database State:**
```sql
SELECT * FROM user_programs WHERE user_id = 1;
-- Expected result:
-- id: 1
-- user_id: 1
-- program_id: 1
-- started_at: <current timestamp>
-- status: 'active'
```

---

### Test Scenario 1.2.4: View All Programs (Navigation)
**Priority:** P2 (Medium)
**Type:** Navigation

**Given** I am on the ProgramSuggestionScreen
**When** I tap "Se alle programmer"
**Then** I should navigate to ProgramListScreen (Epic 3)
**And** I should see a list of all available programs
**And** I can browse and select a different program

**Note:** This is a secondary path - most users will start the recommended program

---

### Test Scenario 1.2.5: Program Data Loaded from Database
**Priority:** P0 (Critical)
**Type:** Data Integrity

**Given** the programs table contains "4-Week Base Carb Training"
**And** the program_sessions table contains 8 sessions for this program
**When** ProgramSuggestionScreen loads
**Then** the program details should be fetched from database
**And** all fields should be populated correctly
**And** session count should be "8 økter" (2 per week × 4 weeks)

**Database Query:**
```sql
SELECT * FROM programs WHERE id = 1;
SELECT COUNT(*) FROM program_sessions WHERE program_id = 1;
-- Expected: 8 sessions
```

---

## Story 1.3: Profile Setup

### Test Scenario 1.3.1: Profile Setup Screen Displays
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have started a program (Story 1.2)
**When** I navigate to ProfileSetupScreen (final onboarding step)
**Then** I should see the screen title: "Din profil"
**And** I should see subtitle: "Valgfritt: Hjelp oss gi deg bedre anbefalinger"
**And** I should see two input fields:
1. Navn (valgfritt) - Placeholder: "f.eks. Kari"
2. Vekt (kg) (valgfritt) - Placeholder: "f.eks. 65"
**And** I should see "Fullfør" button (enabled by default)
**And** I should see "Hopp over" button

---

### Test Scenario 1.3.2: Complete Profile with All Fields
**Priority:** P1 (High)
**Type:** Functional

**Given** I am on the ProfileSetupScreen
**When** I enter name: "Kari Nordmann"
**And** I enter weight: "65"
**And** I tap "Fullfør"
**Then** the profile should be saved to database
**And** onboarding should be marked as complete
**And** I should navigate to MainApp (Dashboard)

**Expected Database State:**
```sql
SELECT name, weight_kg, onboarded_at FROM users WHERE id = 1;
-- Expected result:
-- name: 'Kari Nordmann'
-- weight_kg: 65.0
-- onboarded_at: <timestamp>
```

---

### Test Scenario 1.3.3: Skip Profile Setup
**Priority:** P1 (High)
**Type:** Functional

**Given** I am on the ProfileSetupScreen
**And** I have NOT entered any profile information
**When** I tap "Hopp over"
**Then** onboarding should be marked as complete
**And** I should navigate to MainApp (Dashboard)
**And** the users table should have NULL values for name and weight_kg

**Expected Database State:**
```sql
SELECT name, weight_kg, onboarded_at FROM users WHERE id = 1;
-- Expected result:
-- name: 'User' (placeholder from Story 1.1)
-- weight_kg: NULL
-- onboarded_at: <timestamp>
```

---

### Test Scenario 1.3.4: Name Validation (Max 50 Characters)
**Priority:** P2 (Medium)
**Type:** Validation

**Given** I am on the ProfileSetupScreen
**When** I enter a name with 51 characters: "A" * 51
**Then** I should see validation error: "Navn kan ikke være lengre enn 50 tegn"
**And** "Fullfør" button should remain enabled (name is optional)

**When** I clear the name field
**Then** the validation error should disappear
**And** I can still tap "Fullfør" with empty name (optional field)

---

### Test Scenario 1.3.5: Weight Validation (Range 30-200 kg)
**Priority:** P1 (High)
**Type:** Validation

**Given** I am on the ProfileSetupScreen

**Test Case 1: Weight too low**
**When** I enter weight: "25"
**Then** I should see validation error: "Vekt må være mellom 30 og 200 kg"
**And** "Fullfør" button should be disabled

**Test Case 2: Weight too high**
**When** I enter weight: "250"
**Then** I should see validation error: "Vekt må være mellom 30 og 200 kg"
**And** "Fullfør" button should be disabled

**Test Case 3: Valid weight**
**When** I enter weight: "70"
**Then** no validation error should appear
**And** "Fullfør" button should be enabled

**Test Case 4: Non-numeric input**
**When** I enter weight: "abc"
**Then** I should see validation error: "Vekt må være et tall"
**And** "Fullfør" button should be disabled

---

### Test Scenario 1.3.6: Profile Can Be Edited Later
**Priority:** P2 (Medium)
**Type:** Future Integration

**Given** I have completed onboarding
**And** I am on the MainApp (Dashboard)
**When** I navigate to Settings
**Then** I should see "Rediger profil" option
**When** I tap "Rediger profil"
**Then** I should see a screen similar to ProfileSetupScreen
**And** I can update my name and weight

**Note:** This is a placeholder test for future Settings implementation

---

## Integration Test Scenarios

### Integration 1.I.1: Complete Onboarding Flow (Happy Path)
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I am a new user launching the app for the first time
**When** I execute the following flow:
1. See WelcomeScreen → Tap "Kom i gang"
2. Enter goal: "Sub-3:30 maraton Oslo 2025" → Tap "Neste"
3. Select GI issue: "Kvalme" → Tap "Fullfør"
4. See program recommendation → Tap "Start dette programmet"
5. Enter name: "Kari" and weight: "65" → Tap "Fullfør"

**Then** I should see the MainApp (Dashboard)
**And** the database should contain:
- User record with goal, GI issue, name, weight
- user_programs record with active program
- onboarded_at timestamp set

**Database Validation:**
```sql
-- User created
SELECT COUNT(*) FROM users;
-- Expected: 1

-- User details correct
SELECT primary_goal, primary_gi_issue, name, weight_kg, onboarded_at
FROM users WHERE id = 1;
-- Expected: 'Sub-3:30 maraton Oslo 2025', 'Kvalme', 'Kari', 65.0, <timestamp>

-- Program started
SELECT COUNT(*) FROM user_programs WHERE user_id = 1 AND status = 'active';
-- Expected: 1
```

---

### Integration 1.I.2: Onboarding Persistence (Does Not Repeat)
**Priority:** P0 (Critical)
**Type:** Persistence

**Given** I have completed onboarding
**And** I am on the MainApp
**When** I close the app completely
**And** I reopen the app
**Then** I should see the MainApp (NOT onboarding)
**And** I should see my active program on the dashboard

**When** I restart the app multiple times
**Then** onboarding should NEVER appear again
**And** the app should always open to MainApp

**Validation:** Check onboarded_at field in users table is NOT NULL

---

### Integration 1.I.3: Minimal Onboarding Flow (Skip Profile)
**Priority:** P1 (High)
**Type:** End-to-End

**Given** I am a new user
**When** I execute the minimal flow:
1. WelcomeScreen → "Kom i gang"
2. Enter goal: "Finish marathon" → "Neste"
3. Select GI issue: "Kvalme" → "Fullfør"
4. Program recommendation → "Start dette programmet"
5. ProfileSetupScreen → "Hopp over"

**Then** I should reach MainApp successfully
**And** onboarding should be complete (onboarded_at set)
**And** profile fields (name, weight) should be NULL

---

### Integration 1.I.4: Change Program During Onboarding
**Priority:** P2 (Medium)
**Type:** User Flow

**Given** I am on the ProgramSuggestionScreen
**And** the recommended program is "4-Week Base Carb Training"
**When** I tap "Se alle programmer"
**And** I browse the program list
**And** I select a different program (if available)
**And** I start that program
**Then** the correct program should be saved to user_programs
**And** onboarding should continue to ProfileSetupScreen

**Note:** For MVP with only 1 program, this test verifies navigation only

---

## Performance Tests

### Performance 1.P.1: Onboarding Completion Time
**Priority:** P1 (High)
**Type:** Performance

**Target:** Complete onboarding in <2 minutes

**Test:**
- Measure time from app launch to MainApp
- Include all 5 steps (Welcome, Goals, GI Issue, Program, Profile)
- User enters typical inputs

**Acceptance:** Total time <2 minutes (120 seconds)

---

### Performance 1.P.2: Database Write Performance
**Priority:** P2 (Medium)
**Type:** Performance

**Target:** User record creation <50ms

**Test:**
```typescript
const start = performance.now();
await UserRepository.create({ /* user data */ });
const duration = performance.now() - start;
expect(duration).toBeLessThan(50); // ms
```

---

## Edge Cases & Error Handling

### Edge Case 1.E.1: Extremely Long Goal Text
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I am on the GoalsScreen
**When** I enter 201 characters (exceeds max 200)
**Then** I should see validation error: "Maks 200 tegn"
**And** "Neste" button should be disabled

---

### Edge Case 1.E.2: Special Characters in Goal
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I am on the GoalsScreen
**When** I enter goal: "Sub-3 🏃 maraton (Oslo 2025)"
**Then** the goal should be accepted (special characters allowed)
**And** "Neste" button should be enabled
**And** the goal should be saved correctly with emojis

---

### Edge Case 1.E.3: Back Navigation from First Screen
**Priority:** P3 (Low)
**Type:** Edge Case

**Given** I am on the WelcomeScreen (first screen)
**When** I press the device back button
**Then** the app should exit (or show exit confirmation)
**And** no navigation should occur (already at root)

---

### Edge Case 1.E.4: Rapid Button Tapping
**Priority:** P2 (Medium)
**Type:** Concurrency

**Given** I am on the GIIssueScreen
**And** I have selected "Kvalme"
**When** I rapidly tap "Fullfør" button 5 times
**Then** only ONE user record should be created
**And** only ONE program should be started
**And** no duplicate records should exist

**Validation:** Check database for duplicate records

---

## Test Data Requirements

### Test User Profiles
```json
[
  {
    "name": "Kari Nordmann",
    "goal": "Sub-3:30 maraton Oslo 2025",
    "gi_issue": "Kvalme",
    "weight_kg": 65
  },
  {
    "name": "Erik Hansen",
    "goal": "Finish first ultra-marathon",
    "gi_issue": "Kramper",
    "weight_kg": 78
  },
  {
    "name": null,
    "goal": "Improve endurance",
    "gi_issue": "Oppblåsthet",
    "weight_kg": null
  }
]
```

### Test Programs
```json
{
  "id": 1,
  "name": "4-Week Base Carb Training",
  "description": "Progressive carbohydrate tolerance training...",
  "duration_weeks": 4,
  "target_audience": "Endurance athletes new to carb training",
  "is_active": 1
}
```

---

## Automation Recommendations

### High Priority (Automate First)
1. ✅ Navigation flow tests (1.1.2, 1.1.3)
2. ✅ Validation tests (1.1.4, 1.3.5)
3. ✅ Database integration tests (1.1.7, 1.2.3, 1.3.2)
4. ✅ Complete onboarding flow (1.I.1)

### Medium Priority
5. All GI issue tests (1.1.5)
6. Program recommendation algorithm (1.2.2)
7. Edge cases (1.E.1, 1.E.2, 1.E.4)

### Manual Testing Required
- First launch experience (1.1.1)
- Visual validation (progress indicators, styling)
- Back button behavior (device-specific)
- Performance measurements (1.P.1)

---

## Test Execution Order

### Phase 1: Core Navigation (Day 1)
1. First launch (1.1.1)
2. Navigation flow (1.1.2)
3. Back navigation (1.1.3)

**Exit Criteria:** Wizard navigation works correctly

---

### Phase 2: Data Validation (Day 2)
4. Goal validation (1.1.4)
5. GI issue selection (1.1.5)
6. Profile validation (1.3.4, 1.3.5)

**Exit Criteria:** All validation rules work correctly

---

### Phase 3: Integration (Day 3)
7. Complete flow (1.I.1)
8. Database writes (1.1.7, 1.2.3, 1.3.2)
9. Program recommendation (1.2.1, 1.2.2)

**Exit Criteria:** End-to-end onboarding works

---

### Phase 4: Edge Cases & Polish (Day 4)
10. Skip profile (1.3.3, 1.I.3)
11. Persistence (1.I.2)
12. Edge cases (1.E.1 - 1.E.4)
13. Performance tests (1.P.1, 1.P.2)

**Exit Criteria:** Epic 1 ready for production

---

## Success Criteria

### Epic 1 Approved for Production IF:
✅ All P0 test scenarios pass (navigation, validation, database)
✅ Onboarding completes in <2 minutes
✅ Data persists correctly to database
✅ Onboarding shows only once (persistence works)
✅ All validation rules work correctly
✅ Back navigation works without data loss
✅ Program recommendation logic works for all GI issues
✅ Profile validation prevents invalid data
✅ Integration with Epic 3 (program selection) works

### Epic 1 BLOCKED IF:
❌ Navigation fails or crashes
❌ Data not saved to database
❌ Onboarding shows multiple times
❌ Validation allows invalid data
❌ Back navigation loses user input
❌ Performance exceeds 2 minutes

---

## Sign-off

**QA Lead:** Quinn 🎯
**Test Plan Status:** ✅ COMPLETE
**Total Test Scenarios:** 35+
**Critical Scenarios:** 12
**Estimated Test Execution Time:** 4 days
**Next Action:** Execute Phase 1 tests after Epic 1 implementation begins

---

_"Onboarding is the user's first impression of GI Diary. These tests ensure we deliver a smooth, intuitive experience that gets users to value quickly."_

_— Quinn, Senior QA Engineer_
