# Testing Documentation - GI Diary

This directory contains comprehensive test scenarios for all MVP epics of GI Diary.

---

## 📋 Overview

**Total Test Scenarios:** 115+
**Coverage:** Epics 4, 5, 7 (CRITICAL paths)
**Format:** Given-When-Then (Gherkin-style)
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## 📁 Test Scenario Documents

### 1. Epic 4: Planning (Fuel Planner)
**File:** `epic-4-test-scenarios.md`
**Scenarios:** 30+
**Priority:** P0 (Must-Have)
**Test Duration:** 4 days

**Focus Areas:**
- ✅ Fuel planner algorithm validation
- ✅ Timing calculation accuracy
- ✅ Edge cases (empty skafferi, insufficient products)
- ✅ Manual plan adjustments
- ✅ Database query optimization

**Critical Tests:**
- Algorithm produces 90-110% match of target
- Timing distributed evenly across session
- Greedy algorithm selects optimal products
- Performance: <50ms for plan generation

**Stories Covered:**
- 4.1: Session Planning Screen
- 4.2: Fuel Planner Algorithm (CRITICAL)
- 4.3: Confirm Plan

---

### 2. Epic 5: Session Mode (Økt-modus)
**File:** `epic-5-test-scenarios.md`
**Scenarios:** 40+
**Priority:** P0 (CRITICAL - Product Core)
**Test Duration:** 7 days (includes 4-hour POC)

**Focus Areas:**
- ✅ Background timer reliability (4+ hours)
- ✅ Crash recovery system (Winston's implementation)
- ✅ Quick logging (<5 seconds per action)
- ✅ Notification delivery while backgrounded
- ✅ Data integrity and transaction safety

**Critical Tests:**
- ⚠️ **4-hour background timer POC** (BLOCKER)
- Crash recovery after force-quit
- Auto-save every 30 seconds
- Quick intake logging (<2 seconds)
- Concurrent event logging

**Stories Covered:**
- 5.1: Start Session Mode (with crash recovery)
- 5.2: Intake Notifications
- 5.3: Log Intake
- 5.4: Log Discomfort
- 5.5: End Session (with cleanup)
- 5.CR: Crash Recovery (7 scenarios)

---

### 3. Epic 7: Analysis & Insights
**File:** `epic-7-test-scenarios.md`
**Scenarios:** 45+
**Priority:** P1 (High Priority)
**Test Duration:** 4 days

**Focus Areas:**
- ✅ Data visualization (Victory Native charts)
- ✅ Smart recommendation algorithm
- ✅ Pattern identification across sessions
- ✅ Program progression tracking
- ✅ Program comparison

**Critical Tests:**
- Chart rendering performance (50+ data points)
- Recommendation algorithm accuracy
- Query aggregation performance (<50ms)
- Program comparison with normalization
- Database query optimization

**Stories Covered:**
- 7.1: View Session Detail
- 7.2: Visualize Intake vs Discomfort
- 7.3: Identify Patterns
- 7.4: Smart Recommendations (algorithm)
- 7.5: Add Session Notes
- 7.6: Program Progression Graph (NEW)
- 7.7: Compare Programs (NEW)

---

## 🎯 Test Execution Strategy

### Phase 1: Foundation (Epics 1-3)
**Duration:** Week 1-2
**Focus:** Basic functionality

**Not yet documented** (straightforward CRUD operations):
- Epic 1: Onboarding (3 stories)
- Epic 2: Fuel Library (3 stories)
- Epic 3: Programs (5 stories)

**Recommendation:** Create lightweight test checklists for these (can use manual testing)

---

### Phase 2: Core Functionality (Epic 4 + 5)
**Duration:** Week 3-4
**Focus:** Algorithm validation + Session mode

**Week 3: Epic 4 (Planning)**
- Day 1: Algorithm core tests (4.2.1 - 4.2.8)
- Day 2: UI integration (4.1, 4.3)
- Day 3: Edge cases (4.E.1 - 4.E.4)
- Day 4: Integration tests (4.I.1 - 4.I.3)

**Week 4: Epic 5 (Session Mode) - CRITICAL**
- Day 1-2: Core functionality (5.1-5.5)
- Day 3-4: **Background timer POC** (BLOCKER)
- Day 5-6: Crash recovery + integration
- Day 7: Performance + edge cases

**Exit Criteria:** Epic 5 POC must pass before proceeding

---

### Phase 3: Value Delivery (Epic 7)
**Duration:** Week 5
**Focus:** Analysis and insights

- Day 1: Session detail + visualization (7.1, 7.2)
- Day 2: Pattern identification (7.3)
- Day 3: Recommendations algorithm (7.4)
- Day 4: Advanced analysis (7.6, 7.7)

**Dependencies:** Epic 5 must be complete (need real session data)

---

## 🧪 Test Data

### Setup Script
**File:** `scripts/setupTestData.ts`

**Creates:**
- 3 test user personas (Maria, Erik, Kari)
- 8 realistic fuel products
- 13 completed sessions with events
- 1 active session (crash recovery test)

**Usage:**
```bash
npx ts-node scripts/setupTestData.ts
```

**Test Personas:**
| Name | ID | Profile | Sessions | Use For |
|------|-----|---------|----------|---------|
| Maria | 1 | New User | 1 active | Crash recovery, onboarding |
| Erik | 2 | Active User | 4 completed | Pattern analysis, Story 7.1-7.5 |
| Kari | 3 | Advanced User | 8 completed | Recommendations, progression, comparison |

**See:** `scripts/README.md` for detailed documentation

---

## 📊 Test Coverage Matrix

| Epic | Stories | Scenarios | Priority | Status | Dependencies |
|------|---------|-----------|----------|--------|--------------|
| Epic 1 (Onboarding) | 3 | (TBD) | P0 | Not documented | None |
| Epic 2 (Fuel Library) | 3 | (TBD) | P0 | Not documented | None |
| Epic 3 (Programs) | 5 | (TBD) | P0 | Not documented | Epic 2 |
| **Epic 4 (Planning)** | **3** | **30+** | **P0** | **✅ Complete** | **Epic 2, 3** |
| **Epic 5 (Session Mode)** | **5** | **40+** | **P0** | **✅ Complete** | **Epic 4** |
| Epic 6 (Integrations) | 3 | N/A | P2 | Not MVP | - |
| **Epic 7 (Analysis)** | **7** | **45+** | **P1** | **✅ Complete** | **Epic 5** |

**Total Documented:** 115+ test scenarios across 3 critical epics

---

## 🔬 Test Types

### Functional Testing (70%)
- User stories and acceptance criteria validation
- UI/UX behavior verification
- Navigation flows
- Data persistence

### Algorithm Validation (15%)
- Fuel planner greedy algorithm
- Timing calculation
- Recommendation generation
- Pattern detection

### Performance Testing (10%)
- Database query benchmarks (<50ms)
- Chart rendering performance (<2s)
- Algorithm execution time (<50-100ms)
- Background timer accuracy

### Integration Testing (5%)
- Cross-epic workflows
- Database integrity
- State management
- Navigation flows

---

## 🎓 Test Scenario Format

All test scenarios follow Given-When-Then format:

```gherkin
### Test Scenario X.Y.Z: Descriptive Title
**Priority:** P0 (Critical)
**Type:** Functional

**Given** [precondition/setup]
**And** [additional context]
**When** [action/trigger]
**Then** [expected result]
**And** [additional validation]
```

**Example:**
```gherkin
**Given** I have a fuel plan with 3 intakes
**When** I start the session
**Then** notifications should be scheduled
**And** auto-save should start every 30 seconds
```

---

## ⚡ Critical Test Scenarios (Must Pass)

### Epic 4: Fuel Planner
1. ✅ Algorithm produces 90-110% match (4.2.1, 4.2.2)
2. ✅ Timing calculation accurate (4.2.5)
3. ✅ Empty skafferi handled gracefully (4.1.3)
4. ✅ Performance: <50ms (4.P.1)

### Epic 5: Session Mode
1. ⚠️ **4-hour background timer works** (5.1.5) - BLOCKER
2. ✅ Crash recovery restores session (5.CR.1)
3. ✅ Auto-save every 30 seconds (5.CR.6)
4. ✅ Quick logging <5 seconds (5.3.1)
5. ✅ Notifications delivered while backgrounded (5.2.2)

### Epic 7: Analysis
1. ✅ Charts render 50+ data points smoothly (7.2.1)
2. ✅ Recommendations algorithm accurate (7.4.2 - 7.4.4)
3. ✅ Queries complete <50ms (7.P.3)
4. ✅ Program comparison handles different lengths (7.7.5)

---

## 🚨 Blockers and Risks

### BLOCKER: Epic 5 Background Timer POC
**Test Scenario:** 5.1.5
**Risk:** High
**Impact:** Product-breaking

**Status:** ⚠️ MUST PASS before Epic 5 implementation

**Test Requirements:**
- Physical Android device (NOT emulator)
- 4-hour continuous run
- App fully backgrounded
- Battery optimization enabled (realistic scenario)

**Success Criteria:**
- ✅ Timer accurate within ±30 seconds over 4 hours
- ✅ Battery drain <10% per hour
- ✅ All auto-saves complete (480 saves)
- ✅ App not killed by OS

**If POC fails:**
- STOP Epic 5 implementation
- Revisit architecture (consider alternatives: foreground service, silent audio)
- Re-test with new approach

---

### High-Risk Areas

#### Risk 1: Crash Recovery Reliability
**Epic:** 5
**Scenarios:** 5.CR.1 - 5.CR.7
**Mitigation:** Winston's implementation tested, but needs validation with real crashes

#### Risk 2: Chart Performance
**Epic:** 7
**Scenarios:** 7.2.1, 7.6.1, 7.7.2
**Mitigation:** Victory Native is optimized, but test with 100+ data points

#### Risk 3: Algorithm Accuracy
**Epic:** 4, 7
**Scenarios:** 4.2.x, 7.4.x
**Mitigation:** Comprehensive algorithm validation tests included

---

## 🔧 Automation Strategy

### High Priority for Automation (60%)
**Target:** Jest + React Native Testing Library

**Epic 4:**
- Algorithm validation tests (4.2.1 - 4.2.8)
- Timing calculation tests (4.2.5)
- Database queries (4.I.1)

**Epic 5:**
- Core functionality (5.1.1, 5.3.1, 5.4.1, 5.5.1)
- Crash recovery logic (5.CR.1, 5.CR.6)
- Database writes (5.CR.7)

**Epic 7:**
- Query validation (7.6.4, 7.7.6)
- Recommendation algorithm (7.4.2 - 7.4.5)
- Aggregation calculations (7.3.6)

---

### Medium Priority for Automation (25%)
**Target:** Detox (E2E)

- Full planning flow (4.I.1)
- Session lifecycle (5.I.1)
- Analysis navigation (7.I.1)

---

### Manual Testing Required (15%)

**Cannot be automated:**
- 4-hour background timer test (5.1.5)
- Notification delivery (5.2.2)
- Out-of-memory OS kill (5.CR.4)

**Better tested manually:**
- Chart visualization (7.2.1, 7.6.1, 7.7.2)
- UI/UX interactions (sorting, filtering, tapping)
- Error state validation

---

## 📈 Performance Targets

| Metric | Target | Test Scenario |
|--------|--------|---------------|
| Database write | <50ms | 5.P.1, 7.P.3 |
| UI responsiveness | <100ms | 4.P.2, 5.P.2 |
| Algorithm execution | <50ms (planner) | 4.P.1 |
| Algorithm execution | <100ms (recommendations) | 7.P.2 |
| Chart rendering | <2 seconds | 7.P.1 |
| Background timer accuracy | ±10s over 30 min | 5.1.4 |
| Background timer accuracy | ±30s over 4 hours | 5.1.5 |
| Battery drain | <10% per hour | 5.1.5 |

---

## 🎯 Definition of Done (DoD)

### For Each Test Scenario

**Functional Tests:**
- ✅ Test executes without errors
- ✅ Expected behavior matches actual behavior
- ✅ Database state verified (where applicable)
- ✅ Edge cases handled
- ✅ Error states validated

**Performance Tests:**
- ✅ Meets target benchmark
- ✅ No memory leaks
- ✅ No performance regressions

**Integration Tests:**
- ✅ Cross-epic workflows function correctly
- ✅ Data consistency across screens
- ✅ Navigation flows work

---

### For Each Epic

**Epic 4 (Planning) Ready IF:**
- ✅ All P0 scenarios pass (15+ critical)
- ✅ Algorithm produces valid plans
- ✅ Performance targets met
- ✅ Integration with Epic 3 and 5 works

**Epic 5 (Session Mode) Ready IF:**
- ✅ Background timer POC passes (4 hours)
- ✅ Crash recovery works 100%
- ✅ All P0 scenarios pass (20+ critical)
- ✅ Performance targets met (<5s per action)
- ✅ No data loss in any scenario

**Epic 7 (Analysis) Ready IF:**
- ✅ All P0 scenarios pass (10+ critical)
- ✅ Charts render correctly
- ✅ Recommendations accurate
- ✅ Queries optimized (<50ms)
- ✅ Depends on Epic 5 data availability

---

## 📚 Additional Resources

### Architecture Documents
- `docs/architecture/ARCHITECT_REVIEW.md` - Winston's architecture review
- `docs/architecture/epic-mapping.md` - Epic-to-architecture mapping

### User Stories
- `docs/stories/4.*.md` - Epic 4 stories (Planning)
- `docs/stories/5.*.md` - Epic 5 stories (Session Mode)
- `docs/stories/7.*.md` - Epic 7 stories (Analysis)

### PRD
- `docs/prd/epic-4-planning.md`
- `docs/prd/epic-5-session-mode.md`
- `docs/prd/epic-7-analysis.md`

### QA Review
- `docs/QA_REVIEW.md` - Comprehensive quality assessment

### Test Data
- `scripts/setupTestData.ts` - Test data population
- `scripts/clearTestData.ts` - Test data cleanup
- `scripts/inspectTestData.ts` - Data verification
- `scripts/README.md` - Test data documentation

---

## 🔄 Test Execution Workflow

### Development Workflow
```bash
# 1. Setup test data
npx ts-node scripts/setupTestData.ts

# 2. Run unit tests (Jest)
npm test

# 3. Run E2E tests (Detox)
npm run e2e

# 4. Manual testing with test data
# (Use Maria, Erik, or Kari personas)

# 5. Verify data integrity
npx ts-node scripts/inspectTestData.ts

# 6. Clean up (if needed)
npx ts-node scripts/clearTestData.ts
```

---

### QA Workflow
```bash
# Phase 1: Setup
npx ts-node scripts/clearTestData.ts
npx ts-node scripts/setupTestData.ts

# Phase 2: Execute test scenarios
# - Follow test scenario documents
# - Record results in spreadsheet or test management tool
# - Log bugs in issue tracker

# Phase 3: Validate
npx ts-node scripts/inspectTestData.ts

# Phase 4: Report
# - Update "QA Results" section in each story
# - Update test scenario status (PASS/FAIL)
# - Create summary report
```

---

### CI/CD Workflow (Future)
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  unit-tests:
    - Setup test data
    - Run Jest tests
    - Report coverage

  e2e-tests:
    - Setup test data
    - Run Detox tests
    - Upload screenshots

  performance:
    - Run benchmark tests
    - Compare with baseline
    - Fail if regressions
```

---

## 📝 Test Reporting Template

### Test Execution Summary
```markdown
# Test Execution Summary - Epic X

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Dev / Staging / Prod
**Test Data:** Maria / Erik / Kari

## Test Results
| Scenario | Expected | Actual | Status | Notes |
|----------|----------|--------|--------|-------|
| X.Y.1 | ... | ... | ✅ PASS | - |
| X.Y.2 | ... | ... | ❌ FAIL | Bug #123 |
| X.Y.3 | ... | ... | ⚠️ SKIP | Blocked by POC |

## Summary
- Total: 30 scenarios
- Passed: 25 (83%)
- Failed: 3 (10%)
- Skipped: 2 (7%)

## Critical Issues
1. [Bug #123] Crash recovery fails on Android 10
2. [Bug #124] Chart renders incorrectly with 100+ points

## Recommendations
- Fix critical bugs before production
- Re-test failed scenarios after fixes
```

---

## 🎓 Best Practices

### Writing Test Scenarios
1. ✅ Use Given-When-Then format
2. ✅ Be specific and unambiguous
3. ✅ Include expected database state (where applicable)
4. ✅ Specify test data requirements
5. ✅ Add validation steps
6. ✅ Consider edge cases

### Executing Tests
1. ✅ Setup clean test data before each run
2. ✅ Follow scenarios exactly as written
3. ✅ Record actual results (not just PASS/FAIL)
4. ✅ Take screenshots for UI tests
5. ✅ Log bugs immediately
6. ✅ Verify database state after tests

### Maintaining Test Scenarios
1. ✅ Update scenarios when stories change
2. ✅ Archive obsolete scenarios
3. ✅ Add new scenarios for bug fixes
4. ✅ Review and refine after each sprint
5. ✅ Keep test data scripts in sync

---

## 🏆 Success Metrics

### Test Coverage
- **Target:** 90% coverage of P0/P1 scenarios
- **Current:** 100% for Epics 4, 5, 7

### Defect Detection
- **Target:** Find 80% of bugs before production
- **Measure:** Bugs found in test vs prod

### Automation Rate
- **Target:** 60% automated (Jest + Detox)
- **Current:** 0% (MVP phase - manual testing first)

### Test Execution Time
- **Target:** <2 hours for full regression
- **Current:** ~15 days (7+4+4 for Epics 5, 4, 7)

---

## 📞 Contact

**QA Lead:** Quinn 🎯
**Created:** 2025-10-24
**Last Updated:** 2025-10-24
**Version:** 1.0

**Questions or Issues?**
- Review `docs/QA_REVIEW.md` for quality assessment
- Check test scenario documents for specific tests
- Verify test data with `scripts/inspectTestData.ts`

---

_"Quality is not an act, it is a habit." — Aristotle_

_These test scenarios ensure GI Diary delivers reliable, high-quality functionality that users can trust with their training data._

_— Quinn, Senior QA Engineer_
