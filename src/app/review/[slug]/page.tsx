import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSolutionBySlug } from '@/lib/airtable';
import { ReviewForm } from '@/components';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // Require authentication
  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=/review/${slug}`);
  }

  const solution = await getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/solutions/${slug}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Back to {solution.name}
        </Link>
      </div>

      <ReviewForm
        solutionId={solution.id}
        solutionSlug={slug}
        solutionName={solution.name}
        currentVersion={solution.current_version}
      />
    </div>
  );
}
