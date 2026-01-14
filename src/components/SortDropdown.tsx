'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'rds_score';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page'); // Reset to page 1 when sorting changes
    router.push(`/solutions?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Sort by:</span>
      <select
        value={currentSort}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
      >
        <option value="rds_score">RDS Score</option>
        <option value="review_count">Most Reviews</option>
        <option value="created_at">Newest</option>
      </select>
    </div>
  );
}
