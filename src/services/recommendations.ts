/**
 * Recommendations Service
 *
 * Generates smart recommendations based on user's session data.
 * Story 7.4: Smarte anbefalinger
 *
 * Algorithm:
 * 1. Product Analysis: Success rate per fuel product (økter uten ubehag / total økter)
 * 2. Optimal Carb Rate: Find rate range with lowest discomfort
 * 3. Timing Patterns: Identify when discomfort typically occurs
 */

import { SessionWithStats } from '../database/repositories/SessionLogRepository';
import { SessionEvent, IntakeData, DiscomfortData } from '../types/database';

export type RecommendationType =
  | 'info'
  | 'product_success'
  | 'product_warning'
  | 'optimal_rate'
  | 'timing_pattern';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  message: string;
  details?: string;
  icon: string;
  color: string;
}

interface ProductStats {
  name: string;
  successCount: number; // Sessions without discomfort
  totalCount: number;
  successRate: number;
}

interface RateBucket {
  min: number;
  max: number;
  sessionCount: number;
  discomfortCount: number;
  avgDiscomfort: number;
}

/**
 * Generate recommendations based on session data
 * Requires minimum 5 completed sessions
 */
export function generateRecommendations(
  sessions: SessionWithStats[],
  allEvents: Map<number, SessionEvent[]>
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Minimum data requirement: 5+ sessions
  if (sessions.length < 5) {
    recommendations.push({
      type: 'info',
      title: 'Fullfør 5+ økter for anbefalinger',
      message: `Du har ${sessions.length} fullførte økter. Fullfør ${5 - sessions.length} til for å få personlige anbefalinger.`,
      icon: 'information-outline',
      color: '#2196F3',
    });
    return recommendations;
  }

  // 1. Product Analysis
  const productRecommendations = analyzeProducts(sessions, allEvents);
  recommendations.push(...productRecommendations);

  // 2. Optimal Carb Rate Analysis
  const rateRecommendations = analyzeOptimalRate(sessions);
  recommendations.push(...rateRecommendations);

  // 3. Timing Pattern Analysis
  const timingRecommendations = analyzeTimingPatterns(sessions, allEvents);
  recommendations.push(...timingRecommendations);

  // If no specific recommendations, provide generic success message
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'info',
      title: 'Trenger mer data',
      message: 'Fortsett å logge økter for å få mer spesifikke anbefalinger.',
      icon: 'chart-line',
      color: '#2196F3',
    });
  }

  return recommendations;
}

/**
 * Analyze fuel products to find best and problematic ones
 */
function analyzeProducts(
  sessions: SessionWithStats[],
  allEvents: Map<number, SessionEvent[]>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const productStats = new Map<number, ProductStats>();

  sessions.forEach((session) => {
    const events = allEvents.get(session.id) || [];
    const intakeEvents = events.filter((e) => e.event_type === 'intake');
    const hasDiscomfort = session.discomfort_count > 0;

    intakeEvents.forEach((intake) => {
      const data = JSON.parse(intake.data_json) as IntakeData;
      const productId = data.fuel_product_id;

      if (!productId) return; // Skip if no product ID

      if (!productStats.has(productId)) {
        productStats.set(productId, {
          name: data.product_name || 'Ukjent produkt',
          successCount: 0,
          totalCount: 0,
          successRate: 0,
        });
      }

      const stats = productStats.get(productId)!;
      stats.totalCount++;
      if (!hasDiscomfort) {
        stats.successCount++;
      }
    });
  });

  // Calculate success rates and generate recommendations
  productStats.forEach((stats, productId) => {
    // Only recommend products used in 3+ sessions
    if (stats.totalCount >= 3) {
      stats.successRate = stats.successCount / stats.totalCount;

      // Best products (80%+ success rate)
      if (stats.successRate >= 0.8) {
        recommendations.push({
          type: 'product_success',
          title: `${stats.name} fungerer bra`,
          message: `${stats.successCount} av ${stats.totalCount} økter uten ubehag (${Math.round(stats.successRate * 100)}%)`,
          details: `Dette produktet har vist konsekvent god toleranse. Fortsett å bruke det i lignende økter.`,
          icon: 'check-circle',
          color: '#4CAF50',
        });
      }

      // Problematic products (<50% success rate)
      if (stats.successRate < 0.5 && stats.totalCount >= 3) {
        recommendations.push({
          type: 'product_warning',
          title: `Vurder å unngå ${stats.name}`,
          message: `Kun ${stats.successCount} av ${stats.totalCount} økter uten ubehag (${Math.round(stats.successRate * 100)}%)`,
          details: `Dette produktet har gitt ubehag i flere økter. Prøv alternativer eller reduser mengden.`,
          icon: 'alert-circle',
          color: '#FF9800',
        });
      }
    }
  });

  return recommendations;
}

/**
 * Analyze carb rate ranges to find optimal rate
 */
function analyzeOptimalRate(sessions: SessionWithStats[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Define rate buckets (g/hour)
  const buckets: RateBucket[] = [
    { min: 0, max: 60, sessionCount: 0, discomfortCount: 0, avgDiscomfort: 0 },
    { min: 60, max: 80, sessionCount: 0, discomfortCount: 0, avgDiscomfort: 0 },
    { min: 80, max: 100, sessionCount: 0, discomfortCount: 0, avgDiscomfort: 0 },
    { min: 100, max: 120, sessionCount: 0, discomfortCount: 0, avgDiscomfort: 0 },
    { min: 120, max: 999, sessionCount: 0, discomfortCount: 0, avgDiscomfort: 0 },
  ];

  // Populate buckets
  sessions.forEach((session) => {
    const rate = session.carb_rate_per_hour;
    if (rate <= 0) return;

    const bucket = buckets.find((b) => rate >= b.min && rate < b.max);
    if (bucket) {
      bucket.sessionCount++;
      if (session.discomfort_count > 0) {
        bucket.discomfortCount++;
        bucket.avgDiscomfort += session.avg_discomfort || 0;
      }
    }
  });

  // Calculate average discomfort per bucket
  buckets.forEach((bucket) => {
    if (bucket.discomfortCount > 0) {
      bucket.avgDiscomfort = bucket.avgDiscomfort / bucket.discomfortCount;
    }
  });

  // Find bucket with lowest discomfort (min 3 sessions)
  const validBuckets = buckets.filter((b) => b.sessionCount >= 3);
  if (validBuckets.length > 0) {
    const bestBucket = validBuckets.reduce((best, current) => {
      const bestRate = best.discomfortCount / best.sessionCount;
      const currentRate = current.discomfortCount / current.sessionCount;
      return currentRate < bestRate ? current : best;
    });

    const successRate = 1 - (bestBucket.discomfortCount / bestBucket.sessionCount);
    if (successRate >= 0.7) {
      recommendations.push({
        type: 'optimal_rate',
        title: `Optimal karb-rate: ${bestBucket.min}-${bestBucket.max}g/t`,
        message: `${Math.round(successRate * 100)}% suksessrate i dette området (${bestBucket.sessionCount} økter)`,
        details: `Din data viser best toleranse i dette området. Prøv å holde deg innenfor ${bestBucket.min}-${bestBucket.max}g/t for beste resultater.`,
        icon: 'speedometer',
        color: '#9C27B0',
      });
    }
  }

  // Warn if consistently going too high
  const highRateBucket = buckets.find((b) => b.min >= 100);
  if (highRateBucket && highRateBucket.sessionCount >= 3) {
    const highDiscomfortRate = highRateBucket.discomfortCount / highRateBucket.sessionCount;
    if (highDiscomfortRate > 0.6) {
      recommendations.push({
        type: 'optimal_rate',
        title: 'Vurder å redusere karb-rate',
        message: `${Math.round(highDiscomfortRate * 100)}% av økter med >100g/t hadde ubehag`,
        details: `Høy karb-rate (>100g/t) har gitt ubehag i flere økter. Prøv å redusere til 80-100g/t.`,
        icon: 'alert',
        color: '#FF9800',
      });
    }
  }

  return recommendations;
}

/**
 * Analyze timing patterns to identify when discomfort occurs
 */
function analyzeTimingPatterns(
  sessions: SessionWithStats[],
  allEvents: Map<number, SessionEvent[]>
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Collect all discomfort events with timing
  const discomfortTimings: number[] = []; // Minutes into session

  sessions.forEach((session) => {
    const events = allEvents.get(session.id) || [];
    const discomfortEvents = events.filter((e) => e.event_type === 'discomfort');

    discomfortEvents.forEach((event) => {
      const minutes = event.timestamp_offset_seconds / 60;
      discomfortTimings.push(minutes);
    });
  });

  if (discomfortTimings.length >= 5) {
    // Check for early discomfort pattern (within first 30 minutes)
    const earlyDiscomfort = discomfortTimings.filter((t) => t <= 30);
    if (earlyDiscomfort.length >= 3 && earlyDiscomfort.length / discomfortTimings.length > 0.5) {
      recommendations.push({
        type: 'timing_pattern',
        title: 'Ubehag kommer ofte tidlig',
        message: `${earlyDiscomfort.length} av ${discomfortTimings.length} ubehag skjer innen 30 min`,
        details: `Start saktere med lavere rate de første 30 minuttene. La kroppen venne seg til inntaket før du øker.`,
        icon: 'clock-alert',
        color: '#FF9800',
      });
    }

    // Check for late discomfort pattern (after 90 minutes)
    const lateDiscomfort = discomfortTimings.filter((t) => t >= 90);
    if (lateDiscomfort.length >= 3 && lateDiscomfort.length / discomfortTimings.length > 0.5) {
      recommendations.push({
        type: 'timing_pattern',
        title: 'Ubehag kommer ofte sent',
        message: `${lateDiscomfort.length} av ${discomfortTimings.length} ubehag skjer etter 90 min`,
        details: `Vurder å redusere inntak etter 90 minutter, eller bytt til lettere produkter mot slutten.`,
        icon: 'clock-alert',
        color: '#FF9800',
      });
    }
  }

  return recommendations;
}
