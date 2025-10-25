# Epic 3: Mage-treningsprogrammer

**Epic ID:** EPIC-3
**Epic Name:** Mage-treningsprogrammer
**Priority:** P0 (Must-Have)
**Status:** Ready for Development
**Estimated Complexity:** Medium
**Dependencies:** Epic 1 (bruker onboardet)

---

## Epic Description

Som en bruker må jeg kunne velge og følge strukturerte, forskningsbaserte mage-treningsprogrammer. Programmene skal være progressive (økende intensitet over tid), og jeg skal kunne se min progresjon for hvert program jeg gjennomfører.

**Business Value:**
- Gir struktur og vitenskap bak treningen
- Progresjon motiverer brukere til å fullføre
- Trackbar fremgang gir følelse av mestring
- Fleksibilitet til å teste ulike intensitetsnivåer (30g/t, 40g/t, 50g/t, etc.)

---

## User Stories

### **Story 3.1: Liste over programmer**

**Som** en bruker
**vil jeg** kunne se en liste over tilgjengelige mage-treningsprogrammer (f.eks. '4-ukers Grunnprogram', '2-ukers Varmetilvenning')
**slik at** jeg kan velge et program som passer mine behov

**Acceptance Criteria:**
- [ ] "Programmer"-skjerm tilgjengelig fra hovednavigasjon
- [ ] Liste viser alle tilgjengelige programmer
- [ ] Hvert program-kort viser:
  - Programnavn (f.eks. "4-Week Base Carb Training")
  - Ikon/badge (hvis anbefalt, populært, etc.)
  - Kort beskrivelse (1-2 setninger)
  - Varighet (f.eks. "4 uker, 2 økter/uke")
  - Intensitetsnivå (f.eks. "Starter 30g/t → 60g/t")
  - Target audience (f.eks. "Nybegynnere", "Marathon runners")
  - "Start program"-knapp
- [ ] Filtrering/sortering (future - kan droppes i MVP):
  - Alle
  - For nybegynnere
  - Varighet (kort → lang)
- [ ] Trykk på program-kort → Vis program-detaljer (Story 3.3)

**Technical Notes:**
- Screen: `src/screens/programs/ProgramListScreen.tsx`
- Component: `src/components/program/ProgramCard.tsx`
- Repository: `ProgramRepository.getAll()`
- Database: SELECT FROM `programs` WHERE `is_active = 1`

---

### **Story 3.2: Velge og starte program**

**Som** en bruker
**vil jeg** kunne velge og starte et program
**slik at** jeg kan følge en strukturert plan

**Acceptance Criteria:**
- [ ] "Start program"-knapp på program-kort (liste)
- [ ] Trykk på "Start program" → Bekreftelsesdialog:
  - Tittel: "Start [Programnavn]?"
  - Melding: "Dette programmet varer [X uker] og har [Y økter]. Du kan starte økter når du ønsker."
  - Knapper: "Avbryt" | "Start program"
- [ ] Ved bekreftelse:
  - Program lagres i `user_programs` med status 'active'
  - Timestamp `started_at` settes
  - Bruker returneres til program-detaljer (Story 3.3) eller dashboard
  - Toast: "✓ Program startet!"
- [ ] Aktivt program vises på dashboard
- [ ] **Multi-program support (Story 3.5):**
  - Bruker KAN starte flere programmer samtidig
  - Ingen begrensning på antall aktive programmer

**Technical Notes:**
- Screen: `src/screens/programs/StartProgramScreen.tsx` (eller dialog)
- Repository: `ProgramRepository.startProgram(programId, userId)`
- Database: INSERT INTO `user_programs` (user_id, program_id, started_at, status='active')

---

### **Story 3.3: Oversikt over program**

**Som** en bruker
**vil jeg** kunne se en oversikt over programmet mitt (f.eks. Uke 1, Uke 2)
**slik at** jeg vet hva som er planen for hver økt

**Acceptance Criteria:**
- [ ] Program-detaljskjerm vises ved:
  - Trykk på aktivt program i dashboard
  - Trykk på program-kort i liste
- [ ] Skjerm viser:
  - **Header:**
    - Programnavn
    - Status: "Aktiv" / "Ikke startet" / "Fullført"
    - Start-dato (hvis startet)
    - Progresjon (f.eks. "Uke 2 av 4") - Story 3.4
  - **Innhold:**
    - Kort beskrivelse
    - Forskningskilde (link/referanse)
  - **Økter (gruppert per uke):**
    - Uke 1:
      - Økt 1: "60 min @ 30g/t - Zone 2" [Status: ✓ Fullført / ⏳ Planlagt / - Ikke gjort]
      - Økt 2: "60 min @ 30g/t - Zone 2"
    - Uke 2:
      - Økt 1: "75 min @ 45g/t - Zone 2-3"
      - Økt 2: "75 min @ 45g/t - Zone 2-3"
    - Etc.
- [ ] Trykk på en økt → Gå til Epic 4 (Planlegging)
- [ ] Hvis program ikke startet: "Start program"-knapp

**Technical Notes:**
- Screen: `src/screens/programs/ProgramDetailScreen.tsx`
- Component: `src/components/program/ProgramWeekView.tsx`, `SessionCard.tsx`
- Repository:
  - `ProgramRepository.getDetails(programId)`
  - `ProgramRepository.getSessions(programId)`
- Database: JOIN `programs`, `program_sessions`, `user_programs`

---

### **Story 3.4: Progresjonsoversikt per program** ⭐ NY

**Som** en bruker
**vil jeg** se min progresjon for hvert program jeg gjør (f.eks. 'Uke 2 av 4, 3 økter fullført')
**slik at** jeg holder motivasjonen og ser framgang

**Acceptance Criteria:**
- [ ] På program-detaljskjerm (Story 3.3) vises progresjonsinformasjon:
  - **Progress bar:** Visuell bar som viser gjennomført %
  - **Tekst:** "Uke 2 av 4" (basert på første fullførte økt i uken)
  - **Økter:** "3 av 8 økter fullført" (total count)
- [ ] Progress bar oppdateres basert på fullførte økter:
  - Grønn farge for fullført del
  - Grå/lys for gjenstående
- [ ] Hver økt i listen har status-ikon:
  - ✅ Fullført (grønn)
  - ⏳ Planlagt (gul - har planned_session)
  - ○ Ikke gjort (grå)
- [ ] Fullførte økter vises med dato (f.eks. "Fullført 23. okt")
- [ ] Hvis program fullført (100%):
  - Badge/medal vises
  - Tekst: "🎉 Program fullført!"
  - Knapp: "Se resultater" (går til Epic 7 progresjonsgraf)

**Technical Notes:**
- Component: `src/components/program/ProgressBar.tsx` (ny)
- Logic:
  ```typescript
  const totalSessions = programSessions.length; // f.eks. 8
  const completedSessions = sessionLogs.filter(s => s.session_status === 'completed').length;
  const progressPercent = (completedSessions / totalSessions) * 100;

  const currentWeek = Math.ceil(completedSessions / sessionsPerWeek);
  ```
- Database:
  - COUNT session_logs WHERE program_session_id IN (...)
  - GROUP BY week_number

---

### **Story 3.5: Multi-program support** ⭐ NY

**Som** en bruker
**vil jeg** kunne ha flere aktive programmer samtidig (f.eks. '30g/t Base' og '40g/t Test')
**slik at** jeg kan eksperimentere med ulike protokoller parallelt

**Acceptance Criteria:**
- [ ] Bruker kan starte flere programmer samtidig (ingen begrensning)
- [ ] Dashboard viser ALLE aktive programmer:
  - Liste eller cards med hver sitt progresjonsstatus
  - Trykk på program → gå til program-detaljer (Story 3.3)
- [ ] Ved valg av økt (Epic 4), bruker velger hvilket program økten tilhører
- [ ] Når bruker logger en økt (Epic 5), må de velge/bekrefte hvilket program det er:
  - Dropdown: "Hvilket program?" (hvis flere aktive)
  - Eller auto-deteksjon basert på planlagt økt
- [ ] Progresjon trackes SEPARAT per program (ikke blandet)
- [ ] Bruker kan pause/stoppe ett program uten å påvirke andre:
  - "Pause program"-knapp i program-detaljer
  - Status endres til 'paused'
  - Kan reactives senere

**Technical Notes:**
- Database: `user_programs` table støtter allerede multi-program (user_id + program_id)
- State: `programStore` holder liste av aktive programmer
- UI: Dashboard må vise flere program-cards

**Design consideration:**
- Ikke vis mer enn 3-4 aktive programmer samtidig (clutter)
- Anbefal brukere å fokusere på 1-2 programmer om gangen

---

## User Flow Diagram

```
[Programmer-liste] (Story 3.1)
       ↓
   [Trykk på program]
       ↓
   [Program-detaljer] (Story 3.3)
       ↓
   [Progresjon vises] (Story 3.4)
       ↓
   [Start program] (Story 3.2)
       ↓
   [Bekreft]
       ↓
   [Program aktivt - vises på dashboard]
       ↓
   [Bruker kan starte flere programmer] (Story 3.5)
       ↓
   [Velg økt → Epic 4]
```

---

## Technical Architecture

### Database Schema

```sql
-- programs table (pre-populated)
CREATE TABLE programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  target_audience TEXT,
  research_source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1
);

-- program_sessions table (pre-populated)
CREATE TABLE program_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  carb_rate_g_per_hour INTEGER NOT NULL,
  intensity_zone TEXT,
  notes TEXT,
  FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- user_programs table (tracks user's active programs)
CREATE TABLE user_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'paused'
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

### Seed Data (Migration)

```sql
-- Seed "4-Week Base Carb Training"
INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
VALUES (
  '4-Week Base Carb Training',
  'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
  4,
  'Endurance athletes new to carb training',
  'Based on Jeukendrup (2014) gut training protocols'
);

-- Seed 8 sessions (2 per week)
INSERT INTO program_sessions (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone, notes)
VALUES
  (1, 1, 1, 60, 30, 'Zone 2', 'Start easy, focus on tolerance'),
  (1, 1, 2, 60, 30, 'Zone 2', 'Repeat Week 1 Session 1'),
  (1, 2, 1, 75, 45, 'Zone 2-3', 'Increase duration and carb rate'),
  (1, 2, 2, 75, 45, 'Zone 2-3', 'Repeat Week 2 Session 1'),
  (1, 3, 1, 90, 60, 'Zone 2-3', 'Target race pace carb intake'),
  (1, 3, 2, 90, 60, 'Zone 2-3', 'Repeat Week 3 Session 1'),
  (1, 4, 1, 120, 60, 'Zone 2-3', 'Long session at race pace fueling'),
  (1, 4, 2, 120, 60, 'Zone 2-3', 'Final long session');
```

---

## Screens & Components

```
src/screens/programs/
├── ProgramListScreen.tsx        # Story 3.1
├── ProgramDetailScreen.tsx      # Story 3.3
└── StartProgramScreen.tsx       # Story 3.2 (eller dialog)

src/components/program/
├── ProgramCard.tsx              # Liste-item (Story 3.1)
├── ProgramWeekView.tsx          # Vis uke med økter (Story 3.3)
├── SessionCard.tsx              # Enkelt økt-kort
└── ProgressBar.tsx              # Progresjonbar (Story 3.4) ⭐ NY
```

---

## Testing Scenarios

### Happy Path
1. User går til "Programmer"
2. Ser "4-Week Base Carb Training"
3. Trykker "Start program" → Bekreft
4. Kommer til program-detaljer
5. Ser "Uke 1 av 4, 0 av 8 økter fullført"
6. Trykker på "Uke 1, Økt 1" → Går til planlegging (Epic 4)
7. Fullføre økten (Epic 5)
8. Kommer tilbake til program-detaljer
9. Ser "Uke 1 av 4, 1 av 8 økter fullført" (progress bar oppdatert)

### Multi-Program Path (Story 3.5)
1. User starter "4-Week Base (30g/t)"
2. Gjør 2 økter, ser progresjon
3. Starter nytt program "6-Week Advanced (40g/t)"
4. Dashboard viser begge programmer
5. Velger økt fra Advanced-program
6. Progresjon trackes separat for hvert program

### Edge Cases
- Bruker starter program, men gjør ingen økter (progresjon = 0%)
- Bruker fullfører program (100%) → Se badge/medal
- Bruker pauser program → Status 'paused', kan reactives
- Bruker har 5 aktive programmer (UI håndterer dette gracefully)

---

## Definition of Done

- [ ] Alle 5 User Stories implementert
- [ ] Seed data for minst 1 program (4-Week Base)
- [ ] Program-liste viser korrekt info
- [ ] Start program fungerer (INSERT i user_programs)
- [ ] Program-detaljer viser økter gruppert per uke
- [ ] Progresjonbar oppdateres korrekt (Story 3.4)
- [ ] Multi-program support fungerer (Story 3.5)
- [ ] UI matcher Material Design 3
- [ ] Manuell testing: Start, gjennomfør, fullfør program
- [ ] Performance: 10+ programmer i liste (future-proofing)

---

## Future Enhancements (Post-MVP)

- [ ] Flere programmer (Heat Training, High-Carb, Low-FODMAP, etc.)
- [ ] Egendefinerte programmer (v1.2) - Story 3.7
- [ ] Deling av programmer (community)
- [ ] Streak tracking ("5 dager på rad!")
- [ ] Achievements/badges for fullførte programmer
- [ ] Kalendervisning av planlagte økter
- [ ] Påminnelser for neste økt (v1.1)

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Development
