# Epic 5: "Økt-modus" (Fase 2: Under økta)

**Epic ID:** EPIC-5
**Epic Name:** "Økt-modus" (Fase 2: Under økta)
**Priority:** P0 (Must-Have) - **KRITISK**
**Status:** Ready for Development
**Estimated Complexity:** High
**Dependencies:** Epic 4 (Planlegging)

---

## Epic Description

Som en bruker må jeg kunne logge inntak og ubehag UNDER økten med ekstrem enkelhet (< 5 sekunder per logging). Appen må være stabil i 2-4 timer, fungere i bakgrunnen, og sikre at ingen data går tapt ved crash.

**Business Value:**
- **Kjerneverdien** til hele produktet ligger i denne Epic
- Enkel logging = høyere adoption
- Pålitelig logging = tillit til produktet
- Crash recovery = ingen dataforlis

**CRITICAL SUCCESS FACTORS:**
1. ✅ Background timer må fungere i 4+ timer
2. ✅ Crash recovery må være 100% pålitelig
3. ✅ Logging må være < 5 sekunder
4. ✅ Battery drain må være < 10% per time

---

## User Stories

### **Story 5.1: Start økt-modus**

**Som** en bruker
**vil jeg** kunne starte 'Økt-modus' på mobilen min, som viser en stor 'Start'-knapp og en løpende timer
**slik at** jeg kan begynne å tracke økten min

**Acceptance Criteria:**
- [ ] "Økt-modus"-skjerm tilgjengelig fra:
  - Dashboard: "Start økt"-knapp (planlagt økt)
  - Planlegging: "Start nå"-prompt (Epic 4.3)
  - Meny: "Start spontan økt" (uten plan)
- [ ] Startskjerm viser:
  - **Stor "START"-knapp** (sentral, tydelig)
  - Økt-info (hvis planlagt):
    - Program + Uke/Økt
    - Mål: "75 min @ 45g/t"
    - Planlagt inntak (liste)
  - Hvis spontan: "Uplanlagt økt" (ingen plan)
- [ ] Trykk "START":
  - Timer starter (00:00:00)
  - Session log opprettes i database (status='active')
  - Skjerm endres til aktiv økt-view (Story 5.3/5.4)
  - Notifikasjoner scheduleres (Story 5.2)
  - **Auto-save starter** (hver 30s - Winston's recovery)
- [ ] Timer vises stort og tydelig:
  - Format: HH:MM:SS (f.eks. "01:23:45")
  - Oppdateres hvert sekund
  - Nøyaktighet: ±1 sekund

**Technical Notes:**
- Screen: `src/screens/session/ActiveSessionScreen.tsx`
- Component: `src/components/session/SessionTimer.tsx`
- Service: `src/services/sessionManager.ts`
  - `startSession(plannedSessionId?): Promise<SessionLog>`
- Database: INSERT INTO `session_logs` (started_at, status='active')
- Background: expo-task-manager + expo-background-fetch

---

### **Story 5.2: Varsler for inntak**

**Som** en bruker i 'Økt-modus'
**vil jeg** få et varsel (lyd/vibrasjon) når det er på tide å ta mitt planlagte inntak (basert på Fase 1-planen)
**slik at** jeg ikke glemmer å ta næring til riktig tid

**Acceptance Criteria:**
- [ ] Notifikasjoner scheduleres basert på fuel plan (Epic 4)
- [ ] Eksempel (fuel plan: 0:25, 0:50, 1:00):
  - Etter 25 min → Notifikasjon: "⏰ Tid for inntak: Maurten Gel"
  - Etter 50 min → Notifikasjon: "⏰ Tid for inntak: Maurten Gel"
  - Etter 60 min → Notifikasjon: "⏰ Tid for inntak: Banan"
- [ ] Notifikasjon inneholder:
  - Tittel: "Tid for inntak"
  - Melding: "[Produktnavn] ([Xg] karbs)"
  - Lyd + Vibrasjon (konfigurerbart i settings)
- [ ] Trykk på notifikasjon → Åpne app (aktiv økt-skjerm)
- [ ] Notifikasjoner fortsetter selv om app er i bakgrunnen
- [ ] Hvis spontan økt (ingen plan): Ingen notifikasjoner

**Technical Notes:**
- Service: `src/services/notificationService.ts`
  - `scheduleIntakeReminder(timingMinutes, productName, carbs)`
- API: expo-notifications
- Permissions: NOTIFICATIONS (request on first session start)
- Background: Notifications fungerer selv om app ikke er i forgrunnen

---

### **Story 5.3: Logg inntak**

**Som** en bruker i 'Økt-modus'
**vil jeg** ha én **stor knapp** for å bekrefte 'Planlagt inntak tatt'
**slik at** jeg logger tidsstempelet med ett trykk

**Acceptance Criteria:**
- [ ] Aktiv økt-skjerm viser (etter "START"):
  - **Timer** (øverst, stor)
  - **Neste planlagte inntak** (hvis plan):
    - "Neste: Maurten Gel om 12 min"
  - **Stor "INNTAK"-knapp** (sentral, grønn):
    - Tekst: "Logg inntak" eller ikon (matvareiøon)
    - Trykk → Logg hendelse
- [ ] Trykk på "INNTAK"-knapp:
  - **Hvis planlagt inntak finnes:**
    - Quick-log: Logg planlagt produkt automatisk
    - Toast: "✓ Maurten Gel logget (25g)"
    - Timestamp: Nøyaktig tid (offset fra session start)
  - **Hvis ingen plan (eller ad-hoc):**
    - Vis quick-select: Liste over skafferi-produkter
    - Bruker velger produkt + antall (default 1)
    - Logg → Toast: "✓ [Produkt] logget"
- [ ] Event lagres i database (session_events):
  - event_type: 'intake'
  - timestamp_offset_seconds: Sekunder fra session start
  - data_json: `{ fuel_product_id, product_name, quantity, carbs_consumed, was_planned: true/false }`
- [ ] Liste over loggede events vises nederst (scrollable):
  - "00:25 - ✓ Maurten Gel (25g)"
  - "00:51 - ✓ Maurten Gel (25g)"
  - Nyeste øverst

**Technical Notes:**
- Component: `src/components/session/IntakeButton.tsx`
- Component: `src/components/session/SessionEventList.tsx`
- Service: `sessionManager.logIntake(fuelProductId, quantity)`
- Database: INSERT INTO `session_events`

---

### **Story 5.4: Logg ubehag**

**Som** en bruker i 'Økt-modus'
**vil jeg** ha en separat, stor knapp for å logge 'Ubehag', som lar meg velge en rask 1-5 skala
**slik at** jeg kan tracke mage-problemer underveis

**Acceptance Criteria:**
- [ ] Aktiv økt-skjerm viser (ved siden av/under "INNTAK"-knapp):
  - **Stor "UBEHAG"-knapp** (rød/oransje):
    - Tekst: "Logg ubehag" eller ikon (mage-ikon)
- [ ] Trykk på "UBEHAG"-knapp:
  - Vis quick-select: 1-5 skala (store, tydelige knapper):
    ```
    [1] Lite ubehag
    [2] Mildt ubehag
    [3] Moderat ubehag
    [4] Betydelig ubehag
    [5] Alvorlig ubehag
    ```
  - Valgfritt: Type (dropdown):
    - Kvalme
    - Kramper
    - Oppblåsthet
    - Diaré
    - Annet
  - Valgfritt: Notat (quick-text)
- [ ] Trykk på nivå (1-5) → Logg umiddelbart
  - Toast: "✓ Ubehag logget (nivå 3)"
  - Event lagres i database:
    - event_type: 'discomfort'
    - data_json: `{ level: 3, type: "nausea", notes: "..." }`
- [ ] Event vises i liste nederst:
  - "01:05 - ⚠️ Ubehag (3/5) - Kvalme"

**Technical Notes:**
- Component: `src/components/session/DiscomfortButton.tsx`
- Service: `sessionManager.logDiscomfort(level, type?, notes?)`
- Database: INSERT INTO `session_events`

---

### **Story 5.5: Avslutt økt**

**Som** en bruker
**vil jeg** kunne 'Avslutte økten' i appen når jeg er ferdig
**slik at** loggen lagres

**Acceptance Criteria:**
- [ ] "Avslutt økt"-knapp tilgjengelig på aktiv økt-skjerm:
  - Plassering: Øverst (meny eller ikon)
  - Tekst: "Avslutt" eller stopp-ikon
- [ ] Trykk "Avslutt" → Bekreftelsesdialog:
  - Tittel: "Avslutt økt?"
  - Melding: "Timer: [HH:MM:SS]. Du har logget [X] hendelser."
  - Knapper: "Fortsett" | "Avslutt"
- [ ] Ved bekreftelse:
  - Timer stopper
  - Session log oppdateres:
    - `ended_at` = datetime('now')
    - `duration_actual_minutes` = beregnet fra started_at
    - `session_status` = 'completed'
  - Notifikasjoner kanselleres
  - **Auto-save stoppes**
  - **Recovery metadata ryddes** (Winston's `clearActiveSessionMetadata()`)
- [ ] Navigering:
  - Gå til oppsummeringsskjerm:
    - Vis total tid, antall inntak, antall ubehag
    - Knapp: "Se analyse" (Epic 7)
    - Knapp: "Legg til notater"
    - Knapp: "Tilbake til dashboard"

**Technical Notes:**
- Service: `sessionManager.endSession()`
- Database: UPDATE `session_logs` SET ended_at, duration_actual_minutes, session_status='completed'
- Recovery: `clearActiveSessionMetadata()` (Winston's module)

---

## User Flow Diagram

```
[Dashboard/Planlegging]
       ↓
[Start Økt-modus] (Story 5.1)
       ↓
[Timer starter: 00:00:00]
       ↓
[Notifikasjoner scheduleres] (Story 5.2)
       ↓
       ↓ (Under økten)
       ↓
[Notifikasjon: "Tid for inntak"] (Story 5.2)
       ↓
[Trykk "INNTAK"-knapp] (Story 5.3)
       ↓
[Event logget → Vises i liste]
       ↓
[Føler ubehag → Trykk "UBEHAG"] (Story 5.4)
       ↓
[Velg nivå 1-5 → Event logget]
       ↓
       ↓ (Økt ferdig)
       ↓
[Trykk "Avslutt økt"] (Story 5.5)
       ↓
[Bekreft → Session lagret]
       ↓
[Oppsummeringsskjerm]
       ↓
[Gå til analyse (Epic 7) ELLER Dashboard]
```

---

## Technical Architecture

### Database Schema

```sql
CREATE TABLE session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  planned_session_id INTEGER,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_actual_minutes INTEGER,
  session_status TEXT NOT NULL DEFAULT 'active',
  post_session_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (planned_session_id) REFERENCES planned_sessions(id)
);

CREATE TABLE session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,  -- 'intake' | 'discomfort' | 'note'
  timestamp_offset_seconds INTEGER NOT NULL,
  actual_timestamp TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_log_id) REFERENCES session_logs(id)
);
```

### Background Timer Implementation

```typescript
// src/services/sessionManager.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const SESSION_TIMER_TASK = 'session-timer-task';

// Register background task
TaskManager.defineTask(SESSION_TIMER_TASK, async () => {
  // Keep timer running
  // Auto-save session state every 30s
  await autoSaveSessionState(activeSessionId, elapsedSeconds);
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Start background task
async function startBackgroundTimer() {
  await BackgroundFetch.registerTaskAsync(SESSION_TIMER_TASK, {
    minimumInterval: 30, // seconds
    stopOnTerminate: false,
    startOnBoot: false,
  });
}
```

### Crash Recovery Integration (Winston's Module)

```typescript
// On app startup (App.tsx)
import { useSessionRecovery } from '@hooks/useSessionRecovery';

function App() {
  const recovery = useSessionRecovery();

  if (recovery.recoverableSession) {
    // Show RecoveryDialog (Winston's component)
    return (
      <RecoveryDialog
        message={recovery.recoveryMessage}
        eventCount={recovery.recoverableSession.eventCount}
        onRecover={async () => {
          const data = await recovery.attemptRecovery();
          // Navigate to ActiveSessionScreen with recovered data
        }}
        onDiscard={() => recovery.discardSession()}
        onDismiss={() => recovery.dismissRecovery()}
      />
    );
  }

  return <MainApp />;
}
```

---

## Critical Testing Scenarios

### Background Timer Test (CRITICAL)
1. Start økt
2. La timer løpe til 10 min
3. Minimer app (gå til hjemskjerm)
4. Vent 30 min
5. Åpne app → Timer skal vise 40 min (ikke 10 min)
6. **Pass:** Timer fortsatte i bakgrunnen

### Long Session Test (CRITICAL)
1. Start økt
2. La timer løpe i 4 timer (automation script)
3. Logg 20+ events
4. App skal ikke crashe
5. Battery drain < 40% (10% per time)

### Crash Recovery Test (CRITICAL)
1. Start økt
2. Logg 5 events (inntak + ubehag)
3. Force-quit app (kill process)
4. Reåpne app
5. **Pass:** Recovery dialog vises
6. Trykk "Fortsett" → Timer og events gjenopprettet

### Notification Test
1. Start planlagt økt med 3 inntak (0:10, 0:20, 0:30)
2. Minimer app
3. Vent til 0:10 → Notifikasjon skal vises
4. Trykk notifikasjon → App åpnes til aktiv økt

---

## Definition of Done

- [ ] Alle 5 User Stories implementert
- [ ] Background timer fungerer i 4+ timer (tested)
- [ ] Crash recovery 100% pålitelig (force-quit test)
- [ ] Logging < 5 sekunder per event (timed)
- [ ] Battery drain < 10% per time (measured)
- [ ] Notifikasjoner fungerer i bakgrunnen
- [ ] Auto-save hver 30s (verified)
- [ ] UI responsiv og enkel (brukertest)
- [ ] Manuell testing på fysisk Android-enhet (minimum 2-timers økt)

---

## Non-Functional Requirements

| Requirement | Target | Test Method |
|-------------|--------|-------------|
| Timer accuracy | ±1 second per hour | Stopwatch comparison |
| Background uptime | 4+ hours continuous | Long-running test |
| Crash recovery | 100% success rate | Force-quit 10 times |
| Logging speed | < 5 seconds | Manual timing |
| Battery drain | < 10% per hour | Battery monitor app |
| Notification reliability | 100% delivery | Scheduled test |

---

## Future Enhancements (Post-MVP)

- [ ] Pause/resume IKKE nødvendig (bruker avslutter tidlig)
- [ ] Voice logging ("Hey Google, logg inntak")
- [ ] Smartwatch integration (Garmin/Wear OS)
- [ ] Auto-detect inntak (ML based on HR drop)
- [ ] Live sharing (send progress to coach/friend)

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Development - **REQUIRES PROOF-OF-CONCEPT FIRST**

**⚠️ CRITICAL NOTE:** Epic 5 MÅ ha PoC for background timer (4-hour test) FØR full implementering starter!
