import Link from 'next/link';
import type { Solution } from '@/types';
import { RDSBadge } from './RDSBadge';

interface SolutionCardProps {
  solution: Solution;
}

const categoryLabels: Record<string, string> = {
  apps: 'App',
  agents: 'Agent',
  apis: 'API',
  devices: 'Device',
  robots: 'Robot',
};

const categoryColors: Record<string, string> = {
  apps: 'bg-blue-100 text-blue-800',
  agents: 'bg-purple-100 text-purple-800',
  apis: 'bg-green-100 text-green-800',
  devices: 'bg-orange-100 text-orange-800',
  robots: 'bg-red-100 text-red-800',
};

export function SolutionCard({ solution }: SolutionCardProps) {
  return (
    <Link href={`/solutions/${solution.slug}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {solution.logo_url ? (
              <img
                src={solution.logo_url}
                alt={solution.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{solution.name}</h3>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  categoryColors[solution.category] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {categoryLabels[solution.category] || solution.category}
              </span>
            </div>
          </div>
          <RDSBadge score={solution.rds_score} size="sm" />
        </div>

        <p className="mt-4 text-gray-600 text-sm line-clamp-2">{solution.description}</p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{solution.review_count} reviews</span>
          <span className="text-primary-600 font-medium">View details →</span>
        </div>
      </div>
    </Link>
  );
}
