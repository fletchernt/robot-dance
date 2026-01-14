'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { SolutionCategory } from '@/types';

const categories: { value: SolutionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'apps', label: 'Apps' },
  { value: 'agents', label: 'Agents' },
  { value: 'apis', label: 'APIs' },
  { value: 'devices', label: 'Devices' },
  { value: 'robots', label: 'Robots' },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/solutions?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleCategoryChange(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentCategory === cat.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
