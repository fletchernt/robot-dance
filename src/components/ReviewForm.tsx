'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReviewFormData } from '@/types';

interface ReviewFormProps {
  solutionId: string;
  solutionSlug: string;
  solutionName: string;
  currentVersion?: string;
}

function RatingInput({
  label,
  value,
  onChange,
  weight,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  weight: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">{weight} weight</span>
      </div>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
              num <= value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ solutionId, solutionSlug, solutionName, currentVersion }: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ReviewFormData>({
    solution_id: solutionId,
    performance: 5,
    reliability: 5,
    ease_of_use: 5,
    value: 5,
    trust: 5,
    delight: 5,
    review_text: '',
    youtube_url: '',
    version: currentVersion || '',
  });

  const handleRatingChange = (field: keyof ReviewFormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      router.push(`/solutions/${solutionSlug}?reviewed=true`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Review {solutionName}
      </h2>
      {currentVersion && (
        <p className="text-sm text-gray-600 mb-6">
          Reviewing version: <span className="font-medium text-gray-900">{currentVersion}</span>
        </p>
      )}
      {!currentVersion && <div className="mb-6" />}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Ratings</h3>

        <RatingInput
          label="Performance"
          value={formData.performance}
          onChange={(v) => handleRatingChange('performance', v)}
          weight="25%"
        />
        <RatingInput
          label="Reliability"
          value={formData.reliability}
          onChange={(v) => handleRatingChange('reliability', v)}
          weight="20%"
        />
        <RatingInput
          label="Ease of Use"
          value={formData.ease_of_use}
          onChange={(v) => handleRatingChange('ease_of_use', v)}
          weight="15%"
        />
        <RatingInput
          label="Value"
          value={formData.value}
          onChange={(v) => handleRatingChange('value', v)}
          weight="15%"
        />
        <RatingInput
          label="Trust"
          value={formData.trust}
          onChange={(v) => handleRatingChange('trust', v)}
          weight="15%"
        />
        <RatingInput
          label="Delight"
          value={formData.delight}
          onChange={(v) => handleRatingChange('delight', v)}
          weight="10%"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Your Review</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Written Review *
          </label>
          <textarea
            value={formData.review_text}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, review_text: e.target.value }))
            }
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Share your experience with this AI tool..."
            required
            minLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video Review (optional)
          </label>
          <input
            type="url"
            value={formData.youtube_url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, youtube_url: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Link a video review to earn affiliate commissions
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
