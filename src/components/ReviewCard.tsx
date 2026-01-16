import type { Review } from '@/types';
import { calculateRDS } from '@/lib/rds';
import { AffiliateCTA } from './AffiliateCTA';
import { HelpfulVote } from './HelpfulVote';
import { TrustedReviewerBadge } from './TrustedReviewerBadge';
import { TrustRating } from './TrustRating';

interface ReviewCardProps {
  review: Review;
  userName?: string;
  // Reviewer trust info
  reviewerTrustScore?: number;
  reviewerRatingCount?: number;
  // Affiliate props (optional - only shown if solution has affiliate program)
  solutionName?: string;
  affiliateUrl?: string;
  reviewerCode?: string;
  // Trust rating (shown to verified purchasers)
  showTrustRating?: boolean;
}

function StarRating({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-1">{value}</span>
        <div className="flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full mx-0.5 ${
                i < value ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
  userName,
  reviewerTrustScore = 0,
  reviewerRatingCount = 0,
  solutionName,
  affiliateUrl,
  reviewerCode,
  showTrustRating = false,
}: ReviewCardProps) {
  const reviewScore = calculateRDS(review);
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const showAffiliateCTA = affiliateUrl && reviewerCode && solutionName;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{userName || 'Anonymous'}</p>
            <TrustedReviewerBadge
              trustScore={reviewerTrustScore}
              ratingCount={reviewerRatingCount}
              showScore={reviewerRatingCount > 0}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{formattedDate}</p>
            {review.version && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {review.version}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary-600">{reviewScore}</span>
          <span className="text-sm text-gray-500">RDS</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{review.review_text}</p>

      {review.youtube_url && (
        <a
          href={review.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-red-600 hover:text-red-700 text-sm mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Watch Video Review
        </a>
      )}

      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
        <StarRating value={review.performance} label="Performance" />
        <StarRating value={review.reliability} label="Reliability" />
        <StarRating value={review.ease_of_use} label="Ease of Use" />
        <StarRating value={review.value} label="Value" />
        <StarRating value={review.trust} label="Trust" />
        <StarRating value={review.delight} label="Delight" />
      </div>

      {showAffiliateCTA && (
        <AffiliateCTA
          solutionName={solutionName}
          affiliateUrl={affiliateUrl}
          reviewerCode={reviewerCode}
          reviewerName={userName}
          variant="card"
        />
      )}

      <HelpfulVote
        reviewId={review.id}
        initialYes={review.helpful_yes || 0}
        initialTotal={review.helpful_total || 0}
      />

      {showTrustRating && (
        <TrustRating
          reviewerId={review.user_id}
          reviewId={review.id}
          solutionId={review.solution_id}
          reviewerName={userName || 'this reviewer'}
        />
      )}
    </div>
  );
}
