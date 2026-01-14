'use client';

import { useState } from 'react';

interface HelpfulVoteProps {
  reviewId: string;
  initialYes: number;
  initialTotal: number;
}

export function HelpfulVote({ reviewId, initialYes, initialTotal }: HelpfulVoteProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yesCount, setYesCount] = useState(initialYes);
  const [totalCount, setTotalCount] = useState(initialTotal);

  const helpfulPercent = totalCount > 0
    ? Math.round((yesCount / totalCount) * 100)
    : null;

  const handleVote = async (isHelpful: boolean) => {
    if (hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isHelpful }),
      });

      if (response.ok) {
        setHasVoted(true);
        setTotalCount(prev => prev + 1);
        if (isHelpful) {
          setYesCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        {helpfulPercent !== null ? (
          <span>{helpfulPercent}% found this helpful ({totalCount} votes)</span>
        ) : (
          <span>Was this review helpful?</span>
        )}
      </div>

      {!hasVoted ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Yes, helpful"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Yes
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="No, not helpful"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            No
          </button>
        </div>
      ) : (
        <span className="text-sm text-green-600">Thanks for your feedback!</span>
      )}
    </div>
  );
}
