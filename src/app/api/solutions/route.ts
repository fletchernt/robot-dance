import { NextRequest, NextResponse } from 'next/server';
import { getSolutions, getSolutionBySlug, getReviewsForSolution } from '@/lib/airtable';
import { calculateAverageRatings } from '@/lib/rds';
import type { SolutionCategory, ApiResponse, Solution, SolutionWithReviews } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get('slug');

    // If slug provided, get single solution with reviews
    if (slug) {
      const solution = await getSolutionBySlug(slug);

      if (!solution) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Solution not found' },
          { status: 404 }
        );
      }

      const reviews = await getReviewsForSolution(solution.id);
      const rds_breakdown = calculateAverageRatings(reviews);

      const solutionWithReviews: SolutionWithReviews = {
        ...solution,
        reviews,
        rds_breakdown,
      };

      return NextResponse.json<ApiResponse<SolutionWithReviews>>({
        success: true,
        data: solutionWithReviews,
      });
    }

    // Otherwise, list solutions with filters
    const category = searchParams.get('category') as SolutionCategory | null;
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') as 'rds_score' | 'review_count' | 'created_at' | null;
    const order = searchParams.get('order') as 'asc' | 'desc' | null;

    const solutions = await getSolutions({
      category: category || undefined,
      search: search || undefined,
      sort: sort || undefined,
      order: order || undefined,
    });

    return NextResponse.json<ApiResponse<Solution[]>>({
      success: true,
      data: solutions,
    });
  } catch (error) {
    console.error('Solutions API error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch solutions' },
      { status: 500 }
    );
  }
}
