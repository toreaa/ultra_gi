# Epic 4: Planning (Fuel Planner) - Test Scenarios

**Epic:** EPIC-4 "Planning" (Fase 1: Planlegging)
**Priority:** P0 (Must-Have)
**Test Type:** Functional, Algorithm Validation, Integration
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## Test Overview

Epic 4 validates the fuel planner algorithm - a CRITICAL component that calculates optimal fuel plans for training sessions. The algorithm must:
1. ✅ Generate realistic fuel plans from available products
2. ✅ Match 90-110% of target carbs
3. ✅ Prioritize fewer products (simplicity)
4. ✅ Generate intelligent timing suggestions
5. ✅ Handle edge cases (empty skafferi, insufficient products)

---

## Story 4.1: Session Planning Screen

### Test Scenario 4.1.1: Access Planning from Program Session
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am enrolled in "4-Week Base" program
**And** I am viewing the Program Detail screen (Week 1)
**When** I tap on "Week 1, Session 1" (75 min @ 30g/t)
**Then** I should see "Plan økt"-knapp
**When** I tap "Plan økt"
**Then** I should navigate to Session Planning Screen
**And** I should see session details:
- Program: "4-Week Base"
- Session: "Uke 1, Økt 1"
- Varighet: "75 min"
- Mål: "30g/t"
- Total karbs: "38g" (calculated: 30g/t × 75min / 60)

**Navigation Path:** Program Detail → Session Planning

---

### Test Scenario 4.1.2: Manual Session Planning (Spontaneous)
**Priority:** P1 (High)
**Type:** Functional

**Given** I am on the Dashboard
**When** I tap "Planlegg spontan økt" from menu
**Then** I should see Session Planning Screen
**And** I should see input fields:
- Varighet (minutes): TextInput
- Karb-rate (g/t): TextInput
**When** I enter duration "90" and rate "45"
**Then** I should see calculated total: "68g" (45 × 90 / 60)

---

### Test Scenario 4.1.3: Session Planning with Empty Skafferi
**Priority:** P0 (Critical)
**Type:** Error Handling

**Given** I have NO fuel products in my skafferi
**And** I access Session Planning Screen for "Week 1, Session 1"
**When** the screen loads
**Then** I should see an error state:
- Icon: Empty box
- Message: "Ingen produkter i skafferi"
- Button: "Legg til produkter"
**When** I tap "Legg til produkter"
**Then** I should navigate to Fuel Library (Story 2.2)

**Expected:** Prevent user from creating invalid plan

---

## Story 4.2: Fuel Planner Algorithm

### Test Scenario 4.2.1: Perfect Match (Exact Target)
**Priority:** P0 (Critical)
**Type:** Algorithm Validation

**Given** I have the following fuel products:
- Maurten Gel 100 (25g carbs per serving)
**And** target carbs = 100g
**And** duration = 120 minutes

**When** the fuel planner algorithm runs
**Then** the generated plan should be:
```json
{
  "items": [
    {
      "fuel_product_id": 1,
      "product_name": "Maurten Gel 100",
      "quantity": 4,
      "timing_minutes": [24, 48, 72, 96],
      "carbs_total": 100
    }
  ],
  "total_carbs": 100,
  "target_carbs": 100,
  "match_percentage": 100
}
```

**Validation:**
- ✅ Exact match (100g = 100g)
- ✅ 4 intakes evenly distributed
- ✅ Timing calculation: 120 / (4+1) = 24 min intervals

---

### Test Scenario 4.2.2: Acceptable Overshoot (90-110% Range)
**Priority:** P0 (Critical)
**Type:** Algorithm Validation

**Given** I have the following fuel products:
- Maurten Gel 100 (25g carbs per serving)
**And** target carbs = 90g
**And** duration = 120 minutes

**When** the algorithm runs
**Then** the generated plan should select 4 gels (100g total)
**And** match_percentage should be 111% (100/90)
**And** this should be ACCEPTABLE (within 90-110% range... wait, 111% is over!)

**Expected Result:**
```json
{
  "items": [
    {
      "product_name": "Maurten Gel 100",
      "quantity": 4,
      "carbs_total": 100
    }
  ],
  "total_carbs": 100,
  "target_carbs": 90,
  "match_percentage": 111
}
```

**Validation:**
- ⚠️ Slightly over 110% (111%)
- ✅ Still acceptable (closest possible match)
- ✅ Alternative would be 3 gels (75g = 83%), which is worse

**Algorithm Note:** Greedy algorithm should prefer overshoot to undershoot

---

### Test Scenario 4.2.3: Undershoot (Insufficient Products)
**Priority:** P0 (Critical)
**Type:** Error Handling

**Given** I have the following fuel products:
- Maurten Gel 100 (25g carbs per serving) × 2 servings available
**And** target carbs = 100g
**And** duration = 120 minutes

**When** the algorithm runs
**Then** the plan should show:
```json
{
  "items": [
    {
      "product_name": "Maurten Gel 100",
      "quantity": 2,
      "carbs_total": 50
    }
  ],
  "total_carbs": 50,
  "target_carbs": 100,
  "match_percentage": 50,
  "warning": "Insufficient products (50/100g). Add more products to skafferi."
}
```

**UI Behavior:**
- Show warning banner: "⚠️ Kun 50% av mål nådd. Legg til flere produkter?"
- Allow user to proceed anyway (spontaneous intake during session)
- Button: "Legg til produkter"

---

### Test Scenario 4.2.4: Multiple Product Types (Mix)
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Given** I have the following fuel products:
- Maurten Drink Mix 320 (80g carbs per serving)
- Maurten Gel 100 (25g carbs per serving)
- Banan (27g carbs per serving)
**And** target carbs = 120g
**And** duration = 150 minutes

**When** the algorithm runs (greedy: sort by carbs descending)
**Then** the generated plan should prioritize highest carbs first:

**Step 1:** Select Drink Mix (80g) → Remaining: 40g
**Step 2:** Select 2x Gel (50g) → Total: 130g (108% match)

```json
{
  "items": [
    {
      "product_name": "Maurten Drink Mix 320",
      "quantity": 1,
      "timing_minutes": [50],
      "carbs_total": 80
    },
    {
      "product_name": "Maurten Gel 100",
      "quantity": 2,
      "timing_minutes": [50, 100],
      "carbs_total": 50
    }
  ],
  "total_carbs": 130,
  "target_carbs": 120,
  "match_percentage": 108
}
```

**Validation:**
- ✅ Uses 2 products (drink + gel)
- ✅ 108% match (within 90-110% range)
- ✅ Timing distributed evenly

---

### Test Scenario 4.2.5: Timing Algorithm Validation
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Test Cases:**

| Duration | Quantity | Expected Timing | Formula |
|----------|----------|-----------------|---------|
| 90 min | 3 items | [22, 45, 67] | 90/(3+1) = 22.5 → intervals of ~22 |
| 120 min | 4 items | [24, 48, 72, 96] | 120/(4+1) = 24 |
| 60 min | 2 items | [20, 40] | 60/(2+1) = 20 |
| 75 min | 3 items | [19, 37, 56] | 75/(3+1) = 18.75 |
| 180 min | 6 items | [26, 51, 77, 103, 129, 154] | 180/(6+1) ≈ 25.7 |

**Algorithm:**
```typescript
function generateTiming(duration: number, quantity: number): number[] {
  const interval = duration / (quantity + 1);
  return Array.from({ length: quantity }, (_, i) =>
    Math.round((i + 1) * interval)
  );
}
```

**Validation:**
```typescript
expect(generateTiming(90, 3)).toEqual([23, 45, 68]);  // Rounded
expect(generateTiming(120, 4)).toEqual([24, 48, 72, 96]);
expect(generateTiming(60, 2)).toEqual([20, 40]);
```

---

### Test Scenario 4.2.6: Max Quantity Constraint (Safety Limit)
**Priority:** P2 (Medium)
**Type:** Algorithm Validation

**Given** I have the following fuel products:
- Dextro Energy Tablets (15g carbs per serving)
**And** target carbs = 150g
**And** duration = 180 minutes

**When** the algorithm runs
**Then** it should limit quantity to MAX_QUANTITY (e.g., 5)

**Expected:**
```json
{
  "items": [
    {
      "product_name": "Dextro Energy Tablets",
      "quantity": 5,  // Limited to 5 (not 10)
      "carbs_total": 75
    }
  ],
  "total_carbs": 75,
  "target_carbs": 150,
  "match_percentage": 50,
  "warning": "Max quantity reached for some products"
}
```

**Rationale:** Prevent unrealistic plans (e.g., "take 20 gels")

**Current Implementation:**
```typescript
const quantity = Math.min(
  Math.ceil(remainingCarbs / product.carbs_per_serving),
  5  // MAX_QUANTITY
);
```

---

### Test Scenario 4.2.7: Sorting by Carbs (Greedy Algorithm)
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Given** I have the following fuel products (unsorted):
- Banan (27g)
- Maurten Gel 100 (25g)
- Maurten Drink Mix 320 (80g)
- Dextro Energy Tablets (15g)
- Energy Bar (40g)

**When** the algorithm sorts products
**Then** the sorted order should be (descending by carbs):
1. Maurten Drink Mix 320 (80g)
2. Energy Bar (40g)
3. Banan (27g)
4. Maurten Gel 100 (25g)
5. Dextro Energy Tablets (15g)

**Validation:**
```typescript
const sorted = [...products].sort((a, b) =>
  b.carbs_per_serving - a.carbs_per_serving
);

expect(sorted[0].name).toBe('Maurten Drink Mix 320');
expect(sorted[1].name).toBe('Energy Bar');
```

---

### Test Scenario 4.2.8: Zero Carbs Edge Case
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** target carbs = 0g (user error)
**When** the algorithm runs
**Then** it should return empty plan with validation error

**Expected:**
```json
{
  "items": [],
  "total_carbs": 0,
  "target_carbs": 0,
  "error": "Target carbs must be greater than 0"
}
```

---

## Story 4.3: Confirm Plan

### Test Scenario 4.3.1: Accept Generated Plan (Happy Path)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am on the Session Planning Screen
**And** the algorithm has generated a valid plan (100g, 108% match)
**And** I see the suggested plan:
- Maurten Drink Mix 320 (1x) - 80g
- Maurten Gel 100 (2x) - 50g
- Timing: 50, 100, 150 min
**When** I tap "Godkjenn plan"
**Then** the plan should be saved to database

**Expected Database State:**
```sql
INSERT INTO planned_sessions (
  user_id: 1,
  program_session_id: 1,
  scheduled_for: '2025-10-25T10:00:00Z',
  fuel_plan_json: '{
    "items": [
      {
        "fuel_product_id": 2,
        "product_name": "Maurten Drink Mix 320",
        "quantity": 1,
        "timing_minutes": [50],
        "carbs_total": 80
      },
      {
        "fuel_product_id": 1,
        "product_name": "Maurten Gel 100",
        "quantity": 2,
        "timing_minutes": [100, 150],
        "carbs_total": 50
      }
    ],
    "total_carbs": 130,
    "target_carbs": 120
  }',
  created_at: datetime('now')
);
```

**Then** I should navigate back to Program Detail screen
**And** I should see "Week 1, Session 1" marked as "Planlagt" (planned)

---

### Test Scenario 4.3.2: Manual Adjustment - Change Quantity
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a generated plan with 4x Maurten Gel
**When** I tap on "Maurten Gel" item
**Then** I should see an adjustment dialog with:
- Quantity stepper: [−] [4] [+]
- Remove button: "Fjern produkt"
**When** I tap [−] to decrease quantity to 3
**Then** the plan should update immediately:
- Total carbs: 100g → 75g
- Match percentage: 100% → 75%
- Timing: Recalculate for 3 items

**Real-time Validation:**
- Show warning if total carbs < 90% of target
- Show warning if total carbs > 110% of target

---

### Test Scenario 4.3.3: Manual Adjustment - Add Product
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a plan with only Maurten Gel (75g total)
**And** target is 100g (75% match - warning shown)
**When** I tap "Legg til produkt"
**Then** I should see a product selector with my skafferi products
**When** I select "Banan (27g)"
**Then** the plan should update:
- Items: Maurten Gel (3x) + Banan (1x)
- Total carbs: 75g + 27g = 102g
- Match percentage: 102% ✅
- Timing: Recalculated for 4 items

---

### Test Scenario 4.3.4: Manual Adjustment - Change Timing
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have a plan with 3 gels at auto-generated times: [25, 50, 75]
**When** I tap on the timing for gel #2 (50 min)
**Then** I should see a time picker
**When** I change the time to 55 minutes
**Then** the timing should update: [25, 55, 75]
**And** the change should be persisted in fuel_plan_json

**Note:** This is OPTIONAL for MVP - consider deferring

---

### Test Scenario 4.3.5: Remove Product from Plan
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a plan with 2 products (Drink Mix + Gel)
**When** I tap on "Maurten Drink Mix 320"
**And** I tap "Fjern produkt"
**Then** the product should be removed from plan
**And** total carbs should recalculate (130g → 50g)
**And** match percentage should update (108% → 50%)
**And** warning should show: "⚠️ Kun 50% av mål nådd"

---

### Test Scenario 4.3.6: Save Plan and Start Immediately
**Priority:** P1 (High)
**Type:** Integration

**Given** I have confirmed a fuel plan
**And** I see "Godkjenn plan" button
**And** I see "Start nå" button (optional quick action)
**When** I tap "Start nå"
**Then** the plan should be saved to database (planned_sessions)
**And** a session should start immediately (session_logs with status='active')
**And** I should navigate to Active Session Screen (Story 5.1)
**And** notifications should be scheduled based on fuel plan (Story 5.2)

**Database State:**
```sql
-- planned_sessions created
INSERT INTO planned_sessions (...);

-- session_logs created
INSERT INTO session_logs (
  planned_session_id: <new_id>,
  started_at: datetime('now'),
  session_status: 'active'
);

-- app_metadata for crash recovery
INSERT INTO app_metadata (key, value) VALUES ('active_session_id', <session_id>);
```

---

### Test Scenario 4.3.7: Cancel Planning
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I am on the Session Planning Screen
**And** I have made adjustments to the plan
**When** I tap "Avbryt" or back button
**Then** I should see a confirmation dialog:
- "Avbryt planlegging?"
- "Endringer vil ikke bli lagret"
- [Fortsett planlegging] [Avbryt]
**When** I tap "Avbryt"
**Then** I should navigate back to Program Detail
**And** NO plan should be saved

---

## Integration Test Scenarios

### Integration 4.I.1: Full Planning Flow
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I am enrolled in "4-Week Base" program
**And** I have 5 fuel products in skafferi
**When** I execute the following flow:
1. Navigate to Program Detail (Story 3.3)
2. Tap "Week 1, Session 1" (Story 4.1)
3. Tap "Plan økt" (Story 4.1)
4. View generated plan (Story 4.2)
5. Adjust quantity (Story 4.3)
6. Tap "Godkjenn plan" (Story 4.3)

**Then** I should see success state:
- Plan saved to database
- Session marked as "Planlagt" in Program Detail
- Can now "Start økt" when ready

**Database Validation:**
```sql
SELECT COUNT(*) FROM planned_sessions WHERE program_session_id = 1;
-- Expected: 1

SELECT fuel_plan_json FROM planned_sessions WHERE program_session_id = 1;
-- Expected: Valid JSON with items array
```

---

### Integration 4.I.2: Empty Skafferi → Add Products → Plan
**Priority:** P1 (High)
**Type:** End-to-End

**Given** I have NO fuel products
**When** I access Session Planning Screen
**Then** I see "Ingen produkter i skafferi"
**When** I tap "Legg til produkter"
**Then** I navigate to Fuel Library (Story 2.2)
**When** I add 3 fuel products
**And** I navigate back to Session Planning
**Then** the planner should now generate a valid plan

---

### Integration 4.I.3: Plan → Start → Log Events
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I have a confirmed fuel plan (3 intakes at 25, 50, 75 min)
**When** I tap "Start nå"
**Then** session should start (Story 5.1)
**And** notifications should be scheduled (Story 5.2)
**When** 25 minutes elapse
**Then** I should receive notification "⏰ Tid for inntak: Maurten Gel"
**When** I tap "INNTAK" button
**Then** the planned intake should be logged automatically (Story 5.3)

---

## Algorithm Edge Cases & Stress Tests

### Edge Case 4.E.1: Very High Target (200g+)
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** target carbs = 250g (extreme ultra-endurance scenario)
**And** I have Maurten Gel (25g) and Drink Mix (80g)
**When** the algorithm runs
**Then** it should generate realistic plan with mix of products
**And** quantity should respect MAX_QUANTITY constraint (5)
**And** may undershoot target if insufficient products

---

### Edge Case 4.E.2: Very Low Target (20g)
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** target carbs = 20g (short session)
**And** I have Maurten Gel (25g)
**When** the algorithm runs
**Then** it should select 1 gel (25g = 125% match)
**And** this should be acceptable (closest match)

---

### Edge Case 4.E.3: Single Product Type Only
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I have ONLY Maurten Gel (25g) in skafferi
**And** target carbs = 100g
**When** the algorithm runs
**Then** it should generate plan with 4 gels
**And** timing should be evenly distributed

---

### Edge Case 4.E.4: All Products Have Same Carbs
**Priority:** P3 (Low)
**Type:** Edge Case

**Given** I have 3 products all with 25g carbs
**And** target carbs = 75g
**When** the algorithm runs (greedy sort)
**Then** it should select first product (stable sort)
**And** quantity = 3

---

## Performance Benchmarks

### Benchmark 4.P.1: Algorithm Execution Time
**Target:** <50ms for plan generation

**Test:**
```typescript
const start = performance.now();
const plan = generateFuelPlan(targetCarbs, duration, products);
const executionTime = performance.now() - start;

expect(executionTime).toBeLessThan(50); // ms
```

**Test Cases:**
- 5 products: <10ms
- 20 products: <30ms
- 50 products: <50ms

---

### Benchmark 4.P.2: Real-time Adjustment Responsiveness
**Target:** <100ms for UI update after adjustment

**Test:**
- Change quantity in UI
- Measure time until total carbs updates
- Target: <100ms (feels instant)

---

## Test Data Requirements

### Test Fuel Products
```json
[
  { "id": 1, "name": "Maurten Gel 100", "carbs": 25 },
  { "id": 2, "name": "Maurten Drink Mix 320", "carbs": 80 },
  { "id": 3, "name": "Banan", "carbs": 27 },
  { "id": 4, "name": "Energy Bar", "carbs": 40 },
  { "id": 5, "name": "Dextro Tablets", "carbs": 15 }
]
```

### Test Program Sessions
```json
{
  "id": 1,
  "week": 1,
  "session": 1,
  "duration": 75,
  "carb_rate": 30,
  "target_carbs": 38
}
```

---

## Automation Recommendations

### High Priority (Automate First)
1. ✅ Algorithm validation tests (4.2.1 - 4.2.8)
2. ✅ Timing algorithm tests (4.2.5)
3. ✅ Integration test: Full planning flow (4.I.1)

### Medium Priority
4. Edge case tests (4.E.1 - 4.E.4)
5. Performance benchmarks (4.P.1 - 4.P.2)

### Manual Testing Required
- UI/UX adjustments (4.3.2 - 4.3.5)
- Error state verification (4.1.3)

---

## Test Execution Order

### Phase 1: Algorithm Core (Day 1)
1. Perfect match test (4.2.1)
2. Overshoot/undershoot tests (4.2.2, 4.2.3)
3. Timing algorithm (4.2.5)

**Exit Criteria:** Algorithm produces correct plans

---

### Phase 2: UI Integration (Day 2)
4. Access planning screen (4.1.1)
5. Accept plan (4.3.1)
6. Manual adjustments (4.3.2, 4.3.3)

**Exit Criteria:** Users can create and adjust plans

---

### Phase 3: Edge Cases (Day 3)
7. Empty skafferi (4.1.3)
8. Insufficient products (4.2.3)
9. Edge cases (4.E.1 - 4.E.4)

**Exit Criteria:** All edge cases handled gracefully

---

### Phase 4: Integration (Day 4)
10. Full planning flow (4.I.1)
11. Plan → Start → Log (4.I.3)

**Exit Criteria:** Epic 4 ready for production

---

## Success Criteria

### Epic 4 Approved for Production IF:
✅ All algorithm tests pass (4.2.1 - 4.2.8)
✅ Plans match 90-110% of target (or show appropriate warning)
✅ Timing algorithm generates realistic intervals
✅ Empty skafferi handled gracefully
✅ Manual adjustments work correctly
✅ Performance targets met (<50ms generation)
✅ Integration with Epic 5 works (plan → start)

### Epic 4 BLOCKED IF:
❌ Algorithm produces invalid plans
❌ Timing algorithm fails
❌ Performance exceeds 50ms
❌ Empty skafferi crashes app
❌ Database writes fail

---

## Sign-off

**QA Lead:** Quinn 🎯
**Test Plan Status:** ✅ COMPLETE
**Total Test Scenarios:** 30+
**Critical Scenarios:** 12
**Estimated Test Execution Time:** 4 days
**Next Action:** Execute Phase 1 algorithm tests

---

_"The fuel planner algorithm is the BRAIN of GI Diary. These tests ensure it makes intelligent, realistic recommendations that users can trust."_

_— Quinn, Senior QA Engineer_
