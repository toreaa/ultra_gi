# Product Roadmap - GI Diary

**Version:** 1.0
**Created:** 2025-10-24
**Owner:** John (Product Manager) 📊
**Status:** Active Planning

---

## 🎯 Vision & Mission

**Vision:** "Gjøre mage-trening like strukturert og målbart som fysisk trening"

**Mission:** Hjelpe ultraløpere og maratonløpere med å optimalisere sitt GI-inntak gjennom databasert innsikt.

---

## 📅 Release Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│  MVP RELEASE ROADMAP - 12 WEEKS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 1-2:   Sprint 1  [Epic 1: Onboarding]                    │
│  Week 3-4:   Sprint 2  [Epic 2: Fuel Library]                  │
│  Week 5-6:   Sprint 3  [Epic 3: Programs + Epic 4: Planning]   │
│  Week 7-8:   Sprint 4  [Epic 5: Økt-modus] + POC               │
│  Week 9-10:  Sprint 5  [Epic 7: Analysis + Insights]           │
│  Week 11-12: Sprint 6  [Testing, Polish, APK Build]            │
│                                                                 │
│  → MVP Release: Week 12 (Beta to 5-10 test users)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Target MVP Release Date:** ~2025-02-14 (12 weeks from now)

---

## 🚀 Sprint Breakdown

### **Sprint 0: Foundation (Week 0 - CURRENT)**

**Status:** ✅ 90% Complete

**Goals:**
- ✅ Configuration files (Winston)
- ✅ All dependencies defined
- ✅ Testing infrastructure setup (Quinn)
- ✅ 26 user stories written (Bob)
- ⚪ Dev team assignment (BLOCKER)
- ⚪ Entry point (App.tsx)

**Deliverables:**
- ✅ `package.json`, `tsconfig.json`, `app.json`, `babel.config.js`, `.eslintrc.js`
- ✅ 115+ test scenarios (Epic 4, 5, 7)
- ✅ Test data management scripts
- ⚪ Runnable app (waiting for entry point)

**Blockers:**
- 🔴 Dev team not assigned yet

---

### **Sprint 1: Onboarding (Week 1-2)**

**Epic:** Epic 1 - Onboarding
**Stories:** 3 stories (1.1, 1.2, 1.3)
**Story Points:** 8 SP
**Team:** 2 developers + Quinn (QA)

**Goals:**
1. Create entry point (`App.tsx`)
2. Implement onboarding wizard (Story 1.1)
3. Implement goal/issue selection (Story 1.1)
4. Implement program recommendation (Story 1.2)
5. Setup user profile in SQLite (Story 1.3)
6. Write unit tests for Epic 1 (Quinn)

**Deliverables:**
- ✅ App launches successfully
- ✅ User can complete onboarding flow
- ✅ User profile stored in database
- ✅ Unit tests for onboarding logic
- ✅ Epic 1 test scenarios documented (Quinn)

**Success Criteria:**
- [ ] New user completes onboarding in < 2 minutes
- [ ] 100% test coverage for onboarding service
- [ ] No crashes during onboarding flow

**Demo:** End of Week 2 (to John + Sarah)

---

### **Sprint 2: Fuel Library (Week 3-4)**

**Epic:** Epic 2 - Fuel Library
**Stories:** 4 stories (2.1, 2.2, 2.3, 2.4)
**Story Points:** 13 SP
**Team:** 2 developers + Quinn (QA)

**Goals:**
1. Implement "Mitt Skafferi" list view (Story 2.1)
2. Implement add fuel product form (Story 2.2)
3. Implement edit fuel product (Story 2.3)
4. Implement delete fuel product (Story 2.4)
5. CRUD repository pattern for fuel_products table
6. Write unit tests for Epic 2 (Quinn)

**Deliverables:**
- ✅ User can add/edit/delete fuel products
- ✅ Fuel products persist in SQLite
- ✅ Soft delete pattern implemented
- ✅ Unit tests for fuel library CRUD
- ✅ Epic 2 test scenarios documented (Quinn)

**Success Criteria:**
- [ ] Adding fuel product takes < 30 seconds
- [ ] 90% test coverage for fuel repository
- [ ] No data loss on soft delete

**Demo:** End of Week 4 (to John + Sarah)

---

### **Sprint 3: Programs & Planning (Week 5-6)**

**Epics:** Epic 3 (Programs) + Epic 4 (Planning)
**Stories:** 9 stories (3.1-3.4, 4.1-4.5)
**Story Points:** 21 SP
**Team:** 2 developers + Quinn (QA)

**Goals:**
1. **Epic 3:**
   - Implement program browser (Story 3.1)
   - Implement start program flow (Story 3.2)
   - Implement program detail view (Story 3.3)
   - Program enrollment in database (Story 3.4)

2. **Epic 4:**
   - Implement session planning screen (Story 4.1)
   - Implement fuel plan generator algorithm (Story 4.2)
   - Implement timing calculator (Story 4.3)
   - Implement manual adjustment UI (Story 4.4)
   - Implement "Start nå" button (Story 4.5)

**Deliverables:**
- ✅ User can browse and enroll in programs
- ✅ User can plan a session with fuel products
- ✅ Fuel plan algorithm working (90-110% carb target)
- ✅ Unit tests for planning algorithm (already written by Quinn)
- ✅ Epic 3 test scenarios documented (Quinn)

**Success Criteria:**
- [ ] Fuel plan generated in < 50ms (performance test 4.P.1)
- [ ] Plan matches target ±10%
- [ ] 95% test coverage for fuel planner algorithm

**Demo:** End of Week 6 (to John + Sarah)

---

### **Sprint 4: Økt-modus (Active Session) (Week 7-8)**

**Epic:** Epic 5 - Økt-modus
**Stories:** 5 stories (5.1-5.5)
**Story Points:** 21 SP (HIGH COMPLEXITY)
**Team:** 2 developers + Quinn (QA) + Winston (POC support)

**Goals:**
1. ✅ **POC COMPLETE:** 4-hour background timer proven feasible (Winston - 2025-10-24)
2. Implement active session screen (Story 5.1)
3. Implement session timer using Winston's POC code (Story 5.2)
4. Implement INNTAK/UBEHAG buttons (Story 5.3, 5.4)
5. Implement session end + summary (Story 5.5)
6. Implement crash recovery module (already done by Winston)
7. Implement notifications (expo-notifications)
8. Add onboarding battery optimization tutorial (Epic 1)
9. Test on physical devices: Samsung Galaxy S21, Xiaomi Mi 11 (Quinn)

**Deliverables:**
- ✅ POC: 4-hour background timer works (~6% battery/hr)
- ✅ POC Code: `src/services/poc/sessionTimer.ts` (production-ready)
- ✅ POC Documentation: `docs/architecture/EPIC5_BACKGROUND_TIMER_POC.md`
- ✅ User can start/stop session
- ✅ User can log intake/discomfort events
- ✅ Session data persisted to SQLite
- ✅ Crash recovery works (already tested by Winston)
- ✅ Notifications scheduled for planned intakes
- ✅ Unit tests for session lifecycle (already written by Quinn)

**Success Criteria:**
- [x] Timer runs for 4 hours in background without crash (✅ POC proven on Pixel 6)
- [x] Battery drain < 10%/hr (✅ Actual: ~6%/hr)
- [ ] Events logged in < 5 seconds (G2 target)
- [ ] Crash recovery restores session 100% of time
- [ ] 90% test coverage for session manager
- [ ] Works on Samsung Galaxy S21 (aggressive battery optimization)
- [ ] Works on Xiaomi Mi 11 (very aggressive battery optimization)

**Risks (UPDATED - 2025-10-24):**
- ✅ **RESOLVED:** Background timer POC SUCCESS (Winston)
- 🟡 **NEW RISK R2.1:** Manufacturer-specific kills (Samsung/Xiaomi) - MEDIUM
  - **Mitigation:** Onboarding tutorial for disabling battery optimization
  - **Testing:** Verify on physical Samsung + Xiaomi devices in Sprint 4
- 🟢 **LOW:** iOS behavior unknown (defer to v1.1)

**Demo:** End of Week 8 (to John + Sarah + real users?)

---

### **Sprint 5: Analysis & Insights (Week 9-10)**

**Epic:** Epic 7 - Analysis & Insights
**Stories:** 5 stories (7.1-7.5)
**Story Points:** 18 SP
**Team:** 2 developers + Quinn (QA)

**Goals:**
1. Implement session history list (Story 7.1)
2. Implement session detail view with charts (Story 7.2)
3. Implement correlation engine (GI + timeseries) (Story 7.3)
4. Implement smart recommendations (Story 7.4)
5. Implement data export (CSV/JSON) (Story 7.5)
6. Victory Native charts integration

**Deliverables:**
- ✅ User can view past sessions
- ✅ User can see HR/elevation charts (if Strava synced)
- ✅ User can see recommendations (e.g., "Maurten Gel works well")
- ✅ User can export data to CSV
- ✅ Unit tests for recommendation algorithm (already written by Quinn)

**Success Criteria:**
- [ ] Recommendations generated in < 100ms (performance test 7.P.2)
- [ ] Charts render in < 2s (performance test 7.P.1)
- [ ] 70% of users experience "aha moment" (G3 target - post-launch survey)

**Demo:** End of Week 10 (to John + Sarah + beta users)

---

### **Sprint 6: Testing, Polish & Release (Week 11-12)**

**Epic:** None (cross-epic work)
**Stories:** Bug fixes, polish, testing
**Story Points:** 13 SP
**Team:** 2 developers + Quinn (QA) + Winston (build support)

**Goals:**
1. **E2E Testing:**
   - Run Detox E2E tests (Epic 4 E2E already written)
   - Write additional E2E tests for Epic 1-3, 5, 7
   - Fix any E2E failures

2. **Manual Testing:**
   - Quinn runs full test suite (115+ scenarios)
   - Test on 3 different Android devices
   - Test 4-hour session on real run

3. **Polish:**
   - UX Designer creates app icon + splash screen
   - Fix UI bugs
   - Performance optimization
   - Database migration testing

4. **Build & Deploy:**
   - Configure EAS build (`eas.json`)
   - Build production APK
   - Test APK installation
   - Distribute to 5-10 beta testers

**Deliverables:**
- ✅ All E2E tests passing
- ✅ All manual tests passing (0 critical bugs)
- ✅ Production APK built
- ✅ Beta distributed to 5-10 users

**Success Criteria:**
- [ ] 0 critical bugs
- [ ] < 5 minor bugs
- [ ] APK size < 50MB
- [ ] App launch < 2s

**MVP Release:** End of Week 12 (Internal Beta)

---

## 📊 Post-MVP Roadmap (v1.1 - v2.0)

### **v1.1 - Bug Fixes & Polish (Week 13-14)**

**Goals:**
- Fix bugs from beta testing
- Performance optimization
- UI polish based on beta feedback

**Deliverables:**
- ✅ Beta feedback incorporated
- ✅ Bug fixes deployed
- ✅ Crash-free rate > 99%

---

### **v1.2 - Strava Integration (Week 15-18)**

**Epic:** Epic 6 - Integrations (previously deferred)
**Stories:** 4 stories (6.1-6.4)
**Story Points:** 21 SP

**Goals:**
1. Strava OAuth PKCE flow
2. Sync activities (last 10)
3. Parse timeseries data (HR, elevation)
4. Correlate GI events with HR zones

**Prerequisites:**
- ✅ Winston's OAuth PKCE feasibility study
- ✅ Decision: Backend proxy or pure PKCE?

**Deliverables:**
- ✅ User can connect Strava account
- ✅ User can sync activities
- ✅ Charts show HR + elevation + GI events

---

### **v2.0 - Advanced Features (Week 19-24)**

**Goals:**
1. **Multi-user support** (family plans, coaching)
2. **Garmin Connect integration**
3. **AI-powered insights** (OpenAI/Anthropic API)
4. **Social features** (share sessions with friends)
5. **iOS version** (React Native already cross-platform)

**Deliverables:**
- ✅ iOS app in App Store
- ✅ AI-generated natural language insights
- ✅ Coach can view athlete's sessions

---

## 🎯 Key Milestones

| Milestone | Date | Status |
|-----------|------|--------|
| Configuration Complete | Week 0 (2025-10-24) | ✅ Done |
| App.tsx Entry Point Created | Week 0 (2025-10-24) | ✅ Done |
| Epic 5 Background Timer POC | Week 0 (2025-10-24) | ✅ Done |
| npm install Verified | Week 0 (2025-10-24) | ✅ Done |
| Dev Team Assigned | Week 0 | ⚪ Pending |
| Epic 1 Complete | End Week 2 | ⚪ Not Started |
| Epic 2 Complete | End Week 4 | ⚪ Not Started |
| Epic 3-4 Complete | End Week 6 | ⚪ Not Started |
| Epic 5 Complete + POC | End Week 8 | ⚪ Not Started |
| Epic 7 Complete | End Week 10 | ⚪ Not Started |
| **MVP Beta Release** | **End Week 12** | ⚪ Not Started |
| v1.1 Bug Fixes | End Week 14 | ⚪ Not Started |
| v1.2 Strava Integration | End Week 18 | ⚪ Not Started |
| v2.0 Advanced Features | End Week 24 | ⚪ Not Started |

---

## 🚧 Risks & Dependencies

### **Critical Risks:**

#### **R1: Dev Team Not Assigned** 🔴 BLOCKER
- **Impact:** Cannot start Sprint 1
- **Mitigation:** Sarah (PO) to assign 2 devs by end of Week 0
- **Status:** Open

#### **R2: Epic 5 Background Timer May Fail** ✅ RESOLVED + APPROVED
- **Impact:** Must redesign Epic 5 (2-week delay)
- **Mitigation:** Run POC in Sprint 4, have backup plan ready
- **Status:** ✅ **RESOLVED** (POC Complete - 2025-10-24)
- **Decision:** ✅ **GO** - Sarah (PO) approved Epic 5 for Sprint 4 (2025-10-24)
- **POC Result:** 4-hour timer proven feasible (Hybrid Approach: foreground service + 10s updates)
- **Battery Drain:** ~6% per hour (under 10%/hr target)
- **New Risk R2.1:** Manufacturer-specific kills on Samsung/Xiaomi devices (🟡 MEDIUM)
  - **Mitigation:** Onboarding tutorial for battery optimization + physical device testing in Sprint 4
  - **Status:** Accepted risk - proceed with mitigation plan

#### **R3: Test Data Shows Poor GI Insights** 🟡 MEDIUM
- **Impact:** Users don't get value from Epic 7 (G3 goal fails)
- **Mitigation:** Work with real users (Marit/Erik) early, iterate on recommendations
- **Status:** Open

#### **R4: Strava OAuth PKCE Requires Backend** 🟡 MEDIUM
- **Impact:** v1.2 delayed or requires backend dev (out of scope)
- **Mitigation:** Winston's feasibility study before committing to Epic 6
- **Status:** Open (study not started)

---

### **Dependencies:**

| Dependency | Owner | Due Date | Status |
|------------|-------|----------|--------|
| Dev Team Assignment | Sarah (PO) | End Week 0 | ⚪ Pending |
| Epic 5 Background Timer POC | Winston | Sprint 4 | ✅ **Complete** (2025-10-24) |
| Epic 1-3 Test Scenarios | Quinn (QA) | Week 2 | ⚪ Not Started |
| App Icon + Splash Screen | UX Designer | Sprint 6 | ⚪ Not Started |
| CI/CD Pipeline Setup | Winston/Dev Lead | Week 2 | ⚪ Not Started |
| OAuth PKCE Feasibility Study | Winston | Before Sprint 7 | ⚪ Not Started |

---

## 📈 Success Criteria (MVP Release)

### **Must-Have (P0):**
- ✅ All Epic 1-5, 7 stories completed (26 stories)
- ✅ 0 critical bugs
- ✅ Crash-free rate > 95%
- ✅ All unit tests passing (70% coverage minimum)
- ✅ APK built and installable
- ✅ 5-10 beta testers using app

### **Should-Have (P1):**
- ✅ 90% test coverage for critical services
- ✅ All E2E tests passing
- ✅ Performance targets met (launch < 2s, queries < 50ms)
- ✅ App icon + splash screen (professional look)

### **Nice-to-Have (P2):**
- ✅ CI/CD pipeline running
- ✅ Pre-commit hooks (Husky)
- ✅ Code coverage reports
- ✅ Database seed data for demos

---

## 🎯 Goals Mapping (PRD → Roadmap)

| PRD Goal | Roadmap Delivery | Measurement |
|----------|------------------|-------------|
| **G1:** Strukturert Mage-trening | Epic 3 (Programs) + Epic 5 (Økt-modus) | 80% complete 1 program |
| **G2:** Enkel Logging | Epic 5 (Økt-modus) | < 5 sec per logging |
| **G3:** Datadrevet Innsikt | Epic 7 (Analysis) | 70% "aha moment" |
| **G4:** Privacy-First | All Epics (offline-first) | 0 data breaches |
| **G5:** Offline-Funksjonalitet | All Epics (SQLite) | 100% core features offline |

---

## 📞 Stakeholder Communication

**Weekly Updates:** Every Friday (John to send)
**Sprint Demos:** End of each sprint (to Sarah + John)
**Beta Feedback:** Week 13 (after MVP release)

See `STAKEHOLDER_COMMS.md` for details.

---

## 📚 Related Documents

- **PRD:** `docs/prd.md` (master document)
- **Architecture:** `docs/architecture/tech-stack.md`
- **Stories:** `docs/stories/*.md` (26 stories)
- **Testing:** `docs/testing/AUTOMATION_GUIDE.md`
- **Success Metrics:** `docs/product/SUCCESS_METRICS.md`
- **Stakeholder Comms:** `docs/product/STAKEHOLDER_COMMS.md`

---

**Last Updated:** 2025-10-24 by John (Product Manager) 📊
**Next Update:** After Sprint 1 completion (Week 2)

---

_"A roadmap without dates is a wish list. A roadmap without risks is a fantasy."_
— John, Product Manager 📊
