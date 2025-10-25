# Epic 7: Analyse og Innsikt

**Epic ID:** EPIC-7
**Epic Name:** Analyse og Innsikt
**Priority:** P1 (Should-Have)
**Status:** Ready for Development
**Estimated Complexity:** High
**Dependencies:** Epic 5 (Session Mode), Epic 3 (Programs)

---

## Epic Description

Som en bruker vil jeg kunne analysere mine fullførte økter, se mønstre mellom inntak og ubehag, og få innsikt i hva som fungerer best for meg. Appen skal visualisere data på en måte som gjør det enkelt å identifisere problemer og forbedre mage-toleransen over tid.

**Business Value:**
- Kjerneverdien av "diary"-konseptet - innsikt over tid
- Gjør data actionable (ikke bare logging for loggings skyld)
- Hjelper brukere optimalisere ernæringsstrategien
- Differensiator vs papirdagbok eller Excel

---

## User Stories

### **Story 7.1: Se fullført økt**

**Som** en bruker
**vil jeg** kunne se en oppsummering av en fullført økt (tidslinje med inntak og ubehag)
**slik at** jeg kan se hva som skjedde under økten

**Acceptance Criteria:**
- [ ] Fullførte økter vises på dashboard (liste):
  - Dato + tid
  - Varighet (f.eks. "1t 23min")
  - Program-navn (hvis planlagt)
  - Antall inntak (f.eks. "3 inntak")
  - Antall ubehag (f.eks. "2 ubehag" med høyeste nivå)
  - Quick-status ikon: ✅ Ingen ubehag | ⚠️ Mildt ubehag | ❌ Alvorlig ubehag
- [ ] Trykk på økt → Gå til økt-detaljskjerm
- [ ] Økt-detaljskjerm viser:
  - **Header:**
    - Dato + tid
    - Varighet
    - Program + uke/økt (hvis planlagt)
    - Status: "Fullført" eller "Avbrutt tidlig"
  - **Tidslinje (scrollable):**
    - 00:00 - ⏱️ Start
    - 00:25 - ✓ Inntak: Maurten Gel (25g karbs)
    - 00:51 - ✓ Inntak: Maurten Gel (25g karbs)
    - 01:05 - ⚠️ Ubehag: Nivå 3/5 (Kvalme)
    - 01:15 - ✓ Inntak: Banan (27g karbs)
    - 01:23 - ⏱️ Slutt
  - **Oppsummering:**
    - Total karbs konsumert: 77g
    - Gjennomsnittlig rate: 52g/time
    - Mål-rate (hvis planlagt): 45g/time (↑ 15% over)
    - Antall ubehag: 2
    - Høyeste ubehag: Nivå 3/5
- [ ] Knapp: "Se graf" → Gå til Story 7.2
- [ ] Knapp: "Legg til notater" → Fritekst notater (lagres i session_logs.post_session_notes)

**Technical Notes:**
- Screen: `src/screens/session/SessionDetailScreen.tsx`
- Component: `src/components/session/SessionTimeline.tsx`
- Repository: `SessionLogRepository.getById(id)` → JOIN session_events
- Calculation:
  ```typescript
  const totalCarbs = events.filter(e => e.event_type === 'intake')
    .reduce((sum, e) => sum + JSON.parse(e.data_json).carbs_consumed, 0);
  const avgRate = (totalCarbs / durationMinutes) * 60; // g/hour
  ```

---

### **Story 7.2: Visualiser inntak vs ubehag**

**Som** en bruker
**vil jeg** se en graf som viser mitt karb-inntak over tid, sammen med ubehag-hendelser
**slik at** jeg kan se om det er sammenheng mellom hva jeg tar og når jeg får problemer

**Acceptance Criteria:**
- [ ] Økt-detaljskjerm har "Se graf"-knapp → Åpne graf-view
- [ ] Graf viser (Victory Native chart):
  - **X-akse:** Tid (minutter fra start, f.eks. 0, 15, 30, 45, 60, 75, 90)
  - **Y-akse (primær):** Kumulativt karb-inntak (gram)
  - **Y-akse (sekundær):** Ubehag-nivå (1-5 skala)
- [ ] Karb-inntak vises som:
  - Linje-graf (kumulativ, step function)
  - Vertikal linje ved hvert inntak (med tooltip: "Maurten Gel, 25g")
- [ ] Ubehag vises som:
  - Røde punkter på ubehag-tidspunkter
  - Størrelse/farge tilsvarer nivå (1=liten/lys, 5=stor/mørk)
  - Tooltip: "Nivå 3/5 - Kvalme"
- [ ] Mål-linje (hvis planlagt økt):
  - Stiplet linje som viser ideelt kumulativt inntak basert på mål-rate
  - Eksempel: 45g/t → Etter 60 min skal linje være på 45g
- [ ] Zoom/scroll for lange økter (> 2 timer)
- [ ] Legende: "Karb-inntak" | "Ubehag" | "Mål"

**Technical Notes:**
- Component: `src/components/analysis/IntakeDiscomfortChart.tsx`
- Library: Victory Native (victory-native)
- Data transformation:
  ```typescript
  const cumulativeIntake: DataPoint[] = [];
  let cumulative = 0;
  for (const event of intakeEvents) {
    cumulative += event.carbs_consumed;
    cumulativeIntake.push({
      x: event.timestamp_offset_seconds / 60, // minutes
      y: cumulative,
    });
  }

  const discomfortPoints = discomfortEvents.map(e => ({
    x: e.timestamp_offset_seconds / 60,
    y: JSON.parse(e.data_json).level, // 1-5
  }));
  ```

---

### **Story 7.3: Identifiser mønstre**

**Som** en bruker
**vil jeg** se en oversikt over alle mine økter med statistikk (f.eks. gjennomsnittlig ubehag per karb-rate)
**slik at** jeg kan identifisere mønstre og se hva som fungerer best

**Acceptance Criteria:**
- [ ] "Analyse"-skjerm tilgjengelig fra hovednavigasjon
- [ ] Oversikt over alle fullførte økter (tabell/liste):
  - Dato
  - Varighet
  - Karb-rate (g/time)
  - Antall ubehag
  - Gjennomsnittlig ubehag-nivå
  - Status-ikon (✅ / ⚠️ / ❌)
- [ ] Sorterbare kolonner (dato, karb-rate, ubehag)
- [ ] Filter:
  - Program (dropdown)
  - Dato-range (siste 7 dager, 30 dager, 90 dager, alle)
  - Karb-rate (< 40g/t, 40-60g/t, > 60g/t)
- [ ] Aggregert statistikk øverst:
  - Total antall økter: 12
  - Gjennomsnittlig karb-rate: 48g/t
  - Økter uten ubehag: 8 (67%)
  - Økter med alvorlig ubehag (4-5): 1 (8%)
- [ ] Trykk på økt → Gå til Story 7.1 (økt-detaljer)

**Technical Notes:**
- Screen: `src/screens/analysis/AnalysisScreen.tsx`
- Component: `src/components/analysis/SessionTable.tsx`
- Repository: `SessionLogRepository.getAllWithStats(userId)`
- SQL aggregering:
  ```sql
  SELECT
    sl.id,
    sl.started_at,
    sl.duration_actual_minutes,
    (SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END) / sl.duration_actual_minutes) * 60 AS carb_rate_per_hour,
    COUNT(CASE WHEN se.event_type = 'discomfort' THEN 1 END) AS discomfort_count,
    AVG(CASE WHEN se.event_type = 'discomfort' THEN JSON_EXTRACT(se.data_json, '$.level') END) AS avg_discomfort_level
  FROM session_logs sl
  LEFT JOIN session_events se ON se.session_log_id = sl.id
  WHERE sl.user_id = ? AND sl.session_status = 'completed'
  GROUP BY sl.id
  ORDER BY sl.started_at DESC;
  ```

---

### **Story 7.4: Smarte anbefalinger**

**Som** en bruker
**vil jeg** få smarte anbefalinger basert på mine data (f.eks. 'Du tåler best geler, unngå banan')
**slik at** jeg kan optimalisere ernæringsstrategien min

**Acceptance Criteria:**
- [ ] Anbefalinger vises på Analyse-skjerm (øverst eller separat fane)
- [ ] Algoritme identifiserer:
  - **Beste produkter:** Produkter som oftest konsumeres uten ubehag
  - **Problematiske produkter:** Produkter som ofte følges av ubehag (innen 30 min)
  - **Optimal rate:** Karb-rate med lavest ubehag
  - **Timing:** Tidspunkter hvor ubehag oppstår (tidlig i økt vs sent)
- [ ] Anbefalinger vises som kort (cards):
  - Ikon + tittel + forklaring
  - Eksempel 1: "✅ Maurten Gel fungerer bra - 8 av 10 økter uten ubehag"
  - Eksempel 2: "⚠️ Banan kan være problematisk - 3 av 5 ganger fulgt av ubehag"
  - Eksempel 3: "📊 Din optimale rate: 40-50g/t - 90% suksessrate"
  - Eksempel 4: "⏰ Ubehag oppstår ofte rundt 60 min - Vurder tidligere inntak"
- [ ] "Lær mer"-knapp → Detaljert forklaring av algoritmen
- [ ] Anbefalinger oppdateres dynamisk når nye økter legges til
- [ ] Minimum data-krav: Minst 5 fullførte økter for å vise anbefalinger

**Technical Notes:**
- Component: `src/components/analysis/RecommendationCard.tsx`
- Service: `src/services/recommendations.ts`
- Algorithm (MVP - enkel heuristikk):
  ```typescript
  export function generateRecommendations(sessions: SessionLog[]): Recommendation[] {
    // 1. Produktanalyse
    const productStats = analyzeProductSuccess(sessions);
    // Success rate per produkt: (økter uten ubehag) / (total økter med produktet)

    // 2. Rate-analyse
    const rateStats = analyzeCarbRates(sessions);
    // Group by rate bucket (30-40, 40-50, 50-60), calculate avg discomfort

    // 3. Timing-analyse
    const timingStats = analyzeDiscomfortTiming(sessions);
    // Histogram av ubehag-tidspunkter

    return [
      ...productStats.map(p => ({
        type: 'product',
        title: p.success_rate > 0.8 ? `✅ ${p.name} fungerer bra` : `⚠️ ${p.name} kan være problematisk`,
        message: `${p.success_count} av ${p.total_count} økter uten ubehag`,
      })),
      ...rateStats,
      ...timingStats,
    ];
  }
  ```

---

### **Story 7.5: Legg til notater**

**Som** en bruker
**vil jeg** kunne legge til fritekst-notater til en fullført økt (f.eks. 'Varmt vær, dårlig søvn')
**slik at** jeg kan huske kontekst når jeg ser tilbake på data

**Acceptance Criteria:**
- [ ] Økt-detaljskjerm (Story 7.1) har "Legg til notater"-knapp
- [ ] Trykk → Åpne tekstfelt (multiline, 500 tegn max)
- [ ] Placeholder: "f.eks. Varmt vær (28°C), lite søvn natt før, følte meg sliten"
- [ ] "Lagre"-knapp
- [ ] Notater lagres i `session_logs.post_session_notes`
- [ ] Notater vises på økt-detaljskjerm (under oppsummering)
- [ ] Notater kan redigeres senere (samme flow)
- [ ] Notater vises i Analyse-tabell (Story 7.3) som ikon med tooltip

**Technical Notes:**
- Component: `src/components/session/SessionNotes.tsx`
- Repository: `SessionLogRepository.updateNotes(sessionId, notes)`
- Database: UPDATE `session_logs` SET `post_session_notes` = ?

---

### **Story 7.6: Progresjonsgraf per program** ⭐ NY

**Som** en bruker
**vil jeg** se en progresjonsgraf for det aktive programmet mitt
**slik at** jeg kan se hvordan min toleranse utvikler seg over tid

**Acceptance Criteria:**
- [ ] Program-detaljskjerm (Epic 3.3) har "Se progresjon"-knapp
- [ ] Trykk → Åpne progresjonsgraf-skjerm
- [ ] Graf viser (Victory Native):
  - **X-akse:** Økt-nummer (1, 2, 3, 4, 5, 6, 7, 8)
  - **Y-akse (primær):** Karb-inntak (g/time)
  - **Y-akse (sekundær):** Ubehag-nivå (gjennomsnitt per økt)
- [ ] Data-serier:
  - **Planlagt karb-rate** (stiplet linje, grå)
    - Eksempel: Uke 1-2: 30g/t, Uke 3-4: 45g/t
  - **Faktisk karb-rate** (solid linje, blå)
    - Beregnet fra faktisk inntak per økt
  - **Ubehag** (røde punkter, størrelse = nivå)
    - Gjennomsnittlig ubehag-nivå per økt
- [ ] Kun fullførte økter vises (ikke planlagte)
- [ ] Tooltip ved hover/trykk:
  - "Uke 2, Økt 1: 48g/t (mål: 45g/t), Ubehag: 2/5"
- [ ] Hvis for få økter (< 2 fullført):
  - Vis placeholder: "Fullfør minst 2 økter for å se progresjon"
- [ ] "Del graf"-knapp (future - export som bilde)

**Technical Notes:**
- Screen: `src/screens/programs/ProgramProgressionScreen.tsx`
- Component: `src/components/analysis/ProgressionChart.tsx`
- Repository: `ProgramRepository.getProgressionData(programId, userId)`
- Data transformation:
  ```typescript
  interface ProgressionDataPoint {
    sessionNumber: number;
    plannedRate: number; // from program_sessions.carb_rate_g_per_hour
    actualRate: number;  // from session_logs + events
    avgDiscomfort: number | null; // avg of discomfort events
  }

  // Query
  SELECT
    ps.session_number,
    ps.carb_rate_g_per_hour AS planned_rate,
    (SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END) / sl.duration_actual_minutes) * 60 AS actual_rate,
    AVG(CASE WHEN se.event_type = 'discomfort' THEN JSON_EXTRACT(se.data_json, '$.level') END) AS avg_discomfort
  FROM program_sessions ps
  LEFT JOIN session_logs sl ON sl.planned_session_id = ps.id AND sl.session_status = 'completed'
  LEFT JOIN session_events se ON se.session_log_id = sl.id
  WHERE ps.program_id = ? AND sl.user_id = ?
  GROUP BY ps.session_number
  ORDER BY ps.session_number;
  ```

---

### **Story 7.7: Sammenlign programmer** ⭐ NY

**Som** en bruker
**når jeg** har fullført flere programmer
**vil jeg** kunne sammenligne min progresjon mellom programmer
**slik at** jeg kan se hvilken protokoll som fungerer best for meg

**Acceptance Criteria:**
- [ ] Analyse-skjerm har "Sammenlign programmer"-fane
- [ ] Liste over fullførte programmer (minst 50% gjennomført):
  - Programnavn
  - Fullføringsgrad (f.eks. "6 av 8 økter")
  - Gjennomsnittlig ubehag-nivå
  - Gjennomsnittlig karb-rate
  - Checkbox for å inkludere i sammenligning
- [ ] Bruker velger 2-3 programmer → Trykk "Sammenlign"
- [ ] Sammenligningsgraf vises (Victory Native):
  - **X-akse:** Økt-nummer (normalisert, 1-8 eller % av program)
  - **Y-akse:** Ubehag-nivå (gjennomsnitt per økt)
  - **Flere linjer:** En linje per program (ulike farger)
  - Legende: Programnavn + farge
- [ ] Tabell under graf:
  ```
  | Program                   | Økter | Gj.snitt ubehag | Gj.snitt rate | Suksessrate* |
  |---------------------------|-------|-----------------|---------------|--------------|
  | 4-Week Base (30g/t start) | 8/8   | 1.2/5          | 42g/t         | 87%          |
  | 6-Week Advanced (40g/t)   | 6/8   | 2.8/5          | 55g/t         | 50%          |
  ```
  *Suksessrate = Økter med ubehag < 3 / Total økter
- [ ] Insight-kort:
  - "✅ 4-Week Base hadde lavest ubehag (1.2/5 vs 2.8/5)"
  - "📊 6-Week Advanced hadde høyere rate (55g/t), men mer ubehag"
- [ ] Export som bilde (PNG) for deling (future)

**Technical Notes:**
- Screen: `src/screens/analysis/CompareProgramsScreen.tsx`
- Component: `src/components/analysis/ComparisonChart.tsx`
- Repository: `ProgramRepository.getComparisonData(programIds, userId)`
- Normalization:
  - Programmer har ulik lengde (4 uker vs 6 uker)
  - Normaliser X-akse til % av program (0-100%) eller absolutt økt-nummer
- Data structure:
  ```typescript
  interface ComparisonData {
    programs: Array<{
      programId: number;
      programName: string;
      color: string;
      dataPoints: Array<{
        sessionNumber: number;
        avgDiscomfort: number;
        actualRate: number;
      }>;
      stats: {
        totalSessions: number;
        completedSessions: number;
        avgDiscomfort: number;
        avgRate: number;
        successRate: number; // % sessions with discomfort < 3
      };
    }>;
  }
  ```

---

## User Flow Diagram

```
[Dashboard]
       ↓
[Trykk på fullført økt]
       ↓
[Økt-detaljskjerm] (Story 7.1)
       ↓
[Tidslinje + Oppsummering]
       ↓
[Trykk "Se graf"]
       ↓
[Inntak vs Ubehag-graf] (Story 7.2)
       ↓
[Tilbake til Analyse-skjerm]
       ↓
[Oversikt over alle økter] (Story 7.3)
       ↓
[Anbefalinger] (Story 7.4)
       ↓
[Gå til Program-detaljer] (Epic 3.3)
       ↓
[Trykk "Se progresjon"]
       ↓
[Progresjonsgraf per program] (Story 7.6)
       ↓
[Gå til "Sammenlign programmer"]
       ↓
[Velg 2-3 programmer]
       ↓
[Sammenligningsgraf] (Story 7.7)
```

---

## Technical Architecture

### Screens & Components

```
src/screens/analysis/
├── AnalysisScreen.tsx              # Story 7.3: Oversikt
├── SessionDetailScreen.tsx         # Story 7.1: Økt-detaljer (moved from session/)
├── CompareProgramsScreen.tsx       # Story 7.7: Sammenlign

src/screens/programs/
└── ProgramProgressionScreen.tsx    # Story 7.6: Progresjon per program

src/components/analysis/
├── SessionTimeline.tsx             # Story 7.1: Tidslinje-view
├── IntakeDiscomfortChart.tsx       # Story 7.2: Graf
├── SessionTable.tsx                # Story 7.3: Tabell
├── RecommendationCard.tsx          # Story 7.4: Anbefalinger
├── SessionNotes.tsx                # Story 7.5: Notater
├── ProgressionChart.tsx            # Story 7.6: Progresjonsgraf ⭐ NY
└── ComparisonChart.tsx             # Story 7.7: Sammenligning ⭐ NY
```

### Victory Native Charts

```typescript
// Example: Progression chart (Story 7.6)
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryLegend } from 'victory-native';

<VictoryChart>
  <VictoryAxis
    label="Økt-nummer"
    tickValues={[1, 2, 3, 4, 5, 6, 7, 8]}
  />
  <VictoryAxis
    dependentAxis
    label="Karb-rate (g/time)"
  />
  <VictoryLine
    data={plannedData}
    style={{ data: { stroke: '#888', strokeDasharray: '4,4' } }}
  />
  <VictoryLine
    data={actualData}
    style={{ data: { stroke: '#2196F3', strokeWidth: 2 } }}
  />
  <VictoryScatter
    data={discomfortData}
    size={(datum) => datum.level * 2} // Størrelse basert på nivå
    style={{ data: { fill: '#D32F2F' } }}
  />
  <VictoryLegend
    data={[
      { name: 'Planlagt', symbol: { fill: '#888' } },
      { name: 'Faktisk', symbol: { fill: '#2196F3' } },
      { name: 'Ubehag', symbol: { fill: '#D32F2F' } },
    ]}
  />
</VictoryChart>
```

### Recommendation Algorithm (Story 7.4)

```typescript
// src/services/recommendations.ts

export function generateRecommendations(sessions: SessionLog[]): Recommendation[] {
  if (sessions.length < 5) {
    return [{ type: 'info', title: 'Fullfør 5+ økter', message: 'Vi trenger mer data for anbefalinger' }];
  }

  const recommendations: Recommendation[] = [];

  // 1. Produktanalyse
  const productMap = new Map<number, { name: string; successCount: number; totalCount: number }>();

  for (const session of sessions) {
    const intakes = session.events.filter(e => e.event_type === 'intake');
    const hasDiscomfort = session.events.some(e => e.event_type === 'discomfort');

    for (const intake of intakes) {
      const data = JSON.parse(intake.data_json);
      const productId = data.fuel_product_id;
      const productName = data.product_name;

      if (!productMap.has(productId)) {
        productMap.set(productId, { name: productName, successCount: 0, totalCount: 0 });
      }

      const stats = productMap.get(productId)!;
      stats.totalCount++;
      if (!hasDiscomfort) stats.successCount++;
    }
  }

  for (const [productId, stats] of productMap) {
    if (stats.totalCount >= 3) {
      const successRate = stats.successCount / stats.totalCount;
      if (successRate > 0.8) {
        recommendations.push({
          type: 'product_success',
          title: `✅ ${stats.name} fungerer bra`,
          message: `${stats.successCount} av ${stats.totalCount} økter uten ubehag`,
        });
      } else if (successRate < 0.5) {
        recommendations.push({
          type: 'product_warning',
          title: `⚠️ ${stats.name} kan være problematisk`,
          message: `${stats.totalCount - stats.successCount} av ${stats.totalCount} økter med ubehag`,
        });
      }
    }
  }

  // 2. Optimal rate-analyse
  const rateBuckets = { low: [], medium: [], high: [] };
  for (const session of sessions) {
    const rate = calculateCarbRate(session);
    const avgDiscomfort = calculateAvgDiscomfort(session);

    if (rate < 40) rateBuckets.low.push(avgDiscomfort);
    else if (rate < 55) rateBuckets.medium.push(avgDiscomfort);
    else rateBuckets.high.push(avgDiscomfort);
  }

  const avgByBucket = {
    low: avg(rateBuckets.low),
    medium: avg(rateBuckets.medium),
    high: avg(rateBuckets.high),
  };

  const optimalBucket = Object.keys(avgByBucket).reduce((a, b) =>
    avgByBucket[a] < avgByBucket[b] ? a : b
  );

  const rateRanges = { low: '< 40g/t', medium: '40-55g/t', high: '> 55g/t' };
  recommendations.push({
    type: 'optimal_rate',
    title: `📊 Din optimale rate: ${rateRanges[optimalBucket]}`,
    message: `Lavest gjennomsnittlig ubehag (${avgByBucket[optimalBucket].toFixed(1)}/5)`,
  });

  // 3. Timing-analyse (future)
  // ...

  return recommendations;
}
```

---

## Critical Testing Scenarios

### Session Detail Test
1. Fullfør en økt med 3 inntak + 2 ubehag
2. Gå til dashboard → Trykk på økten
3. **Pass:** Tidslinje viser alle 5 hendelser i riktig rekkefølge
4. **Pass:** Oppsummering viser korrekt total karbs og avg rate

### Graph Test
1. Åpne økt-detaljer (med minimum 3 inntak)
2. Trykk "Se graf"
3. **Pass:** Graf viser kumulativ karb-linje
4. **Pass:** Ubehag-punkter vises korrekt
5. **Pass:** Mål-linje vises (hvis planlagt økt)

### Recommendation Test
1. Fullfør 5+ økter med ulike produkter
2. Gå til Analyse-skjerm
3. **Pass:** Anbefalinger vises (minst 2 kort)
4. **Pass:** Anbefalinger er relevante (faktisk basert på data)

### Progression Test (Story 7.6)
1. Start "4-Week Base"-program
2. Fullfør 4 økter
3. Gå til program-detaljer → "Se progresjon"
4. **Pass:** Graf viser 4 datapunkter
5. **Pass:** Planlagt vs faktisk rate vises korrekt

### Comparison Test (Story 7.7)
1. Fullfør minst 50% av 2 ulike programmer
2. Gå til Analyse → "Sammenlign programmer"
3. Velg begge programmer → "Sammenlign"
4. **Pass:** Graf viser 2 linjer (ulike farger)
5. **Pass:** Tabell viser korrekt statistikk
6. **Pass:** Insight-kort vises

---

## Definition of Done

- [ ] Alle 7 User Stories implementert
- [ ] Økt-detaljer viser tidslinje + oppsummering
- [ ] Graf fungerer (Victory Native, zoom/scroll)
- [ ] Analyse-skjerm viser tabell med sortering/filter
- [ ] Anbefalinger genereres korrekt (minst 5 økter)
- [ ] Notater kan legges til og redigeres
- [ ] Progresjonsgraf per program (Story 7.6) ⭐
- [ ] Sammenligningsgraf for flere programmer (Story 7.7) ⭐
- [ ] UI matcher Material Design 3
- [ ] Manuell testing med ekte data (10+ økter)
- [ ] Performance: Graf rendrer < 2s for lange økter (3+ timer)

---

## Non-Functional Requirements

| Requirement | Target | Test Method |
|-------------|--------|-------------|
| Chart rendering | < 2s for 3-hour session | Performance test |
| Query performance | < 500ms for 100 sessions | Database benchmark |
| Recommendation accuracy | Subjectively useful | User feedback |
| Zoom/scroll smoothness | 60 FPS | Frame rate monitor |

---

## Future Enhancements (Post-MVP)

- [ ] Export graf som bilde (PNG)
- [ ] Del analyse med coach/trener (PDF rapport)
- [ ] Maskinlæring for bedre anbefalinger
- [ ] Korrelasjon med eksterne data (Epic 6: HR, watt)
- [ ] Prediktiv modell: "Med denne planen har du 85% sjanse for suksess"
- [ ] Sammenlign med andre brukere (anonymisert benchmark)
- [ ] Værhensyn (korrelasjon mellom temp og ubehag)

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Development - **INCLUDES NEW STORIES 7.6 & 7.7**

**⚠️ NOTE:** Story 7.6 (Progresjonsgraf per program) og 7.7 (Sammenlign programmer) er NYE basert på brukerens feedback om progresjonsoversikt per program. Disse er kritiske for multi-program support (Epic 3.5).
