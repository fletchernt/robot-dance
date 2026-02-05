import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, markSubmissionPublished, createSolutionFromSubmission } from '@/lib/airtable';
import type { ApiResponse, Solution } from '@/types';

interface PublishRequest {
  submissionId: string;
}

export async function POST(request: NextRequest) {
  console.log('[Publish API] POST request received');

  try {
    const body: PublishRequest = await request.json();

    if (!body.submissionId) {
      console.log('[Publish API] Missing submissionId');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'submissionId is required' },
        { status: 400 }
      );
    }

    console.log('[Publish API] Publishing submission:', body.submissionId);

    // Fetch the submission
    const submission = await getSubmissionById(body.submissionId);
    if (!submission) {
      console.log('[Publish API] Submission not found:', body.submissionId);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    console.log('[Publish API] Submission fetched:', {
      id: submission.id,
      name: submission.name,
      status: submission.status,
      published_at: submission.published_at,
    });

    // Check if already published
    if (submission.published_at) {
      console.log('[Publish API] Submission already published at:', submission.published_at);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Submission already published at ${submission.published_at}` },
        { status: 400 }
      );
    }

    // Validate status is approved (handle both "Approved" and "approved")
    if (submission.status !== 'approved') {
      console.log('[Publish API] Submission not approved. Current status:', submission.status);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Submission status must be "approved" (current: "${submission.status}")` },
        { status: 400 }
      );
    }

    // Create the solution in the Solutions table
    console.log('[Publish API] Creating solution from submission...');
    const solution = await createSolutionFromSubmission(submission);
    console.log('[Publish API] Solution created:', solution.id, solution.slug);

    // Mark submission as published
    await markSubmissionPublished(submission.id);
    console.log('[Publish API] Submission marked as published');

    return NextResponse.json<ApiResponse<{ submission_id: string; solution: Solution }>>({
      success: true,
      data: {
        submission_id: submission.id,
        solution,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Publish API] Error:', message);
    console.error('[Publish API] Full error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
