import { TRUSTED_REVIEWER_THRESHOLD } from '@/types';

interface TrustedReviewerBadgeProps {
  trustScore: number;
  ratingCount: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export function TrustedReviewerBadge({
  trustScore,
  ratingCount,
  showScore = false,
  size = 'sm',
}: TrustedReviewerBadgeProps) {
  const isTrusted = trustScore >= TRUSTED_REVIEWER_THRESHOLD && ratingCount >= 3;

  if (!isTrusted && !showScore) {
    return null;
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1';

  if (isTrusted) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${sizeClasses} bg-amber-100 text-amber-800 rounded-full font-medium`}
        title={`Trust score: ${trustScore.toFixed(1)}/10 from ${ratingCount} verified purchasers`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Trusted Reviewer
        {showScore && <span className="ml-1 opacity-75">({trustScore.toFixed(1)})</span>}
      </span>
    );
  }

  // Show score without badge if requested
  if (showScore && ratingCount > 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${sizeClasses} bg-gray-100 text-gray-600 rounded-full`}
        title={`Trust score from ${ratingCount} verified purchasers`}
      >
        Trust: {trustScore.toFixed(1)}/10
      </span>
    );
  }

  return null;
}
