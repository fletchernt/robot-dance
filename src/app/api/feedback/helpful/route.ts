import { NextRequest, NextResponse } from 'next/server';
import { updateReviewHelpful } from '@/lib/airtable';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, isHelpful } = body;

    if (!reviewId || typeof isHelpful !== 'boolean') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing reviewId or isHelpful' },
        { status: 400 }
      );
    }

    await updateReviewHelpful(reviewId, isHelpful);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error('Helpful vote error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
