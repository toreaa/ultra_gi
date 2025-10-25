# Epic 7: Analysis & Insights - Test Scenarios

**Epic:** EPIC-7 "Analyse & Innsikt" (Fase 3: Etterpå)
**Priority:** P1 (High Priority)
**Test Type:** Functional, Data Visualization, Analytics Algorithm
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## Test Overview

Epic 7 validates the analysis and insights features - the VALUE DELIVERY layer that turns raw data into actionable insights. This epic must:
1. ✅ Display session data in meaningful visualizations
2. ✅ Identify patterns across multiple sessions
3. ✅ Generate smart recommendations
4. ✅ Compare program effectiveness
5. ✅ Enable data-driven training decisions

**Note:** This epic depends on having REAL DATA from Epic 5 (completed sessions with events).

---

## Story 7.1: View Session Detail

### Test Scenario 7.1.1: View Completed Session Timeline
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have a completed session:
- Duration: 75 minutes
- Events: 3 intakes, 2 discomforts
- Started: 2025-10-24 10:00:00
**When** I navigate to Session Detail Screen (from Analysis or Program Detail)
**Then** I should see:

**Header:**
- "Uke 1, Økt 1" (if planned)
- Date: "24. okt 2025"
- Duration: "1t 15min"

**Summary Cards:**
- Total karbs: "75g"
- Gj.snitt rate: "40g/t" (calculated: 75g / 75min × 60)
- Antall inntak: "3"
- Antall ubehag: "2"

**Timeline (Scrollable):**
```
00:00:00 ▶️ Økt startet
00:25:15 ✓ Maurten Gel (25g)
00:50:30 ✓ Maurten Gel (25g)
00:55:00 ⚠️ Ubehag (nivå 2) - Kvalme
01:05:00 ⚠️ Ubehag (nivå 3) - Kvalme
01:10:45 ✓ Maurten Gel (25g)
01:15:00 ⏹️ Økt avsluttet
```

**Navigation:** Back button to previous screen

---

### Test Scenario 7.1.2: Session Detail with No Discomfort (Success Case)
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a completed session with NO discomfort events
**When** I view Session Detail
**Then** I should see:
- Summary: "Antall ubehag: 0"
- Success indicator: "✅ Ingen ubehag registrert"
- Timeline shows only intake events

**UX Note:** Celebrate success! User tolerates fuel well.

---

### Test Scenario 7.1.3: Session Detail with Extensive Discomfort (Problem Case)
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a completed session with 5 discomfort events (levels 3-5)
**When** I view Session Detail
**Then** I should see:
- Summary: "Antall ubehag: 5"
- Warning indicator: "⚠️ Høyt ubehag-nivå"
- Timeline highlights discomfort events in red
- Recommendation card: "Vurder lavere karb-rate eller andre produkter"

---

### Test Scenario 7.1.4: Session Detail with Notes
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have a completed session with post_session_notes
**When** I view Session Detail
**Then** I should see notes section:
```
📝 Notater
"Varmt vær (28°C), lite søvn"
```
**And** I should see "Rediger notater" button (Story 7.5)

---

## Story 7.2: Visualize Intake vs Discomfort

### Test Scenario 7.2.1: Display Graph for Single Session
**Priority:** P0 (Critical)
**Type:** Data Visualization

**Given** I have a completed session with:
- 4 intake events: 25min (25g), 50min (25g), 75min (25g), 100min (25g)
- 2 discomfort events: 55min (level 2), 105min (level 3)
**When** I view the Intake vs Discomfort graph
**Then** I should see a Victory Native chart with:

**X-axis:** Time (minutes) [0, 25, 50, 75, 100, 120]
**Y-axis:** Dual axes:
- Left: Cumulative carbs (0-100g)
- Right: Discomfort level (0-5)

**Data Series:**
1. **Cumulative intake (blue line):**
   - 0min: 0g
   - 25min: 25g
   - 50min: 50g
   - 75min: 75g
   - 100min: 100g

2. **Discomfort events (red scatter points):**
   - 55min: level 2 (red dot)
   - 105min: level 3 (red dot)

**Visualization:**
```
Carbs │                              ●────── 100g
      │                        ●────╯
      │                  ●────╯
      │            ●────╯
      │      ●────╯                    Discomfort
      │●────╯              🔴              │
    0 └──────────────────────────────────────── 5
      0    25    50    75   100   120 (min)
                     🔴
```

**Insights:**
- Discomfort appears ~30 min after intake
- Pattern visible: intake spike → discomfort follows

---

### Test Scenario 7.2.2: Empty Graph (No Events)
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I have a completed session with NO events (spontaneous, ended early)
**When** I view the graph
**Then** I should see placeholder:
- "Ingen data å vise"
- "Ingen inntak eller ubehag ble logget under denne økten"

---

### Test Scenario 7.2.3: Graph with 100+ Data Points (Performance)
**Priority:** P2 (Medium)
**Type:** Performance

**Given** I have a session with 100+ events (extreme case: 4-hour session with many intakes)
**When** I view the graph
**Then** the chart should:
- Render in <2 seconds
- Scroll/pan smoothly (60 FPS)
- Not crash or lag

**Performance Target:** Victory Native should handle 100+ points efficiently

---

### Test Scenario 7.2.4: Tap Data Point for Details
**Priority:** P2 (Medium)
**Type:** UX Enhancement

**Given** I am viewing the intake vs discomfort graph
**When** I tap on an intake data point (50min, 25g)
**Then** I should see a tooltip:
```
⏰ 00:50
✓ Maurten Gel (25g)
Totalt: 50g
```

**When** I tap on a discomfort data point (55min, level 2)
**Then** I should see:
```
⏰ 00:55
⚠️ Ubehag (nivå 2)
Type: Kvalme
```

---

## Story 7.3: Identify Patterns

### Test Scenario 7.3.1: Display Session Table (All Completed Sessions)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have 5 completed sessions
**When** I navigate to "Analyse"-skjerm from main navigation
**Then** I should see a table/list with columns:

| Dato | Varighet | Karb-rate | Ubehag (gj.snitt) | Status |
|------|----------|-----------|-------------------|--------|
| 24. okt | 75 min | 40g/t | 2.5/5 | ⚠️ |
| 22. okt | 90 min | 35g/t | 1.0/5 | ✅ |
| 20. okt | 75 min | 30g/t | 0.0/5 | ✅ |
| 18. okt | 90 min | 35g/t | 1.5/5 | ✅ |
| 16. okt | 75 min | 30g/t | 1.0/5 | ✅ |

**Status Icons:**
- ✅ Green: Avg discomfort < 2
- ⚠️ Yellow: Avg discomfort 2-3
- 🔴 Red: Avg discomfort > 3

**Sorting:** Default = newest first (started_at DESC)

---

### Test Scenario 7.3.2: Sort by Carb Rate
**Priority:** P1 (High)
**Type:** Functional

**Given** I am viewing the session table
**When** I tap the "Karb-rate" column header
**Then** the table should sort by carb rate (ascending)
**When** I tap again
**Then** it should sort descending

**Sorted (Ascending):**
```
30g/t → 30g/t → 35g/t → 35g/t → 40g/t
```

---

### Test Scenario 7.3.3: Sort by Discomfort Level
**Priority:** P1 (High)
**Type:** Functional

**Given** I am viewing the session table
**When** I tap "Ubehag (gj.snitt)" column
**Then** sessions should sort by average discomfort (ascending)

**Sorted (Ascending):**
```
0.0/5 → 1.0/5 → 1.0/5 → 1.5/5 → 2.5/5
```

**Use Case:** Quickly find "best" sessions (lowest discomfort)

---

### Test Scenario 7.3.4: Filter by Program
**Priority:** P1 (High)
**Type:** Functional

**Given** I have completed sessions from 2 different programs:
- 4-Week Base: 5 sessions
- Advanced Protocol: 3 sessions
**When** I select "Program" filter dropdown
**Then** I should see options:
- Alle programmer (default)
- 4-Week Base
- Advanced Protocol
**When** I select "4-Week Base"
**Then** only 5 sessions from that program should be shown

---

### Test Scenario 7.3.5: Filter by Date Range
**Priority:** P2 (Medium)
**Type:** Functional

**Given** I have sessions spanning 2 months
**When** I open date range filter
**And** I select "Siste 7 dager"
**Then** only sessions from last 7 days should be shown

**Preset Ranges:**
- Siste 7 dager
- Siste 30 dager
- Siste 3 måneder
- Egendefinert (custom date picker)

---

### Test Scenario 7.3.6: Aggregate Statistics Display
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have 10 completed sessions with various outcomes
**When** I view the Analyse screen
**Then** I should see aggregate stats at the top:

```
┌─────────────────────────────────────────────┐
│ 📊 Oppsummering (10 økter)                  │
├─────────────────────────────────────────────┤
│ Gj.snitt karb-rate: 42g/t                   │
│ Økter uten ubehag: 60% (6/10)               │
│ Økter med alvorlig ubehag (>3): 10% (1/10)  │
│ Total tid: 15t 30min                         │
└─────────────────────────────────────────────┘
```

**Calculations:**
```sql
-- Average carb rate
AVG(carb_rate_per_hour)

-- Sessions without discomfort
COUNT(CASE WHEN avg_discomfort = 0 THEN 1 END) / COUNT(*)

-- Sessions with severe discomfort
COUNT(CASE WHEN avg_discomfort > 3 THEN 1 END) / COUNT(*)

-- Total duration
SUM(duration_actual_minutes)
```

---

### Test Scenario 7.3.7: Tap Session Row to View Detail
**Priority:** P1 (High)
**Type:** Navigation

**Given** I am viewing the session table
**When** I tap on any session row
**Then** I should navigate to Session Detail Screen (Story 7.1)
**And** when I go back, I should return to the same scroll position in the table

---

## Story 7.4: Smart Recommendations

### Test Scenario 7.4.1: Generate Recommendations (Minimum Data Requirement)
**Priority:** P0 (Critical)
**Type:** Algorithm Validation

**Given** I have completed 5+ sessions
**When** I view the Analyse screen
**Then** I should see a "Anbefalinger" section with recommendation cards

**If < 5 sessions:**
```
ℹ️ Fullfør minst 5 økter for å få anbefalinger
Du har fullført 3 av 5 økter
```

---

### Test Scenario 7.4.2: Product Success Recommendation
**Priority:** P0 (Critical)
**Type:** Algorithm Validation

**Given** I have 10 completed sessions with the following fuel products:
- Maurten Gel: 8 sessions, 7 without discomfort (88% success)
- SiS Gel: 5 sessions, 2 without discomfort (40% success)
- Banan: 3 sessions, 3 without discomfort (100% success - but only 3 sessions)

**When** the recommendation algorithm runs
**Then** I should see:

```
✅ Maurten Gel fungerer bra
7 av 8 økter uten ubehag (88%)
```

**Algorithm Logic:**
```typescript
// Filter products used in 3+ sessions
const qualifiedProducts = products.filter(p => p.totalSessions >= 3);

// Calculate success rate (sessions without discomfort / total)
const successRate = successCount / totalCount;

// Recommend if success rate > 80%
if (successRate > 0.8) {
  return {
    type: 'product_success',
    title: `✅ ${productName} fungerer bra`,
    message: `${successCount} av ${totalCount} økter uten ubehag (${Math.round(successRate * 100)}%)`
  };
}
```

**Note:** Banan has 100% success but only 3 sessions - below 3-session threshold

---

### Test Scenario 7.4.3: Problematic Product Recommendation
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Given** I have sessions with:
- SiS Gel: 5 sessions, 4 WITH discomfort (80% failure)

**When** the algorithm runs
**Then** I should see:

```
⚠️ SiS Gel ser ut til å gi ubehag
4 av 5 økter med ubehag (80%)
Vurder å bytte til andre produkter
```

**Algorithm Logic:**
```typescript
const failureRate = discomfortCount / totalCount;

if (failureRate > 0.7 && totalCount >= 3) {
  return {
    type: 'product_problem',
    title: `⚠️ ${productName} ser ut til å gi ubehag`,
    message: `${discomfortCount} av ${totalCount} økter med ubehag (${Math.round(failureRate * 100)}%)`,
    action: 'Vurder å bytte til andre produkter'
  };
}
```

---

### Test Scenario 7.4.4: Optimal Carb Rate Recommendation
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Given** I have sessions grouped by carb rate:
- 30g/t: Avg discomfort 0.5/5 (2 sessions)
- 40g/t: Avg discomfort 1.0/5 (3 sessions)
- 50g/t: Avg discomfort 3.5/5 (2 sessions)

**When** the algorithm runs
**Then** I should see:

```
📊 Optimal karb-rate: 30-40g/t
Lavest ubehag ved 30g/t (gj.snitt 0.5/5)
Ved 50g/t øker ubehag betydelig (3.5/5)
```

**Algorithm Logic:**
```typescript
// Group sessions by rate buckets (30-35, 35-45, 45-55, etc.)
const rateBuckets = groupByRate(sessions);

// Find bucket with lowest average discomfort
const optimalBucket = rateBuckets.minBy(b => b.avgDiscomfort);

if (optimalBucket.avgDiscomfort < 2.0) {
  return {
    type: 'optimal_rate',
    title: `📊 Optimal karb-rate: ${optimalBucket.range}`,
    message: `Lavest ubehag ved ${optimalBucket.rate} (gj.snitt ${optimalBucket.avgDiscomfort}/5)`
  };
}
```

---

### Test Scenario 7.4.5: Timing Pattern Recommendation
**Priority:** P2 (Medium)
**Type:** Algorithm Validation

**Given** discomfort events occur most frequently 30-40 minutes after intake
**When** the algorithm analyzes timing patterns
**Then** I should see:

```
⏰ Ubehag oppstår ofte 30-40 min etter inntak
Vurder å justere timing eller redusere mengde
```

**Algorithm Logic:**
```typescript
// For each discomfort event, find nearest previous intake
const timeDifferences = discomfortEvents.map(d => {
  const previousIntake = findPreviousIntake(d.timestamp);
  return d.timestamp - previousIntake.timestamp;
});

// Create histogram
const histogram = createHistogram(timeDifferences, 10); // 10-min buckets

// Find peak bucket
const peakBucket = histogram.maxBy(b => b.count);

if (peakBucket.count >= 3) {
  return {
    type: 'timing_pattern',
    title: `⏰ Ubehag oppstår ofte ${peakBucket.range} etter inntak`,
    message: 'Vurder å justere timing eller redusere mengde'
  };
}
```

---

### Test Scenario 7.4.6: No Recommendations (Insufficient Data)
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I have only 2 completed sessions
**When** I view recommendations
**Then** I should see:

```
ℹ️ Fullfør minst 5 økter for å få anbefalinger
Du har fullført 2 av 5 økter
[Fortsett med program]
```

---

### Test Scenario 7.4.7: "Learn More" Button
**Priority:** P2 (Medium)
**Type:** UX Enhancement

**Given** I see a recommendation card
**When** I tap "Lær mer"
**Then** I should see a detailed explanation modal:

**Example (Product Success):**
```
✅ Maurten Gel fungerer bra

Detaljert analyse:
• Brukt i 8 av 10 økter
• 7 økter uten ubehag (88% suksess)
• Gj.snitt ubehag: 0.3/5 (svært lavt)

Dette produktet ser ut til å være godt tolerert.
Fortsett å bruke det i fremtidige økter.

[Lukk]
```

---

## Story 7.5: Add Session Notes

### Test Scenario 7.5.1: Add Notes to Completed Session
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a completed session with NO notes
**And** I am viewing Session Detail Screen (Story 7.1)
**When** I tap "Legg til notater"
**Then** I should see a text input modal:
- Title: "Legg til notater"
- TextInput (multiline, 500 max chars)
- Placeholder: "f.eks. Varmt vær (28°C), lite søvn"
- Character counter: "0/500"
- Buttons: [Avbryt] [Lagre]

**When** I type "Varmt vær, hadde hodepine"
**And** I tap "Lagre"
**Then** notes should be saved to database

**Expected Database State:**
```sql
UPDATE session_logs
SET post_session_notes = 'Varmt vær, hadde hodepine'
WHERE id = 1;
```

**Then** I should see a toast: "✓ Notater lagret"
**And** the notes should appear in Session Detail view

---

### Test Scenario 7.5.2: Edit Existing Notes
**Priority:** P1 (High)
**Type:** Functional

**Given** I have a completed session with existing notes: "Varmt vær"
**When** I tap "Rediger notater"
**Then** the text input should be pre-filled with "Varmt vær"
**When** I append ", lite søvn"
**And** I tap "Lagre"
**Then** notes should update to "Varmt vær, lite søvn"

---

### Test Scenario 7.5.3: Character Limit Validation (500 chars)
**Priority:** P2 (Medium)
**Type:** Validation

**Given** I am adding notes
**When** I type 500 characters
**Then** the character counter should show "500/500"
**When** I try to type more
**Then** further input should be blocked
**And** the counter should turn red (visual feedback)

---

### Test Scenario 7.5.4: Notes Icon in Analysis Table
**Priority:** P2 (Medium)
**Type:** UX Enhancement

**Given** I am viewing the session table (Story 7.3)
**And** some sessions have notes, some don't
**Then** I should see a notes icon (📝) for sessions with notes
**When** I tap the icon
**Then** I should see a tooltip with the note preview:
```
📝 "Varmt vær, lite søvn..."
```

---

## Story 7.6: Program Progression Graph (NEW)

### Test Scenario 7.6.1: Display Progression for Active Program
**Priority:** P0 (Critical)
**Type:** Data Visualization

**Given** I am enrolled in "4-Week Base" program
**And** I have completed 6 out of 8 sessions
**When** I navigate to Program Detail screen (Story 3.3)
**And** I tap "Se progresjon"
**Then** I should see a progression graph with:

**X-axis:** Økt-nummer (1-8)
**Y-axis (Primary):** Karb-rate (g/t) [0-70]
**Y-axis (Secondary):** Ubehag-nivå (0-5)

**Data Series:**
1. **Planlagt karb-rate (gray dashed line):**
   - Session 1-2: 30g/t
   - Session 3-4: 40g/t
   - Session 5-6: 50g/t
   - Session 7-8: 60g/t (not completed)

2. **Faktisk karb-rate (blue solid line):**
   - Only for completed sessions (1-6)
   - May differ slightly from planned

3. **Ubehag (red scatter points):**
   - Average discomfort per session
   - Size of dot = severity

**Visualization:**
```
Rate │
60g  │                     ┆       ┆
50g  │           ┆       ●━━━━━━━●     🔴
40g  │     ┆   ●━━━━━━━●               🔴
30g  │   ●━━━━●
     └───────────────────────────────────
       1   2   3   4   5   6   7   8

     ━━━━ Actual    ┆┆┆┆ Planned    🔴 Discomfort
```

**Insights:**
- Discomfort increases with rate (expected)
- User is tolerating progression well

---

### Test Scenario 7.6.2: Empty State (<2 Completed Sessions)
**Priority:** P1 (High)
**Type:** Edge Case

**Given** I have completed only 1 session
**When** I tap "Se progresjon"
**Then** I should see placeholder:
```
📊 Fullfør minst 2 økter for å se progresjon

Du har fullført 1 av 8 økter
[Tilbake]
```

---

### Test Scenario 7.6.3: Tooltip on Data Point Tap
**Priority:** P2 (Medium)
**Type:** UX Enhancement

**Given** I am viewing the progression graph
**When** I tap on data point for Session 3
**Then** I should see tooltip:
```
Uke 2, Økt 1
Mål: 40g/t
Faktisk: 42g/t
Ubehag: 2/5
```

---

### Test Scenario 7.6.4: Progression Query Validation
**Priority:** P0 (Critical)
**Type:** Database Query

**Given** I have a program with 6 completed sessions
**When** the progression data query runs
**Then** it should execute this SQL:

```sql
SELECT
  ps.session_number,
  ps.carb_rate_g_per_hour AS planned_rate,
  (SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END) / sl.duration_actual_minutes) * 60 AS actual_rate,
  AVG(CASE WHEN se.event_type = 'discomfort' THEN JSON_EXTRACT(se.data_json, '$.level') END) AS avg_discomfort
FROM program_sessions ps
LEFT JOIN planned_sessions pls ON pls.program_session_id = ps.id
LEFT JOIN session_logs sl ON sl.planned_session_id = pls.id AND sl.session_status = 'completed'
LEFT JOIN session_events se ON se.session_log_id = sl.id
WHERE ps.program_id = ?
GROUP BY ps.session_number
ORDER BY ps.session_number;
```

**Expected Result:**
```json
[
  { "session_number": 1, "planned_rate": 30, "actual_rate": 32, "avg_discomfort": 1.0 },
  { "session_number": 2, "planned_rate": 30, "actual_rate": 28, "avg_discomfort": 0.5 },
  { "session_number": 3, "planned_rate": 40, "actual_rate": 42, "avg_discomfort": 2.0 },
  ...
]
```

---

## Story 7.7: Compare Programs (NEW)

### Test Scenario 7.7.1: Select Programs to Compare
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have completed 2 programs:
- 4-Week Base (8 sessions, 50% completion average)
- Advanced Protocol (6 sessions, 100% completion)
**And** I navigate to "Analyse" → "Sammenlign programmer"
**Then** I should see a list of programs with checkboxes:

```
☐ 4-Week Base (100% fullført)
☐ Advanced Protocol (100% fullført)
☐ High-Intensity Build (25% fullført) [DISABLED - < 50%]

[Sammenlign] (disabled until 2-3 selected)
```

**When** I select "4-Week Base" and "Advanced Protocol"
**Then** the "Sammenlign" button should enable
**When** I tap "Sammenlign"
**Then** I should see the comparison graph

---

### Test Scenario 7.7.2: Display Comparison Graph
**Priority:** P0 (Critical)
**Type:** Data Visualization

**Given** I have selected 2 programs to compare:
- 4-Week Base: 8 sessions, avg discomfort 1.5/5
- Advanced Protocol: 6 sessions, avg discomfort 2.8/5

**When** the comparison graph loads
**Then** I should see:

**X-axis:** Normalized (0-100% or session #)
**Y-axis:** Ubehag-nivå (0-5)

**Data Series:**
1. **4-Week Base (blue line):**
   - 8 data points (one per session)
   - Average: 1.5/5

2. **Advanced Protocol (orange line):**
   - 6 data points
   - Average: 2.8/5

**Legend:**
```
━━━ 4-Week Base (1.5/5 avg)
━━━ Advanced Protocol (2.8/5 avg)
```

**Visualization:**
```
Discomfort
5 │                    ●━━●    (Orange)
4 │              ●━━━━╯
3 │        ●━━━━╯
2 │  ●━━━━╯━━━━━●━━━━●━━━━●  (Blue)
1 │━━●━━●━━━━━━╯
0 └────────────────────────────────
  0%  25%  50%  75%  100%
```

**Insight:** 4-Week Base has significantly lower discomfort

---

### Test Scenario 7.7.3: Comparison Table with Stats
**Priority:** P1 (High)
**Type:** Functional

**Given** I am viewing the comparison graph
**Then** I should see a comparison table below:

| Program | Økter | Gj.snitt ubehag | Gj.snitt rate | Suksessrate* |
|---------|-------|-----------------|---------------|--------------|
| 4-Week Base | 8 | 1.5/5 | 38g/t | 75% (6/8) |
| Advanced Protocol | 6 | 2.8/5 | 52g/t | 50% (3/6) |

*Suksessrate = Økter med ubehag < 3

---

### Test Scenario 7.7.4: Insight Card (Best Program)
**Priority:** P1 (High)
**Type:** Algorithm

**Given** I am comparing 2 programs
**And** "4-Week Base" has lower average discomfort (1.5/5 vs 2.8/5)
**Then** I should see an insight card:

```
✅ 4-Week Base hadde lavest ubehag
Gj.snitt: 1.5/5 vs 2.8/5
Dette programmet ser ut til å passe deg best.
```

**Algorithm Logic:**
```typescript
const lowestDiscomfortProgram = programs.minBy(p => p.avgDiscomfort);
const difference = otherPrograms[0].avgDiscomfort - lowestDiscomfortProgram.avgDiscomfort;

if (difference > 1.0) {
  return {
    type: 'program_comparison',
    title: `✅ ${lowestDiscomfortProgram.name} hadde lavest ubehag`,
    message: `Gj.snitt: ${lowestDiscomfortProgram.avgDiscomfort}/5 vs ${otherPrograms[0].avgDiscomfort}/5`,
    insight: 'Dette programmet ser ut til å passe deg best.'
  };
}
```

---

### Test Scenario 7.7.5: Normalization (Different Program Lengths)
**Priority:** P1 (High)
**Type:** Algorithm Validation

**Given** I am comparing programs with different lengths:
- 4-Week Base: 8 sessions
- Advanced Protocol: 6 sessions

**When** data is normalized for comparison
**Then** X-axis should use percentage (0-100%) OR session number

**Normalization Options:**

**Option 1: Percentage (0-100%)**
- 4-Week Base Session 1 → 0%
- 4-Week Base Session 8 → 100%
- Advanced Protocol Session 1 → 0%
- Advanced Protocol Session 6 → 100%

**Option 2: Session Number (1-N)**
- Keep as session number
- Graph may have different lengths
- Easier to understand

**Recommendation:** Use Session Number (Option 2) for MVP

---

### Test Scenario 7.7.6: Comparison Query Validation
**Priority:** P0 (Critical)
**Type:** Database Query

**Given** I am comparing 2 programs
**When** the comparison query runs
**Then** it should execute for EACH program:

```sql
SELECT
  ps.session_number,
  AVG(CASE WHEN se.event_type = 'discomfort' THEN JSON_EXTRACT(se.data_json, '$.level') END) AS avg_discomfort,
  (SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END) / sl.duration_actual_minutes) * 60 AS actual_rate
FROM program_sessions ps
LEFT JOIN planned_sessions pls ON pls.program_session_id = ps.id
LEFT JOIN session_logs sl ON sl.planned_session_id = pls.id AND sl.session_status = 'completed'
LEFT JOIN session_events se ON se.session_log_id = sl.id
WHERE ps.program_id = ?
GROUP BY ps.session_number
ORDER BY ps.session_number;
```

---

### Test Scenario 7.7.7: Limit to 3 Programs (UI Constraint)
**Priority:** P2 (Medium)
**Type:** Validation

**Given** I have 4 completed programs
**When** I am selecting programs to compare
**And** I have selected 3 programs
**Then** all other checkboxes should be disabled
**And** I should see hint text: "Maksimalt 3 programmer kan sammenlignes"

**Rationale:** Chart readability - more than 3 lines is cluttered

---

## Integration Test Scenarios

### Integration 7.I.1: Full Analysis Flow
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I have completed 8 sessions (full program)
**When** I execute the following flow:
1. Navigate to "Analyse" tab
2. View session table (Story 7.3)
3. Tap a session to view detail (Story 7.1)
4. View intake vs discomfort graph (Story 7.2)
5. Go back to Analysis screen
6. View recommendations (Story 7.4)
7. Tap "Se progresjon" on program (Story 7.6)

**Then** all screens should load without errors
**And** all data should be consistent across views

---

### Integration 7.I.2: Compare → Detail → Notes
**Priority:** P1 (High)
**Type:** End-to-End

**Given** I am comparing 2 programs
**When** I identify that "4-Week Base" had lower discomfort
**And** I navigate to a specific session from that program
**And** I add notes: "Dette fungerte best fordi det var gradvis progresjon"
**Then** the notes should be saved
**And** when I return to comparison view, the insight should still be visible

---

## Performance Benchmarks

### Benchmark 7.P.1: Chart Rendering Performance
**Target:** <2 seconds for chart with 50+ data points

**Test:**
```typescript
const start = performance.now();
<VictoryChart>
  <VictoryLine data={dataPoints} /> // 50 points
</VictoryChart>
const renderTime = performance.now() - start;

expect(renderTime).toBeLessThan(2000); // ms
```

---

### Benchmark 7.P.2: Recommendation Algorithm Performance
**Target:** <100ms for analysis of 100 sessions

**Test:**
```typescript
const start = performance.now();
const recommendations = generateRecommendations(sessions); // 100 sessions
const executionTime = performance.now() - start;

expect(executionTime).toBeLessThan(100); // ms
```

---

### Benchmark 7.P.3: Query Performance (Aggregation)
**Target:** <50ms for session aggregation query

**Test:**
```sql
-- Query should complete in <50ms
EXPLAIN QUERY PLAN
SELECT ... FROM session_logs ... GROUP BY ...;
```

**Optimization:** Ensure indexes on:
- `session_logs.user_id`
- `session_logs.session_status`
- `session_events.session_log_id`

---

## Test Data Requirements

Use the test data from `scripts/setupTestData.ts`:

### Erik (Active User)
- 4 completed sessions (Week 1-2)
- Suitable for testing Story 7.1-7.5

### Kari (Advanced User)
- 8 completed sessions (full program)
- Suitable for testing Story 7.6 (progression)
- Suitable for testing Story 7.4 (recommendations)

### For Story 7.7 (Compare Programs)
- Need to add second program enrollment for Kari
- Or create new test user with multiple programs

---

## Automation Recommendations

### High Priority (Automate First)
1. ✅ Query validation tests (7.6.4, 7.7.6)
2. ✅ Recommendation algorithm tests (7.4.2 - 7.4.5)
3. ✅ Aggregation calculations (7.3.6)

### Medium Priority
4. Integration tests (7.I.1, 7.I.2)
5. Performance benchmarks (7.P.1 - 7.P.3)

### Manual Testing Required
- Chart visualization (7.2.1, 7.6.1, 7.7.2)
- User interactions (tap, scroll, sort)
- UI/UX validation

---

## Test Execution Order

### Phase 1: Session Detail (Day 1)
1. View session timeline (7.1.1)
2. View intake vs discomfort graph (7.2.1)
3. Add notes (7.5.1)

**Exit Criteria:** Single session analysis works

---

### Phase 2: Pattern Identification (Day 2)
4. Display session table (7.3.1)
5. Sort and filter (7.3.2 - 7.3.5)
6. Aggregate statistics (7.3.6)

**Exit Criteria:** Multi-session analysis works

---

### Phase 3: Recommendations (Day 3)
7. Generate recommendations (7.4.1)
8. Product success/problem detection (7.4.2, 7.4.3)
9. Optimal rate recommendation (7.4.4)

**Exit Criteria:** Smart insights generated

---

### Phase 4: Advanced Analysis (Day 4)
10. Program progression (7.6.1)
11. Program comparison (7.7.1, 7.7.2)
12. Integration tests (7.I.1, 7.I.2)

**Exit Criteria:** Epic 7 ready for production

---

## Success Criteria

### Epic 7 Approved for Production IF:
✅ All visualizations render correctly
✅ Charts handle 50+ data points smoothly
✅ Recommendations algorithm produces valid insights
✅ Queries complete in <50ms
✅ Sorting and filtering work correctly
✅ Program comparison handles different lengths
✅ No data integrity issues
✅ Integration with Epic 5 data works seamlessly

### Epic 7 BLOCKED IF:
❌ Charts crash or lag significantly
❌ Recommendation algorithm produces incorrect insights
❌ Query performance exceeds 100ms
❌ Data inconsistencies between views
❌ Normalization algorithm fails

---

## Sign-off

**QA Lead:** Quinn 🎯
**Test Plan Status:** ✅ COMPLETE
**Total Test Scenarios:** 45+
**Critical Scenarios:** 15
**Estimated Test Execution Time:** 4 days
**Dependencies:** Epic 5 must be complete (need real session data)
**Next Action:** Execute Phase 1 tests after Epic 5 completion

---

_"Epic 7 transforms raw data into actionable insights. These tests ensure users get REAL VALUE from their training data - the ultimate goal of GI Diary."_

_— Quinn, Senior QA Engineer_
