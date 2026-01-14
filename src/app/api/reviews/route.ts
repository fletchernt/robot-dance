import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createReview, getReviewsByUser } from '@/lib/airtable';
import type { ApiResponse, Review, ReviewFormData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      );
    }

    const reviews = await getReviewsByUser(userId);

    return NextResponse.json<ApiResponse<Review[]>>({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      );
    }

    const body: ReviewFormData = await request.json();

    // Validate ratings are 1-10
    const ratings = ['performance', 'reliability', 'ease_of_use', 'value', 'trust', 'delight'];
    for (const rating of ratings) {
      const value = body[rating as keyof ReviewFormData] as number;
      if (typeof value !== 'number' || value < 1 || value > 10) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: `Invalid ${rating} rating. Must be 1-10.` },
          { status: 400 }
        );
      }
    }

    if (!body.solution_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solution ID is required' },
        { status: 400 }
      );
    }

    if (!body.review_text || body.review_text.trim().length < 10) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Review text must be at least 10 characters' },
        { status: 400 }
      );
    }

    const review = await createReview(body, userId);

    return NextResponse.json<ApiResponse<Review>>({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
