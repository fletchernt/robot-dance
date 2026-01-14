import { RDS_WEIGHTS, type ReviewRatings, type Review } from '@/types';

/**
 * Calculate Robot Dance Score from ratings
 * Formula: weighted sum of ratings (1-10) multiplied by 10 = 0-100 score
 */
export function calculateRDS(ratings: ReviewRatings): number {
  const weightedSum =
    ratings.performance * RDS_WEIGHTS.performance +
    ratings.reliability * RDS_WEIGHTS.reliability +
    ratings.ease_of_use * RDS_WEIGHTS.ease_of_use +
    ratings.value * RDS_WEIGHTS.value +
    ratings.trust * RDS_WEIGHTS.trust +
    ratings.delight * RDS_WEIGHTS.delight;

  // Multiply by 10 to get 0-100 scale
  const score = Math.round(weightedSum * 10);

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate average ratings from a list of reviews
 */
export function calculateAverageRatings(reviews: Review[]): ReviewRatings {
  if (reviews.length === 0) {
    return {
      performance: 0,
      reliability: 0,
      ease_of_use: 0,
      value: 0,
      trust: 0,
      delight: 0,
    };
  }

  const totals = reviews.reduce(
    (acc, review) => ({
      performance: acc.performance + review.performance,
      reliability: acc.reliability + review.reliability,
      ease_of_use: acc.ease_of_use + review.ease_of_use,
      value: acc.value + review.value,
      trust: acc.trust + review.trust,
      delight: acc.delight + review.delight,
    }),
    {
      performance: 0,
      reliability: 0,
      ease_of_use: 0,
      value: 0,
      trust: 0,
      delight: 0,
    }
  );

  const count = reviews.length;

  return {
    performance: Math.round((totals.performance / count) * 10) / 10,
    reliability: Math.round((totals.reliability / count) * 10) / 10,
    ease_of_use: Math.round((totals.ease_of_use / count) * 10) / 10,
    value: Math.round((totals.value / count) * 10) / 10,
    trust: Math.round((totals.trust / count) * 10) / 10,
    delight: Math.round((totals.delight / count) * 10) / 10,
  };
}

/**
 * Get RDS color based on score
 */
export function getRDSColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get RDS background color based on score
 */
export function getRDSBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

/**
 * Get RDS label based on score
 */
export function getRDSLabel(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 40) return 'Below Average';
  if (score >= 30) return 'Poor';
  return 'Very Poor';
}
