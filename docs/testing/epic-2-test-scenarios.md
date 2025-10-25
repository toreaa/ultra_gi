# Epic 2: Fuel Library (Mitt Skafferi) - Test Scenarios

**Epic:** EPIC-2 "Drivstoff-bibliotek (Mitt Skafferi)"
**Priority:** P0 (Must-Have)
**Test Type:** CRUD Operations, Data Validation, UI/UX
**Created:** 2025-10-24
**Author:** Quinn (QA) 🎯

---

## Test Overview

Epic 2 validates the personal fuel library - the PRODUCT CATALOG that enables personalized planning. These test scenarios ensure:
1. ✅ Complete CRUD operations (Create, Read, Update, Delete)
2. ✅ Data validation prevents invalid products
3. ✅ Soft delete preserves data integrity
4. ✅ Empty state guides new users
5. ✅ Product grouping by type works correctly
6. ✅ Performance with 50+ products

---

## Story 2.1: Personal Fuel Library

### Test Scenario 2.1.1: Access Fuel Library from Navigation
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have completed onboarding
**And** I am on the MainApp (Dashboard)
**When** I navigate to "Mitt Skafferi" from main navigation (tab bar or menu)
**Then** I should see the FuelLibraryScreen
**And** I should see the screen title: "Mitt Skafferi"
**And** I should see a Floating Action Button (FAB) with "+" icon

**Navigation Path:** Dashboard → Mitt Skafferi

---

### Test Scenario 2.1.2: Empty State Display
**Priority:** P0 (Critical)
**Type:** UI/UX

**Given** I have NO fuel products in my skafferi
**When** I navigate to FuelLibraryScreen
**Then** I should see an empty state with:
- An icon (empty box or food-off icon)
- Message: "Ditt skafferi er tomt. Legg til dine første produkter!"
- Large "Legg til produkt" button
**When** I tap "Legg til produkt"
**Then** I should navigate to AddFuelScreen (Story 2.2)

---

### Test Scenario 2.1.3: Display Single Product
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have 1 fuel product in my skafferi:
- Name: "Maurten Gel 100"
- Type: gel
- Carbs: 25g per serving
- Serving size: "40g pakke"
**When** I view FuelLibraryScreen
**Then** I should see a product card displaying:
- Product name: "Maurten Gel 100"
- Type icon: Flask/water icon (gel)
- Carbs: "25g karbs"
- Serving size: "40g pakke"
**And** the FAB "+" button should be visible

---

### Test Scenario 2.1.4: Product Cards Display All Fields
**Priority:** P1 (High)
**Type:** UI Validation

**Given** I have multiple products with different field combinations:

**Product 1: All fields populated**
- Name: "Maurten Gel 100"
- Type: gel
- Carbs: 25g
- Serving size: "40g pakke"
- Notes: "Min favoritt"

**Product 2: Minimum required fields only**
- Name: "Sportsdrikk"
- Type: drink
- Carbs: 30g
- Serving size: null
- Notes: null

**When** I view FuelLibraryScreen
**Then** Product 1 card should show:
- Title: "Maurten Gel 100"
- Subtitle: "25g karbs • 40g pakke"
- Icon: gel icon

**And** Product 2 card should show:
- Title: "Sportsdrikk"
- Subtitle: "30g karbs" (no serving size shown)
- Icon: drink icon

---

### Test Scenario 2.1.5: Product Grouping by Type
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I have 8 fuel products across all types:
- 2 gels: "Maurten Gel", "SiS Gel"
- 2 drinks: "Maurten Drink Mix", "Sportsdrikk"
- 2 bars: "Energy Bar", "Protein Bar"
- 2 food items: "Banan", "Dadler"

**When** I view FuelLibraryScreen
**Then** I should see products grouped into 4 sections:
1. **Section: "Gels"**
   - Maurten Gel
   - SiS Gel
2. **Section: "Drikker"**
   - Maurten Drink Mix
   - Sportsdrikk
3. **Section: "Bars"**
   - Energy Bar
   - Protein Bar
4. **Section: "Mat"**
   - Banan
   - Dadler

**And** each section should have a header with the section title
**And** products within each section should be sorted alphabetically

---

### Test Scenario 2.1.6: Empty Sections Not Displayed
**Priority:** P1 (High)
**Type:** UI Logic

**Given** I have products in only 2 types:
- 2 gels
- 1 drink
- 0 bars
- 0 food items

**When** I view FuelLibraryScreen
**Then** I should see only 2 sections:
- "Gels" section (with 2 products)
- "Drikker" section (with 1 product)
**And** I should NOT see sections for:
- "Bars"
- "Mat"

---

### Test Scenario 2.1.7: Product Type Icons Display Correctly
**Priority:** P2 (Medium)
**Type:** UI Validation

**Test each product type icon:**

| Product Type | Icon Name | Expected Visual |
|--------------|-----------|-----------------|
| gel | flask | Flask/beaker icon |
| drink | cup | Cup/glass icon |
| bar | food-apple | Food bar/apple icon |
| food | food | Food/banana icon |

**Validation:** Each product card displays correct icon for its type

---

### Test Scenario 2.1.8: Tap Product Card to Edit
**Priority:** P0 (Critical)
**Type:** Navigation

**Given** I have a product "Maurten Gel 100" in my library
**When** I tap on the product card
**Then** I should navigate to EditFuelScreen (Story 2.3)
**And** I should see the product's details pre-populated for editing

---

### Test Scenario 2.1.9: FAB Navigation to Add Product
**Priority:** P0 (Critical)
**Type:** Navigation

**Given** I am viewing FuelLibraryScreen (with or without existing products)
**When** I tap the Floating Action Button (FAB) with "+" icon
**Then** I should navigate to AddFuelScreen (Story 2.2)

---

### Test Scenario 2.1.10: Performance with 50+ Products
**Priority:** P1 (High)
**Type:** Performance

**Given** I have 50 fuel products in my library
**When** I navigate to FuelLibraryScreen
**Then** the screen should load in <2 seconds
**And** scrolling should be smooth (60 FPS)
**And** the product list should be virtualized (not all rendered at once)
**And** no lag should occur when scrolling

**Performance Targets:**
- Initial render: <2 seconds
- Scroll FPS: >55 FPS
- Memory usage: <50 MB

---

## Story 2.2: Add Fuel Product

### Test Scenario 2.2.1: Access Add Product Screen
**Priority:** P0 (Critical)
**Type:** Navigation

**Given** I am on FuelLibraryScreen
**When** I tap the FAB "+" button (or "Legg til produkt" from empty state)
**Then** I should navigate to AddFuelScreen
**And** I should see screen title: "Legg til produkt"
**And** I should see an empty form with 5 fields
**And** I should see "Lagre" button (disabled initially)
**And** I should see "Avbryt" button (enabled)

---

### Test Scenario 2.2.2: Add Product with All Fields (Happy Path)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am on AddFuelScreen
**When** I fill in all fields:
- Produktnavn: "Maurten Gel 100"
- Produkttype: "Gel"
- Karbohydrater per porsjon: "25"
- Porsjonstørrelse: "40g pakke"
- Notater: "Min favoritt-gel, fungerer godt"
**Then** "Lagre" button should become enabled
**When** I tap "Lagre"
**Then** the product should be saved to database
**And** I should navigate back to FuelLibraryScreen
**And** I should see toast message: "✓ Produkt lagt til"
**And** the new product should appear in the "Gels" section

**Expected Database State:**
```sql
SELECT * FROM fuel_products WHERE user_id = 1 AND name = 'Maurten Gel 100';
-- Expected result:
-- id: 1
-- user_id: 1
-- name: 'Maurten Gel 100'
-- product_type: 'gel'
-- carbs_per_serving: 25.0
-- serving_size: '40g pakke'
-- notes: 'Min favoritt-gel, fungerer godt'
-- created_at: <timestamp>
-- deleted_at: NULL
```

---

### Test Scenario 2.2.3: Add Product with Minimum Required Fields
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am on AddFuelScreen
**When** I fill in ONLY required fields:
- Produktnavn: "Sportsdrikk"
- Produkttype: "Drikke"
- Karbohydrater per porsjon: "30"
- Porsjonstørrelse: (leave empty)
- Notater: (leave empty)
**Then** "Lagre" button should be enabled
**When** I tap "Lagre"
**Then** the product should be saved successfully
**And** optional fields should be stored as NULL in database

---

### Test Scenario 2.2.4: Product Name Validation
**Priority:** P1 (High)
**Type:** Validation

**Test Case 1: Empty name**
**Given** I am on AddFuelScreen
**When** I leave "Produktnavn" empty
**Then** I should see validation error: "Produktnavn er påkrevd"
**And** "Lagre" button should be disabled

**Test Case 2: Name too long (>50 characters)**
**When** I enter 51 characters: "A" * 51
**Then** I should see error: "Produktnavn kan ikke være lengre enn 50 tegn"
**And** "Lagre" button should be disabled

**Test Case 3: Valid name (1-50 characters)**
**When** I enter "Maurten Gel"
**Then** no validation error should appear
**And** "Lagre" button should be enabled (if other required fields valid)

---

### Test Scenario 2.2.5: Product Type Validation
**Priority:** P0 (Critical)
**Type:** Validation

**Given** I am on AddFuelScreen
**And** I have NOT selected a product type
**Then** I should see error: "Velg en produkttype"
**And** "Lagre" button should be disabled

**When** I select "Gel"
**Then** the validation error should disappear
**And** "Lagre" button should be enabled (if other fields valid)

---

### Test Scenario 2.2.6: Carbs Validation
**Priority:** P0 (Critical)
**Type:** Validation

**Test Case 1: Empty carbs**
**Given** I am on AddFuelScreen
**When** I leave "Karbohydrater per porsjon" empty
**Then** I should see error: "Karbohydrater er påkrevd"
**And** "Lagre" button should be disabled

**Test Case 2: Zero carbs**
**When** I enter "0"
**Then** I should see error: "Karbohydrater må være større enn 0"
**And** "Lagre" button should be disabled

**Test Case 3: Negative carbs**
**When** I enter "-5"
**Then** I should see error: "Karbohydrater må være større enn 0"
**And** "Lagre" button should be disabled

**Test Case 4: Carbs too high (>200)**
**When** I enter "250"
**Then** I should see error: "Karbohydrater kan ikke overstige 200g"
**And** "Lagre" button should be disabled

**Test Case 5: Valid carbs (1-200)**
**When** I enter "25"
**Then** no validation error should appear
**And** "Lagre" button should be enabled

**Test Case 6: Decimal carbs**
**When** I enter "27.5"
**Then** the value should be accepted
**And** saved as 27.5 in database

---

### Test Scenario 2.2.7: Optional Fields Validation
**Priority:** P2 (Medium)
**Type:** Validation

**Test Case 1: Serving size too long (>50 characters)**
**When** I enter serving size with 51 characters
**Then** I should see error: "Porsjonstørrelse kan ikke være lengre enn 50 tegn"

**Test Case 2: Notes too long (>200 characters)**
**When** I enter notes with 201 characters
**Then** I should see error: "Notater kan ikke overstige 200 tegn"

---

### Test Scenario 2.2.8: Product Type Selector UI
**Priority:** P1 (High)
**Type:** UI/UX

**Given** I am on AddFuelScreen
**Then** I should see a product type selector (dropdown or segmented buttons)
**And** it should have 4 options:
1. Gel
2. Drikke
3. Bar
4. Mat

**When** I select "Gel"
**Then** the selection should be visually highlighted
**When** I change to "Drikke"
**Then** "Drikke" should be highlighted
**And** "Gel" should be unhighlighted

---

### Test Scenario 2.2.9: Cancel Add Product
**Priority:** P1 (High)
**Type:** Functional

**Given** I am on AddFuelScreen
**And** I have filled in some fields:
- Produktnavn: "Test Product"
- Produkttype: "Gel"
**When** I tap "Avbryt"
**Then** I should navigate back to FuelLibraryScreen
**And** NO product should be saved to database
**And** the product should NOT appear in the library

---

### Test Scenario 2.2.10: Real-Time Validation Feedback
**Priority:** P2 (Medium)
**Type:** UX

**Given** I am on AddFuelScreen
**When** I enter invalid carbs: "250"
**Then** I should see the validation error immediately (not on submit)
**When** I correct the value to "25"
**Then** the error should disappear immediately
**And** "Lagre" button should become enabled

**Expected:** Validation errors update in real-time as user types

---

## Story 2.3: Edit and Delete Products

### Test Scenario 2.3.1: Access Edit Screen
**Priority:** P0 (Critical)
**Type:** Navigation

**Given** I have a product "Maurten Gel 100" in my library
**When** I tap on the product card in FuelLibraryScreen
**Then** I should navigate to EditFuelScreen
**And** I should see screen title: "Rediger produkt"
**And** all form fields should be pre-populated with existing data:
- Produktnavn: "Maurten Gel 100"
- Produkttype: "Gel" (selected)
- Karbohydrater: "25"
- Porsjonstørrelse: "40g pakke"
- Notater: (existing notes if any)
**And** I should see "Lagre endringer" button
**And** I should see "Slett produkt" button (red, at bottom)
**And** I should see "Avbryt" button

---

### Test Scenario 2.3.2: Edit Product Successfully
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am editing "Maurten Gel 100"
**And** the original carbs value is 25g
**When** I change carbs to "27"
**And** I change serving size to "41g pakke"
**And** I tap "Lagre endringer"
**Then** the product should be updated in database
**And** I should navigate back to FuelLibraryScreen
**And** I should see toast: "✓ Produkt oppdatert"
**And** the product card should display updated values:
- Carbs: "27g karbs"
- Serving size: "41g pakke"

**Expected Database State:**
```sql
SELECT carbs_per_serving, serving_size FROM fuel_products WHERE id = 1;
-- Expected result:
-- carbs_per_serving: 27.0
-- serving_size: '41g pakke'
```

---

### Test Scenario 2.3.3: Edit Product Name
**Priority:** P1 (High)
**Type:** Functional

**Given** I am editing "Maurten Gel 100"
**When** I change the name to "Maurten Gel 100 CAF (with caffeine)"
**And** I tap "Lagre endringer"
**Then** the product name should be updated
**And** the product card should display the new name
**And** alphabetical sorting should be updated within the section

---

### Test Scenario 2.3.4: Edit Product Type (Move to Different Section)
**Priority:** P1 (High)
**Type:** Functional

**Given** I am editing a product with type "gel"
**And** the product is currently in the "Gels" section
**When** I change the type to "drink"
**And** I tap "Lagre endringer"
**Then** the product should be updated
**And** the product should move from "Gels" section to "Drikker" section
**And** the product icon should change from gel icon to drink icon

---

### Test Scenario 2.3.5: Edit Validation (Same as Add)
**Priority:** P1 (High)
**Type:** Validation

**Given** I am editing a product
**When** I try to save with invalid data (e.g., carbs = 0)
**Then** validation errors should appear
**And** "Lagre endringer" button should be disabled
**And** the product should NOT be saved

**Expected:** All validation rules from Story 2.2 apply to editing

---

### Test Scenario 2.3.6: Cancel Edit
**Priority:** P1 (High)
**Type:** Functional

**Given** I am editing "Maurten Gel 100"
**And** I have made changes to the form
**When** I tap "Avbryt"
**Then** I should navigate back to FuelLibraryScreen
**And** NO changes should be saved to database
**And** the product should display original values

---

### Test Scenario 2.3.7: Delete Product - Confirmation Dialog
**Priority:** P0 (Critical)
**Type:** UI/UX

**Given** I am editing "Maurten Gel 100"
**When** I tap "Slett produkt" button (red)
**Then** I should see a confirmation dialog with:
- Title: "Slett Maurten Gel 100?"
- Message: "Dette produktet vil bli fjernet fra ditt skafferi. Tidligere loggede økter påvirkes ikke."
- Buttons: "Avbryt" | "Slett" (red)
**And** the dialog should be modal (blocks other interactions)

---

### Test Scenario 2.3.8: Cancel Delete
**Priority:** P1 (High)
**Type:** Functional

**Given** I am viewing the delete confirmation dialog
**When** I tap "Avbryt"
**Then** the dialog should close
**And** I should remain on EditFuelScreen
**And** the product should NOT be deleted
**And** the product should still exist in database

---

### Test Scenario 2.3.9: Confirm Delete (Soft Delete)
**Priority:** P0 (Critical)
**Type:** Functional

**Given** I am viewing the delete confirmation dialog for "Maurten Gel 100"
**When** I tap "Slett" (red button)
**Then** the product should be soft deleted (deleted_at timestamp set)
**And** I should navigate back to FuelLibraryScreen
**And** I should see toast: "✓ Produkt slettet"
**And** the product should NO LONGER appear in the library
**And** the product should NOT be physically deleted from database

**Expected Database State:**
```sql
SELECT id, name, deleted_at FROM fuel_products WHERE id = 1;
-- Expected result:
-- id: 1
-- name: 'Maurten Gel 100'
-- deleted_at: <current timestamp> (NOT NULL)
```

---

### Test Scenario 2.3.10: Soft Delete Does Not Affect Existing Plans
**Priority:** P0 (Critical)
**Type:** Data Integrity

**Given** I have a product "Maurten Gel 100" (id=1)
**And** this product is used in a planned session (fuel_plan_json references id=1)
**When** I delete the product (soft delete)
**Then** the product should be soft deleted (deleted_at set)
**And** the existing planned session should still reference the product
**And** the fuel plan should still display "Maurten Gel 100" (data preserved)

**Rationale:** Soft delete preserves historical data

---

### Test Scenario 2.3.11: Deleted Products Do Not Appear in Library
**Priority:** P0 (Critical)
**Type:** Query Validation

**Given** I have deleted 2 products (soft delete)
**And** I have 5 active products
**When** I view FuelLibraryScreen
**Then** only the 5 active products should be displayed
**And** deleted products should NOT appear in any section

**Database Query:**
```sql
SELECT * FROM fuel_products
WHERE user_id = 1 AND deleted_at IS NULL;
-- Expected: 5 products (NOT 7)
```

---

### Test Scenario 2.3.12: Deleted Products Do Not Appear in Selectors
**Priority:** P1 (High)
**Type:** Integration

**Given** I have deleted "Maurten Gel 100"
**When** I go to plan a session (Epic 4)
**And** I view the fuel product selector
**Then** "Maurten Gel 100" should NOT be available for selection
**And** only active products should be shown

---

## Integration Test Scenarios

### Integration 2.I.1: Complete CRUD Lifecycle
**Priority:** P0 (Critical)
**Type:** End-to-End

**Given** I am on FuelLibraryScreen (empty)
**When** I execute the following flow:
1. Tap FAB "+" → Navigate to AddFuelScreen
2. Add product "Maurten Gel 100" (25g carbs) → Save
3. Return to library → See product in "Gels" section
4. Tap product card → Navigate to EditFuelScreen
5. Change carbs to 27g → Save
6. Return to library → See updated carbs (27g)
7. Tap product card again → Navigate to EditFuelScreen
8. Tap "Slett produkt" → Confirm delete
9. Return to library → Product no longer visible

**Then** the database should reflect all changes:
- Product created (INSERT)
- Product updated (UPDATE)
- Product soft deleted (UPDATE deleted_at)

---

### Integration 2.I.2: Add Multiple Products Across Types
**Priority:** P1 (High)
**Type:** End-to-End

**Given** I start with empty library
**When** I add 8 products:
- 2 gels
- 2 drinks
- 2 bars
- 2 food items
**Then** all products should appear in correct sections
**And** each section should be sorted alphabetically
**And** FAB should always be accessible

---

### Integration 2.I.3: Empty → Populate → Delete All
**Priority:** P1 (High)
**Type:** End-to-End

**Given** I start with empty library (empty state shown)
**When** I add 3 products
**Then** empty state should disappear
**And** product list should appear with 3 products
**When** I delete all 3 products one by one
**Then** empty state should reappear
**And** message should say "Ditt skafferi er tomt..."

---

## Performance Benchmarks

### Benchmark 2.P.1: Database Insert Performance
**Target:** <50ms per insert

**Test:**
```typescript
const start = performance.now();
await FuelProductRepository.create(product);
const duration = performance.now() - start;
expect(duration).toBeLessThan(50); // ms
```

---

### Benchmark 2.P.2: Database Update Performance
**Target:** <50ms per update

**Test:**
```typescript
const start = performance.now();
await FuelProductRepository.update(id, updates);
const duration = performance.now() - start;
expect(duration).toBeLessThan(50); // ms
```

---

### Benchmark 2.P.3: List Rendering Performance
**Target:** <2 seconds for 50 products

**Test:**
- Load 50 products
- Measure time from navigation to FuelLibraryScreen until list rendered
- Target: <2000ms

---

## Edge Cases & Error Handling

### Edge Case 2.E.1: Special Characters in Product Name
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I am adding a product
**When** I enter name: "Maurten Gel 100 (Café + 🍌)"
**Then** the name should be accepted (special characters allowed)
**And** the product should save successfully
**And** the name should display correctly with all characters

---

### Edge Case 2.E.2: Very Small Carbs Value
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I am adding a product
**When** I enter carbs: "0.5" (half gram)
**Then** the value should be accepted
**And** saved as 0.5 in database
**And** displayed as "0.5g karbs"

---

### Edge Case 2.E.3: Maximum Carbs Value
**Priority:** P2 (Medium)
**Type:** Edge Case

**Given** I am adding a product
**When** I enter carbs: "200" (maximum allowed)
**Then** the value should be accepted
**And** no validation error should appear

**When** I enter carbs: "200.1" (over maximum)
**Then** validation error should appear

---

### Edge Case 2.E.4: Duplicate Product Names (Allowed)
**Priority:** P2 (Medium)
**Type:** Business Logic

**Given** I have a product named "Banan"
**When** I add another product also named "Banan"
**Then** both products should be saved successfully
**And** both should appear in the library
**And** they should have different IDs

**Rationale:** Users may have different versions of same product (e.g., "Banan" from different sources)

---

### Edge Case 2.E.5: Rapid Add/Delete Operations
**Priority:** P2 (Medium)
**Type:** Concurrency

**Given** I am on FuelLibraryScreen
**When** I rapidly:
1. Add product A
2. Navigate back
3. Add product B
4. Navigate back
5. Delete product A
**Then** all operations should complete successfully
**And** database should be consistent (product A deleted, product B active)
**And** no race conditions should occur

---

## Test Data Requirements

### Test Fuel Products
```json
[
  {
    "name": "Maurten Gel 100",
    "product_type": "gel",
    "carbs_per_serving": 25,
    "serving_size": "40g pakke",
    "notes": "Min favoritt-gel"
  },
  {
    "name": "Maurten Drink Mix 320",
    "product_type": "drink",
    "carbs_per_serving": 80,
    "serving_size": "500ml flaske",
    "notes": null
  },
  {
    "name": "Banan",
    "product_type": "food",
    "carbs_per_serving": 27,
    "serving_size": "Medium banan",
    "notes": "Naturlig og billig"
  },
  {
    "name": "Energy Bar",
    "product_type": "bar",
    "carbs_per_serving": 40,
    "serving_size": null,
    "notes": null
  }
]
```

---

## Automation Recommendations

### High Priority (Automate First)
1. ✅ CRUD operations (2.2.2, 2.3.2, 2.3.9)
2. ✅ Validation tests (2.2.4, 2.2.5, 2.2.6)
3. ✅ Soft delete functionality (2.3.9, 2.3.10, 2.3.11)
4. ✅ Integration test (2.I.1)

### Medium Priority
5. Product grouping (2.1.5, 2.1.6)
6. Empty state (2.1.2)
7. Edge cases (2.E.1 - 2.E.5)
8. Performance tests (2.P.1 - 2.P.3)

### Manual Testing Required
- UI/UX validation (icons, styling, animations)
- Empty state visual verification
- Confirmation dialog appearance
- Toast messages
- Scroll performance

---

## Test Execution Order

### Phase 1: Basic CRUD (Day 1)
1. Add product (2.2.1, 2.2.2, 2.2.3)
2. View library (2.1.1, 2.1.3)
3. Edit product (2.3.1, 2.3.2)
4. Delete product (2.3.7, 2.3.9)

**Exit Criteria:** Basic CRUD operations work

---

### Phase 2: Validation (Day 2)
5. Add validation (2.2.4, 2.2.5, 2.2.6, 2.2.7)
6. Edit validation (2.3.5)
7. Empty state (2.1.2)

**Exit Criteria:** All validation rules work correctly

---

### Phase 3: Advanced Features (Day 3)
8. Product grouping (2.1.5, 2.1.6)
9. Type icons (2.1.7)
10. Soft delete data integrity (2.3.10, 2.3.11, 2.3.12)

**Exit Criteria:** Grouping and soft delete work

---

### Phase 4: Integration & Performance (Day 4)
11. Complete CRUD lifecycle (2.I.1, 2.I.2, 2.I.3)
12. Performance tests (2.1.10, 2.P.1, 2.P.2, 2.P.3)
13. Edge cases (2.E.1 - 2.E.5)

**Exit Criteria:** Epic 2 ready for production

---

## Success Criteria

### Epic 2 Approved for Production IF:
✅ All CRUD operations work correctly (Create, Read, Update, Delete)
✅ Soft delete preserves data integrity (no hard deletes)
✅ All validation rules prevent invalid data
✅ Product grouping by type works correctly
✅ Empty state guides users to add first product
✅ Performance with 50+ products is acceptable (<2s load)
✅ Type icons display correctly for all types
✅ Database queries exclude soft-deleted products
✅ No crashes or data loss in any scenario

### Epic 2 BLOCKED IF:
❌ Hard delete occurs (data loss)
❌ Validation allows invalid data (carbs = 0, empty name)
❌ Soft-deleted products appear in library or selectors
❌ Product grouping fails or displays incorrectly
❌ Performance is unacceptable (>5s for 50 products)
❌ Database queries fail or timeout

---

## Sign-off

**QA Lead:** Quinn 🎯
**Test Plan Status:** ✅ COMPLETE
**Total Test Scenarios:** 40+
**Critical Scenarios:** 15
**Estimated Test Execution Time:** 4 days
**Next Action:** Execute Phase 1 tests after Epic 2 implementation begins

---

_"The Fuel Library is the foundation of personalized fuel planning. These tests ensure users can reliably manage their product catalog with confidence."_

_— Quinn, Senior QA Engineer_
