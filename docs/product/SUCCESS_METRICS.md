# Success Metrics - GI Diary

**Version:** 1.0
**Created:** 2025-10-24
**Owner:** John (Product Manager) 📊 + Sarah (Product Owner)
**Status:** Active

---

## 🎯 Purpose

This document defines **how we measure success** for GI Diary MVP. Each PRD goal (G1-G5) has specific, measurable metrics to determine if we've achieved our mission.

**Philosophy:** "If you can't measure it, you can't manage it."

---

## 📊 PRD Goals → Success Metrics

### **G1: Strukturert Mage-trening**

**Goal Statement (from PRD):**
> "80% av brukere fullfører minst 1 komplett program (8-12 økter)"

---

#### **Metric G1.1: Program Completion Rate**

**Definition:** Percentage of users who complete at least 1 full program (all sessions).

**Target:** ≥ 80%

**Measurement Method:**
```sql
-- SQLite Query (run weekly)
SELECT
  COUNT(DISTINCT user_id) AS total_users,
  COUNT(DISTINCT CASE
    WHEN completed_sessions = total_sessions THEN user_id
  END) AS users_completed_program,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN completed_sessions = total_sessions THEN user_id END)
    / COUNT(DISTINCT user_id),
    1
  ) AS completion_rate_pct
FROM (
  SELECT
    upe.user_id,
    p.id AS program_id,
    COUNT(DISTINCT ps.id) AS total_sessions,
    COUNT(DISTINCT sl.id) AS completed_sessions
  FROM user_program_enrollments upe
  JOIN programs p ON upe.program_id = p.id
  JOIN program_sessions ps ON p.id = ps.program_id
  LEFT JOIN session_logs sl ON ps.id = sl.planned_session_id
    AND sl.session_status = 'completed'
  GROUP BY upe.user_id, p.id
);
```

**Data Collection:**
- Automated query run weekly
- Stored in analytics log (or exported CSV)

**Success Threshold:**
- ✅ **GREEN:** ≥ 80%
- 🟡 **YELLOW:** 60-79%
- 🔴 **RED:** < 60%

**Action if Red:**
- Investigate drop-off points (which session do users quit?)
- Add motivational nudges (notifications, progress bars)
- Simplify program structure (fewer sessions?)

---

#### **Metric G1.2: Average Sessions per User**

**Definition:** Mean number of completed sessions per user.

**Target:** ≥ 8 sessions (minimum program length)

**Measurement Method:**
```sql
SELECT
  AVG(session_count) AS avg_sessions_per_user,
  MIN(session_count) AS min_sessions,
  MAX(session_count) AS max_sessions,
  ROUND(STDEV(session_count), 1) AS std_dev
FROM (
  SELECT user_id, COUNT(*) AS session_count
  FROM session_logs
  WHERE session_status = 'completed'
  GROUP BY user_id
);
```

**Success Threshold:**
- ✅ **GREEN:** ≥ 8 sessions
- 🟡 **YELLOW:** 5-7 sessions
- 🔴 **RED:** < 5 sessions

---

### **G2: Enkel Logging**

**Goal Statement (from PRD):**
> "< 5 sekunder å logge en hendelse (intake/ubehag)"

---

#### **Metric G2.1: Average Logging Time**

**Definition:** Time between button tap (INNTAK/UBEHAG) and data persisted to database.

**Target:** < 5 seconds

**Measurement Method:**

**In-App Instrumentation:**
```typescript
// src/services/sessionManager.ts
export async function logIntake(fuelProductId: number, quantity: number) {
  const startTime = performance.now();

  // Insert event into database
  await SessionEventRepository.create({
    session_log_id: activeSessionId,
    event_type: 'intake',
    timestamp_offset_seconds: getCurrentSessionOffset(),
    data_json: { fuel_product_id: fuelProductId, quantity },
  });

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log performance metric
  logPerformanceMetric('logging_time', duration);

  return duration;
}
```

**Analytics Query:**
```sql
-- Assuming performance_metrics table exists
SELECT
  AVG(duration_ms) AS avg_logging_time_ms,
  MAX(duration_ms) AS max_logging_time_ms,
  ROUND(PERCENTILE(duration_ms, 0.95), 0) AS p95_logging_time_ms
FROM performance_metrics
WHERE metric_name = 'logging_time'
  AND created_at >= date('now', '-7 days');
```

**Success Threshold:**
- ✅ **GREEN:** < 3 seconds (avg)
- 🟡 **YELLOW:** 3-5 seconds (avg)
- 🔴 **RED:** > 5 seconds (avg)

**Action if Red:**
- Optimize database write queries
- Add loading spinner (perceived performance)
- Pre-load fuel products (reduce query time)

---

#### **Metric G2.2: User-Perceived Ease of Use**

**Definition:** Subjective rating of logging ease (post-session survey).

**Target:** ≥ 4.0 / 5.0

**Measurement Method:**

**In-App Survey (after session ends):**
```
"Hvor enkelt var det å logge inntak og ubehag under økten?"

[1] [2] [3] [4] [5]
Veldig vanskelig      Veldig enkelt
```

**Data Collection:**
- Survey shown after session ends (optional, skip-able)
- Results stored in `user_feedback` table

**Success Threshold:**
- ✅ **GREEN:** ≥ 4.0 / 5.0
- 🟡 **YELLOW:** 3.0-3.9 / 5.0
- 🔴 **RED:** < 3.0 / 5.0

---

### **G3: Datadrevet Innsikt**

**Goal Statement (from PRD):**
> "70% opplever 'aha moment' etter 5 økter (når appen begynner å gi innsikt)"

---

#### **Metric G3.1: "Aha Moment" Rate**

**Definition:** Percentage of users who report experiencing valuable insights after ≥5 sessions.

**Target:** ≥ 70%

**Measurement Method:**

**In-App Survey (after 5 completed sessions):**
```
"Har appen hjulpet deg med å forstå hva som fungerer/ikke fungerer for deg?"

○ Ja, jeg har fått verdifull innsikt! (1)
○ Delvis, noen nyttige mønstre (0.5)
○ Nei, ikke enda (0)
```

**Analytics Query:**
```sql
SELECT
  COUNT(*) AS total_responses,
  SUM(CASE WHEN response = 'yes' THEN 1 ELSE 0 END) AS yes_count,
  ROUND(
    100.0 * SUM(CASE WHEN response = 'yes' THEN 1 ELSE 0 END) / COUNT(*),
    1
  ) AS aha_moment_pct
FROM user_feedback
WHERE feedback_type = 'aha_moment'
  AND session_count >= 5;
```

**Success Threshold:**
- ✅ **GREEN:** ≥ 70%
- 🟡 **YELLOW:** 50-69%
- 🔴 **RED:** < 50%

**Action if Red:**
- Improve recommendation algorithm (Epic 7)
- Add more insight types (timing patterns, product success rate)
- Show insights earlier (after 3 sessions instead of 5?)

---

#### **Metric G3.2: Recommendation Quality Score**

**Definition:** Percentage of recommendations marked as "helpful" by users.

**Target:** ≥ 60%

**Measurement Method:**

**In-App Feedback (after viewing recommendation):**
```
"Var denne innsikten nyttig?"

👍 Ja (1)   👎 Nei (0)
```

**Analytics Query:**
```sql
SELECT
  COUNT(*) AS total_recommendations,
  SUM(helpful_rating) AS helpful_count,
  ROUND(
    100.0 * SUM(helpful_rating) / COUNT(*),
    1
  ) AS helpful_pct
FROM recommendation_feedback;
```

**Success Threshold:**
- ✅ **GREEN:** ≥ 60%
- 🟡 **YELLOW:** 40-59%
- 🔴 **RED:** < 40%

---

### **G4: Privacy-First**

**Goal Statement (from PRD):**
> "0 data breaches, 100% av data lagres lokalt på enheten"

---

#### **Metric G4.1: Data Breach Count**

**Definition:** Number of security incidents where user data was exposed.

**Target:** 0

**Measurement Method:**
- Manual security audit (quarterly)
- Monitor crash logs for sensitive data leaks
- User reports of unauthorized access

**Success Threshold:**
- ✅ **GREEN:** 0 breaches
- 🔴 **RED:** ≥ 1 breach

**Action if Red:**
- Immediate incident response
- Security patch released within 24 hours
- User notification (if required by GDPR)

---

#### **Metric G4.2: Offline Functionality Coverage**

**Definition:** Percentage of core features that work without internet connection.

**Target:** 100%

**Measurement Method:**

**Manual Testing Checklist:**
```
Core Features (Must Work Offline):
[ ] Onboarding (Epic 1)
[ ] Add/edit fuel products (Epic 2)
[ ] Browse programs (Epic 3)
[ ] Plan session (Epic 4)
[ ] Start session (Epic 5)
[ ] Log intake/discomfort (Epic 5)
[ ] End session (Epic 5)
[ ] View session history (Epic 7)
[ ] View recommendations (Epic 7)

Optional Features (Can Require Internet):
[ ] Strava OAuth (Epic 6)
[ ] Sync activities (Epic 6)
```

**Success Threshold:**
- ✅ **GREEN:** 9/9 core features work offline (100%)
- 🔴 **RED:** < 9/9

---

#### **Metric G4.3: User Data Ownership Score**

**Definition:** User awareness that they own their data (survey).

**Target:** ≥ 80% aware

**Measurement Method:**

**User Survey (Week 4 post-launch):**
```
"Hvor trygg føler du at dine data er i GI Diary?"

○ Veldig trygg - jeg vet at dataene mine aldri forlater telefonen min (1)
○ Noe trygg - tror dataene mine er sikre (0.5)
○ Usikker - vet ikke hvor dataene mine lagres (0)
```

**Success Threshold:**
- ✅ **GREEN:** ≥ 80% "veldig trygg"
- 🟡 **YELLOW:** 60-79%
- 🔴 **RED:** < 60%

---

### **G5: Offline-Funksjonalitet**

**Goal Statement (from PRD):**
> "100% av kjernefeatures fungerer uten internett"

---

#### **Metric G5.1: Offline Feature Coverage**

**Definition:** Same as G4.2 (Offline Functionality Coverage).

**Target:** 100%

**Measurement Method:** See G4.2

---

#### **Metric G5.2: Crash-Free Rate**

**Definition:** Percentage of sessions that don't crash.

**Target:** ≥ 99%

**Measurement Method:**
- Use crash reporting tool (e.g., Sentry, Bugsnag)
- Track: `(total_sessions - crashed_sessions) / total_sessions`

**Success Threshold:**
- ✅ **GREEN:** ≥ 99%
- 🟡 **YELLOW:** 95-98.9%
- 🔴 **RED:** < 95%

**Action if Red:**
- Prioritize crash fixes immediately
- Add more error boundaries (React error handling)
- Improve crash recovery module

---

## 📈 Performance Metrics (Non-PRD Goals)

### **P1: App Launch Time**

**Target:** < 2 seconds

**Measurement Method:**
- Measure time from app icon tap to first screen render
- Use performance profiling tools

**Success Threshold:**
- ✅ **GREEN:** < 2 seconds
- 🟡 **YELLOW:** 2-3 seconds
- 🔴 **RED:** > 3 seconds

---

### **P2: Database Query Performance**

**Target:** < 50ms for typical queries

**Measurement Method:**
- Instrument all database queries (see G2.1 example)
- Track p95 latency

**Success Threshold:**
- ✅ **GREEN:** < 50ms (p95)
- 🟡 **YELLOW:** 50-100ms (p95)
- 🔴 **RED:** > 100ms (p95)

---

### **P3: APK Size**

**Target:** < 50MB

**Measurement Method:**
- Check APK file size after EAS build

**Success Threshold:**
- ✅ **GREEN:** < 50MB
- 🟡 **YELLOW:** 50-75MB
- 🔴 **RED:** > 75MB

---

## 📊 Reporting & Dashboards

### **Weekly Metrics Report (Sent by John every Friday):**

**Template:**
```
GI Diary - Weekly Metrics Report (Week X)

**G1: Strukturert Mage-trening**
- Program Completion Rate: 75% (🟡 Target: 80%)
- Avg Sessions per User: 6.2 (🟡 Target: 8)

**G2: Enkel Logging**
- Avg Logging Time: 2.1s (✅ Target: <5s)
- Ease of Use Rating: 4.3/5 (✅ Target: ≥4.0)

**G3: Datadrevet Innsikt**
- "Aha Moment" Rate: 68% (🟡 Target: 70%)
- Recommendation Quality: 55% (🟡 Target: 60%)

**G4: Privacy-First**
- Data Breaches: 0 (✅ Target: 0)
- Offline Coverage: 100% (✅ Target: 100%)

**G5: Offline-Funksjonalitet**
- Crash-Free Rate: 97.2% (🟡 Target: 99%)

**Performance:**
- App Launch Time: 1.8s (✅ Target: <2s)
- DB Query p95: 42ms (✅ Target: <50ms)
- APK Size: 48MB (✅ Target: <50MB)

**Action Items:**
1. 🔴 Improve program completion rate (add motivational nudges)
2. 🟡 Investigate crash causes (target 99%)
3. 🟡 Enhance recommendation algorithm (target 70% aha moment)
```

---

### **Dashboard Location:**

**Option 1:** Manual Google Sheets (MVP)
- Weekly manual data entry from SQLite queries
- Simple charts (line graphs, bar charts)

**Option 2:** Automated (v2.0+)
- Build analytics dashboard (web app)
- Auto-sync from SQLite exports
- Real-time charts

---

## 🎯 Post-Launch Success Criteria

### **Week 4 (First Milestone):**
- ✅ ≥ 5 beta users actively using app
- ✅ ≥ 3 users completed 5+ sessions
- ✅ ≥ 1 user completed full program
- ✅ 0 critical bugs reported
- ✅ Crash-free rate > 95%

### **Week 12 (MVP Success):**
- ✅ ≥ 20 active users
- ✅ ≥ 10 users completed 5+ sessions
- ✅ ≥ 5 users completed full program
- ✅ Program completion rate ≥ 60% (relaxed target)
- ✅ "Aha moment" rate ≥ 60% (relaxed target)
- ✅ 0 data breaches
- ✅ Crash-free rate > 99%

### **Week 24 (v1.2 Success):**
- ✅ ≥ 50 active users
- ✅ Program completion rate ≥ 70%
- ✅ "Aha moment" rate ≥ 70%
- ✅ Strava integration working (if Epic 6 launched)
- ✅ 4.5+ star rating (if launched to public)

---

## 🚧 Risks to Metrics

### **Risk M1: Small Sample Size (Beta)**
**Impact:** Metrics unreliable with < 10 users

**Mitigation:**
- Focus on qualitative feedback initially (interviews)
- Set lower success thresholds for beta (60% instead of 80%)
- Recruit more beta testers (target: 20+)

---

### **Risk M2: Selection Bias (Early Adopters)**
**Impact:** Beta users more motivated than general users

**Mitigation:**
- Acknowledge bias in reporting
- Adjust targets for public launch (lower expected completion rate)
- Recruit diverse beta testers (not just ultra-runners)

---

### **Risk M3: Measurement Overhead**
**Impact:** Too much instrumentation slows down app

**Mitigation:**
- Only measure critical metrics (G1-G5 + P1-P3)
- Sample performance metrics (10% of events, not 100%)
- Disable verbose logging in production builds

---

## 📞 Ownership & Reporting

| Metric | Owner | Frequency | Reported To |
|--------|-------|-----------|-------------|
| G1.1 Program Completion | John (PM) | Weekly | Sarah (PO), Team |
| G2.1 Logging Time | Dev Team | Weekly | John (PM) |
| G3.1 "Aha Moment" Rate | John (PM) | Bi-weekly | Sarah (PO) |
| G4.1 Data Breaches | Winston (Architect) | Quarterly | Sarah (PO), Leadership |
| G5.2 Crash-Free Rate | Quinn (QA) | Daily | Dev Team, John (PM) |
| P1-P3 Performance | Dev Team | Weekly | Winston (Architect) |

---

## 📚 Related Documents

- **PRD:** `docs/prd.md` (G1-G5 goals defined)
- **Roadmap:** `docs/product/ROADMAP.md` (timeline)
- **Testing:** `docs/testing/AUTOMATION_GUIDE.md` (test coverage)
- **Stakeholder Comms:** `docs/product/STAKEHOLDER_COMMS.md`

---

**Last Updated:** 2025-10-24 by John (Product Manager) 📊

**Next Review:** After MVP Beta Release (Week 12)

---

_"In God we trust. All others must bring data."_
— W. Edwards Deming (Quality Management Pioneer)
