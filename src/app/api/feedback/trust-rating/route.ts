import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUserTrustScore, getReviewById, hasUserRatedReview, createTrustRating } from '@/lib/airtable';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Require authentication for trust ratings
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Must be signed in to rate reviewers' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewerId, reviewId, rating } = body;

    if (!reviewerId || !reviewId || typeof rating !== 'number') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 10) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Rating must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Verify the review exists and get the reviewer ID
    const review = await getReviewById(reviewId);
    if (!review) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify the reviewerId matches the review's user_id
    if (review.user_id !== reviewerId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Reviewer ID mismatch' },
        { status: 400 }
      );
    }

    // Get the current user's ID
    const raterId = (session.user as { id: string }).id;

    // Check if user has already rated this review
    const alreadyRated = await hasUserRatedReview(raterId, reviewId);
    if (alreadyRated) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'You have already rated this review' },
        { status: 400 }
      );
    }

    // Create the trust rating record
    await createTrustRating(raterId, reviewerId, reviewId, rating);

    // Update the reviewer's trust score
    await updateUserTrustScore(reviewerId, rating);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error('Trust rating error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}
