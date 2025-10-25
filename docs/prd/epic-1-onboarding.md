# Epic 1: Onboarding og Profiloppsett

**Epic ID:** EPIC-1
**Epic Name:** Onboarding og Profiloppsett
**Priority:** P0 (Must-Have)
**Status:** Ready for Development
**Estimated Complexity:** Low
**Dependencies:** None

---

## Epic Description

Som en ny bruker av GI Diary, må jeg kunne gjennomføre en enkel onboarding-prosess som hjelper meg å komme i gang med mage-trening. Appen skal samle inn mine mål og utfordringer, og foreslå et passende treningsprogram basert på mine behov.

**Business Value:**
- Lav terskel for å komme i gang
- Personalisert opplevelse fra første stund
- Økt sannsynlighet for at brukere fullfører første program

---

## User Stories

### **Story 1.1: Velkomst-veiviser**

**Som** en ny bruker
**vil jeg** gjennomgå en enkel velkomst-veiviser (wizard)
**slik at** jeg kan legge inn mine mål (f.eks. neste løp) og mitt største mageproblem (f.eks. kvalme)

**Acceptance Criteria:**
- [ ] Velkomstskjerm vises ved første app-oppstart
- [ ] Wizard består av maksimalt 3 skjermer
- [ ] Skjerm 1: Velkomst med forklaring av hva appen gjør
- [ ] Skjerm 2: Input for mål (fritekst, f.eks. "Sub-3 maraton Oslo 2025")
- [ ] Skjerm 3: Velg største mageproblem fra liste:
  - Kvalme
  - Kramper
  - Oppblåsthet
  - Diaré
  - Annet (fritekst)
- [ ] "Neste"-knapp på hver skjerm
- [ ] "Tilbake"-knapp for å rette tidligere svar
- [ ] Progress indicator viser hvor langt brukeren er (1/3, 2/3, 3/3)

**Technical Notes:**
- Screens: `src/screens/onboarding/WelcomeScreen.tsx`
- Database: Lagres i `users` table (primary_goal, primary_gi_issue)
- State: `userStore` (Zustand)

---

### **Story 1.2: Foreslå program**

**Som** en bruker
**vil jeg** at appen skal foreslå et passende 'Mage-program' for meg basert på svarene mine i velkomst-veiviseren
**slik at** jeg får en god start og vet hvilket program som passer for meg

**Acceptance Criteria:**
- [ ] Etter siste onboarding-skjerm vises program-forslag
- [ ] Forslag basert på brukerens problem:
  - Kvalme → "4-Week Base Carb Training" (starter lavt, 30g/t)
  - Kramper → "4-Week Base Carb Training"
  - Oppblåsthet → "4-Week Base Carb Training"
  - Annet → "4-Week Base Carb Training" (standard)
- [ ] Forslag-skjerm viser:
  - Programnavn
  - Kort beskrivelse (1-2 setninger)
  - Varighet (f.eks. "4 uker, 2 økter per uke")
  - Start-intensitet (f.eks. "Starter på 30g/t")
- [ ] Knapp: "Start dette programmet"
- [ ] Knapp: "Se alle programmer" (går til Epic 3)
- [ ] Forklaring: "Hvorfor dette programmet?" (matchet mot problem)

**Technical Notes:**
- Screens: `src/screens/onboarding/ProgramSuggestionScreen.tsx`
- Logic: `src/services/programRecommendation.ts`
- Database: `programs` table (lese), `user_programs` table (opprette ved "Start")

---

### **Story 1.3: Opprett profil**

**Som** en bruker
**vil jeg** kunne opprette en enkel profil med basisinfo (f.eks. vekt)
**slik at** appen kan gi meg mer nøyaktige anbefalinger (f.eks. koffeindosering)

**Acceptance Criteria:**
- [ ] Etter program-forslag vises profil-skjerm (siste onboarding-steg)
- [ ] Felter:
  - Navn (valgfritt, for personalisering)
  - Vekt (kg) (valgfritt, brukes for fremtidige beregninger)
- [ ] "Hopp over"-knapp for å unngå å fylle ut
- [ ] "Fullfør"-knapp lagrer profil og går til hovedskjerm
- [ ] Profil kan redigeres senere i Settings

**Technical Notes:**
- Screens: `src/screens/onboarding/ProfileSetupScreen.tsx` (ny)
- Database: `users` table (name, weight_kg, onboarded_at)
- State: `userStore.completeOnboarding()`

---

## User Flow Diagram

```
[App Launch]
    ↓
[First Time?] → Yes → [WelcomeScreen]
    ↓                      ↓
    No                [GoalsScreen] (Story 1.1)
    ↓                      ↓
[Main App]          [ProgramSuggestionScreen] (Story 1.2)
                           ↓
                    [ProfileSetupScreen] (Story 1.3)
                           ↓
                    [Main App - Dashboard]
```

---

## Technical Architecture

### Database Schema

```sql
-- users table (existing)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,                      -- Story 1.3
  weight_kg REAL,                 -- Story 1.3
  onboarded_at TEXT NOT NULL,     -- Timestamp
  primary_goal TEXT,              -- Story 1.1
  primary_gi_issue TEXT,          -- Story 1.1
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Screens

```
src/screens/onboarding/
├── WelcomeScreen.tsx           # Story 1.1 (Skjerm 1)
├── GoalsScreen.tsx             # Story 1.1 (Skjerm 2-3)
├── ProgramSuggestionScreen.tsx # Story 1.2
└── ProfileSetupScreen.tsx      # Story 1.3 (ny)
```

### State Management

```typescript
// src/store/userStore.ts
interface UserState {
  user: User | null;
  onboardingCompleted: boolean;

  completeOnboarding: (profile: {
    name?: string;
    weight_kg?: number;
    primary_goal: string;
    primary_gi_issue: string;
  }) => Promise<void>;
}
```

---

## Testing Scenarios

### Happy Path
1. User åpner app første gang
2. Ser velkomstskjerm → trykker "Kom i gang"
3. Fyller inn mål: "Sub-3:30 maraton"
4. Velger problem: "Kvalme"
5. Får forslag: "4-Week Base Carb Training"
6. Trykker "Start dette programmet"
7. Fyller inn navn: "Kari" og vekt: 65 kg
8. Trykker "Fullfør"
9. Kommer til dashboard med aktivt program

### Edge Cases
- Bruker trykker "Tilbake" flere ganger
- Bruker velger "Hopp over" på profil-skjerm
- Bruker velger "Se alle programmer" i stedet for foreslått
- Bruker lukker app midt i onboarding (skal kunne fortsette ved neste oppstart)

---

## Definition of Done

- [ ] Alle 3 User Stories implementert
- [ ] UI matcher Material Design 3 guidelines
- [ ] Data lagres korrekt i SQLite
- [ ] Onboarding kan gjennomføres på < 2 minutter
- [ ] Manuell testing på Android emulator og fysisk enhet
- [ ] Crash-testing (force-quit midt i onboarding)
- [ ] Tilbake-knapp fungerer korrekt
- [ ] Onboarding vises kun første gang (ikke ved relaunch)

---

## Future Enhancements (Post-MVP)

- [ ] Legg til flere program-forslag (ikke bare "4-Week Base")
- [ ] Personaliserte anbefalinger basert på vekt og erfaring
- [ ] Onboarding-video (kort intro til mage-trening)
- [ ] Import profil fra Strava/Garmin (navn, vekt)

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Development
