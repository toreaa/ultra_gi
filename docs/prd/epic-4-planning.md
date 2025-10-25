# Epic 4: Økt-planlegging (Fase 1: Før økta)

**Epic ID:** EPIC-4
**Epic Name:** Økt-planlegging (Fase 1: Før økta)
**Priority:** P0 (Must-Have)
**Status:** Ready for Development
**Estimated Complexity:** Medium
**Dependencies:** Epic 2 (Skafferi), Epic 3 (Programmer)

---

## Epic Description

Som en bruker må jeg kunne planlegge ernæringen min FØR økten, basert på programmets krav og produktene i mitt skafferi. Appen skal generere en konkret, praktisk plan som jeg kan følge under økten.

**Business Value:**
- Fjerner gjettearbeid ("hvor mye skal jeg ta?")
- Konkret plan → enklere å følge
- Personalisert til MINE produkter (ikke generiske råd)

---

## User Stories

### **Story 4.1: Velg økt → ernæringsplan**

**Som** en bruker
**når jeg** velger dagens program-økt (f.eks. 'Uke 2: 75min @ 45 g/t')
**vil jeg** at appen skal lage en konkret ernæringsplan
**slik at** jeg vet nøyaktig hva jeg skal ta og når

**Acceptance Criteria:**
- [ ] Bruker kommer til planleggingsskjerm ved:
  - Trykk på økt fra program-detaljer (Epic 3.3)
  - Dashboard: "Planlegg neste økt"-knapp
- [ ] Skjerm viser økt-info øverst:
  - Programnavn + Uke/Økt nummer
  - Varighet (f.eks. "75 minutter")
  - Mål-intensitet (f.eks. "45g karbs per time")
  - Intensitetssone (f.eks. "Zone 2-3")
- [ ] Appen beregner totalt karb-behov:
  - Formula: `(duration_minutes / 60) * carb_rate_g_per_hour`
  - Eksempel: (75 / 60) * 45 = 56.25g → rund av til 56g
  - Vis: "Du trenger ca. 56g karbohydrater for denne økten"
- [ ] Appen foreslår produkter fra skafferi (Story 4.2)
- [ ] Knapp: "Lag plan" (går til Story 4.2)

**Technical Notes:**
- Screen: `src/screens/session/SessionPlanScreen.tsx`
- Logic: `src/services/fuelPlanner.ts`
  - `calculateRequiredCarbs(duration, carbRate): number`
- Database: Read from `program_sessions`

---

### **Story 4.2: Bruk produkter fra skafferi**

**Som** en bruker
**vil jeg** at ernæringsplanen skal bruke produktene fra 'Mitt Skafferi' (f.eks. 'Plan: Ta 1 "Maurten Gel" + 1/2 flaske "Min Sportsdrikk"')
**slik at** planen er realistisk og praktisk for meg

**Acceptance Criteria:**
- [ ] Appen genererer forslag basert på tilgjengelige produkter
- [ ] Algoritme (MVP - enkel greedy):
  1. Sorter produkter etter "passer best" (nærmest mål-karbs)
  2. Velg kombinasjon som treffer ~90-110% av mål
  3. Prioriter færre produkter (1-3 items) framfor mange
- [ ] Foreslått plan vises som liste:
  ```
  Foreslått plan (56g totalt):
  - 2x Maurten Gel 100 (50g)
  - 1x Banan (27g)
  Total: 77g (137% av mål)
  ```
- [ ] **Timing-forslag** (auto-generert):
  - Del opp inntak jevnt over økten
  - Eksempel (75 min økt):
    - 0:25 - Ta Maurten Gel (25g)
    - 0:50 - Ta Maurten Gel (25g)
    - 1:00 - Ta Banan (27g)
- [ ] Bruker kan:
  - Akseptere forslag → Gå til Story 4.3
  - Manuell tilpasning:
    - Endre antall (f.eks. 1x → 2x)
    - Legge til/fjerne produkter
    - Justere timing (dra og slipp eller input)
- [ ] Live oppdatering av total karbs og % av mål

**Technical Notes:**
- Logic: `src/services/fuelPlanner.ts`
  ```typescript
  function generateFuelPlan(
    targetCarbs: number,
    durationMinutes: number,
    availableProducts: FuelProduct[]
  ): FuelPlan
  ```
- Component: `src/components/fuel/FuelSelector.tsx`
- Algorithm (MVP):
  ```typescript
  // Greedy: Velg produkter som kommer nærmest målet
  // Future: Knapsack problem (optimalisering)
  ```

---

### **Story 4.3: Bekreft plan**

**Som** en bruker
**vil jeg** kunne bekrefte denne planen
**slik at** appen 'armeres' og er klar for 'Økt-modus'

**Acceptance Criteria:**
- [ ] "Bekreft plan"-knapp nederst på planleggingsskjerm
- [ ] Ved bekreftelse:
  - Plan lagres i `planned_sessions` table
  - `fuel_plan_json` inneholder produkter + timing
  - `planned_date` settes til i dag (eller bruker velger dato)
- [ ] Toast: "✓ Plan lagret!"
- [ ] Navigering:
  - Tilbake til program-detaljer (økt markert som "⏳ Planlagt")
  - ELLER direkte til "Økt-modus" (Epic 5) med prompt:
    - "Vil du starte økten nå?"
    - [Ja] → Gå til Epic 5
    - [Nei] → Tilbake
- [ ] Planlagt økt vises på dashboard:
  - "Planlagt økt: Uke 2, Økt 1 - 75 min @ 45g/t"
  - Knapp: "Start økt" → Epic 5

**Technical Notes:**
- Database: INSERT INTO `planned_sessions`
  ```sql
  INSERT INTO planned_sessions (user_id, program_session_id, planned_date, fuel_plan_json, notes)
  VALUES (1, 3, '2025-10-24', '[{...}]', '');
  ```
- `fuel_plan_json` format:
  ```json
  [
    {
      "fuel_product_id": 1,
      "product_name": "Maurten Gel 100",
      "quantity": 2,
      "timing_minutes": [25, 50],
      "carbs_total": 50
    },
    {
      "fuel_product_id": 3,
      "product_name": "Banan",
      "quantity": 1,
      "timing_minutes": [60],
      "carbs_total": 27
    }
  ]
  ```

---

## User Flow Diagram

```
[Velg økt fra program] (Epic 3.3)
       ↓
[Planleggingsskjerm] (Story 4.1)
       ↓
[Beregn karb-behov: 56g]
       ↓
[Generer forslag fra skafferi] (Story 4.2)
       ↓
[Vis plan: 2x Gel + 1x Banan = 77g]
       ↓
[Bruker kan justere (valgfritt)]
       ↓
[Bekreft plan] (Story 4.3)
       ↓
[Plan lagret i planned_sessions]
       ↓
[Prompt: "Start økten nå?"]
       ↓ Ja          ↓ Nei
   [Epic 5]    [Dashboard]
```

---

## Technical Architecture

### Database Schema

```sql
CREATE TABLE planned_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_session_id INTEGER,
  planned_date TEXT NOT NULL,
  fuel_plan_json TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (program_session_id) REFERENCES program_sessions(id)
);
```

### Fuel Plan Algorithm (MVP)

```typescript
// src/services/fuelPlanner.ts

export function generateFuelPlan(
  targetCarbs: number,
  durationMinutes: number,
  availableProducts: FuelProduct[]
): FuelPlan {
  const plan: FuelPlanItem[] = [];
  let remainingCarbs = targetCarbs;

  // Sort products by carbs_per_serving (descending)
  const sorted = [...availableProducts].sort((a, b) =>
    b.carbs_per_serving - a.carbs_per_serving
  );

  // Greedy algorithm
  for (const product of sorted) {
    if (remainingCarbs <= 0) break;

    const quantity = Math.ceil(remainingCarbs / product.carbs_per_serving);
    const clampedQty = Math.min(quantity, 5); // Max 5 of same product

    plan.push({
      fuel_product_id: product.id,
      product_name: product.name,
      quantity: clampedQty,
      timing_minutes: generateTiming(durationMinutes, clampedQty),
      carbs_total: product.carbs_per_serving * clampedQty,
    });

    remainingCarbs -= product.carbs_per_serving * clampedQty;
  }

  return plan;
}

function generateTiming(durationMinutes: number, quantity: number): number[] {
  // Spread intake evenly over session
  const interval = durationMinutes / (quantity + 1);
  return Array.from({ length: quantity }, (_, i) => Math.round((i + 1) * interval));
}
```

---

## Testing Scenarios

### Happy Path
1. User velger "Uke 2, Økt 1: 75 min @ 45g/t"
2. Ser "Du trenger 56g karbs"
3. Appen foreslår: 2x Maurten Gel + 1x Banan
4. Timing: 0:25, 0:50, 1:00
5. User bekrefter
6. Plan lagret, prompt "Start nå?" → Nei
7. Ser planlagt økt på dashboard

### Manual Adjustment
1. User ser forslag (77g)
2. Synes det er for mye
3. Fjerner banan → 50g (89% av mål)
4. Bekrefter
5. Plan lagret med kun 2x Gel

### Edge Cases
- Tomt skafferi → Feilmelding: "Legg til produkter i skafferi først"
- Skafferi har kun produkter med høyt karb-innhold (vanskelig å treffe mål)
- Veldig kort økt (30 min) → 1 produkt er nok
- Veldig lang økt (240 min) → Mange produkter (vurder begrensning)

---

## Definition of Done

- [ ] Alle 3 User Stories implementert
- [ ] Karb-beregning korrekt (formula verified)
- [ ] Fuel plan-algoritme fungerer (greedy MVP)
- [ ] Plan lagres i database (fuel_plan_json)
- [ ] Timing-forslag genereres automatisk
- [ ] Bruker kan manuelt justere plan
- [ ] Manuell testing: Planlegg 5+ ulike økter
- [ ] Edge case: Tomt skafferi håndteres

---

## Future Enhancements (Post-MVP)

- [ ] Smartere algoritme (knapsack optimization)
- [ ] Lær av tidligere økter (hva fungerte best?)
- [ ] "Favoritt-planer" (lagre og gjenbruk)
- [ ] Værhensyn (varmt vær → mer drikke)
- [ ] Integrasjon med Epic 7: "Denne planen fungerte bra sist"

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Development
