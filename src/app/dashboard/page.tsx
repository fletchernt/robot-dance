import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getReviewsByUser, getUserById, getSolutionById } from '@/lib/airtable';
import { generateReferralLink } from '@/lib/referral';
import { ReviewCard, CopyButton, TrustedReviewerBadge } from '@/components';
import { COMMISSION_SPLIT, TRUSTED_REVIEWER_THRESHOLD } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard');
  }

  const userId = (session.user as { id?: string })?.id;
  const referralCode = (session.user as { referral_code?: string })?.referral_code;

  if (!userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-600">Error loading user data. Please try signing out and back in.</p>
      </div>
    );
  }

  const user = await getUserById(userId);
  const reviews = await getReviewsByUser(userId);

  // Get solution names for reviews
  const reviewsWithSolutions = await Promise.all(
    reviews.map(async (review) => {
      const solution = await getSolutionById(review.solution_id);
      return { ...review, solution };
    })
  );

  const baseUrl = process.env.NEXTAUTH_URL || 'https://robotdance.com';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Trust Score</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {(user?.trust_rating_count || 0) > 0
                ? (user?.trust_score || 0).toFixed(1)
                : '—'}
            </p>
            <span className="text-lg text-gray-400">/10</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(user?.trust_rating_count || 0)} rating{(user?.trust_rating_count || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Referral Clicks</p>
          <p className="text-3xl font-bold text-gray-900">{user?.total_clicks || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Conversions</p>
          <p className="text-3xl font-bold text-gray-900">{user?.total_conversions || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">Pending Earnings</p>
          <p className="text-3xl font-bold text-green-600">
            ${(user?.pending_earnings || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Trust Score Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reviewer Trust Status</h2>
            <p className="text-sm text-gray-600">
              {(user?.trust_rating_count || 0) >= 3 && (user?.trust_score || 0) >= TRUSTED_REVIEWER_THRESHOLD ? (
                <>You have earned the <strong>Trusted Reviewer</strong> badge!</>
              ) : (user?.trust_rating_count || 0) >= 3 ? (
                <>Your trust score is below {TRUSTED_REVIEWER_THRESHOLD}. Keep writing accurate reviews to improve it.</>
              ) : (
                <>Get {3 - (user?.trust_rating_count || 0)} more rating{3 - (user?.trust_rating_count || 0) !== 1 ? 's' : ''} from verified purchasers to qualify for Trusted Reviewer status.</>
              )}
            </p>
          </div>
          <TrustedReviewerBadge
            trustScore={user?.trust_score || 0}
            ratingCount={user?.trust_rating_count || 0}
            showScore
            size="md"
          />
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Earnings Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${(user?.pending_earnings || 0).toFixed(2)}
            </p>
            <p className="text-xs text-yellow-600 mt-1">Awaiting payout</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-1">Paid Out</p>
            <p className="text-2xl font-bold text-green-600">
              ${(user?.paid_earnings || 0).toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-1">Total received</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700 mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-primary-600">
              ${((user?.pending_earnings || 0) + (user?.paid_earnings || 0)).toFixed(2)}
            </p>
            <p className="text-xs text-primary-600 mt-1">Lifetime earnings</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>How it works:</strong> When someone uses your referral link to sign up for a solution,
            you earn {Math.round(COMMISSION_SPLIT.reviewer * 100)}% of the affiliate commission.
            Payouts are processed monthly for balances over $50.
          </p>
        </div>
      </div>

      {/* Referral Code */}
      {referralCode && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-2">Your Referral Code</h2>
          <p className="text-primary-100 mb-4">
            Share your referral links to earn commissions on conversions
          </p>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-primary-100 mb-2">Your unique code:</p>
            <p className="text-2xl font-mono font-bold">{referralCode}</p>
          </div>
          <p className="mt-4 text-sm text-primary-100">
            Your referral link format: {baseUrl}/r/{referralCode}/[solution-slug]
          </p>
        </div>
      )}

      {/* Your Reviews */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Reviews</h2>

        {reviewsWithSolutions.length > 0 ? (
          <div className="space-y-4">
            {reviewsWithSolutions.map((review) => (
              <div key={review.id} className="relative">
                {review.solution && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Review for:{' '}
                    </span>
                    <a
                      href={`/solutions/${review.solution.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {review.solution.name}
                    </a>
                    {referralCode && (
                      <span className="ml-4 text-xs text-gray-500">
                        Referral link:{' '}
                        <code className="bg-gray-100 px-2 py-0.5 rounded">
                          {generateReferralLink(referralCode, review.solution.slug, baseUrl)}
                        </code>
                      </span>
                    )}
                  </div>
                )}
                <ReviewCard review={review} userName={session.user?.name || 'You'} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500 mb-4">You haven&apos;t written any reviews yet</p>
            <a
              href="/solutions"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse solutions to review →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
