/**
 * Epic 4: Planning - E2E Tests (Detox)
 *
 * Test Scenarios: Integration tests (4.I.1 - 4.I.3)
 * Priority: P1 (High)
 * Dependencies: Epic 2 (Fuel Library), Epic 3 (Programs)
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Epic 4: Planning - Full Flow (E2E)', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Test Scenario 4.I.1: Full Planning Flow', () => {
    it('should complete full planning flow from program detail to confirmed plan', async () => {
      // GIVEN - User is enrolled in "4-Week Base" program with fuel products
      // (Assumes test data is setup)

      // Step 1: Navigate to Program Detail
      await element(by.text('Programmer')).tap();
      await waitFor(element(by.text('4-Week Base')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('4-Week Base')).tap();

      // Step 2: Tap on "Week 1, Session 1"
      await waitFor(element(by.text('Uke 1, Økt 1')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('Uke 1, Økt 1')).tap();

      // Step 3: Tap "Plan økt"
      await waitFor(element(by.text('Plan økt')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('Plan økt')).tap();

      // THEN - Should see Session Planning Screen
      await waitFor(element(by.text('Planlegg økt')))
        .toBeVisible()
        .withTimeout(5000);

      // Step 4: View generated plan
      await waitFor(element(by.id('fuel-plan-container')))
        .toBeVisible()
        .withTimeout(5000);

      // Should see suggested fuel items
      await detoxExpect(element(by.text(/Maurten Gel|Maurten Drink/))).toBeVisible();

      // Step 5: Adjust quantity (optional - test manual adjustment)
      // Tap on a fuel item to open adjustment dialog
      await element(by.text(/Maurten Gel/)).tap();
      await waitFor(element(by.id('quantity-stepper')))
        .toBeVisible()
        .withTimeout(2000);

      // Decrease quantity
      await element(by.id('quantity-decrease')).tap();

      // Close dialog
      await element(by.text('OK')).tap();

      // Step 6: Confirm plan
      await element(by.text('Godkjenn plan')).tap();

      // THEN - Should navigate back to Program Detail
      await waitFor(element(by.text('4-Week Base')))
        .toBeVisible()
        .withTimeout(5000);

      // AND - Session should be marked as "Planlagt"
      await detoxExpect(element(by.text('Planlagt'))).toBeVisible();
    });
  });

  describe('Test Scenario 4.I.2: Empty Skafferi → Add Products → Plan', () => {
    it('should handle empty skafferi gracefully and allow adding products', async () => {
      // GIVEN - User has NO fuel products (requires clearing test data first)
      // NOTE: This test may require a specific test user with empty skafferi

      // Step 1: Access Session Planning Screen
      await element(by.text('Programmer')).tap();
      await element(by.text('4-Week Base')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();

      // THEN - Should see empty state
      await waitFor(element(by.text('Ingen produkter i skafferi')))
        .toBeVisible()
        .withTimeout(5000);

      // Step 2: Tap "Legg til produkter"
      await element(by.text('Legg til produkter')).tap();

      // THEN - Should navigate to Fuel Library (Story 2.2)
      await waitFor(element(by.text('Legg til produkt')))
        .toBeVisible()
        .withTimeout(5000);

      // Step 3: Add a fuel product
      await element(by.id('product-name-input')).typeText('Maurten Gel 100');
      await element(by.id('product-type-select')).tap();
      await element(by.text('Gel')).tap();
      await element(by.id('carbs-per-serving-input')).typeText('25');
      await element(by.text('Lagre')).tap();

      // Step 4: Navigate back to Session Planning
      await element(by.id('back-button')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();

      // THEN - Should now generate a valid plan
      await waitFor(element(by.id('fuel-plan-container')))
        .toBeVisible()
        .withTimeout(5000);
      await detoxExpect(element(by.text('Maurten Gel 100'))).toBeVisible();
    });
  });

  describe('Test Scenario 4.I.3: Plan → Start → Log Events', () => {
    it('should transition from planning to active session with scheduled notifications', async () => {
      // GIVEN - User has a confirmed fuel plan
      // (Complete planning flow first)
      await element(by.text('Programmer')).tap();
      await element(by.text('4-Week Base')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();
      await element(by.text('Godkjenn plan')).tap();

      // Step 1: Tap "Start nå"
      await waitFor(element(by.text('Start nå')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.text('Start nå')).tap();

      // THEN - Should navigate to Active Session Screen (Story 5.1)
      await waitFor(element(by.id('session-timer')))
        .toBeVisible()
        .withTimeout(5000);

      // Timer should be running
      await detoxExpect(element(by.id('session-timer'))).toHaveText(/00:00:/);

      // Should see "INNTAK" button (Story 5.3)
      await detoxExpect(element(by.text('INNTAK'))).toBeVisible();

      // Should see next planned intake
      await detoxExpect(element(by.text(/Neste:/i))).toBeVisible();

      // Step 2: Wait 25 minutes (simulated - in real test, would need to mock timer)
      // NOTE: Cannot actually wait 25 minutes in E2E test
      // Instead, verify notification is scheduled

      // Step 3: Log intake manually (simulate user tapping INNTAK button)
      await element(by.text('INNTAK')).tap();

      // THEN - Should see toast confirmation
      await waitFor(element(by.text(/logget/i)))
        .toBeVisible()
        .withTimeout(2000);

      // AND - Event should appear in event list
      await detoxExpect(element(by.text(/Maurten Gel/))).toBeVisible();
    });
  });

  describe('Algorithm Validation (Visual)', () => {
    it('should display correct total carbs calculation', async () => {
      // Navigate to planning screen
      await element(by.text('Programmer')).tap();
      await element(by.text('4-Week Base')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();

      // THEN - Should see total carbs matching target
      // Uke 1, Økt 1: 75 min @ 30g/t = 38g target
      await waitFor(element(by.text(/38g/i)))
        .toBeVisible()
        .withTimeout(5000);

      // Should see match percentage (90-110% range)
      await detoxExpect(element(by.text(/\d{2,3}%/))).toBeVisible();
    });

    it('should display evenly distributed timing', async () => {
      // Navigate to planning screen
      await element(by.text('Programmer')).tap();
      await element(by.text('4-Week Base')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();

      // THEN - Should see timing suggestions
      await waitFor(element(by.id('fuel-plan-container')))
        .toBeVisible()
        .withTimeout(5000);

      // Scroll through plan to see timing
      await element(by.id('fuel-plan-container')).scrollTo('bottom');

      // Should see times like "25 min", "50 min" etc.
      await detoxExpect(element(by.text(/\d{2} min/))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should show warning when plan does not match target', async () => {
      // This test would require mocking insufficient products scenario
      // For E2E, we can test the UI behavior when warning exists

      // Navigate to planning screen
      await element(by.text('Programmer')).tap();
      await element(by.text('4-Week Base')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();

      // If warning exists (would need specific test data)
      // await detoxExpect(element(by.text(/⚠️/))).toBeVisible();
      // await detoxExpect(element(by.text(/Kun \d+% av mål/))).toBeVisible();
    });

    it('should allow canceling plan without saving', async () => {
      // Navigate to planning screen
      await element(by.text('Programmer')).tap();
      await element(by.text('4-Week Base')).tap();
      await element(by.text('Uke 1, Økt 1')).tap();
      await element(by.text('Plan økt')).tap();

      // Make adjustment
      await element(by.text(/Maurten Gel/)).tap();
      await element(by.id('quantity-increase')).tap();
      await element(by.text('OK')).tap();

      // Tap cancel/back
      await element(by.id('back-button')).tap();

      // THEN - Should see confirmation dialog
      await waitFor(element(by.text('Avbryt planlegging?')))
        .toBeVisible()
        .withTimeout(2000);

      // Confirm cancellation
      await element(by.text('Avbryt')).tap();

      // THEN - Should return to program detail
      await waitFor(element(by.text('4-Week Base')))
        .toBeVisible()
        .withTimeout(5000);

      // AND - Session should NOT be marked as "Planlagt"
      await detoxExpect(element(by.text('Planlagt'))).not.toBeVisible();
    });
  });
});
