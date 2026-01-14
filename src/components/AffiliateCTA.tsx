'use client';

interface AffiliateCTAProps {
  solutionName: string;
  affiliateUrl: string;
  reviewerCode: string;
  reviewerName?: string;
  variant?: 'card' | 'page';  // card = compact for review cards, page = larger for solution page
}

export function AffiliateCTA({
  solutionName,
  affiliateUrl,
  reviewerCode,
  reviewerName,
  variant = 'card',
}: AffiliateCTAProps) {
  // Build tracked affiliate URL
  const trackedUrl = `/api/affiliate?url=${encodeURIComponent(affiliateUrl)}&ref=${reviewerCode}`;

  if (variant === 'card') {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href={trackedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          Try {solutionName} &rarr;
        </a>
        <p className="text-xs text-gray-500 text-center mt-2">
          {reviewerName ? `Support ${reviewerName}` : 'Support this reviewer'} at no extra cost
        </p>
      </div>
    );
  }

  // Page variant - larger, more prominent
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Ready to try {solutionName}?
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        If these reviews helped you decide, use the link below to support our reviewers at no extra cost to you.
      </p>
      <a
        href={trackedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
      >
        Get {solutionName}
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
