import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSolutionBySlug, getReviewsForSolution, getUserById, getUserRatedReviewIds } from '@/lib/airtable';
import { calculateAverageRatings } from '@/lib/rds';
import { RDSBadge, ReviewCard, AffiliateCTA } from '@/components';
import type { User, Review } from '@/types';
import { TRUSTED_REVIEWER_THRESHOLD } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const categoryLabels: Record<string, string> = {
  apps: 'App',
  agents: 'Agent',
  apis: 'API',
  devices: 'Device',
  robots: 'Robot',
};

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const reviews = await getReviewsForSolution(solution.id);
  const averages = calculateAverageRatings(reviews);
  const session = await getServerSession(authOptions);

  // Fetch reviewer info for each review
  const reviewerMap = new Map<string, User>();
  for (const review of reviews) {
    if (review.user_id && !reviewerMap.has(review.user_id)) {
      const user = await getUserById(review.user_id);
      if (user) {
        reviewerMap.set(review.user_id, user);
      }
    }
  }

  // Get the current user's ID and their already-rated reviews
  const currentUserId = (session?.user as { id?: string })?.id;
  const userRatedReviewIds = currentUserId
    ? await getUserRatedReviewIds(currentUserId)
    : [];

  // Sort reviews: Trusted reviewers first, then by trust score, then by date
  const sortedReviews = [...reviews].sort((a, b) => {
    const reviewerA = reviewerMap.get(a.user_id);
    const reviewerB = reviewerMap.get(b.user_id);

    const trustScoreA = reviewerA?.trust_score || 0;
    const trustScoreB = reviewerB?.trust_score || 0;
    const ratingCountA = reviewerA?.trust_rating_count || 0;
    const ratingCountB = reviewerB?.trust_rating_count || 0;

    const isTrustedA = trustScoreA >= TRUSTED_REVIEWER_THRESHOLD && ratingCountA >= 3;
    const isTrustedB = trustScoreB >= TRUSTED_REVIEWER_THRESHOLD && ratingCountB >= 3;

    // Trusted reviewers first
    if (isTrustedA && !isTrustedB) return -1;
    if (!isTrustedA && isTrustedB) return 1;

    // Within same trust tier, sort by trust score (higher first)
    if (ratingCountA > 0 && ratingCountB > 0 && trustScoreA !== trustScoreB) {
      return trustScoreB - trustScoreA;
    }

    // If no trust ratings, sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Get the first reviewer's code for the page-level CTA
  const firstReviewer = sortedReviews.length > 0 ? reviewerMap.get(sortedReviews[0].user_id) : null;
  const affiliateReviewerCode = firstReviewer?.referral_code;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start space-x-6">
            {solution.logo_url ? (
              <img
                src={solution.logo_url}
                alt={solution.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {solution.name}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {categoryLabels[solution.category] || solution.category}
              </span>
              <p className="mt-4 text-gray-600 max-w-2xl">{solution.description}</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <RDSBadge score={solution.rds_score} size="lg" showLabel />
            <p className="mt-2 text-sm text-gray-500">
              {solution.review_count} reviews
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          {solution.website_url && (
            <a
              href={solution.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700"
            >
              Visit Website
            </a>
          )}
          <Link
            href={`/review/${slug}`}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200"
          >
            Write a Review
          </Link>
        </div>

      </div>

      {/* RDS Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Robot Dance Score™</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { key: 'performance', label: 'Performance', weight: '25%' },
            { key: 'reliability', label: 'Reliability', weight: '20%' },
            { key: 'ease_of_use', label: 'Ease of Use', weight: '15%' },
            { key: 'value', label: 'Value', weight: '15%' },
            { key: 'trust', label: 'Trust', weight: '15%' },
            { key: 'delight', label: 'Delight', weight: '10%' },
          ].map((category) => (
            <div key={category.key} className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {averages[category.key as keyof typeof averages].toFixed(1)}
              </div>
              <div className="text-sm font-medium text-gray-700 mt-1">
                {category.label}
              </div>
              <div className="text-xs text-gray-500">{category.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate CTA (page level - shown if solution has affiliate program) */}
      {solution.affiliate_url && sortedReviews.length > 0 && affiliateReviewerCode && (
        <div className="mb-8">
          <AffiliateCTA
            solutionName={solution.name}
            affiliateUrl={solution.affiliate_url}
            reviewerCode={affiliateReviewerCode}
            variant="page"
          />
        </div>
      )}

      {/* Reviews */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Reviews ({sortedReviews.length})
          </h2>
          <Link
            href={`/review/${slug}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Write a Review →
          </Link>
        </div>

        {sortedReviews.length > 0 ? (
          <div className="space-y-4">
            {sortedReviews.map((review) => {
              const reviewer = reviewerMap.get(review.user_id);
              // Show trust rating for signed-in users viewing other people's reviews (if not already rated)
              const isOwnReview = review.user_id === currentUserId;
              const alreadyRated = userRatedReviewIds.includes(review.id);
              const canRateTrust = !!session?.user && !isOwnReview && !alreadyRated;
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  userName={reviewer?.name}
                  reviewerTrustScore={reviewer?.trust_score}
                  reviewerRatingCount={reviewer?.trust_rating_count}
                  solutionName={solution.name}
                  affiliateUrl={solution.affiliate_url}
                  reviewerCode={reviewer?.referral_code}
                  showTrustRating={canRateTrust}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500 mb-4">No reviews yet</p>
            <Link
              href={`/review/${slug}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Be the first to review →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
