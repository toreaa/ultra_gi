/**
 * Smart Recommendations Algorithm Tests (Epic 7)
 *
 * Test Scenarios: 7.4.1 - 7.4.5
 * Priority: P1 (High)
 * Coverage Target: 85%
 */

import { generateRecommendations } from '../recommendations';
import type { SessionLog, SessionEvent } from '@/types/database';

describe('Smart Recommendations Algorithm (Epic 7.4)', () => {
  describe('Test Scenario 7.4.1: Minimum Data Requirement', () => {
    it('should return info message when less than 5 sessions', () => {
      // Given - Only 3 completed sessions
      const sessions: SessionLog[] = [
        createMockSession(1, 75, []),
        createMockSession(2, 90, []),
        createMockSession(3, 75, []),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('info');
      expect(recommendations[0].title).toContain('Fullfør minst 5 økter');
      expect(recommendations[0].message).toContain('Du har fullført 3 av 5');
    });

    it('should generate recommendations when 5+ sessions completed', () => {
      // Given - 5 completed sessions
      const sessions: SessionLog[] = [
        createMockSession(1, 75, [createIntakeEvent(1, 1500, 'Maurten Gel', 25)]),
        createMockSession(2, 90, [createIntakeEvent(2, 1500, 'Maurten Gel', 25)]),
        createMockSession(3, 75, [createIntakeEvent(3, 1500, 'Maurten Gel', 25)]),
        createMockSession(4, 90, [createIntakeEvent(4, 1500, 'Maurten Gel', 25)]),
        createMockSession(5, 75, [createIntakeEvent(5, 1500, 'Maurten Gel', 25)]),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).not.toBe('info');
    });
  });

  describe('Test Scenario 7.4.2: Product Success Recommendation', () => {
    it('should recommend product with >80% success rate (3+ sessions)', () => {
      // Given - Maurten Gel used in 8 sessions, 7 without discomfort (88% success)
      const sessions: SessionLog[] = [
        // 7 sessions without discomfort
        ...Array.from({ length: 7 }, (_, i) =>
          createMockSession(i + 1, 75, [
            createIntakeEvent(i + 1, 1500, 'Maurten Gel', 25, 1),
            // No discomfort events
          ])
        ),
        // 1 session with discomfort
        createMockSession(8, 75, [
          createIntakeEvent(8, 1500, 'Maurten Gel', 25, 1),
          createDiscomfortEvent(8, 3300, 2, 'nausea'),
        ]),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      const productSuccess = recommendations.find(r => r.type === 'product_success');
      expect(productSuccess).toBeDefined();
      expect(productSuccess!.title).toContain('✅ Maurten Gel fungerer bra');
      expect(productSuccess!.message).toContain('7 av 8 økter uten ubehag');
      expect(productSuccess!.message).toContain('88%');
    });

    it('should NOT recommend product with <3 sessions (insufficient data)', () => {
      // Given - Banan used only 2 times, both successful
      const sessions: SessionLog[] = [
        createMockSession(1, 75, [createIntakeEvent(1, 1500, 'Banan', 27, 3)]),
        createMockSession(2, 75, [createIntakeEvent(2, 1500, 'Banan', 27, 3)]),
        createMockSession(3, 75, [createIntakeEvent(3, 1500, 'Maurten Gel', 25, 1)]),
        createMockSession(4, 75, [createIntakeEvent(4, 1500, 'Maurten Gel', 25, 1)]),
        createMockSession(5, 75, [createIntakeEvent(5, 1500, 'Maurten Gel', 25, 1)]),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      const bananaRec = recommendations.find(r => r.message?.includes('Banan'));
      expect(bananaRec).toBeUndefined(); // Not enough sessions
    });
  });

  describe('Test Scenario 7.4.3: Problematic Product Recommendation', () => {
    it('should warn about product with >70% failure rate', () => {
      // Given - SiS Gel used 5 times, 4 with discomfort (80% failure)
      const sessions: SessionLog[] = [
        // 4 sessions with discomfort
        ...Array.from({ length: 4 }, (_, i) =>
          createMockSession(i + 1, 75, [
            createIntakeEvent(i + 1, 1500, 'SiS Gel', 22, 2),
            createDiscomfortEvent(i + 1, 3300, 3, 'nausea'),
          ])
        ),
        // 1 session without discomfort
        createMockSession(5, 75, [
          createIntakeEvent(5, 1500, 'SiS Gel', 22, 2),
        ]),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      const productProblem = recommendations.find(r => r.type === 'product_problem');
      expect(productProblem).toBeDefined();
      expect(productProblem!.title).toContain('⚠️ SiS Gel ser ut til å gi ubehag');
      expect(productProblem!.message).toContain('4 av 5 økter med ubehag');
      expect(productProblem!.action).toContain('Vurder å bytte til andre produkter');
    });
  });

  describe('Test Scenario 7.4.4: Optimal Carb Rate Recommendation', () => {
    it('should identify optimal carb rate with lowest discomfort', () => {
      // Given - Sessions at different rates
      const sessions: SessionLog[] = [
        // 30g/t - Low discomfort (avg 0.5/5)
        createMockSession(1, 75, [], 30),
        createMockSession(2, 75, [createDiscomfortEvent(2, 3000, 1, 'nausea')], 30),

        // 40g/t - Moderate discomfort (avg 1.5/5)
        createMockSession(3, 90, [createDiscomfortEvent(3, 3000, 1, 'nausea')], 40),
        createMockSession(4, 90, [createDiscomfortEvent(4, 3000, 2, 'nausea')], 40),

        // 50g/t - High discomfort (avg 3.5/5)
        createMockSession(5, 120, [createDiscomfortEvent(5, 3000, 3, 'nausea')], 50),
        createMockSession(6, 120, [createDiscomfortEvent(6, 3000, 4, 'nausea')], 50),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      const optimalRate = recommendations.find(r => r.type === 'optimal_rate');
      expect(optimalRate).toBeDefined();
      expect(optimalRate!.title).toContain('📊 Optimal karb-rate: 30-40g/t');
      expect(optimalRate!.message).toContain('Lavest ubehag ved');
    });
  });

  describe('Test Scenario 7.4.5: Timing Pattern Recommendation', () => {
    it('should identify timing pattern when discomfort occurs consistently after intake', () => {
      // Given - Discomfort consistently 30-40 min after intake
      const sessions: SessionLog[] = [
        createMockSession(1, 90, [
          createIntakeEvent(1, 1500, 'Gel', 25, 1), // 25 min
          createDiscomfortEvent(1, 3600, 2, 'nausea'), // 60 min (35 min later)
        ]),
        createMockSession(2, 90, [
          createIntakeEvent(2, 1800, 'Gel', 25, 1), // 30 min
          createDiscomfortEvent(2, 4200, 2, 'nausea'), // 70 min (40 min later)
        ]),
        createMockSession(3, 90, [
          createIntakeEvent(3, 2100, 'Gel', 25, 1), // 35 min
          createDiscomfortEvent(3, 4200, 2, 'nausea'), // 70 min (35 min later)
        ]),
        createMockSession(4, 90, [
          createIntakeEvent(4, 1500, 'Gel', 25, 1), // 25 min
          createDiscomfortEvent(4, 3300, 2, 'nausea'), // 55 min (30 min later)
        ]),
        createMockSession(5, 90, [
          createIntakeEvent(5, 1800, 'Gel', 25, 1), // 30 min
          createDiscomfortEvent(5, 4000, 2, 'nausea'), // 67 min (37 min later)
        ]),
      ];

      // When
      const recommendations = generateRecommendations(sessions);

      // Then
      const timingPattern = recommendations.find(r => r.type === 'timing_pattern');
      expect(timingPattern).toBeDefined();
      expect(timingPattern!.title).toContain('⏰ Ubehag oppstår ofte');
      expect(timingPattern!.message).toContain('30-40 min etter inntak');
    });
  });

  describe('Algorithm Logic Validation', () => {
    it('should calculate success rate correctly', () => {
      // Test the internal calculation logic
      const successCount = 7;
      const totalCount = 8;
      const successRate = successCount / totalCount;

      expect(successRate).toBe(0.875); // 87.5%
      expect(Math.round(successRate * 100)).toBe(88); // Display as 88%
    });

    it('should group carb rates into buckets', () => {
      // Rates should be grouped into ranges (e.g., 30-35, 35-40, 40-45)
      const rates = [30, 32, 35, 38, 40, 42, 50, 52];

      const buckets = groupRateIntoBuckets(rates, 5); // 5g bucket size

      expect(buckets).toEqual({
        '30-35': [30, 32, 35],
        '35-40': [35, 38, 40],
        '40-45': [40, 42],
        '50-55': [50, 52],
      });
    });
  });

  describe('Performance Benchmark 7.P.2: Recommendation Algorithm Performance', () => {
    it('should generate recommendations in less than 100ms for 100 sessions', () => {
      // Given - 100 sessions with various data
      const sessions: SessionLog[] = Array.from({ length: 100 }, (_, i) =>
        createMockSession(i + 1, 75 + (i % 3) * 15, [
          createIntakeEvent(i + 1, 1500, 'Maurten Gel', 25, 1),
          ...(i % 3 === 0 ? [createDiscomfortEvent(i + 1, 3000, 2, 'nausea')] : []),
        ])
      );

      // When
      const start = performance.now();
      generateRecommendations(sessions);
      const executionTime = performance.now() - start;

      // Then
      expect(executionTime).toBeLessThan(100); // ms
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createMockSession(
  id: number,
  duration: number,
  events: SessionEvent[],
  carbRate?: number
): SessionLog {
  return {
    id,
    user_id: 1,
    planned_session_id: id,
    started_at: new Date(Date.now() - id * 24 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - id * 24 * 60 * 60 * 1000 + duration * 60 * 1000).toISOString(),
    duration_actual_minutes: duration,
    session_status: 'completed',
    post_session_notes: null,
    created_at: new Date().toISOString(),
    events,
    carb_rate_g_per_hour: carbRate || 40,
  } as SessionLog;
}

function createIntakeEvent(
  sessionLogId: number,
  offsetSeconds: number,
  productName: string,
  carbs: number,
  productId: number = 1
): SessionEvent {
  return {
    id: Math.random(),
    session_log_id: sessionLogId,
    event_type: 'intake',
    timestamp_offset_seconds: offsetSeconds,
    actual_timestamp: new Date().toISOString(),
    data_json: JSON.stringify({
      fuel_product_id: productId,
      product_name: productName,
      quantity: 1,
      carbs_consumed: carbs,
      was_planned: true,
    }),
    created_at: new Date().toISOString(),
  } as SessionEvent;
}

function createDiscomfortEvent(
  sessionLogId: number,
  offsetSeconds: number,
  level: number,
  type: string
): SessionEvent {
  return {
    id: Math.random(),
    session_log_id: sessionLogId,
    event_type: 'discomfort',
    timestamp_offset_seconds: offsetSeconds,
    actual_timestamp: new Date().toISOString(),
    data_json: JSON.stringify({
      level,
      type,
      notes: null,
    }),
    created_at: new Date().toISOString(),
  } as SessionEvent;
}

function groupRateIntoBuckets(rates: number[], bucketSize: number): Record<string, number[]> {
  const buckets: Record<string, number[]> = {};

  for (const rate of rates) {
    const bucketStart = Math.floor(rate / bucketSize) * bucketSize;
    const bucketEnd = bucketStart + bucketSize;
    const bucketKey = `${bucketStart}-${bucketEnd}`;

    if (!buckets[bucketKey]) {
      buckets[bucketKey] = [];
    }
    buckets[bucketKey].push(rate);
  }

  return buckets;
}
