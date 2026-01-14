import { Suspense } from 'react';
import { getSolutions } from '@/lib/airtable';
import { SolutionCard, CategoryFilter, SearchBar } from '@/components';
import type { SolutionCategory } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    category?: SolutionCategory;
    search?: string;
    sort?: 'rds_score' | 'review_count' | 'created_at';
    order?: 'asc' | 'desc';
  }>;
}

async function SolutionsList({ searchParams }: PageProps) {
  const params = await searchParams;
  const solutions = await getSolutions({
    category: params.category,
    search: params.search,
    sort: params.sort || 'rds_score',
    order: params.order || 'desc',
  }).catch(() => []);

  if (solutions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500 mb-4">No solutions found</p>
        <p className="text-sm text-gray-400">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {solutions.map((solution) => (
        <SolutionCard key={solution.id} solution={solution} />
      ))}
    </div>
  );
}

export default async function SolutionsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Solutions</h1>
        <p className="text-gray-600">
          Discover and compare the best AI tools, rated by the community
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-lg" />}>
          <SearchBar />
        </Suspense>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded-full w-48" />}>
            <CategoryFilter />
          </Suspense>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              defaultValue={params.sort || 'rds_score'}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="rds_score">RDS Score</option>
              <option value="review_count">Most Reviews</option>
              <option value="created_at">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="mt-4 h-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        }
      >
        <SolutionsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
