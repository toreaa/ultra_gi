/**
 * Fuel Planner Algorithm Tests (Epic 4)
 *
 * Test Scenarios: 4.2.1 - 4.2.8
 * Priority: P0 (Critical)
 * Coverage Target: 90%
 */

import { generateFuelPlan, generateTiming } from '../fuelPlanner';
import type { FuelProduct } from '@/types/database';

describe('Fuel Planner Algorithm (Epic 4)', () => {
  // Test data
  const mockProducts: FuelProduct[] = [
    {
      id: 1,
      user_id: 1,
      name: 'Maurten Gel 100',
      product_type: 'gel',
      carbs_per_serving: 25,
      serving_size: '1 pakke',
      notes: null,
      deleted_at: null,
      created_at: '2025-10-24T10:00:00Z',
    },
    {
      id: 2,
      user_id: 1,
      name: 'Maurten Drink Mix 320',
      product_type: 'drink',
      carbs_per_serving: 80,
      serving_size: '500ml',
      notes: null,
      deleted_at: null,
      created_at: '2025-10-24T10:00:00Z',
    },
    {
      id: 3,
      user_id: 1,
      name: 'Banan',
      product_type: 'food',
      carbs_per_serving: 27,
      serving_size: '1 stk',
      notes: null,
      deleted_at: null,
      created_at: '2025-10-24T10:00:00Z',
    },
  ];

  describe('Test Scenario 4.2.1: Perfect Match (Exact Target)', () => {
    it('should generate plan with exact match for 100g target', () => {
      // Given
      const targetCarbs = 100;
      const durationMinutes = 120;
      const products = [mockProducts[0]]; // Maurten Gel (25g)

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products);

      // Then
      expect(plan.total_carbs).toBe(100);
      expect(plan.target_carbs).toBe(100);
      expect(plan.match_percentage).toBe(100);
      expect(plan.items).toHaveLength(1);
      expect(plan.items[0].quantity).toBe(4);
      expect(plan.items[0].carbs_total).toBe(100);
    });

    it('should generate correct timing for 4 items over 120 minutes', () => {
      // Given
      const targetCarbs = 100;
      const durationMinutes = 120;
      const products = [mockProducts[0]];

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products);

      // Then
      expect(plan.items[0].timing_minutes).toEqual([24, 48, 72, 96]);
    });
  });

  describe('Test Scenario 4.2.2: Acceptable Overshoot (90-110% Range)', () => {
    it('should generate plan with 111% match for 90g target (acceptable)', () => {
      // Given
      const targetCarbs = 90;
      const durationMinutes = 120;
      const products = [mockProducts[0]]; // Maurten Gel (25g)

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products);

      // Then
      expect(plan.total_carbs).toBe(100); // 4 gels
      expect(plan.target_carbs).toBe(90);
      expect(plan.match_percentage).toBe(111); // Slightly over 110%, but acceptable
      expect(plan.items[0].quantity).toBe(4);

      // Note: 3 gels would be 75g (83%), which is worse
      // Algorithm prefers overshoot to undershoot
    });
  });

  describe('Test Scenario 4.2.3: Undershoot (Insufficient Products)', () => {
    it('should generate plan with warning for insufficient products', () => {
      // Given
      const targetCarbs = 100;
      const durationMinutes = 120;
      // User only has 2 servings available (not in current data structure, but logic should handle)
      const products = [mockProducts[0]]; // Maurten Gel (25g)

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products, { maxQuantity: 2 });

      // Then
      expect(plan.total_carbs).toBe(50); // Only 2 gels
      expect(plan.match_percentage).toBe(50);
      expect(plan.warning).toBe('Insufficient products (50/100g). Add more products to skafferi.');
    });
  });

  describe('Test Scenario 4.2.4: Multiple Product Types (Mix)', () => {
    it('should prioritize highest carbs first (greedy algorithm)', () => {
      // Given
      const targetCarbs = 120;
      const durationMinutes = 150;
      const products = mockProducts; // Drink Mix (80g), Banan (27g), Gel (25g)

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products);

      // Then - Should select Drink Mix (80g) first, then Gels
      expect(plan.items[0].fuel_product_id).toBe(2); // Drink Mix (highest)
      expect(plan.items[0].carbs_total).toBe(80);
      expect(plan.total_carbs).toBeGreaterThanOrEqual(108); // 90% of 120
      expect(plan.total_carbs).toBeLessThanOrEqual(132); // 110% of 120
    });
  });

  describe('Test Scenario 4.2.5: Timing Algorithm Validation', () => {
    const testCases = [
      { duration: 90, quantity: 3, expected: [23, 45, 68] },
      { duration: 120, quantity: 4, expected: [24, 48, 72, 96] },
      { duration: 60, quantity: 2, expected: [20, 40] },
      { duration: 75, quantity: 3, expected: [19, 38, 56] },
      { duration: 180, quantity: 6, expected: [26, 51, 77, 103, 129, 154] },
    ];

    testCases.forEach(({ duration, quantity, expected }) => {
      it(`should generate correct timing for ${quantity} items over ${duration} minutes`, () => {
        // When
        const timing = generateTiming(duration, quantity);

        // Then
        expect(timing).toEqual(expected);
      });
    });
  });

  describe('Test Scenario 4.2.6: Max Quantity Constraint (Safety Limit)', () => {
    it('should limit quantity to MAX_QUANTITY (5)', () => {
      // Given
      const targetCarbs = 150;
      const durationMinutes = 180;
      const products = [
        {
          ...mockProducts[0],
          carbs_per_serving: 15, // Dextro Tablets
        },
      ];

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products);

      // Then
      expect(plan.items[0].quantity).toBeLessThanOrEqual(5); // MAX_QUANTITY
      expect(plan.items[0].quantity).toBe(5);
      expect(plan.items[0].carbs_total).toBe(75); // 5 × 15g
      expect(plan.warning).toContain('Max quantity reached');
    });
  });

  describe('Test Scenario 4.2.7: Sorting by Carbs (Greedy Algorithm)', () => {
    it('should sort products by carbs descending before selection', () => {
      // Given
      const unsortedProducts = [
        { ...mockProducts[0], carbs_per_serving: 25 }, // Gel
        { ...mockProducts[2], carbs_per_serving: 27 }, // Banan
        { ...mockProducts[1], carbs_per_serving: 80 }, // Drink Mix
      ];

      // When
      const plan = generateFuelPlan(100, 120, unsortedProducts);

      // Then - First item should be highest carbs (Drink Mix)
      expect(plan.items[0].carbs_total).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Test Scenario 4.2.8: Zero Carbs Edge Case', () => {
    it('should return error for zero target carbs', () => {
      // Given
      const targetCarbs = 0;
      const durationMinutes = 120;
      const products = mockProducts;

      // When
      const plan = generateFuelPlan(targetCarbs, durationMinutes, products);

      // Then
      expect(plan.items).toEqual([]);
      expect(plan.error).toBe('Target carbs must be greater than 0');
    });
  });

  describe('Performance Benchmark 4.P.1: Algorithm Execution Time', () => {
    it('should generate plan in less than 50ms', () => {
      // Given
      const targetCarbs = 100;
      const durationMinutes = 120;
      const products = mockProducts;

      // When
      const start = performance.now();
      generateFuelPlan(targetCarbs, durationMinutes, products);
      const executionTime = performance.now() - start;

      // Then
      expect(executionTime).toBeLessThan(50); // ms
    });
  });
});

describe('Timing Generation Helper Function', () => {
  it('should calculate correct intervals using (duration / (quantity + 1))', () => {
    // Formula: interval = duration / (quantity + 1)
    const duration = 120;
    const quantity = 4;
    const expectedInterval = 120 / (4 + 1); // = 24

    const timing = generateTiming(duration, quantity);

    expect(timing[0]).toBe(24); // First intake at 24 min
    expect(timing[1]).toBe(48); // Second at 48 min
    expect(timing[2]).toBe(72); // Third at 72 min
    expect(timing[3]).toBe(96); // Fourth at 96 min
  });

  it('should round fractional minutes correctly', () => {
    const timing = generateTiming(75, 3); // 75 / 4 = 18.75

    expect(timing[0]).toBe(19); // Rounded from 18.75
    expect(timing[1]).toBe(38); // Rounded from 37.5
    expect(timing[2]).toBe(56); // Rounded from 56.25
  });
});
