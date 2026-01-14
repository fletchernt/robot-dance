'use client';

import { useState } from 'react';

interface TrustRatingProps {
  reviewerId: string;
  reviewId: string;
  solutionId: string;
  reviewerName: string;
}

export function TrustRating({
  reviewerId,
  reviewId,
  solutionId,
  reviewerName,
}: TrustRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback/trust-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId,
          reviewId,
          solutionId,
          rating,
        }),
      });

      if (response.ok) {
        setHasRated(true);
      }
    } catch (error) {
      console.error('Failed to submit trust rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-700">
          Thanks for rating {reviewerName}&apos;s review! Your feedback helps keep our community trustworthy.
        </p>
      </div>
    );
  }

  const displayRating = hoveredRating ?? rating;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <p className="text-sm font-medium text-blue-900 mb-2">
        You purchased through this review. How accurate was {reviewerName}&apos;s review?
      </p>
      <p className="text-xs text-blue-700 mb-3">
        Your rating helps other users know if they can trust this reviewer.
      </p>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onMouseEnter={() => setHoveredRating(num)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={() => setRating(num)}
            className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
              displayRating && num <= displayRating
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-100 border border-gray-200'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-blue-600">
          {rating ? `Your rating: ${rating}/10` : 'Select a rating'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
}
