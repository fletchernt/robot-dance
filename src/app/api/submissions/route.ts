import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, getSubmissionByUrl, getSolutionBySlug } from '@/lib/airtable';
import type { ApiResponse, Submission, SubmitToolFormData } from '@/types';

// Simple slug generation
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitToolFormData = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Tool name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!body.website_url || !body.website_url.startsWith('http')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Please enter a valid website URL starting with http:// or https://' },
        { status: 400 }
      );
    }

    if (!body.description || body.description.trim().length < 20) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Please select a category' },
        { status: 400 }
      );
    }

    if (!body.submitter_email || !body.submitter_email.includes('@')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if tool already exists in solutions
    const slug = generateSlug(body.name);
    const existingSolution = await getSolutionBySlug(slug);
    if (existingSolution) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'This tool is already listed on RobotDance!' },
        { status: 400 }
      );
    }

    // Check if already submitted
    const existingSubmission = await getSubmissionByUrl(body.website_url);
    if (existingSubmission) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'This tool has already been submitted and is pending review.' },
        { status: 400 }
      );
    }

    const submission = await createSubmission(body);

    return NextResponse.json<ApiResponse<Submission>>({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Submissions POST error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to submit tool. Please try again.' },
      { status: 500 }
    );
  }
}
