import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, getSubmissionByUrl, getSolutionBySlug } from '@/lib/airtable';
import { sendSubmissionConfirmation, sendAdminSubmissionNotification } from '@/lib/email';
import type { ApiResponse, Submission, SubmitToolFormData } from '@/types';

// Simple slug generation
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  console.log('[Submissions API] POST request received');

  try {
    const body: SubmitToolFormData = await request.json();

    console.log('[Submissions API] Validating submission:', {
      name: body.name,
      website_url: body.website_url,
      category: body.category,
      submitter_email: body.submitter_email,
    });

    // Validate required fields
    if (!body.name || body.name.trim().length < 2) {
      console.log('[Submissions API] Validation failed: name too short');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Tool name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!body.website_url || !body.website_url.startsWith('http')) {
      console.log('[Submissions API] Validation failed: invalid URL');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Please enter a valid website URL starting with http:// or https://' },
        { status: 400 }
      );
    }

    if (!body.description || body.description.trim().length < 20) {
      console.log('[Submissions API] Validation failed: description too short');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (!body.category) {
      console.log('[Submissions API] Validation failed: no category');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Please select a category' },
        { status: 400 }
      );
    }

    if (!body.submitter_email || !body.submitter_email.includes('@')) {
      console.log('[Submissions API] Validation failed: invalid email');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if tool already exists in solutions
    const slug = generateSlug(body.name);
    console.log('[Submissions API] Checking for existing solution with slug:', slug);
    try {
      const existingSolution = await getSolutionBySlug(slug);
      if (existingSolution) {
        console.log('[Submissions API] Tool already exists in solutions:', slug);
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'This tool is already listed on RobotDance!' },
          { status: 400 }
        );
      }
    } catch (lookupError) {
      console.error('[Submissions API] Solution lookup failed (proceeding):', lookupError);
      // Don't block submission if lookup fails
    }

    // Check if already submitted
    console.log('[Submissions API] Checking for duplicate submission:', body.website_url);
    try {
      const existingSubmission = await getSubmissionByUrl(body.website_url);
      if (existingSubmission) {
        console.log('[Submissions API] Duplicate submission found for URL:', body.website_url);
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'This tool has already been submitted and is pending review.' },
          { status: 400 }
        );
      }
    } catch (lookupError) {
      console.error('[Submissions API] Submission lookup failed (proceeding):', lookupError);
      // Don't block submission if lookup fails
    }

    console.log('[Submissions API] Creating submission...');
    const submission = await createSubmission(body);
    console.log('[Submissions API] Submission created successfully:', submission.id);

    // Send emails (non-blocking — don't fail the submission if emails fail)
    sendSubmissionConfirmation(body.submitter_email.trim(), body.name.trim()).catch((err) => {
      console.error('[Submissions API] Confirmation email failed:', err);
    });

    sendAdminSubmissionNotification(submission).catch((err) => {
      console.error('[Submissions API] Admin notification email failed:', err);
    });

    return NextResponse.json<ApiResponse<Submission>>({
      success: true,
      data: submission,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Submissions API] Unhandled error:', message);
    console.error('[Submissions API] Full error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: `Failed to submit tool: ${message}` },
      { status: 500 }
    );
  }
}
