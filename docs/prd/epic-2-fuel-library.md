# Epic 2: Drivstoff-bibliotek ("Mitt Skafferi")

**Epic ID:** EPIC-2
**Epic Name:** Drivstoff-bibliotek ("Mitt Skafferi")
**Priority:** P0 (Must-Have)
**Status:** Ready for Development
**Estimated Complexity:** Low
**Dependencies:** Epic 1 (bruker må være onboardet)

---

## Epic Description

Som en bruker må jeg kunne definere mine egne ernæringsprodukter (gel, drikke, mat) i et personlig "skafferi", slik at appen kan bruke disse til å lage konkrete ernæringsplaner. Dette er kritisk fordi hver utøver bruker sine egne prefererte produkter.

**Business Value:**
- Personalisering - brukeren definerer SINE produkter
- Fleksibilitet - fungerer med alle produkter (ikke låst til spesifikke merker)
- Nøyaktighet - appen snakker brukerens språk ("Maurten Gel" i stedet for "Gel #1")

---

## User Stories

### **Story 2.1: Personlig Skafferi**

**Som** en bruker
**vil jeg** ha et personlig 'Skafferi' der jeg kan legge til de gel-ene, sportsdrikkene og matvarene jeg bruker
**slik at** jeg kan bygge mine egne ernæringsplaner basert på produkter jeg faktisk har tilgjengelig

**Acceptance Criteria:**
- [ ] "Mitt Skafferi" er tilgjengelig fra hovednavigasjon (tab-bar eller meny)
- [ ] Skafferi-skjerm viser liste over alle mine produkter
- [ ] Tom-state vises hvis ingen produkter:
  - Illustrasjon eller ikon
  - Tekst: "Ditt skafferi er tomt. Legg til dine første produkter!"
  - Stor "Legg til produkt"-knapp
- [ ] Produkter vises som kort (cards) med:
  - Produktnavn
  - Produkttype (ikon: gel/drikke/bar/mat)
  - Karbohydrater (f.eks. "25g karbs")
  - Porsjonstørrelse (hvis angitt)
- [ ] Produkter gruppert etter type (Gels, Drikker, Bars, Mat)
- [ ] Floating Action Button (FAB): "+" for å legge til nytt produkt
- [ ] Trykk på produkt-kort → Gå til redigering (Story 2.3)

**Technical Notes:**
- Screen: `src/screens/fuel/FuelLibraryScreen.tsx`
- Component: `src/components/fuel/FuelProductCard.tsx`
- Repository: `FuelProductRepository.getAll(userId)`
- Database: `fuel_products` table WHERE `deleted_at IS NULL`

---

### **Story 2.2: Legg til produkt**

**Som** en bruker
**når jeg** legger til et nytt produkt
**vil jeg** kunne spesifisere navn, type (gel, drikke, bar) og viktigst: **antall gram karbohydrater**
**slik at** appen kan bruke dette i ernæringsberegninger

**Acceptance Criteria:**
- [ ] "Legg til produkt"-skjerm åpnes fra FAB eller tom-state knapp
- [ ] Form-felter:
  1. **Produktnavn** (påkrevd, tekstfelt)
     - Placeholder: "f.eks. Maurten Gel 100"
  2. **Produkttype** (påkrevd, dropdown/radio)
     - Gel
     - Drikke
     - Bar
     - Mat
  3. **Karbohydrater per porsjon** (påkrevd, nummer)
     - Input type: numeric
     - Enhet: gram (vises automatisk)
     - Placeholder: "f.eks. 25"
  4. **Porsjonstørrelse** (valgfritt, tekstfelt)
     - Placeholder: "f.eks. 40g pakke, 500ml flaske"
  5. **Notater** (valgfritt, tekstområde)
     - Placeholder: "f.eks. Min favoritt-gel, går godt ned"
- [ ] Valideringer:
  - Produktnavn må fylles ut
  - Type må velges
  - Karbohydrater må være > 0 og < 200 (rimelighetskontroll)
- [ ] Feilmeldinger vises under felt ved validering
- [ ] "Lagre"-knapp (disabled til valid)
- [ ] "Avbryt"-knapp
- [ ] Ved lagring:
  - Produkt lagres i database
  - Bruker returneres til Skafferi-liste
  - Nytt produkt vises øverst i sin kategori
  - Toast-melding: "✓ Produkt lagt til"

**Technical Notes:**
- Screen: `src/screens/fuel/AddFuelScreen.tsx`
- Component: `src/components/fuel/FuelProductForm.tsx` (reusable)
- Validation: React Hook Form + Zod schema
- Repository: `FuelProductRepository.create()`

---

### **Story 2.3: Rediger og slett produkter**

**Som** en bruker
**vil jeg** kunne redigere og slette produkter fra mitt 'Skafferi'
**slik at** det holder seg oppdatert og reflekterer produktene jeg faktisk bruker

**Acceptance Criteria:**

**Redigering:**
- [ ] Trykk på produkt-kort i listen → Åpne redigeringsskjerm
- [ ] Redigeringsskjerm viser samme form som "Legg til" (Story 2.2)
- [ ] Alle felter pre-populert med eksisterende data
- [ ] "Lagre endringer"-knapp
- [ ] "Slett produkt"-knapp (rød, nederst)
- [ ] "Avbryt"-knapp
- [ ] Ved lagring:
  - Produkt oppdateres i database
  - Bruker returneres til liste
  - Toast: "✓ Produkt oppdatert"

**Sletting:**
- [ ] "Slett produkt"-knapp viser bekreftelsesdialog:
  - Tittel: "Slett [Produktnavn]?"
  - Melding: "Dette produktet vil bli fjernet fra ditt skafferi. Tidligere loggede økter påvirkes ikke."
  - Knapper: "Avbryt" | "Slett" (rød)
- [ ] Ved bekreftelse:
  - Soft delete (sett `deleted_at` timestamp)
  - Bruker returneres til liste
  - Produkt fjernes fra visning
  - Toast: "✓ Produkt slettet"
- [ ] Slettet produkt fjernes fra liste umiddelbart

**Begrensninger:**
- [ ] Produkter som er brukt i planlagte økter kan fortsatt slettes (soft delete bevarer data-integritet)

**Technical Notes:**
- Screen: `src/screens/fuel/EditFuelScreen.tsx`
- Component: Same `FuelProductForm.tsx` (edit mode)
- Repository:
  - `FuelProductRepository.update(id, data)`
  - `FuelProductRepository.softDelete(id)`
- Database: Soft delete sett `deleted_at = datetime('now')`

---

## User Flow Diagram

```
[Mitt Skafferi] (Story 2.1)
       ↓
   [Tom liste?]
       ↓ Ja
   [Tom-state]
       ↓
   [Trykk "Legg til"]
       ↓
   [Legg til produkt-form] (Story 2.2)
       ↓
   [Fyll inn: Navn, Type, Karbs]
       ↓
   [Lagre]
       ↓
   [Tilbake til liste] → Produkt vises
       ↓
   [Trykk på produkt]
       ↓
   [Rediger produkt] (Story 2.3)
       ↓
   [Endre data ELLER Slett]
       ↓
   [Lagre/Slett]
       ↓
   [Tilbake til liste]
```

---

## Technical Architecture

### Database Schema

```sql
CREATE TABLE fuel_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL,           -- 'gel', 'drink', 'bar', 'food'
  carbs_per_serving REAL NOT NULL,
  serving_size TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,                      -- Soft delete
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_fuel_products_user ON fuel_products(user_id);
CREATE INDEX idx_fuel_products_active ON fuel_products(user_id, deleted_at);
```

### Screens & Components

```
src/screens/fuel/
├── FuelLibraryScreen.tsx        # Story 2.1: Liste
├── AddFuelScreen.tsx            # Story 2.2: Legg til
└── EditFuelScreen.tsx           # Story 2.3: Rediger

src/components/fuel/
├── FuelProductCard.tsx          # Vis produkt i liste
├── FuelProductForm.tsx          # Reusable form (add/edit)
└── FuelSelector.tsx             # (Brukes i Epic 4)
```

### Repository

```typescript
// src/database/repositories/FuelProductRepository.ts
export class FuelProductRepository {
  static async getAll(userId: number): Promise<FuelProduct[]> {
    // Hent alle aktive produkter (deleted_at IS NULL)
  }

  static async create(product: NewFuelProduct): Promise<number> {
    // INSERT INTO fuel_products
    // Return lastInsertRowId
  }

  static async update(id: number, product: Partial<FuelProduct>): Promise<void> {
    // UPDATE fuel_products SET ... WHERE id = ?
  }

  static async softDelete(id: number): Promise<void> {
    // UPDATE fuel_products SET deleted_at = datetime('now') WHERE id = ?
  }
}
```

---

## Validation Schema (Zod)

```typescript
import { z } from 'zod';

export const fuelProductSchema = z.object({
  name: z.string()
    .min(1, 'Produktnavn er påkrevd')
    .max(50, 'Produktnavn kan ikke være lengre enn 50 tegn'),

  product_type: z.enum(['gel', 'drink', 'bar', 'food'], {
    errorMap: () => ({ message: 'Velg en produkttype' })
  }),

  carbs_per_serving: z.number()
    .positive('Karbohydrater må være større enn 0')
    .max(200, 'Karbohydrater kan ikke overstige 200g (sjekk input)'),

  serving_size: z.string().optional(),

  notes: z.string().max(200, 'Notater kan ikke overstige 200 tegn').optional(),
});
```

---

## Testing Scenarios

### Happy Path
1. User går til "Mitt Skafferi" (tom)
2. Trykker "Legg til produkt"
3. Fyller inn:
   - Navn: "Maurten Gel 100"
   - Type: "Gel"
   - Karbs: 25
   - Porsjon: "40g pakke"
4. Trykker "Lagre"
5. Ser produktet i listen
6. Trykker på produktet
7. Endrer karbs til 27 (oppdatert oppskrift)
8. Lagrer → Ser oppdatert verdi i listen

### Edge Cases
- Legge til produkt med kun påkrevde felter (navn, type, karbs)
- Legge til produkt med veldig langt navn (validering)
- Prøve å legge til med 0 karbs (validering)
- Prøve å lagre uten å velge type (validering)
- Slette et produkt som er brukt i en planlagt økt (soft delete, data bevares)
- Opprette 50+ produkter (performance test)

---

## Definition of Done

- [ ] Alle 3 User Stories implementert
- [ ] CRUD-operasjoner fungerer korrekt (Create, Read, Update, Delete)
- [ ] Soft delete implementert (deleted_at timestamp)
- [ ] Valideringer fungerer på alle felter
- [ ] UI matcher Material Design 3
- [ ] Tom-state vises når ingen produkter
- [ ] Produkter grupperes etter type
- [ ] Toast-meldinger ved lagring/sletting
- [ ] Bekreftelsesdialog ved sletting
- [ ] Manuell testing på emulator og fysisk enhet
- [ ] Performance test med 50+ produkter

---

## Future Enhancements (Post-MVP)

- [ ] Søk/filtrer produkter (v1.1)
- [ ] Sortering (alfabetisk, sist brukt, mest brukt)
- [ ] Produktbilder (scan barcode eller last opp bilde)
- [ ] Import fra database (Maurten, Precision Fuel, etc.)
- [ ] Dele produktbibliotek med andre brukere (community feature)
- [ ] Automatisk forslag basert på populære produkter

---

**Epic Owner:** Sarah (PO)
**Last Updated:** 2025-10-23
**Status:** ✅ Ready for Development
