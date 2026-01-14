import Link from 'next/link';
import { getSolutions } from '@/lib/airtable';
import { SolutionCard } from '@/components';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Get top rated solutions
  const topSolutions = await getSolutions({
    sort: 'rds_score',
    order: 'desc',
  }).catch(() => []);

  const featuredSolutions = topSolutions.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Discover the Best AI Tools
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Find, compare, and review AI solutions with our unique Robot Dance Score.
            From apps to agents, APIs to robots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/solutions"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse Solutions
            </Link>
            <Link
              href="/solutions?sort=rds_score"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors border border-primary-500"
            >
              View Top Rated
            </Link>
          </div>
        </div>
      </section>

      {/* What is RDS Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What is the Robot Dance Score?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The RDS is a 0-100 score calculated from user reviews across six key categories,
              helping you quickly identify the best AI solutions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: 'Performance', weight: '25%', icon: '⚡' },
              { label: 'Reliability', weight: '20%', icon: '🛡️' },
              { label: 'Ease of Use', weight: '15%', icon: '✨' },
              { label: 'Value', weight: '15%', icon: '💰' },
              { label: 'Trust', weight: '15%', icon: '🔒' },
              { label: 'Delight', weight: '10%', icon: '🎉' },
            ].map((category) => (
              <div
                key={category.label}
                className="text-center p-4 rounded-lg bg-gray-50"
              >
                <span className="text-2xl mb-2 block">{category.icon}</span>
                <h3 className="font-semibold text-gray-900">{category.label}</h3>
                <p className="text-sm text-gray-500">{category.weight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Solutions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Top Rated Solutions</h2>
            <Link
              href="/solutions?sort=rds_score"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>

          {featuredSolutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No solutions yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { slug: 'apps', label: 'Apps', icon: '📱', color: 'bg-blue-100 text-blue-800' },
              { slug: 'agents', label: 'Agents', icon: '🤖', color: 'bg-purple-100 text-purple-800' },
              { slug: 'apis', label: 'APIs', icon: '🔌', color: 'bg-green-100 text-green-800' },
              { slug: 'devices', label: 'Devices', icon: '📟', color: 'bg-orange-100 text-orange-800' },
              { slug: 'robots', label: 'Robots', icon: '🦾', color: 'bg-red-100 text-red-800' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/solutions?category=${cat.slug}`}
                className={`${cat.color} p-6 rounded-xl text-center hover:opacity-80 transition-opacity`}
              >
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <span className="font-semibold">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Share Your AI Experience
            </h2>
            <p className="text-primary-100 mb-6 max-w-xl mx-auto">
              Review AI tools you&apos;ve used and earn commissions when others discover
              solutions through your referral links.
            </p>
            <Link
              href="/solutions"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Start Reviewing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
